import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import type { ScrapedData } from '../types/ScrapedData';
import { scrapeWebsite } from '../services/scraperService';

interface UrlInputProps {
  onDataScraped: (data: ScrapedData[], url: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onDataScraped, onLoadingChange }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Lütfen bir URL girin');
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError('Geçerli bir URL girin (örn: https://example.com)');
      return;
    }

    setError('');
    onLoadingChange(true);

    try {
      const data = await scrapeWebsite(url);
      onDataScraped(data, url);
    } catch (err) {
      setError('Veri çekilirken bir hata oluştu. URL\'yi kontrol edin.');
      console.error('Scraping error:', err);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          Website URL'si
        </label>
        <div className="relative">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium"
      >
        Veriyi Çek
      </button>
    </form>
  );
};

export default UrlInput;