import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Army } from './models/army.model';
import { Battle } from './models/battle.model';


@Injectable()
export class BattleService {
  constructor(
    @InjectModel(Battle)
    private battleModel: typeof Battle,
    @InjectModel(Army)
    private armyModel: typeof Army,
  ) {}

  
}