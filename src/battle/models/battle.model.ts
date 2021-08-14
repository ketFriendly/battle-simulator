
import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import { Army } from './army.model';

@Table
export class Battle extends Model {

  @Column
  status: string;

  @HasMany(() => Army)
  units: Army[];
}