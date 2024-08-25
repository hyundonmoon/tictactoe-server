import { Room } from '../models/room.model';
const { v4: uuidv4 } = require('uuid');

export default function createRoom(
  owner: string,
  name: string,
  password: string,
  isPrivate: boolean
): Room {
  return {
    id: uuidv4(),
    owner,
    name,
    password,
    isPrivate,
    players: [],
    createdAt: new Date(),
  };
}
