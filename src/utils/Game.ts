import { Board, GameplayData, Player } from '../models/game.model';

export default class Game {
  isStarted = false;
  isFinished = false;
  winner: Player | null = null;
  currentTurn: Player | null;
  firstPlayerId: string;
  board = Array.from({ length: 9 }).fill('') as Board;
  player1: Player | null = null;
  player2: Player | null = null;

  constructor(firstPlayerId: string, firstPlayerName: string) {
    this.firstPlayerId = firstPlayerId;
    this.addPlayer(firstPlayerId, firstPlayerName);
    this.currentTurn = this.player1;
  }

  get isPlayable(): boolean {
    return this.player1 !== null && this.player2 !== null;
  }

  get players() {
    const playerList: Player[] = [];

    if (this.player1) playerList.push(this.player1);
    if (this.player2) playerList.push(this.player2);

    return playerList;
  }

  get gamePlayData(): GameplayData {
    return {
      isStarted: this.isStarted,
      isFinished: this.isFinished,
      isDraw: this.isFinished && this.winner === null,
      winner: this.winner,
      board: this.board,
      players: this.players,
      currentTurn: this.currentTurn!,
    };
  }

  addPlayer(id: string, name: string) {
    if (this.isPlayable) return;

    if (!this.player1) {
      this.player1 = { id, name, symbol: 'X' };
    } else {
      this.player2 = { id, name, symbol: 'O' };
    }
  }

  removePlayer(id: string): boolean {
    let removed = false;

    if (id === this.player1?.id) {
      if (this.player2) {
        this.player1 = { ...this.player2, symbol: 'X' };
        this.player2 = null;
      } else {
        this.player1 = null;
      }

      removed = true;
    } else if (id === this.player2?.id) {
      this.player2 = null;
      removed = true;
    }

    if (removed) {
      this.isStarted = false;
      this.isFinished = false;
      this.winner = null;
      this.currentTurn = this.player1;
      this.firstPlayerId = this.player1?.id!;
      this.board = Array.from({ length: 9 }).fill('') as Board;
    }

    return removed;
  }

  startGame() {
    if (this.player1 === null || this.player2 === null) return;

    this.isStarted = true;
    this.currentTurn =
      this.firstPlayerId === this.player1.id ? this.player1 : this.player2;
  }
}
