import {
  ContractFunctionExecutionError,
  createPublicClient,
  createWalletClient,
  getContract,
  http,
} from 'viem';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OBApiService } from 'src/providers/ob-api/ab-api.service';
import { twapRouterAbi } from '../../ob-twap-router-abi';
import { privateKeyToAccount } from 'viem/accounts';
import { ConfigService } from '@nestjs/config';
import { berachain } from 'viem/chains';
import BigNumber from 'bignumber.js';
import * as Queue from 'queue';

interface TwapOrder {
  orderId: bigint;
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  intervalSecs: bigint;
  orderAmountIn: bigint;
  lastExecuted: bigint;
  recipient: `0x${string}`;
  totalAmountIn: bigint;
  totalExecuted: bigint;
  slippage: bigint;
}

// The delay is to have a time buffer due to possible mismatchs in block timestamps
const EXECUTION_DELAY = 5000;

@Injectable()
export class TwapExecutorService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TwapExecutorService.name);
  private readonly twapRouterContract;
  private readonly publicClient;
  private readonly walletClient;

  private readonly jobQueue = new Queue.default({
    concurrency: 1,
    timeout: 1000 * 60,
    autostart: true,
  });

  constructor(
    public readonly obApiService: OBApiService,
    private configService: ConfigService,
  ) {
    const twapRouterAddress = this.configService.get<string>(
      'TWAP_ROUTER_ADDRESS',
    );
    if (!twapRouterAddress) {
      throw new Error('TWAP_ROUTER_ADDRESS is not set');
    }

    const rpcUrl = this.configService.get<string>('RPC_URL');
    if (!rpcUrl) {
      throw new Error('RPC_URL is not set');
    }

    this.publicClient = createPublicClient({
      chain: berachain,
      transport: http(rpcUrl),
    });

    const privateKey = this.configService.get<string>('EXECUTOR_PRIVATE_KEY');
    if (!privateKey) {
      throw new Error('EXECUTOR_PRIVATE_KEY is not set');
    }

    this.walletClient = createWalletClient({
      chain: berachain,
      transport: http(rpcUrl),
      account: privateKeyToAccount(privateKey as `0x${string}`),
    });

    this.publicClient.watchContractEvent({
      address: twapRouterAddress as `0x${string}`,
      abi: twapRouterAbi,
      eventName: 'TwapOrderCreated',
      onLogs: (logs) => {
        // New orders are immediately scheduled for the next execution
        for (const log of logs) {
          const order = log.args as TwapOrder;
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          this.jobQueue.push(this.processOrder.bind(this, order));
        }
      },
    });

    this.twapRouterContract = getContract({
      address: twapRouterAddress as `0x${string}`,
      abi: twapRouterAbi,
      client: {
        public: this.publicClient,
        wallet: this.walletClient,
      },
    });
  }

  async onApplicationBootstrap() {
    const activeOrders = await this.twapRouterContract.read.getActiveOrderIds();
    this.logger.log(`Found ${activeOrders.length} active orders`);

    // On application start, all orders are scheduled for the next execution
    for (const orderId of activeOrders) {
      try {
        const { order, nextExecution } = await this.getOrder(orderId);

        let nextExecutionTimeout = Number(nextExecution) - Date.now();
        if (nextExecutionTimeout < 0) {
          // This means there is a delayed order, should be sent to the alerting service
          this.logger.warn(
            `Next execution timeout is negative: ${nextExecutionTimeout}`,
          );
          nextExecutionTimeout = 0;
        }

        this.scheduleOrder(order, nextExecutionTimeout);
      } catch (error) {
        // TODO: add a fallback and retry for these orders
        // This should be sent to the alert system
        this.logger.error(`Error getting order: ${orderId}`, error);
      }
    }
  }

  private scheduleOrder(order: TwapOrder, nextExecutionTimeout: number) {
    setTimeout(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      () => this.jobQueue.push(this.processOrder.bind(this, order)),
      nextExecutionTimeout + EXECUTION_DELAY,
    );
  }

  private async getOrder(orderId: bigint): Promise<{
    order: TwapOrder;
    nextExecution: bigint;
  }> {
    const orderParams = await this.twapRouterContract.read.orders([orderId]);

    if (orderParams) {
      const order = {
        orderId: orderId,
        tokenIn: orderParams[0],
        tokenOut: orderParams[1],
        intervalSecs: orderParams[2],
        orderAmountIn: orderParams[3],
        lastExecuted: orderParams[4],
        recipient: orderParams[5],
        totalAmountIn: orderParams[6],
        totalExecuted: orderParams[7],
        slippage: orderParams[8],
      };

      const nextExecution =
        (order.lastExecuted + order.intervalSecs) * BigInt(1000);

      return { order, nextExecution };
    } else {
      throw new Error(`Order not found: ${orderId}`);
    }
  }

  private async processOrder(order: TwapOrder) {
    console.log('Processing order', order.orderId);
    console.log(order);

    try {
      const slippage = BigNumber(order.slippage.toString())
        .div(10000)
        .toFixed(4);

      const swapResponse = await this.obApiService.swap({
        tokenIn: order.tokenIn,
        tokenOut: order.tokenOut,
        amount: order.orderAmountIn.toString(),
        slippage: slippage,
        to: order.recipient,
      });

      const params = [
        order.orderId,
        swapResponse.routerParams.pathDefinition as `0x${string}`,
        BigInt(swapResponse.routerParams.swapTokenInfo.outputQuote),
        swapResponse.routerParams.executor as `0x${string}`,
        swapResponse.routerParams.referralCode,
      ] as const;

      await this.twapRouterContract.simulate.executeOrder(params);
      const txHash = await this.twapRouterContract.write.executeOrder(params);
      this.logger.log('Order Execution Tx Sent', order.orderId, txHash);

      // Waiting for receipt to be mined to avoid nonce collision
      // TODO: Track the nonce and don't wait for the receipt to include multiple orders in each block
      await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      this.logger.log('Order Execution Tx Mined', {
        orderId: order.orderId,
        txHash: txHash,
      });

      // Get the updated order
      const { order: updatedOrder, nextExecution } = await this.getOrder(
        order.orderId,
      );

      let nextExecutionTimeout = Number(nextExecution) - Date.now();
      if (nextExecutionTimeout < 0) {
        // This means the order is delayed, should be sent to the alerting service
        this.logger.warn(
          `Next execution timeout is negative: ${nextExecutionTimeout}`,
        );
        nextExecutionTimeout = 0;
      }

      if (updatedOrder.totalExecuted >= updatedOrder.totalAmountIn) {
        this.logger.log('Order completed', updatedOrder.orderId);
        return;
      }

      this.logger.log('Next execution timeout', {
        orderId: order.orderId,
        nextExecution: nextExecution,
        nextExecutionTimeout: nextExecutionTimeout,
      });

      this.scheduleOrder(updatedOrder, nextExecutionTimeout);
    } catch (error) {
      if (error instanceof ContractFunctionExecutionError) {
        if (error.shortMessage.includes('ORDER_NOT_ACTIVE')) {
          // The order has been completed successfully, no need to retry
          this.logger.log('Order completed', order.orderId);
          return;
        }

        // TODO: Handle OBRouter errors in TWAP Router, or encode the errors in ABI

        // OBRouter error: SlippageExceeded
        if (error.shortMessage.includes('0x71c4efed')) {
          // TODO: small slippage can lead to ever failing orders for low liquidity pairs, we should handle this
          this.logger.warn('Slippage exceeded', order.orderId);
          this.scheduleOrder(order, 5000);
          return;
        }
      }
      // On any error, we should send an alert to the alerting service
      this.logger.error('Error processing order', order.orderId, error);

      // The order will be sent for a retry after a delay
      // TODO: Implement a backoff mechanism
      this.scheduleOrder(order, 5000);
    }
  }
}
