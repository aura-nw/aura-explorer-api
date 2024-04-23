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

3. NodeJS

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

   Run the command: ```npm run start```

2. Docker way
   
   Use `docker-compose.yml` to set up MySQL, redis:
   
      Run the command:

      ```
         docker-compose up
      ```
   
   Use `Dockerfile` build and run image:
   
      Run the command to build docker image

      ```
         docker build -t <tag> .
      ```
   
      Run application

      ```
         docker run <tag>
      ```

## License
   This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
