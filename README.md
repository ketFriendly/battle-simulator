<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# Battle Simulator

## Description

Application that simulates battles between 3+ armies. It was written using NestJS, Sequelize and PostgreSQL.

User needs to provide at least 2 battles with at least 3 armies each in order to initiate the battles.

Battle is first created, armies are added and then battle can be queued to start. After at least one more battle has been queued, they start (5 battles can be active simultaniously )

## Installation

```bash
$ npm install
```

## Running the app

Create the database (PostgreSQL) and adjust the .env file (see .env.example).

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# debug
$ npm run start:debug
```

## Usage

In order to consume the API you need to create couple of battles and assign armies.

List of available routes at http://localhost:3000/. You can find API docs at http://localhost:3000/api

| Method | Route                 |
| ------ | --------------------- |
| POST   | /battle               |
| POST   | /battle/add-army      |
| GET    | /battle               |
| PATCH  | /battle               |
| PUT    | /battle               |
| GET    | /battle/logs/recreate |

### POST /battle

Creates a battle, and returns an ID of it.

## POST /battle/add-army

Create an army and assign it to first available battle.

```
{
  "army": {
    "name": string,
    "units": number between 80 - 100,
    "strategy": "RANDOM" | "WEAKEST" | "STRONGEST
  }
}
```

### GET /battle

Retrieves all battles with their armies.

### PATCH /battle

Schedules a battle to start if proper conditions are met.
Body requires json in format of:

```
{
  "battleId": {
    "battleId": number
  }
}
```

### PUT /battle

Resets started battle.
Body requires json in format of:

```
{
  "battleId": {
    "battleId": number
  }
}
```

### GET /battle/logs/recreate

Recreate battle from logs
Requires query params:

```
  - startDate= Date
  - battleId= number

```

### Left to do:

- Seeding data
- Restarting the battle
- Error handling
- Returning more detailed responses 
