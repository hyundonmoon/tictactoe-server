import Game from '../utils/Game';

export const ActiveGames = new Map<string, Game>();

export function removeUserFromGame(roomId: string, playerId: string) {
  const game = ActiveGames.get(roomId);

  if (!game) {
    return;
  }

  if (game.players.findIndex((player) => player.id === playerId) === -1) {
    return;
  }

  if (game.players.length === 1) {
    ActiveGames.delete(roomId);
    return;
  }

  game.removePlayer(playerId);
}
