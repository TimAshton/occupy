# Occupy
Location-based strategy game.

## Tech Stack
* Client App - React Native
* Cloud Infratstructure - AWS
* Database - DynamoDB
* API - Java/OpenAPI
* Server - NodeJS

## Overview
![Alt Occupy UI Wireframe](occupy-ui-wireframe.png)

## Service Layer
### Data Structure Summary
* GameSystem
    * currentVersion - string
* Season
    * seasonId - string
    * created - datetime
    * updated - datetime
    * status - enum
    * title - string
    * description - string
* Player
    * playerId - string
    * playerHash - string
    * created - datetime
    * updated - datetime
    * status - enum
    * handle - string
    * email - string
    * mobile - string
    * settlerCount - float
* Game
    * gameId - string
    * created - datetime
    * updated - datetime
    * status - enum
* Sector
    * sectorId - string
    * created - datetime
    * updated - datetime
    * gameId - string
    * ownerId - string
    * settlerCount - integer
    * sectorXCoord - float
    * sectorYCoord - float
    * claimXCoord - float
    * claimYCoord - float
    * elevation - float

## Game Info
### Sectors
I only define a sector when it is claimed. This is opposed to trying to create every possible sector first.

Sector coords define sector boarders. Claim coords are where a plauer is when the submit a claim.
