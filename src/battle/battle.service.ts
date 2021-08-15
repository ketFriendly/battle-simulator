import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { classToPlain } from 'class-transformer';
import { ArmyDTO } from './dtos/army.dto';
import { BattleDTO } from './dtos/battle.dto';
import { AttackStrategy, BattleStatus } from './utils/enums';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';

@Injectable()
export class BattleService {
  constructor(
    @InjectModel(Battle)
    private battleModel: typeof Battle,
    @InjectModel(Army)
    private armyModel: typeof Army,
  ) { }

  async createBattle(): Promise<number> {
    const battle = await this.battleModel.create({
      status: BattleStatus.CREATED,
      units: [],
    });
    return battle.id;
  }

  async addArmy(army: ArmyDTO): Promise<string> {
    const battles = await this.battleModel.findAll({
      where: { status: BattleStatus.CREATED },
    });

    if (battles.length > 0) {
      const tempArmy = new this.armyModel(army);
      tempArmy.battleId = battles[0].id;
      tempArmy.battle = battles[0];
      const newArmy = await tempArmy.save();
      return `Created an army with the id ${newArmy.id}`;
    }
    return 'Cannot add army as all battles have already started or finished. Try creating a new battle.';
  }

  async getAllBattles(): Promise<any> {
    const allBattles = await this.battleModel.findAll({ include: [Army] });
    const allBattlesDtos = allBattles.map(battle =>
      classToPlain(new BattleDTO(battle.toJSON())),
    );
    return allBattlesDtos;
  }

  async startBattle(id: number) {
    const battleToStart = await this.battleModel.findByPk(id, {
      include: [Army],
    });
    if (
      battleToStart &&
      battleToStart.units.length >= 3 &&
      battleToStart.status !== 'finished'
    ) {
      battleToStart.status = BattleStatus.STARTED;
      await battleToStart.save();
      this.battlefield(battleToStart);

      return `Battle with an ID: ${battleToStart.id} has started.`;
    }
    return `Battle with id ${id} either doesn't exist, doesn't have enough armies to start or is finished.`;
  }

  async battlefield(battle: Battle) {
    let armies = battle.units;

    while (armies.length > 1) {
      for (let i = 0; i < armies.length; i++) {
        const attacker = armies[i];
        const canAttack =
          !attacker.reloadTime || attacker.reloadTime.getTime() < Date.now();

        if (canAttack) {
          const damage = attacker.attackChancesAndDamage(attacker.units);
          const defender = await this.chooseDefender(
            attacker.strategy,
            attacker.id,
            armies,
          );
          const result = await this.receiveDamage(damage, defender);

          if (!result) {
            armies = armies.filter(unit => unit.id != defender.id);
          } else {
            battle.units = battle.units.map(unit => {
              if (unit.id === result.id) {
                return result;
              }
              return unit;
            });
          }

          await this.setAttackerReload(attacker);
        }
      }
    }

    battle.status = BattleStatus.FINISHED;
    battle.save();
  }

  async chooseDefender(
    strategy: string,
    attackerId: number,
    units: Army[],
  ): Promise<Army> {
    const potentialDefenders = units.filter(unit => unit.id != attackerId);
    let defender = null;
    switch (strategy) {
      case AttackStrategy.WEAKEST: {
        potentialDefenders.sort((a, b) => (a.units > b.units ? 1 : -1));
        defender = potentialDefenders[0];
        break;
      }
      case AttackStrategy.STRONGEST: {
        potentialDefenders.sort((a, b) => (a.units > b.units ? -1 : 1));
        defender = potentialDefenders[0];
        break;
      }
      case AttackStrategy.RANDOM: {
        defender =
          potentialDefenders[
          Math.floor(Math.random() * potentialDefenders.length)
          ];
        break;
      }
    }
    return defender;
  }

  receiveDamage(hits: number, defender: Army) {
    if (hits - defender.units === -0.5 || hits - defender.units >= 0) {
      this.armyModel.destroy({ where: { id: defender.id } });
      return null;
    } else {
      let unitsRemaining = defender.units - hits;
      if (unitsRemaining === 0.5) unitsRemaining = 1;
      defender.units = Math.floor(unitsRemaining);

      return defender.save();
    }
  }

  setAttackerReload(attacker: Army) {
    const time = new Date(Date.now() + attacker.units * 10); //10 is the number of miliseconds it takes to reload
    attacker.reloadTime = time;
    return attacker.save();
  }
}
