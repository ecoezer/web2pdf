import type { ScrapedData } from '../types/ScrapedData';

export const scrapeWebsite = async (url: string): Promise<ScrapedData[]> => {
  try {
    // Use different API endpoints for development and production
    const apiUrl = import.meta.env.DEV 
      ? 'http://localhost:3001/api/scrape'
      : '/.netlify/functions/scrape';
      
    console.log('Scraping URL:', url);
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('Scraping result:', result);
    return result.data || [];
  } catch (error) {
    console.error('Scraping service error:', error);
    throw error;
  }
}