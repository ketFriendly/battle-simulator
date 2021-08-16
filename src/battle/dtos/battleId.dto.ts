import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Exclude()
export class BattleIdDTO {
  @ApiProperty()
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  battleId: number;
}
