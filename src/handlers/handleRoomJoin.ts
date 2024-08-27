import { Socket } from 'socket.io';
import { REQUIRED_PLAYERS } from '../constants/gameplay.constants';
import { ROOM_SERVER_TO_CLIENT } from '../constants/socket.constants';
import {
  getPendingRoom,
  deletePendingRoom,
  addActiveRoom,
  getActiveRoom,
} from '../db/rooms';

export default function handleRoomJoin(this: Socket, roomId: string) {
  const socket = this;
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
}
