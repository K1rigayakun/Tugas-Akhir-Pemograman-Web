import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class PlaceBidDto {
  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  @IsUUID()
  idempotencyKey!: string;
}
