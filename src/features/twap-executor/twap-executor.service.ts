import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { OBApiService } from 'src/providers/ob-api/ab-api.service';
import { createPublicClient, getContract, http } from 'viem';
import { twapRouterAbi } from '../../ob-twap-router-abi';
import { berachain } from 'viem/chains';

@Injectable()
export class TwapExecutorService implements OnApplicationBootstrap {
  private readonly twapRouterContract;

  constructor(public readonly obApiService: OBApiService) {
    const publicClient = createPublicClient({
      chain: berachain,
      transport: http(),
    });

    this.twapRouterContract = getContract({
      address: '0xFd88aD4849BA0F729D6fF4bC27Ff948Ab1Ac3dE7',
      abi: twapRouterAbi,
      client: publicClient,
    });

    publicClient.watchContractEvent({
      address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
      abi: twapRouterAbi,
      eventName: 'TwapOrderCreated',
      onLogs: (logs) => console.log(logs),
    });
  }

  async onApplicationBootstrap() {
    const activeOrders =
      await this.twapRouterContract.read.getPendingOrderIds();
    console.log(activeOrders);
  }
}
