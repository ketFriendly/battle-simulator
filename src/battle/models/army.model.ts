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

  @ForeignKey(()=> Battle)
  @Column
  battleId: number;

  @BelongsTo(() => Battle)
  battle: Battle;
}