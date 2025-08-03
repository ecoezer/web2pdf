import type { ScrapedData } from '../types/ScrapedData';

interface CustomSelectors {
  container: string;
  title: string;
  description: string;
  image: string;
  link: string;
  price: string;
  category: string;
}

export const scrapeWebsite = async (url: string, customSelectors?: CustomSelectors): Promise<ScrapedData[]> => {
  try {
    // Always use the proxy endpoint in development
    const apiUrl = '/api/scrape';
      
    console.log('Scraping URL:', url);
    console.log('API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, customSelectors }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Use default message if all else fails
        }
      }
      console.error('Response error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Scraping result:', result);
    return result.data || [];
  } catch (error) {
    console.error('Scraping service error:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown scraping error occurred');
    }
  }
}