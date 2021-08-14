import { Exclude, Expose } from "class-transformer"
import { IsInt, IsString, Max, Min, MaxLength, IsEnum, IsNotEmpty} from "class-validator"
import { StrategyTypes } from "../../utils/constants"
import { StrategyType } from "../../utils/types"


@Exclude()
export class ArmyDTO {
    @Expose()
    @IsString()
    @MaxLength(20)
    @IsNotEmpty()
    name: string

    @Expose()
    @IsInt()
    @Min(80)
    @Max(100)
    @IsNotEmpty()
    units: number

    @Expose()
    @IsEnum(StrategyTypes)
    @IsNotEmpty()
    strategy: StrategyType

    constructor(partial: Partial<ArmyDTO>) {
        Object.assign(this, partial);
      }
}