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

  socket.on('createRoom', ({ name, password, isPrivate }) => {
    const newRoom = createRoom(socket.id, name, password ?? '', isPrivate);
    newRoom.timeout = setTimeout(
      () => {
        deletePendingRoom(newRoom.id);
      },
      1000 * 60 * 2
    );
    addPendingRoom(newRoom);

    socket.emit('roomPending', { roomId: newRoom.id });
  });

  socket.on('joinRoom', (roomId: string) => {
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
        socket.emit('roomJoined', { roomId });
      } else {
        // if a room is pending and the user who asks to join isn't the owner, they shouldn't be able to join
        socket.emit('roomNotFound');
      }

      return;
    }

    const activeRoom = getActiveRoom(roomId);

    if (activeRoom) {
      if (activeRoom.players.length >= MAX_PLAYERS) {
        socket.emit('roomFull');
        return;
      }

      if (activeRoom.password) {
        socket.emit('passwordRequired', { roomId });
        return;
      }

      activeRoom.players.push(socket.id);
      socket.join(roomId);
      socket.emit('roomJoined', { roomId });

      if (activeRoom.players.length === MAX_PLAYERS) {
        socket.emit('gameStart');
      }

      return;
    }

    socket.emit('roomNotFound');
  });

  socket.on('joinRoomWithPassword', (roomId, password) => {
    const activeRoom = getActiveRoom(roomId);

    if (activeRoom) {
      if (password !== activeRoom.password) {
        socket.emit('passwordWrong', { roomId });
        return;
      }

      if (activeRoom.players.length >= MAX_PLAYERS) {
        socket.emit('roomFull');
        return;
      }

      activeRoom.players.push(socket.id);
      socket.join(roomId);
      socket.emit('roomJoined', { roomId });

      if (activeRoom.players.length === MAX_PLAYERS) {
        socket.emit('gameStart');
      }

      return;
    }

    socket.emit('roomNotFound');
  });

  socket.on('leaveRoom', (roomId: string) => {
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
