import { SupportedToken, SwapRequest, SwapResponse } from './types';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class OBApiService {
  private readonly axiosInstance;
  private tokenListCache: SupportedToken[] | null = null;

  constructor(private configService: ConfigService) {
    const obApiUrl = this.configService.get<string>('OB_API_URL');
    if (!obApiUrl) {
      throw new Error('OB_API_URL is not set');
    }

    const obApiKey = this.configService.get<string>('OB_API_KEY');
    if (!obApiKey) {
      throw new Error('OB_API_KEY is not set');
    }

    this.axiosInstance = axios.create({
      baseURL: obApiUrl,
      headers: {
        Authorization: `Bearer ${obApiKey}`,
      },
    });
  }

  private handleAxiosError(error: AxiosError): never {
    if (error.response) {
      throw new Error(
        `OB API error: ${JSON.stringify(error.response.data, null, 2)}`,
      );
    }
    throw error;
  }

  async swap(request: SwapRequest): Promise<SwapResponse> {
    // TODO: Validate inputs
    const response = await this.axiosInstance
      .get<SwapResponse>('/v1/swap', {
        params: request,
      })
      // eslint-disable-next-line @typescript-eslint/unbound-method
      .catch(this.handleAxiosError);

    if (response.data.status !== 'Success') {
      throw new Error(
        `Could not find a route for the swap: ${JSON.stringify(response.data, null, 2)}`,
      );
    }

    return response.data;
  }

  async tokenList(): Promise<SupportedToken[]> {
    // TODO: implement cache expiration
    if (this.tokenListCache) {
      return this.tokenListCache;
    }

    const response = await this.axiosInstance
      .get<SupportedToken[]>('/v1/tokens')
      // eslint-disable-next-line @typescript-eslint/unbound-method
      .catch(this.handleAxiosError);

    this.tokenListCache = response.data;
    return this.tokenListCache;
  }

  async isTokenSupported(token: string): Promise<boolean> {
    const tokenList = await this.tokenList();
    return tokenList.some((t) => t.address === token);
  }
}
