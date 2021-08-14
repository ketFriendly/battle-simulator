import { Expose } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";


export class BattleIdDTO{
    @Expose()
    @IsNumber()
    @IsNotEmpty()
    battleId: number;
}