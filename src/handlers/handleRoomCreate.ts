import { Socket } from 'socket.io';
import { ROOM_SERVER_TO_CLIENT } from '../constants/socket.constants';
import { addPendingRoom, deletePendingRoom } from '../db/rooms';
import { CreateRoomRequestParams } from '../models/room.model';
import createRoom from '../utils/generateRoom';

export default function handleRoomCreate(
  this: Socket, // https://www.typescriptlang.org/docs/handbook/2/functions.html#declaring-this-in-a-function
  { name, password, isPrivate }: CreateRoomRequestParams
) {
  const socket = this;
  const newRoom = createRoom(socket.id, name, password ?? '', isPrivate);
  newRoom.timeout = setTimeout(
    () => {
      deletePendingRoom(newRoom.id);
    },
    1000 * 60 * 2
  );
  addPendingRoom(newRoom);
  socket.emit(ROOM_SERVER_TO_CLIENT.PENDING, { roomId: newRoom.id });
}
