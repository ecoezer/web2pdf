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
  [key: string]: any;
}