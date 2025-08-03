export interface ScrapedData {
  id: string;
  title: string;
  description: string;
  url?: string;
  image?: string;
  price?: string;
  category?: string;
  date?: string;
  author?: string;
  content?: string;
  // Sports-specific fields
  league?: string;
  homeTeam?: string;
  awayTeam?: string;
  score?: string;
  halftime?: string;
  matchDate?: string;
  [key: string]: any;
}