import { Controller, Get, Post } from '@nestjs/common';
import { BattleService } from './battle.service';


@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  async createNewBattle():Promise<number> {
    try{
      return await this.battleService.createBattle();
    }
    catch(error){
      console.log(error);
    }
  }
}