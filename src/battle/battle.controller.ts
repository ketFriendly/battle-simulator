import { Body, Controller, Get, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BattleService } from './battle.service';
import { ArmyDTO } from './dtos/army.dto';
import { BattleDTO } from './dtos/battle.dto';
import { BattleIdDTO } from './dtos/battleId.dto';

@ApiTags('battle')
@Controller('battle')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  @ApiOperation({ summary: 'Create battle' })
  async createNewBattle(): Promise<number> {
    try {
      return await this.battleService.createBattle();
    } catch (error) {
      console.log(error);
    }
  }

  @Post('add-army')
  @ApiOperation({ summary: 'Add an army to existing battle' })
  @ApiBody({
    type: ArmyDTO,
    description: 'Army to create and enter the battle with',
  })
  async addArmy(@Body('army') army: ArmyDTO): Promise<string> {
    try {
      return await this.battleService.addArmy(army);
    } catch (error) {
      console.log(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all started games/battles' })
  async getAllGames(): Promise<BattleDTO> {
    try {
      return await this.battleService.getAllBattles();
    } catch (error) {
      console.log(error);
    }
  }

  @Patch()
  @ApiOperation({ summary: 'Start an existing battle' })
  @ApiBody({ type: BattleIdDTO, description: 'Id of the battle to start' })
  async startBattle(@Body('battleId') battleId: BattleIdDTO): Promise<string> {
    try {
      return await this.battleService.startBattle(battleId.battleId);
    } catch (error) {
      console.log(error);
    }
  }

  @Put()
  @ApiOperation({ summary: 'Reset a started battle' })
  @ApiBody({ type: BattleIdDTO, description: 'Id of the battle to restart' })
  async resetBattle(@Body('battleId') battleId: BattleIdDTO): Promise<any> {
    try {
      return await this.battleService.resetStartedBattle(battleId.battleId);
    } catch (error) {
      console.log(error);
    }
  }

  @Get('logs/recreate')
  @ApiOperation({ summary: 'Get battle data from log' })
  @ApiQuery({ name: 'startDate' })
  @ApiQuery({ name: 'battleId' })
  async recreateBattleFromLog(
    @Query('startDate') startDate: Date,
    @Query('battleId') battleId: string,
  ) {
    try {
      return await this.battleService.getLogs(startDate, battleId);
    } catch (error) {
      console.log(error);
    }
  }
}
