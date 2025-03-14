import { TwapExecutorModule } from './features/twap-executor/twap-executor.module';
import { OBApiModule } from 'src/providers/ob-api/ob-api.module';
import { OrdersModule } from './features/orders/orders.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    OBApiModule,
    OrdersModule,
    TwapExecutorModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
