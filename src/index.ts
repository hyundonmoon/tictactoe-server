import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './models/socket.model';
import {
  addActiveRoom,
  addPendingRoom,
  deletePendingRoom,
  getActiveRoom,
  getActiveRoomsList,
  getPendingRoom,
  removeUserFromRoom,
} from './db/rooms';
import createRoom from './utils/generateRoom';
import { MAX_PLAYERS } from './constants/gameplay.constants';
import cors from 'cors';
import {
  ROOM_CLIENT_TO_SERVER,
  ROOM_SERVER_TO_CLIENT,
} from './constants/socket.constants';

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
      if (activeRoom.players.length >= MAX_PLAYERS) {
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

      if (activeRoom.players.length === MAX_PLAYERS) {
        socket.emit('gameStart');
      }

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

      if (activeRoom.players.length >= MAX_PLAYERS) {
        socket.emit(ROOM_SERVER_TO_CLIENT.FULL);
        return;
      }

      activeRoom.players.push(socket.id);
      socket.join(roomId);
      socket.emit(ROOM_SERVER_TO_CLIENT.JOINED, { roomId });

      if (activeRoom.players.length === MAX_PLAYERS) {
        socket.emit('gameStart');
      }

      return;
    }

    socket.emit(ROOM_SERVER_TO_CLIENT.NOT_FOUND);
  });

  socket.on(ROOM_CLIENT_TO_SERVER.LEAVE, (roomId: string) => {
    removeUserFromRoom(io, socket, roomId);
  });

  socket.on('disconnecting', () => {
    if (socket.rooms.size) {
      Array.from(socket.rooms).forEach((roomId) => {
        removeUserFromRoom(io, socket, roomId);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.rooms);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
