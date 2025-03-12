import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

// TODO: Add validations for addresses and limits
export class CreateOrderDto {
  /**
   * The address of the token to be swapped in.
   *
   * @example 0x1234567890123456789012345678901234567890
   */
  @IsNotEmpty()
  @IsString()
  tokenIn!: string;

  /**
   * The address of the token to be swapped out.
   *
   * @example 0x1234567890123456789012345678901234567890
   */
  @IsNotEmpty()
  @IsString()
  tokenOut!: string;

  /**
   * The interval in seconds between each swap.
   *
   * @example 60
   */
  @IsNotEmpty()
  @IsNumberString()
  intervalSecs!: string;

  /**
   * The amount of tokens to be swapped in for each interval.
   *
   * @example 1000
   */
  @IsNotEmpty()
  @IsNumberString()
  orderAmountIn!: string;

  /**
   * The total amount of tokens to be swapped in. Should be greater than orderAmountIn and a multiple of orderAmountIn.
   *
   * @example 5000
   */
  @IsNotEmpty()
  @IsNumberString()
  totalAmountIn!: string;

  /**
   * The address of the recipient of the tokens.
   *
   * @example 0x1234567890123456789012345678901234567890
   */
  @IsNotEmpty()
  @IsString()
  recipient!: string;

  /**
   * The slippage for the order as a decimal value. Will be truncated to 4 decimal places.
   * Example: 0.01 = 1%
   *
   * @example 0.01
   */
  @IsNotEmpty()
  @IsNumberString()
  slippage!: string;
}
