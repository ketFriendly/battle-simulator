import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AttackStrategy } from '../utils/enums';

@Exclude()
export class ArmyDTO {
  @ApiProperty()
  @Expose()
  @IsString()
  @MaxLength(20)
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @Expose()
  @IsInt()
  @Min(80)
  @Max(100)
  @IsNotEmpty()
  units: number;

  @ApiProperty()
  @Expose()
  @IsEnum(AttackStrategy)
  @IsNotEmpty()
  strategy: AttackStrategy;

  constructor(partial: Partial<ArmyDTO>) {
    Object.assign(this, partial);
  }
}
