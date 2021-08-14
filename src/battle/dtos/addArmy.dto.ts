import { Exclude, Expose } from "class-transformer"
import { IsInt, IsString, Contains, Max, Min, MaxLength, IsEnum} from "class-validator"
import { StrategyType, StrategyTypes } from "src/utils/enums"


@Exclude()
export class AddArmyDTO {
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
}