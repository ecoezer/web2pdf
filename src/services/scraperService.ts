import { ScrapedData } from '../types/ScrapedData';

export const scrapeWebsite = async (url: string): Promise<ScrapedData[]> => {
  // Since we can't use server-side scraping in the browser, 
  // we'll simulate scraping with mock data for demonstration
  // In a real application, this would call a backend API
  
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading

  // Mock data based on common website structures
  const mockData: ScrapedData[] = [
    {
      id: '1',
      title: 'Örnek Başlık 1',
      description: 'Bu bir örnek açıklama metnidir. Gerçek uygulamada bu veriler web sitesinden çekilecektir.',
      url: 'https://example.com/item1',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₺299.99',
      category: 'Teknoloji',
      date: new Date().toLocaleDateString('tr-TR'),
      author: 'John Doe'
    },
    {
      id: '2',
      title: 'Örnek Başlık 2',
      description: 'İkinci örnek içerik. Bu veriler normalde HTML parsing ile elde edilir.',
      url: 'https://example.com/item2',
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₺199.99',
      category: 'Eğitim',
      date: new Date().toLocaleDateString('tr-TR'),
      author: 'Jane Smith'
    },
    {
      id: '3',
      title: 'Örnek Başlık 3',
      description: 'Üçüncü örnek veri. Gerçek uygulamada Cheerio veya benzeri kütüphaneler kullanılır.',
      url: 'https://example.com/item3',
      image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₺399.99',
      category: 'Sağlık',
      date: new Date().toLocaleDateString('tr-TR'),
      author: 'Mike Johnson'
    },
    {
      id: '4',
      title: 'Örnek Başlık 4',
      description: 'Dördüncü örnek içerik. Bu sistem farklı web sitesi yapılarına uyum sağlayabilir.',
      url: 'https://example.com/item4',
      image: 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₺149.99',
      category: 'Spor',
      date: new Date().toLocaleDateString('tr-TR'),
      author: 'Sarah Wilson'
    },
    {
      id: '5',
      title: 'Örnek Başlık 5',
      description: 'Beşinci örnek veri. Sistem dinamik olarak farklı veri tiplerini destekler.',
      url: 'https://example.com/item5',
      image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: '₺249.99',
      category: 'Sanat',
      date: new Date().toLocaleDateString('tr-TR'),
      author: 'David Brown'
    }
  ];

  // Add some randomization to make it feel more realistic
  const randomizedData = mockData.map(item => ({
    ...item,
    id: Math.random().toString(36).substr(2, 9),
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR')
  }));

  return randomizedData;
};

// In a real implementation, you would have something like this:
/*
export const scrapeWebsite = async (url: string): Promise<ScrapedData[]> => {
  try {
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Scraping failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
};
*/