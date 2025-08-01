import type { ScrapedData } from '../types/ScrapedData';

export const scrapeWebsite = async (url: string): Promise<ScrapedData[]> => {
  try {
    // Use different API endpoints for development and production
    const apiUrl = import.meta.env.DEV 
      ? '/api/scrape'
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
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch {
        // If we can't read the response at all, use the default message
      }
      console.error('Response error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Scraping result:', result);
    return result.data || [];
  } catch (error) {
    console.error('Scraping service error:', error);
    throw error;
  }
}