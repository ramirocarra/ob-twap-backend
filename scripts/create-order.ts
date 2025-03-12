import axios from 'axios';

const run = async () => {
  const axiosClient = axios.create({
    baseURL: 'http://localhost:3000',
  });

  const response = await axiosClient.get('/orders', {
    params: {
      tokenIn: '0x1234567890123456789012345678901234567890',
      tokenOut: '0x1234567890123456789012345678901234567890',
      intervalSecs: '60',
      orderAmountIn: '1000',
      totalAmountIn: '5000',
      recipient: '0x1234567890123456789012345678901234567890',
      slippage: '0.01',
    },
  });

  console.log('Create Order Calldata:', response.data);
};

void run();
