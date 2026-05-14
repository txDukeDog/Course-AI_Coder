export interface Card {
  id: number;
  title: string;
  details: string;
  position: number;
}

export interface Column {
  id: number;
  name: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: number;
  name: string;
  columns: Column[];
}
