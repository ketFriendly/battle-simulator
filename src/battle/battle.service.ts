import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';
import { battlestatus } from '../utils/enums'


@Injectable()
export class BattleService {
  constructor(
    @InjectModel(Battle)
    private battleModel: typeof Battle,
    @InjectModel(Army)
    private armyModel: typeof Army,
  ) {}

  async createBattle():Promise<number>{
    const battle = await this.battleModel.create({status:battlestatus.CREATED, units:null});
    return battle.id;
  }
}