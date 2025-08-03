import React, { useState } from 'react';
import { Search, AlertCircle, Trophy } from 'lucide-react';
import type { ScrapedData } from '../types/ScrapedData';
import { scrapeWebsite } from '../services/scraperService';

interface UrlInputProps {
  onDataScraped: (data: ScrapedData[], url: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onDataScraped, onLoadingChange }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  // Fixed selectors for match data
  const matchSelectors = {
    homeTeam: 'a.left-block-team-name',
    awayTeam: 'a.r-left-block-team-name',
    score: 'div.match-score'
  };

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
      const data = await scrapeWebsite(url, matchSelectors);
      onDataScraped(data, url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(`Veri çekilirken bir hata oluştu: ${errorMessage}`);
      console.error('Scraping error:', err);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          Maç Sonuçları URL'si
        </label>
        <div className="relative">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/mac-sonuclari"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-2">
          <Trophy className="w-5 h-5 text-blue-600 mr-2" />
          <h4 className="font-medium text-blue-800">Maç Sonuçları Modu</h4>
        </div>
        <p className="text-sm text-blue-700">
          Sadece ev sahibi takım, misafir takım ve maç sonucu verileri çekilecek.
        </p>
        <div className="mt-3 text-xs text-blue-600">
          <strong>Hedeflenen veriler:</strong>
          <br />• Ev sahibi takım: a.left-block-team-name
          <br />• Misafir takım: a.r-left-block-team-name  
          <br />• Maç sonucu: div.match-score
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
        className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
      >
        <Trophy className="w-5 h-5 mr-2" />
        Maç Verilerini Çek
      </button>
    </form>
  );
};

export default UrlInput;