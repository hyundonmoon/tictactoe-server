import { Server, Socket } from 'socket.io';
import { Room, RoomResponse } from '../models/room.model';
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../models/socket.model';
import { ROOM_SERVER_TO_CLIENT } from '../constants/socket.constants';

// rooms that have been created but not joined
const PendingRooms: Map<string, Room> = new Map();
// rooms that have been joined
const ActiveRooms: Map<string, Room> = new Map();

export function checkIfRoomPending(id: string): boolean {
  return PendingRooms.has(id);
}

export function checkIfRoomActive(id: string): boolean {
  return ActiveRooms.has(id);
}

export function getPendingRoom(id: string): Room | undefined {
  return PendingRooms.get(id);
}

export function getActiveRoom(id: string): Room | undefined {
  return ActiveRooms.get(id);
}

export function getActiveRoomsList(
  filter: 'waiting' | 'all' = 'all'
): RoomResponse[] {
  const rooms = Array.from(ActiveRooms.values())
    .filter((room) => !room.isPrivate)
    .map((room) => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.length,
      hasPassword: !!room.password,
    }));

  if (filter === 'all') {
    return rooms;
  }

  return rooms.filter((room) => room.playerCount === 1);
}

export function addPendingRoom(room: Room): void {
  PendingRooms.set(room.id, room);
}

export function deletePendingRoom(roomId: string): void {
  PendingRooms.delete(roomId);
}

export function addActiveRoom(room: Room): void {
  delete room.owner;
  ActiveRooms.set(room.id, room);
}

export function deleteActiveRoom(roomId: string): void {
  ActiveRooms.delete(roomId);
}

export function updateActiveRoom(
  room: Room,
  updatedProps: Partial<Room>
): void {
  const updatedRoom = {
    ...room,
    ...updatedProps,
  };
  ActiveRooms.set(room.id, updatedRoom);
}

export function removeUserFromRoom(
  io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >,
  socket: Socket,
  roomId: string
): void {
  const activeRoom = getActiveRoom(roomId);

  if (!activeRoom) {
    // ignore if room doesnt exist
    return;
  }

  if (!activeRoom.players.includes(socket.id)) {
    // ignore if player isn't part of the room
    return;
  }

  if (activeRoom.players.length === 1) {
    deleteActiveRoom(roomId);
  } else {
    updateActiveRoom(activeRoom, {
      players: activeRoom.players.filter((id) => id !== socket.id),
    });
    io.to(roomId).emit(ROOM_SERVER_TO_CLIENT.PLAYER_LEFT, {
      playerId: socket.id,
    });
  }

  socket.leave(roomId);
}
