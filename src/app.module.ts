import { TwapExecutorModule } from './features/twap-executor/twap-executor.module';
import { OrdersModule } from './features/orders/orders.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [OrdersModule, TwapExecutorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
