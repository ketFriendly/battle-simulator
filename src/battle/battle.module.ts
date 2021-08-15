import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BattleController } from './battle.controller';
import { BattleService } from './battle.service';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';


@Module({
  imports: [SequelizeModule.forFeature([Battle, Army])],
  providers: [BattleService],
  controllers: [BattleController],
})
export class BattleModule { }