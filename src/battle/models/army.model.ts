import { Column, ForeignKey, Model, Table, BelongsTo} from 'sequelize-typescript';
import { Battle } from './battle.model';

@Table
export class Army extends Model {
  @Column
  name: string;

  @Column
  units: number;

  @Column
  strategy: string;

  @Column
  reloadTime: Date;

  @ForeignKey(()=> Battle)
  @Column
  battleId: number;

  @BelongsTo(() => Battle)
  battle: Battle;



  attackChancesAndDamage(unitCount:number):number {
    const chance = []
    for (let i = 0; i < unitCount; i++) {
      const hit = Math.random() < unitCount / 100
      chance.push(hit)
    }
    return chance.filter(Boolean).length * 0.5;
  }
}