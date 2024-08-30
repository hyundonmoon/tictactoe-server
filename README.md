# Tic-Tac-Toe Game

## Overview

This is the backend app for the Tic-Tac-Toe game, implemented using Node.js, Express, and Socket.io. It manages game room creation, player connections, real-time communication between players, and game state management.

## Features

- **Room Management**: Create and manage game rooms, including password protection and player limits.
- **Real-Time Communication**: Handle real-time updates and interactions between players using Socket.io.
- **Game State Management**: Manage game state and provide updates to players.

## Built with

- Node.js
- Express
- Socket.io

## Installation

1. Clone repo

```bash
git clone https://github.com/hyundonmoon/tictactoe-server.git
```

2. Navigate to project directory

```bash
cd ./tictactoe-server
```

3. Install Dependencies

```bash
npm i
```

4. Start server

```bash
npm run dev
```

## Usage

### API

- GET /rooms: List all available game rooms, with optional query parameters to filter by whether room is full or not.

### Socket events

#### Room-related

The room-related events handle the creation, joining, and management of game rooms. Users may create rooms, join rooms with or without a password, and leave rooms as needed.

- Server to client

  - ROOM::PENDING
  - ROOM::JOINED
  - ROOM::NOT_FOUND
  - ROOM::FULL
  - ROOM::PASSWORD_REQUIRED
  - ROOM::WRONG_PASSWORD

* Client to server

  - ROOM::CREATE
  - ROOM::JOIN
  - ROOM::JOIN_PASSWORD
  - ROOM::LEAVE

#### Game-related

The game-related events manage the gameplay flow, including starting/joining a game, taking turns, and determining the game outcome. They handle the entire game lifecycle from a player joining the game to the game ending, and also support scenarios like game abortion or playing again.

- Server to client

  - GAME::JOINED
  - GAME::START
  - GAME::OVER
  - GAME::ACTION
  - GAME::ABORT
  - GAME::PENDING

- Client to server
  - GAME::JOIN
  - GAME::PLAY_AGAIN
  - GAME::ACTION

## Roadmap

- [ ] Use socket to update room list in real-time
- [ ] Add scoring system for games
- [ ] Absolute path imports
