import { Socket } from 'socket.io';
import { REQUIRED_PLAYERS } from '../constants/gameplay.constants';
import { ROOM_SERVER_TO_CLIENT } from '../constants/socket.constants';
import {
  addActiveRoom,
  deletePendingRoom,
  getActiveRoom,
  getPendingRoom,
} from '../db/rooms';
import { IOServer } from '../models/socket.model';

export default function handleRoomJoin(
  io: IOServer,
  socket: Socket,
  roomId: string
) {
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
      io.emit(ROOM_SERVER_TO_CLIENT.NEW_ROOM, {
        id: roomId,
        name: pendingRoom.name,
        playerCount: pendingRoom.players.length,
        hasPassword: !!pendingRoom.password,
      });
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
}
