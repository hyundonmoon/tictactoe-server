import express, { Request } from 'express';
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
} from './db/rooms';
import createRoom from './utils/generateRoom';
import { MAX_PLAYERS } from './constants/gameplay.constants';

const app = express();
const server = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

const PORT = process.env.PORT || 3000;

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
        clearTimeout(pendingRoom.timeout);
        pendingRoom.players.push(socket.id);
        deletePendingRoom(pendingRoom.id);
        addActiveRoom(pendingRoom);
        socket.join(roomId);
        socket.emit('roomJoined', { roomId });
      } else {
        // if a room is pending and the user who asks the join isn't the user, they shouldn't be able to join
        socket.emit('roomNotFound');
      }

      return;
    }

    const activeRoom = getActiveRoom(roomId);

    if (activeRoom) {
      if (activeRoom.players.length > MAX_PLAYERS) {
        socket.emit('roomFull');
        return;
      }

      if (activeRoom.password && activeRoom.owner !== socket.id) {
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
      }

      if (activeRoom.players.length > MAX_PLAYERS) {
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

  socket.on('disconnecting', () => {
    console.log(socket.rooms); // TODO: handle removing active rooms from memory
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    console.log(socket.rooms);
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
