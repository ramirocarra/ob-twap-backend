import { BadRequestException, Injectable } from '@nestjs/common';
import { twapRouterAbi } from '../../ob-twap-router-abi';
import { CreateOrderDto } from './dtos/create-order.dto';
import { encodeFunctionData, isAddress } from 'viem';
import BigNumber from 'bignumber.js';

@Injectable()
export class OrdersService {
  getCreateOrderPayload(createOrderRequest: CreateOrderDto): string {
    const slippage = BigNumber(createOrderRequest.slippage)
      .multipliedBy(10000)
      .toFixed(0);

    if (!isAddress(createOrderRequest.tokenIn)) {
      throw new BadRequestException('Invalid tokenIn address');
    }

    if (!isAddress(createOrderRequest.tokenOut)) {
      throw new BadRequestException('Invalid tokenOut address');
    }

    if (!isAddress(createOrderRequest.recipient)) {
      throw new BadRequestException('Invalid recipient address');
    }

    // TODO: call contract to validate inputs

    return encodeFunctionData({
      abi: twapRouterAbi,
      functionName: 'createTwapOrder',
      args: [
        createOrderRequest.tokenIn,
        createOrderRequest.tokenOut,
        BigInt(createOrderRequest.intervalSecs),
        BigInt(createOrderRequest.orderAmountIn),
        BigInt(createOrderRequest.totalAmountIn),
        createOrderRequest.recipient,
        BigInt(slippage),
      ],
    });
  }
}
