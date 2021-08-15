import {  Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Army } from './battle/models/army.model';
import { Battle } from './battle/models/battle.model';
import { BattleModule } from './battle/battle.module';
import { config } from 'dotenv';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

config();
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.PGPORT) || 5432,
      username: process.env.PGUSER,
      password: process.env.PGPASS,
      database: process.env.PGDB,
      models: [Battle, Army],
      synchronize: true,
      autoLoadModels: true,
    }),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          level: 'info',
          dirname: path.join(__dirname, './../logs/info'),
          filename: 'info.log',
        }),
        new winston.transports.File({
          level: 'error',
          dirname: path.join(__dirname, './../logs/error'),
          filename: 'error.log',
        }),
      ],
    }),
    BattleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
