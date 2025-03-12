import { CreateOrderDto } from './dtos/create-order.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Returns the calldata to build a transaction for creating a new order in the OBTwapRouter Contract.
   */
  @ApiResponse({
    status: 200,
    description: 'The calldata as a hex string',
    type: String,
  })
  @Get()
  createOrder(@Query() createOrderRequest: CreateOrderDto) {
    return this.ordersService.getCreateOrderPayload(createOrderRequest);
  }
}
