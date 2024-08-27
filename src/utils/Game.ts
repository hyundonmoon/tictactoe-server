import { REQUIRED_PLAYERS } from '../constants/gameplay.constants';
import { BoardState, Player } from '../models/game.model';

export default class Game {
  isPlayable = false;
  isStarted = false;
  isFinished = false;
  winner: string | null = null;
  currentPlayer: Player;
  firstPlayerId: string;
  players: Player[] = [];
  board = Array.from({ length: 9 }).fill('') as BoardState;

  constructor(firstPlayerId: string, firstPlayerName: string) {
    this.firstPlayerId = firstPlayerId;
    this.addPlayer(firstPlayerId, firstPlayerName);
    this.currentPlayer = this.players[0];
  }

  get isDraw() {
    return this.isFinished && this.winner === null;
  }

  addPlayer(id: string, name: string) {
    if (this.players.length >= REQUIRED_PLAYERS) return;

    let newPlayerSymbol: 'O' | 'X' = 'X';
    if (this.players.length) {
      newPlayerSymbol = this.players[0].symbol === 'X' ? 'O' : 'X';
    }

    this.players.push({ id, name, symbol: newPlayerSymbol });

    if (this.players.length === REQUIRED_PLAYERS) {
      this.isPlayable = true;
    }
  }

  removePlayer(id: string) {
    console.log('remove player', { id, players: this.players });
    this.players = this.players.filter((player) => player.id !== id);

    if (this.players.length) {
      this.isPlayable = false;
      this.isStarted = false;
      this.isFinished = false;
      this.winner = null;
      this.players[0].symbol = 'X';
      this.currentPlayer = this.players[0];
      this.firstPlayerId = this.players[0].id;
      this.board = Array.from({ length: 9 }).fill('') as BoardState;
    }

    console.log('after removing', { this: this });
  }

  startGame() {
    this.isStarted = true;
  }
}
