import { Board, GameAction, GameplayData, Player } from '../models/game.model';

export default class Game {
  isStarted = false;
  isFinished = false;
  isAborted = false;
  winner: Player | null = null;
  currentTurn: Player | null = null;
  firstPlayerId: string;
  board = Array.from({ length: 9 }).fill('') as Board;
  player1!: Player;
  player2: Player | null = null;

  constructor(firstPlayerId: string, firstPlayerName: string) {
    this.firstPlayerId = firstPlayerId;
    this.addPlayer(firstPlayerId, firstPlayerName);
  }

  get isPlayable(): boolean {
    return !!this.player1?.ready && !!this.player2?.ready;
  }

  get players() {
    const playerList: Player[] = [];

    if (this.player1) playerList.push(this.player1);
    if (this.player2) playerList.push(this.player2);

    return playerList;
  }

  get gamePlayData(): GameplayData {
    return {
      board: this.board,
      players: this.players,
      currentTurn: this.currentTurn!,
    };
  }

  addPlayer(id: string, name: string) {
    if (this.isPlayable) return;

    if (!this.player1) {
      this.player1 = { id, name, symbol: 'X', ready: true };
    } else {
      this.player2 = { id, name, symbol: 'O', ready: true };
    }
  }

  removePlayer(id: string): boolean {
    let removed = false;

    if (id === this.player1?.id) {
      if (this.player2) {
        this.player1 = { ...this.player2, symbol: 'X' };
        this.player2 = null;
        removed = true;
      }
    } else if (id === this.player2?.id) {
      this.player2 = null;
      removed = true;
    }

    if (removed && this.isStarted && !this.isFinished) {
      // removed during a game === aborted
      this.isAborted = true;
    }

    if (removed) {
      this.firstPlayerId = this.player1.id;
    }

    return removed;
  }

  startGame() {
    if (this.player1 === null || this.player2 === null) return;

    this.isStarted = true;
    this.isFinished = false;
    this.isAborted = false;
    this.winner = null;
    this.board = Array.from({ length: 9 }).fill('') as Board;
    this.currentTurn =
      this.firstPlayerId === this.player1.id ? this.player1 : this.player2;
  }

  updateGame(action: GameAction) {
    if (
      this.board[action.idx] !== '' ||
      !this.isStarted ||
      !this.player1 ||
      !this.player2
    ) {
      return;
    }

    this.board[action.idx] = action.player.symbol;
    const { winner, isFinished } = this.calcGameResult(
      this.board,
      this.player1,
      this.player2
    );

    if (isFinished) {
      this.winner = winner;
      this.isFinished = isFinished;

      // set up for next game
      if (this.firstPlayerId === this.player1.id) {
        this.firstPlayerId = this.player2.id;
      } else {
        this.firstPlayerId = this.player1.id;
      }

      this.player1.ready = false;
      this.player2.ready = false;
    } else {
      if (this.currentTurn === this.player1) {
        this.currentTurn = this.player2;
      } else {
        this.currentTurn = this.player1;
      }
    }
  }

  calcGameResult(
    board: Board,
    player1: Player,
    player2: Player
  ): { winner: Player | null; isFinished: boolean } {
    const winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    let winner: Player | null = null;
    let isFinished = false;

    for (const combo of winningCombos) {
      const [a, b, c] = combo;

      if (!board[a] || !board[b] || !board[c]) continue;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        const winningSymbol = board[a];
        winner = winningSymbol === player1.symbol ? player1 : player2;
        isFinished = true;
      }
    }

    if (!isFinished && board.every((value) => value !== '')) {
      isFinished = true;
    }

    return {
      winner,
      isFinished,
    };
  }
}
