import { Injectable } from '@nestjs/common';

@Injectable()
export class OBApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
