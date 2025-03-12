import { OBApiService } from './ab-api.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [OBApiService],
  exports: [OBApiService],
})
export class OBApiModule {}
