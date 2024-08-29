import { Socket } from 'socket.io';
import { GAME_SERVER_TO_CLIENT } from '../constants/socket.constants';
import { ActiveGames } from '../db/games';
import { IOServer } from '../models/socket.model';
import handleGameJoin from './handleGameJoin';

export default function handleGamePlayAgain(
  io: IOServer,
  socket: Socket,
  roomId: string,
  playerId: string,
  playerName: string
) {
  const game = ActiveGames.get(roomId);

  if (!game) {
    handleGameJoin(io, socket, roomId, playerId, playerName);
    return;
  }

  if (game.player1?.id !== playerId && game.player2?.id !== playerId) {
    return;
  }

  if (game.player1 && game.player1.id === playerId) {
    game.player1.ready = true;
  } else if (game.player2 && game.player2.id === playerId) {
    game.player2.ready = true;
  }

  if (game.isPlayable) {
    game.startGame();
    io.to(roomId).emit(GAME_SERVER_TO_CLIENT.START, game.gamePlayData);
  } else {
    socket?.emit(GAME_SERVER_TO_CLIENT.PENDING);
  }
}
