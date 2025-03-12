import { OBApiModule } from 'src/providers/ob-api/ob-api.module';
import { TwapExecutorService } from './twap-executor.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [OBApiModule],
  controllers: [],
  providers: [TwapExecutorService],
})
export class TwapExecutorModule {}
