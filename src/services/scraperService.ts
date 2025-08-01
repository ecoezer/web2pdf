import type { ScrapedData } from '../types/ScrapedData';

export const scrapeWebsite = async (url: string): Promise<ScrapedData[]> => {
  try {
    // Use Netlify function in production, localhost in development
    const apiUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/scrape'
      : '/.netlify/functions/scrape';
      
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}