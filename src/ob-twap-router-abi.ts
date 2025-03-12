export const twapRouterAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_obRouter',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'createTwapOrder',
    inputs: [
      {
        name: 'tokenIn',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tokenOut',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'intervalSecs',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'orderAmountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'totalAmountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'slippage',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'orderId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeOrder',
    inputs: [
      {
        name: 'orderId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'pathDefinition',
        type: 'bytes',
        internalType: 'bytes',
      },
      {
        name: 'outputQuote',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'executor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'referralCode',
        type: 'uint32',
        internalType: 'uint32',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getPendingOrderIds',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'obRouter',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'orders',
    inputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'tokenIn',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tokenOut',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'intervalSecs',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'orderAmountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'lastExecuted',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'totalAmountIn',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'totalExecuted',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'slippage',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'TwapOrderCreated',
    inputs: [
      {
        name: 'orderId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'tokenIn',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenOut',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'intervalSecs',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'lastExecuted',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'orderAmountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalAmountIn',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'slippage',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
] as const;
