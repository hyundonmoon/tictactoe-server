import { Server } from 'socket.io';
import {
  GAME_CLIENT_TO_SERVER,
  GAME_SERVER_TO_CLIENT,
  ROOM_CLIENT_TO_SERVER,
  ROOM_SERVER_TO_CLIENT,
} from '../constants/socket.constants';
import { GameAction, GameOverData, GameplayData } from './game.model';
import { CreateRoomRequestParams, RoomResponse } from './room.model';

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
  [ROOM_SERVER_TO_CLIENT.PLAYER_LEFT]: ({
    playerId,
  }: {
    playerId: string;
  }) => void;
  [ROOM_SERVER_TO_CLIENT.NEW_ROOM]: (roomData: RoomResponse) => void;
  [GAME_SERVER_TO_CLIENT.PENDING]: () => void;
  [GAME_SERVER_TO_CLIENT.START]: (data: GameplayData) => void;
  [GAME_SERVER_TO_CLIENT.ACTION]: (data: GameplayData) => void;
  [GAME_SERVER_TO_CLIENT.OVER]: (data: GameOverData) => void;
  [GAME_SERVER_TO_CLIENT.ABORT]: () => void;
}

export interface ClientToServerEvents {
  [ROOM_CLIENT_TO_SERVER.CREATE]: (params: CreateRoomRequestParams) => void;
  [ROOM_CLIENT_TO_SERVER.JOIN]: (roomId: string) => void;
  [ROOM_CLIENT_TO_SERVER.JOIN_PASSWORD]: (
    roomId: string,
    password: string
  ) => void;
  [ROOM_CLIENT_TO_SERVER.LEAVE]: (roomId: string) => void;
  [GAME_CLIENT_TO_SERVER.JOIN]: (
    roomId: string,
    playerId: string,
    playerName: string
  ) => void;
  [GAME_CLIENT_TO_SERVER.PLAY_AGAIN]: (
    roomId: string,
    playerId: string,
    playerName: string
  ) => void;
  [GAME_CLIENT_TO_SERVER.ACTION]: (action: GameAction) => void;
}

export interface InterServerEvents {}

export interface SocketData {}

export type IOServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
