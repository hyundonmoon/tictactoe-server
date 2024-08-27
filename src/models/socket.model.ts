import { CreateRoomRequestParams } from './room.model';
import {
  ROOM_CLIENT_TO_SERVER,
  ROOM_SERVER_TO_CLIENT,
} from '../constants/socket.constants';

export interface ServerToClientEvents {
  [ROOM_SERVER_TO_CLIENT.PENDING]: ({ roomId }: { roomId: string }) => void;
  [ROOM_SERVER_TO_CLIENT.JOINED]: ({ roomId }: { roomId: string }) => void;
  [ROOM_SERVER_TO_CLIENT.PASSWORD_REQUIRED]: ({
    roomId,
  }: {
    roomId: string;
  }) => void;
  [ROOM_SERVER_TO_CLIENT.WRONG_PASSWORD]: ({
    roomId,
  }: {
    roomId: string;
  }) => void;
  [ROOM_SERVER_TO_CLIENT.FULL]: () => void;
  [ROOM_SERVER_TO_CLIENT.NOT_FOUND]: () => void;
  gameStart: () => void;
  [ROOM_SERVER_TO_CLIENT.PLAYER_LEFT]: ({
    playerId,
  }: {
    playerId: string;
  }) => void;
}

export interface ClientToServerEvents {
  [ROOM_CLIENT_TO_SERVER.CREATE]: (params: CreateRoomRequestParams) => void;
  [ROOM_CLIENT_TO_SERVER.JOIN]: (roomId: string) => void;
  [ROOM_CLIENT_TO_SERVER.JOIN_PASSWORD]: (
    roomId: string,
    password: string
  ) => void;
  [ROOM_CLIENT_TO_SERVER.LEAVE]: (roomId: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {}
