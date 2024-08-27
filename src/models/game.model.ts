export interface Player {
  id: string;
  symbol: 'O' | 'X';
  name: string;
}

export interface Game {
  players: [];
}

export type BoardState = [
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
