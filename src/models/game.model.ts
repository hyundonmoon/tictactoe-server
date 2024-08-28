export interface Player {
  id: string;
  symbol: 'O' | 'X';
  name: string;
}

export interface GameplayData {
  isStarted: boolean;
  isFinished: boolean;
  isAborted: boolean;
  isDraw: boolean;
  winner: Player | null;
  board: Board;
  players: Player[];
  currentTurn: Player;
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
