import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { BattleService } from './battle.service';
import { ArmyDTO } from './dtos/army.dto';
import { BattleDTO } from './dtos/battle.dto';
import { BattleIdDTO } from './dtos/battleId.dto';



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

  @Patch()
  async startBattle(@Body('battleId') battleId: BattleIdDTO):Promise<string> {
    try {
      return await this.battleService.startBattle(battleId.battleId)
    } catch (error) {
      console.log(error)
    }
  }
}