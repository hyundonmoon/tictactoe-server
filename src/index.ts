import console from 'console';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import {
  GAME_CLIENT_TO_SERVER,
  ROOM_CLIENT_TO_SERVER,
} from './constants/socket.constants';
import { getActiveRoomsList } from './db/rooms';
import handleDisconnect from './handlers/handleDisconnect';
import handleGameAction from './handlers/handleGameAction';
import handleGameJoin from './handlers/handleGameJoin';
import handleGamePlayAgain from './handlers/handleGamePlayAgain';
import handleRoomCreate from './handlers/handleRoomCreate';
import handleRoomJoin from './handlers/handleRoomJoin';
import handleRoomLeave from './handlers/handleRoomLeave';
import handleRoomPasswordJoin from './handlers/handleRoomPasswordJoin';
import { GameAction } from './models/game.model';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from './models/socket.model';

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
  socket.on(ROOM_CLIENT_TO_SERVER.CREATE, handleRoomCreate);
  socket.on(ROOM_CLIENT_TO_SERVER.JOIN, handleRoomJoin);
  socket.on(ROOM_CLIENT_TO_SERVER.JOIN_PASSWORD, handleRoomPasswordJoin);

  socket.on(ROOM_CLIENT_TO_SERVER.LEAVE, (roomId: string) => {
    handleRoomLeave(io, socket, roomId);
  });

  socket.on(
    GAME_CLIENT_TO_SERVER.JOIN,
    (roomId: string, playerId: string, playerName: string) => {
      handleGameJoin(io, socket, roomId, playerId, playerName);
    }
  );

  socket.on(
    GAME_CLIENT_TO_SERVER.PLAY_AGAIN,
    (roomId: string, playerId: string, playerName: string) => {
      handleGamePlayAgain(io, socket, roomId, playerId, playerName);
    }
  );

  socket.on(GAME_CLIENT_TO_SERVER.ACTION, (action: GameAction) => {
    handleGameAction(io, action);
  });

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
