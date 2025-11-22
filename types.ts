export interface Category {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  title: string;
  username: string;
  password: string; // stored encrypted
  url?: string;
  categoryId: string;
  notes?: string; // stored encrypted
  image?: string; // Base64 string
  createdAt: number;
  updatedAt: number;
}

export interface ExportData {
  version: number;
  exportedAt: number;
  categories: Category[];
  accounts: Account[]; // Decrypted for JSON export
}

export type Theme = 'light' | 'dark';