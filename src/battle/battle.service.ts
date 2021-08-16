import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { classToPlain } from 'class-transformer';
import { ArmyDTO } from './dtos/army.dto';
import { BattleDTO } from './dtos/battle.dto';
import { AttackStrategy, BattleStatus } from './utils/enums';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger, QueryOptions } from 'winston';

@Injectable()
export class BattleService implements OnApplicationShutdown {
  private startedBattles = []; //minimum 2 max 5
  private queuedBattles = [];
  constructor(
    @InjectModel(Battle)
    private battleModel: typeof Battle,
    @InjectModel(Army)
    private armyModel: typeof Army,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.populateBattles();
  }

  private async populateBattles() {
    this.queuedBattles.push(
      ...(await this.battleModel.findAll({
        where: { status: BattleStatus.QUEUED },
        include: [Army],
      })),
    );

    this.startedBattles.push(
      ...(await this.battleModel.findAll({
        where: {
          status: BattleStatus.STARTED,
        },
        include: [Army],
      })),
    );
  }

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
      return `Created an army with the id ${newArmy.id} and added to battle ${newArmy.battleId}`;
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

    const battleExistsAndIsCreated =
      battleToStart && battleToStart.status === 'created';

    if (!battleExistsAndIsCreated) {
      return "Battle can't be started or doesn't exist.";
    }

    const hasThreeOrMoreArmies = battleToStart.units.length >= 3;
    const thereAreBetweenTwoAndFiveStartedBattles =
      this.startedBattles.length >= 2 || this.startedBattles.length === 4;
    const thereAreFiveStartedBattles = this.startedBattles.length === 5;
    const isQueueEmpty = this.queuedBattles.length === 0;
    const doesQueueHaveAtLeastOneBattle = this.queuedBattles.length >= 1;

    if (!hasThreeOrMoreArmies) {
      return "Battle doesn't have enough armies to start";
    }

    if (
      thereAreFiveStartedBattles ||
      (isQueueEmpty && this.startedBattles.length < 2)
    ) {
      battleToStart.status = BattleStatus.QUEUED;
      this.queuedBattles.push(battleToStart);
      await battleToStart.save();
      this.logger.info(`Battle ${battleToStart.id} has been queued`, {
        battleID: battleToStart.id,
      });
      return 'Battle has been queued.';
    }

    if (
      thereAreBetweenTwoAndFiveStartedBattles ||
      doesQueueHaveAtLeastOneBattle
    ) {
      battleToStart.status = BattleStatus.STARTED;
      this.startedBattles.push(battleToStart);
      await battleToStart.save();
      this.battlefield(battleToStart);
      let length =
        this.queuedBattles.length < 5 - this.startedBattles.length
          ? this.queuedBattles.length
          : 5 - this.startedBattles.length;

      for (let i = 0; i < length; i++) {
        let queuedBattleToStart = this.queuedBattles.shift();
        queuedBattleToStart.status = BattleStatus.STARTED;
        await queuedBattleToStart.save();
        this.startedBattles.push(queuedBattleToStart);
        this.battlefield(queuedBattleToStart);
        this.logger.info(`Battle ${battleToStart.id} has started`, {
          battleID: battleToStart.id,
        });
      }
      return 'Battles have started!';
    }

    return 'The battle has already started or been queued to start';
  }

  async battlefield(battle: Battle) {
    let armies = battle.units;

    while (armies.length > 1) {
      for (let i = 0; i < armies.length; i++) {
        const attacker = armies[i];
        const canAttack =
          !attacker.reloadTime || attacker.reloadTime.getTime() < Date.now();

        if (canAttack) {
          this.logger.info(
            `Battle ${attacker.battleId}.Army ${attacker.id} chosen as attacker`,
            { battleID: attacker.battleId, armyID: attacker.id },
          );
          const damage = attacker.attackChancesAndDamage(attacker.units);
          const defender = await this.chooseDefender(
            attacker.strategy,
            attacker.id,
            armies,
          );
          this.logger.info(
            `Battle ${attacker.battleId}.Army with the id ${attacker.id} attacks army with the id ${defender.id} and inflicts ${damage} `,
            {
              battleID: attacker.battleId,
              attackerID: attacker.id,
              defenderID: defender.id,
              damage: damage,
            },
          );
          const result = this.receiveDamage(damage, defender);

          if (result.units === 0) {
            armies = armies.filter(army => army.id !== result.id);
          }

          battle.units = battle.units.map(unit => {
            if (unit.id === result.id) {
              return result;
            }
            return unit;
          });

          const attackerReloaded = await this.setAttackerReload(attacker);
          this.logger.info(
            `Battle ${attacker.battleId}.Army with the ${attacker.id} started reload `,
            { battleID: attacker.battleId, attackerID: attacker.id },
          );
          battle.units.forEach(unit => {
            if (unit.id === attackerReloaded.id) {
              return attackerReloaded;
            }
            return unit;
          });
        }
      }
    }
    if (armies.length === 1) {
      battle.status = BattleStatus.FINISHED;
      battle.units.forEach(army => {
        if (army.units === 0) {
          army.destroy();
        } else {
          army.save();
        }
      });
      this.startedBattles = this.startedBattles.filter(b => b.id !== battle.id);
      battle.save();
      this.logger.info(`Battle ${battle.id} finished`, { battleID: battle.id });
    }
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
    this.logger.info(
      `Battle ${defender.battleId}.Army ${defender.id} chosen as defender based on strategy`,
      { battleID: defender.battleId, armyID: defender.id },
    );
    return defender;
  }

  receiveDamage(hits: number, defender: Army): Army {
    if (hits - defender.units === -0.5 || hits - defender.units >= 0) {
      defender.units = 0;
    } else {
      let unitsRemaining = defender.units - hits;
      if (unitsRemaining === 0.5) unitsRemaining = 1;
      defender.units = Math.floor(unitsRemaining);
    }

    return defender;
  }

  setAttackerReload(attacker: Army): Army {
    const time = new Date(Date.now() + attacker.units * 10); //10 is the number of miliseconds it takes to reload
    attacker.reloadTime = time;
    return attacker;
  }
  resetStartedBattle(battleId: number): void {
    const battle = this.startedBattles.find(battle => battle.id === battleId);
    if (battle) {
      this.startedBattles = this.startedBattles.filter(
        battle => battle.id !== battleId,
      );
      this.battlefield(battle);
      this.logger.info(`Battle ${battle.id} has been restarted`, {
        battleID: battle.id,
        restarted: true,
      });
    }
  }
  //save unfinished battle
  async onApplicationShutdown(signal: string) {
    if (this.startedBattles.length > 0) {
      await this.updateStarted();
    }
    console.log(signal);
  }

  async updateStarted(): Promise<any> {
    this.startedBattles.forEach(async battle => {
      await battle.save();
      battle.units.forEach(async army => {
        await army.save();
      });
    });
    return Promise.resolve(null);
  }

  async getLogs(startDate, battleId) {
    const options: QueryOptions = {
      from: startDate,
      until: new Date(),
      limit: 5000,
      fields: ['timestamp', 'message', 'battleID'],
    };
    let results = [];

    let promise: { file: [] } = await new Promise((resolve, reject) =>
      this.logger.query(options, (err: Error, result: { file: [] }) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      }),
    );

    results = promise.file;
    console.log(results.length > 0);
    if (results.length > 0) {
      const filtered = results.filter(item => {
        return item.battleID == battleId;
      });
      return filtered;
    }
    return 'Battle did not occure on the given date';
  }
}
