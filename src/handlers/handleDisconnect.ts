import { Socket } from 'socket.io';
import { removeUserFromGame } from '../db/games';
import { removeUserFromRoom } from '../db/rooms';
import { IOServer } from '../models/socket.model';

export default function handleDisconnect(io: IOServer, socket: Socket) {
  if (socket.rooms.size) {
    Array.from(socket.rooms).forEach((roomId) => {
      removeUserFromGame(roomId, socket.id);
      removeUserFromRoom(io, socket, roomId);
    });
  }
}
