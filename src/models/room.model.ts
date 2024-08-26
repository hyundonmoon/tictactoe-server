export interface Room {
  id: string; // uuid
  owner?: string; // socket id, used to identify creator when room is pending
  name: string; // user submitted name for room
  password?: string;
  isPrivate: boolean; // private rooms don't show up on the room list, doesn't necessarily have to have a password
  players: string[];
  createdAt: Date;
  timeout?: ReturnType<typeof setTimeout>;
}

export interface RoomResponse {
  id: string;
  name: string;
  playerCount: number;
  hasPassword: boolean;
}

export interface CreateRoomRequestParams {
  name: string;
  password?: string;
  isPrivate: boolean;
}
