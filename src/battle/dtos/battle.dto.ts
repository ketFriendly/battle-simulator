import { Exclude, Expose, Transform, Type } from "class-transformer"
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator"
import { BattleStatus } from "../../utils/constants"
import { BattleStatusType } from "../../utils/types"
import { ArmyDTO } from "./army.dto"

@Exclude()
export class BattleDTO {
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    id: number

    @Expose()
    @IsEnum(BattleStatus)
    @IsNotEmpty()
    status:BattleStatusType
    
    @Expose()
    @Type(()=> ArmyDTO)
    @IsNotEmpty()
    units:ArmyDTO[]

    constructor(partial: Partial<BattleDTO>) {
        Object.assign(this, partial);
      }
}