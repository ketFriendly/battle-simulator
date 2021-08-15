import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Exclude()
export class BattleIdDTO {
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  battleId: number;
}
