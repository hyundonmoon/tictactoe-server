import { Socket } from 'socket.io';
import { REQUIRED_PLAYERS } from '../constants/gameplay.constants';
import { ROOM_SERVER_TO_CLIENT } from '../constants/socket.constants';
import { getActiveRoom } from '../db/rooms';

export default function handleRoomPasswordJoin(
  this: Socket,
  roomId: string,
  password: string
) {
  const socket = this;
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
}
