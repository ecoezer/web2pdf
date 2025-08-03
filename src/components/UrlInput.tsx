import React, { useState } from 'react';
import { Search, AlertCircle, Trophy, BarChart3 } from 'lucide-react';
import type { ScrapedData } from '../types/ScrapedData';
import { scrapeWebsite } from '../services/scraperService';

interface UrlInputProps {
  onDataScraped: (data: ScrapedData[], url: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onDataScraped, onLoadingChange }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [dataType, setDataType] = useState<'match' | 'statistics'>('match');

  // Fixed selectors for match data
  const matchSelectors = {
    homeTeam: 'a.left-block-team-name',
    awayTeam: 'a.r-left-block-team-name',
    score: 'div.match-score'
  };

  // Selectors for statistics data
  const statisticsSelectors = {
    table: 'table',
    statistic: 'td, th',
    homeValue: 'td:first-child',
    awayValue: 'td:last-child'
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
      const selectors = dataType === 'statistics' ? statisticsSelectors : matchSelectors;
      const data = await scrapeWebsite(url, selectors, dataType);
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
      {/* Data Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Veri Tipi Seçin
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="dataType"
              value="match"
              checked={dataType === 'match'}
              onChange={(e) => setDataType(e.target.value as 'match' | 'statistics')}
              className="mr-2"
            />
            <Trophy className="w-4 h-4 mr-1" />
            Maç Sonuçları
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="dataType"
              value="statistics"
              checked={dataType === 'statistics'}
              onChange={(e) => setDataType(e.target.value as 'match' | 'statistics')}
              className="mr-2"
            />
            <BarChart3 className="w-4 h-4 mr-1" />
            İstatistikler
          </label>
        </div>
      </div>
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          {dataType === 'statistics' ? 'İstatistik' : 'Maç Sonuçları'} URL'si
        </label>
        <div className="relative">
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={dataType === 'statistics' ? 'https://example.com/istatistikler' : 'https://example.com/mac-sonuclari'}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className={`p-4 border rounded-lg ${
        dataType === 'statistics' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center mb-2">
          {dataType === 'statistics' ? (
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <Trophy className="w-5 h-5 text-blue-600 mr-2" />
          )}
          <h4 className={`font-medium ${
            dataType === 'statistics' ? 'text-green-800' : 'text-blue-800'
          }`}>
            {dataType === 'statistics' ? 'İstatistik Modu' : 'Maç Sonuçları Modu'}
          </h4>
        </div>
        <p className={`text-sm ${
          dataType === 'statistics' ? 'text-green-700' : 'text-blue-700'
        }`}>
          {dataType === 'statistics' 
            ? 'Tablolar ve istatistik verileri çekilecek (topla oynama, şut, pas başarısı vb.).'
            : 'Sadece ev sahibi takım, misafir takım ve maç sonucu verileri çekilecek.'
          }
        </p>
        <div className={`mt-3 text-xs ${
          dataType === 'statistics' ? 'text-green-600' : 'text-blue-600'
        }`}>
          <strong>Hedeflenen veriler:</strong>
          {dataType === 'statistics' ? (
            <>
              <br />• Tablolar: table
              <br />• İstatistik değerleri: td, th
              <br />• Ev sahibi değerleri: td:first-child
              <br />• Misafir değerleri: td:last-child
            </>
          ) : (
            <>
              <br />• Ev sahibi takım: a.left-block-team-name
              <br />• Misafir takım: a.r-left-block-team-name  
              <br />• Maç sonucu: div.match-score
            </>
          )}
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
        className={`w-full text-white py-3 px-6 rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center ${
          dataType === 'statistics'
            ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
        }`}
      >
        {dataType === 'statistics' ? (
          <BarChart3 className="w-5 h-5 mr-2" />
        ) : (
          <Trophy className="w-5 h-5 mr-2" />
        )}
        {dataType === 'statistics' ? 'İstatistik Verilerini Çek' : 'Maç Verilerini Çek'}
      </button>
    </form>
  );
};

export default UrlInput;