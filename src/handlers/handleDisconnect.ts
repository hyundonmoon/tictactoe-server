import { Socket } from 'socket.io';
import { GAME_SERVER_TO_CLIENT } from '../constants/socket.constants';
import { removeUserFromGame } from '../db/games';
import { removeUserFromRoom } from '../db/rooms';
import { IOServer } from '../models/socket.model';

export default function handleDisconnect(io: IOServer, socket: Socket) {
  if (socket.rooms.size) {
    Array.from(socket.rooms).forEach((roomId) => {
      const game = removeUserFromGame(roomId, socket.id);
      removeUserFromRoom(io, socket, roomId);

      if (game && game.isAborted) {
        socket.to(roomId).emit(GAME_SERVER_TO_CLIENT.ABORT); // emits to room, exluding itself
      }
    });
  }
}
