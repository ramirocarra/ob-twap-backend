export interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amount: string;
  slippage: string;
  to: string;
}

export interface SwapResponse {
  status: string;
  blockNumber: number;
  tokenFrom: number;
  tokenTo: number;
  price: number;
  priceImpact: number;
  tokens: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  }[];
  tx: {
    to: string;
    data: string;
    value: string;
  };
  routerAddr: string;
  routerParams: {
    swapTokenInfo: {
      inputToken: string;
      inputAmount: string;
      outputToken: string;
      outputQuote: string;
      outputMin: string;
      outputReceiver: string;
    };
    pathDefinition: string;
    executor: string;
    referralCode: number;
    value: string;
  };
}

export interface SupportedToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  tokenURI: string;
}
