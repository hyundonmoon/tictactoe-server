import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { REQUIRED_PLAYERS } from './constants/gameplay.constants';
import {
  GAME_CLIENT_TO_SERVER,
  GAME_SERVER_TO_CLIENT,
  ROOM_CLIENT_TO_SERVER,
  ROOM_SERVER_TO_CLIENT,
} from './constants/socket.constants';
import { ActiveGames } from './db/games';
import {
  addActiveRoom,
  addPendingRoom,
  deletePendingRoom,
  getActiveRoom,
  getActiveRoomsList,
  getPendingRoom,
  removeUserFromRoom,
} from './db/rooms';
import handleDisconnect from './handlers/handleDisconnect';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './models/socket.model';
import Game from './utils/Game';
import createRoom from './utils/generateRoom';

const app = express();
const server = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: 'http://localhost:5173',
  },
});

const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/rooms', (req, res) => {
  const filter = req.query.filter as 'waiting' | 'all';
  const rooms = getActiveRoomsList(filter);
  res.json(rooms);
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on(ROOM_CLIENT_TO_SERVER.CREATE, ({ name, password, isPrivate }) => {
    const newRoom = createRoom(socket.id, name, password ?? '', isPrivate);
    newRoom.timeout = setTimeout(
      () => {
        deletePendingRoom(newRoom.id);
      },
      1000 * 60 * 2
    );
    addPendingRoom(newRoom);

    socket.emit(ROOM_SERVER_TO_CLIENT.PENDING, { roomId: newRoom.id });
  });

  socket.on(ROOM_CLIENT_TO_SERVER.JOIN, (roomId: string) => {
    // TODO: I feel like there's room for improvement here
    const pendingRoom = getPendingRoom(roomId);

    if (pendingRoom) {
      if (pendingRoom.owner === socket.id) {
        console.log('Owner joining');
        clearTimeout(pendingRoom.timeout);
        pendingRoom.players.push(socket.id);
        deletePendingRoom(pendingRoom.id);
        addActiveRoom(pendingRoom);
        socket.join(roomId);
        socket.emit(ROOM_SERVER_TO_CLIENT.JOINED, { roomId });
      } else {
        // if a room is pending and the user who asks to join isn't the owner, they shouldn't be able to join
        socket.emit(ROOM_SERVER_TO_CLIENT.NOT_FOUND);
      }

      return;
    }

    const activeRoom = getActiveRoom(roomId);

    if (activeRoom) {
      if (activeRoom.players.length >= REQUIRED_PLAYERS) {
        socket.emit(ROOM_SERVER_TO_CLIENT.FULL);
        return;
      }

      if (activeRoom.password) {
        socket.emit(ROOM_SERVER_TO_CLIENT.PASSWORD_REQUIRED, { roomId });
        return;
      }

      activeRoom.players.push(socket.id);
      socket.join(roomId);
      socket.emit(ROOM_SERVER_TO_CLIENT.JOINED, { roomId });

      return;
    }

    socket.emit(ROOM_SERVER_TO_CLIENT.NOT_FOUND);
  });

  socket.on(ROOM_CLIENT_TO_SERVER.JOIN_PASSWORD, (roomId, password) => {
    const activeRoom = getActiveRoom(roomId);

    if (activeRoom) {
      if (password !== activeRoom.password) {
        socket.emit(ROOM_SERVER_TO_CLIENT.WRONG_PASSWORD, { roomId });
        return;
      }

      if (activeRoom.players.length >= REQUIRED_PLAYERS) {
        socket.emit(ROOM_SERVER_TO_CLIENT.FULL);
        return;
      }

      activeRoom.players.push(socket.id);
      socket.join(roomId);
      socket.emit(ROOM_SERVER_TO_CLIENT.JOINED, { roomId });

      return;
    }

    socket.emit(ROOM_SERVER_TO_CLIENT.NOT_FOUND);
  });

  socket.on(ROOM_CLIENT_TO_SERVER.LEAVE, (roomId: string) => {
    removeUserFromRoom(io, socket, roomId);
  });

  socket.on(
    GAME_CLIENT_TO_SERVER.READY,
    (roomId: string, playerId: string, playerName: string) => {
      console.log('server ready event', { playerId, playerName });
      const game = ActiveGames.get(roomId);

      if (game) {
        if (game.players.length < REQUIRED_PLAYERS) {
          game.addPlayer(playerId, playerName);

          if (game.isPlayable) {
            game.startGame();

            io.to(roomId).emit(GAME_SERVER_TO_CLIENT.START, {
              players: game.players,
              board: game.board,
              currentTurnPlayerId: game.firstPlayerId,
            });
          }
        }
      } else {
        ActiveGames.set(roomId, new Game(playerId, playerName));
      }
    }
  );

  socket.on('disconnecting', () => {
    handleDisconnect(io, socket);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.rooms);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
