import { GAME_SERVER_TO_CLIENT } from '../constants/socket.constants';
import { ActiveGames } from '../db/games';
import { GameAction } from '../models/game.model';
import { IOServer } from '../models/socket.model';

export default function handleGameAction(io: IOServer, action: GameAction) {
  const game = ActiveGames.get(action.roomId);

  if (!game) {
    return;
  }

  game.updateGame(action);
  io.to(action.roomId).emit(GAME_SERVER_TO_CLIENT.ACTION, game.gamePlayData);

  if (game.isFinished) {
    io.to(action.roomId).emit(GAME_SERVER_TO_CLIENT.OVER, {
      winner: game.winner,
      isDraw: game.winner === null,
    });
  }
}
