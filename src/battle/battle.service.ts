import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';
import { battlestatus } from '../utils/enums'
import { AddArmyDTO } from './dtos/addArmy.dto';


@Injectable()
export class BattleService {
  constructor(
    @InjectModel(Battle)
    private battleModel: typeof Battle,
    @InjectModel(Army)
    private armyModel: typeof Army,
  ) { }

  async createBattle(): Promise<number> {
    const battle = await this.battleModel.create({ status: battlestatus.CREATED, units: [] });
    return battle.id;
  }
  async addArmy(army: AddArmyDTO) {
    const battles = await this.battleModel.findAll({ where: { status: battlestatus.CREATED } });
    console.log(battles)
    if (battles.length>0) {
      const tempArmy = new this.armyModel(army);
      tempArmy.battleId = battles[0].id;
      tempArmy.battle = battles[0];
      const newArmy =  await tempArmy.save();
      return `Created an army with the id ${newArmy.id}`;
    }
    return "Cannot add army as all battles have already started or finished. Try creating a new battle."
  }
}