import { Socket } from 'socket.io';
import { REQUIRED_PLAYERS } from '../constants/gameplay.constants';
import { GAME_SERVER_TO_CLIENT } from '../constants/socket.constants';
import { ActiveGames } from '../db/games';
import { IOServer } from '../models/socket.model';
import Game from '../utils/Game';

export default function handleGameReady(
  io: IOServer,
  socket: Socket,
  roomId: string,
  playerId: string,
  playerName: string
) {
  const game = ActiveGames.get(roomId);

  if (game) {
    if (game.players.length < REQUIRED_PLAYERS) {
      game.addPlayer(playerId, playerName);

      if (game.isPlayable) {
        game.startGame();

        io.to(roomId).emit(GAME_SERVER_TO_CLIENT.START, {
          players: game.players,
          board: game.board,
          currentTurnPlayerId: game.firstPlayerId,
        });
      }
    }
  } else {
    ActiveGames.set(roomId, new Game(playerId, playerName));
  }
}
