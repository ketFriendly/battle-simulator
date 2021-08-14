import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';
import { BattleStatus } from '../utils/constants';
import { ArmyDTO } from './dtos/army.dto';
import { classToPlain } from 'class-transformer';
import { BattleDTO } from './dtos/battle.dto';


@Injectable()
export class BattleService {
  constructor(
    @InjectModel(Battle)
    private battleModel: typeof Battle,
    @InjectModel(Army)
    private armyModel: typeof Army,
  ) { }

  async createBattle(): Promise<number> {
    const battle = await this.battleModel.create({ status: BattleStatus[0], units: [] });
    return battle.id;
  }
  async addArmy(army: ArmyDTO): Promise<string> {
    const battles = await this.battleModel.findAll({ where: { status: BattleStatus[0] } });
    console.log(battles)
    if (battles.length > 0) {
      const tempArmy = new this.armyModel(army);
      tempArmy.battleId = battles[0].id;
      tempArmy.battle = battles[0];
      const newArmy = await tempArmy.save();
      return `Created an army with the id ${newArmy.id}`;
    }
    return "Cannot add army as all battles have already started or finished. Try creating a new battle."
  }

  async getAllBattles(): Promise<any> {
    const allBattles = await this.battleModel.findAll({ include: [Army] });
    const allBattlesDtos = allBattles.map(battle => classToPlain(new BattleDTO(battle.toJSON())));
    return allBattlesDtos;
  }

  async startBattle(id: number) {
    const battleToStart = await this.battleModel.findByPk(id, { include: [Army] });
    if (battleToStart && battleToStart.units.length >= 3 && battleToStart.status !== "finished") {
      battleToStart.status = BattleStatus[1];
      await battleToStart.save();
      await this.battlefield(battleToStart);
      return "Battle has started"
    }
    return `Battle with id ${id} either doesn't exist, doesn't have enough armies to start or is finished.`
  }

  async battlefield(battle: Battle) {
    while (battle.units.length > 1) {
      for (let i = 0; i < battle.units.length; i++) {
        const attacker = battle.units[i]
        if (attacker.reloadTime && attacker.reloadTime.getTime() > Date.now()) {
          const damage = attacker.attackChancesAndDamage(attacker.units);
          const defender = await this.chooseDefender(attacker.strategy, attacker.id, battle.units);
          const result = await this.receiveDamage(damage, defender);
          if (!result) {
            battle.units = battle.units.filter(unit => unit.id != defender.id);
            battle.save();
          } else {
            battle.units = battle.units.map(unit => {
              if (unit.id === result.id) {
                return result;
              }
              return unit;
            })
          }
          await this.setAttackerReload(attacker);
        }
      }
    }
  }

  async chooseDefender(strategy: string, attackerId: number, units: Army[]): Promise<Army> {
    const potentialDefenders = units.filter(unit => unit.id != attackerId);
    let defender = null;
    switch (strategy) {
      case "weakest": {
        potentialDefenders.sort((a, b) => (a.units > b.units ? 1 : -1));
        defender = potentialDefenders[0];
      }
      case "strongest": {
        potentialDefenders.sort((a, b) => (a.units > b.units ? -1 : 1));
        defender = potentialDefenders[0];
        break;
      }
      case "random": {
        defender = potentialDefenders[Math.floor(Math.random() * potentialDefenders.length)]
        break;
      }
    }
    return defender;
  }

  async receiveDamage(hits: number, defender: Army) {
    if (hits - defender.units === -0.5 || hits - defender.units <= 0) {
      this.armyModel.destroy({ where: { id: defender.id } });
      return null;
    }
    else {
      defender.units -= hits;
      const newArmy = await defender.save();
      return newArmy;
    }
  }

  async setAttackerReload(attacker: Army) {
    const time = new Date(Date.now() + attacker.units * 10); //10 is the number of miliseconds it takes to reload
    attacker.reloadTime = time;
    return await attacker.save();
  }
 
}

