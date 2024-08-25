import { Room } from '../models/room.model';

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

export function getActiveRoomsList(filter: 'waiting' | 'all' = 'all'): Room[] {
  const rooms = Array.from(ActiveRooms.values()).filter(
    (room) => !room.isPrivate
  );

  if (filter === 'all') {
    return rooms;
  }

  return rooms.filter((room) => room.players.length === 1);
}

export function addPendingRoom(room: Room): void {
  PendingRooms.set(room.id, room);
}

export function deletePendingRoom(roomId: string): void {
  PendingRooms.delete(roomId);
}

export function addActiveRoom(room: Room): void {
  ActiveRooms.set(room.id, room);
}

export function deleteActiveRoom(roomId: string): void {
  ActiveRooms.delete(roomId);
}
