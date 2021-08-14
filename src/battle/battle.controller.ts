import { Body, Controller, Get, Post } from '@nestjs/common';
import { BattleService } from './battle.service';
import { ArmyDTO } from './dtos/army.dto';
import { BattleDTO } from './dtos/battle.dto';



@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) { }

  @Post()
  async createNewBattle(): Promise<number> {
    try {
      return await this.battleService.createBattle();
    } catch (error) {
      console.log(error);
    }
  }

  @Post('add-army')
  async addArmy(@Body('army') army: ArmyDTO): Promise<string> {
    try {
      return await this.battleService.addArmy(army);
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  async getAllGames():Promise<BattleDTO>{
    try {
      return await this.battleService.getAllBattles()
    } catch (error) {
      console.log(error)
    }
  }
}