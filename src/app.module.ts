import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Army } from './battle/models/army.model';
import { Battle } from './battle/models/battle.model';
import { BattleModule } from './battle/battle.module';
import { config } from "dotenv";

config()
@Module({
  imports: [SequelizeModule.forRoot({
    dialect: 'postgres',
    host: 'localhost',
    port: parseInt(process.env.PGPORT)||5432,
    username: process.env.PGUSER,
    password: process.env.PGPASS,
    database: process.env.PGDB,
    models: [Battle,Army],
    synchronize: true,
    autoLoadModels:true
  }),
  BattleModule
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
