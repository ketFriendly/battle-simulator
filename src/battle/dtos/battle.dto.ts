import { Exclude, Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { BattleStatus } from '../utils/enums';
import { ArmyDTO } from './army.dto';

@Exclude()
export class BattleDTO {
  @Expose()
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @Expose()
  @IsEnum(BattleStatus)
  @IsNotEmpty()
  status: BattleStatus;

  @Expose()
  @Type(() => ArmyDTO)
  @IsNotEmpty()
  units: ArmyDTO[];

  constructor(partial: Partial<BattleDTO>) {
    Object.assign(this, partial);
  }
}
