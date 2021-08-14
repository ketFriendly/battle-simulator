import { Exclude, Expose } from "class-transformer"
import { IsInt, IsString, Contains, Max, Min, MaxLength, IsEnum} from "class-validator"
import { StrategyTypes } from "../../utils/constants"
import { StrategyType } from "../../utils/types"


@Exclude()
export class ArmyDTO {
    @Expose()
    @IsString()
    @MaxLength(20)
    name: string

    @Expose()
    @IsInt()
    @Min(80)
    @Max(100)
    units: number

    @Expose()
    @IsEnum(StrategyTypes)
    strategy: StrategyType

    constructor(partial: Partial<ArmyDTO>) {
        Object.assign(this, partial);
      }
}