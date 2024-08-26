import { CreateRoomRequestParams } from './room.model';

export interface ServerToClientEvents {
  roomPending: ({ roomId }: { roomId: string }) => void;
  roomJoined: ({ roomId }: { roomId: string }) => void;
  passwordRequired: ({ roomId }: { roomId: string }) => void;
  passwordWrong: ({ roomId }: { roomId: string }) => void;
  roomFull: () => void;
  roomNotFound: () => void;
  gameStart: () => void;
  playerLeft: ({ playerId }: { playerId: string }) => void;
}

export interface ClientToServerEvents {
  createRoom: (params: CreateRoomRequestParams) => void;
  joinRoom: (roomId: string) => void;
  joinRoomWithPassword: (roomId: string, password: string) => void;
  leaveRoom: (roomId: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {}
