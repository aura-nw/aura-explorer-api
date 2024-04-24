# Aura Explorer API

Aura Explorer API is a API Service for Aura Network explorer. Aura Explorer API also consume [Horoscope](https://github.com/aura-nw/horoscope-v2) for view the status of a blockchain transaction and analytics smart contract, then provides API for [AuraScan](https://github.com/aura-nw/aurascan) query data.

## Getting start

1. Clone the repository
 ```git clone https://github.com/aura-nw/aura-explorer-api ```

2. Navigate to the project folder
 ```cd aura-explorer-api ```

3. Install dependencies
 ```npm instal ```

## Install requirements
1. MySQL

    #### Download: https://dev.mysql.com/downloads/mysql/

2. Aura node

    #### Check the environment here: https://docs.aura.network/environment

3. NodeJS: Version 16 or higher.

    #### Download: https://nodejs.org/en/download/

5. Redis

   #### Download: https://redis.io/download/

## Configuration

  #### Create a `.env` from `.env.example`:
  ```
      cp .env.example .env
  ```

## NPM scripts

1. ```npm run build```: Creates a build directory.
2. ```npm run start```: Start production mode.
3. ```npm run lint```: Run ESLint.
4. ```npm run test```: Run tests & generate coverage report.
5. ```npm run migration:generate```: Create generate migration file.

## How to run

1. Native way

   Make sure you install the required dependencies (MySQL, Redis), you can install them manually or use docker-compose to start container in the background.

      Run the command:

      ```
         docker-compose up
      ```

   Build source and create a build directory.
   
      Run the command:

      ```
         npm run build
      ```

   Starting app
      
      Run the command:

      ```
         npm run start
      ```

3. Docker way
   
   Use `docker-compose.yml` to install the required dependencies MySQL, redis:
   
      Run the command:

      ```
         docker-compose up
      ```
   
   Use `Dockerfile` to build and run Docker image:
   
      Run the command to build Docker image

      ```
         docker build -t <tag> .
      ```
   
      Run application

      ```
         docker run <tag>
      ```
      
## Adding a new chain

Add new chain information to table explorer at db:

| chain_id | name | address_prefix | chain_db | minimal_denom | decimal  | explorer_url | evm_denom | evm_decimal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| id of chain (ex: evmos_9000-4) | name of chain (ex: Evmos Testnet) | address prefix (ex: evmos) | horoscope chain db to get data (ex: evmostestnet) | minimal denom of native coin (ex: evmos) | decimal of token (ex: 18) | url of website (ex: https://evmos.dev.aurascan.io) | evm denom of native coin (ex: atvemos) | evm decimal of native coin (ex: 18) |

If you encounter an error regarding the queue job for a new chain, please clear all delayed job and restart app.

Bullboard: http://localhost:[PORT]/admin/queues/queue/

## License
   This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
