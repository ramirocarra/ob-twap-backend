import 'dotenv/config';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, getContract, http, parseAbi } from 'viem';
import axios from 'axios';
import { berachain } from 'viem/chains';

const ABI_ERC20 = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
]);

const USDC_ADDRESS = '0x549943e04f40284185054145c6E4e9568C1D3241';
const ORDER_AMOUNT_TOTAL = 5000;
const ORDER_AMOUNT_IN = 1000;

const run = async () => {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY is not set');
  }

  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    throw new Error('RPC_URL is not set');
  }

  const twapRouterAddress = process.env.TWAP_ROUTER_ADDRESS;
  if (!twapRouterAddress) {
    throw new Error('TWAP_ROUTER_ADDRESS is not set');
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: berachain,
    transport: http(rpcUrl),
  });

  const usdcContract = getContract({
    address: USDC_ADDRESS,
    abi: ABI_ERC20,
    client,
  });

  const userBalance = await usdcContract.read.balanceOf([account.address]);
  console.log('User Balance:', userBalance);

  const allowance = await usdcContract.read.allowance([
    account.address,
    twapRouterAddress as `0x${string}`,
  ]);
  console.log('Allowance:', allowance);

  if (allowance < ORDER_AMOUNT_TOTAL * 10 ** 6) {
    console.log('Approving...');
    const approveTx = await usdcContract.write.approve([
      twapRouterAddress as `0x${string}`,
      BigInt(ORDER_AMOUNT_TOTAL * 10 ** 6),
    ]);
    console.log('Approve Tx:', approveTx);
  }

  const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
  });

  const response = await axiosClient.get('/orders', {
    params: {
      tokenIn: USDC_ADDRESS,
      tokenOut: '0x6969696969696969696969696969696969696969',
      intervalSecs: '60',
      orderAmountIn: ORDER_AMOUNT_IN,
      totalAmountIn: ORDER_AMOUNT_TOTAL,
      recipient: account.address,
      slippage: '0.01',
    },
  });

  console.log('Create Order Calldata:', response.data);

  const tx = await client.sendTransaction({
    to: twapRouterAddress as `0x${string}`,
    data: response.data,
  });

  console.log('Create Order Tx:', tx);
};

void run();
