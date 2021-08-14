import { Exclude, Expose, Transform, Type } from "class-transformer"
import { IsEnum, IsNumber } from "class-validator"
import { BattleStatus } from "../../utils/constants"
import { BattleStatusType } from "../../utils/types"
import { ArmyDTO } from "./army.dto"

@Exclude()
export class BattleDTO {
    @Expose()
    @IsNumber()
    id: number

    @Expose()
    @IsEnum(BattleStatus)
    status:BattleStatusType
    
    @Expose()
    @Type(()=> ArmyDTO)
    units:ArmyDTO[]

    constructor(partial: Partial<BattleDTO>) {
        Object.assign(this, partial);
      }
}