export interface Player {
  id: string;
  symbol: 'O' | 'X';
  name: string;
  ready: boolean;
}

export type Board = [
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
  'O' | 'X' | '',
];

export interface GameAction {
  idx: number;
  player: Player;
  roomId: string;
}

export interface GameplayData {
  players: Player[];
  currentTurn: Player;
  board: Board;
}

export interface GameOverData {
  isDraw: boolean;
  winner: Player | null;
}
