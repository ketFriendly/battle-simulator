import { Body, Controller, Post } from '@nestjs/common';
import { BattleService } from './battle.service';
import { AddArmyDTO } from './dtos/addArmy.dto';



@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) { }

  @Post()
  async createNewBattle(): Promise<number> {
    try {
      return await this.battleService.createBattle();
    }
    catch (error) {
      console.log(error);
    }
  }

  @Post('add-army')
  async addArmy(@Body('army') army: AddArmyDTO):Promise<string> {
    try{
      return await this.battleService.addArmy(army);
    }catch (error){
      console.log(error);
    }
  }
}