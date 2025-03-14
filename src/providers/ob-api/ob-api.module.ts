import { OBApiService } from './ab-api.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [OBApiService],
  exports: [OBApiService],
})
export class OBApiModule {}
