import React, { useState } from 'react';
import { Search, AlertCircle, Target, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import type { ScrapedData } from '../types/ScrapedData';
import { scrapeWebsite } from '../services/scraperService';

interface UrlInputProps {
  onDataScraped: (data: ScrapedData[], url: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onDataScraped, onLoadingChange }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetMode, setPresetMode] = useState('custom'); // 'custom' or 'sports'
  const [customSelectors, setCustomSelectors] = useState({
    container: '',
    title: '',
    description: '',
    image: '',
    link: '',
    price: '',
    category: ''
  });

  // Sports-specific selectors for match data
  const sportsSelectors = {
    container: '.match-item, .game-item, .fixture, .match-card, .score-box, [class*="match"], [class*="game"], [class*="fixture"]',
    title: '.league, .competition, .tournament, [class*="league"], [class*="competition"]',
    description: '.teams, .vs, .match-teams, [class*="team"]',
    date: '.date, .time, .match-date, .match-time, [class*="date"], [class*="time"]',
    score: '.score, .result, .final-score, [class*="score"], [class*="result"]',
    halftime: '.halftime, .ht, .half-time, [class*="halftime"], [class*="ht"]',
    homeTeam: '.home-team, .team-home, [class*="home"]',
    awayTeam: '.away-team, .team-away, [class*="away"]'
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
      const selectorsToUse = presetMode === 'sports' ? sportsSelectors : customSelectors;
      const data = await scrapeWebsite(url, selectorsToUse);
      onDataScraped(data, url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(`Veri çekilirken bir hata oluştu: ${errorMessage}`);
      console.error('Scraping error:', err);
    } finally {
      onLoadingChange(false);
    }
  };

  const handleSelectorChange = (field: string, value: string) => {
    setCustomSelectors(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetSelectors = () => {
    setCustomSelectors({
      container: '',
      title: '',
      description: '',
      image: '',
      link: '',
      price: '',
      category: ''
    });
  };

  const setSportsMode = () => {
    setPresetMode('sports');
    setShowAdvanced(true);
  };

  const setCustomMode = () => {
    setPresetMode('custom');
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

      {/* Preset Mode Selection */}
      <div className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={setSportsMode}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            presetMode === 'sports'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Trophy className="w-4 h-4 mr-2" />
          Spor Verileri (Maç Sonuçları)
        </button>
        <button
          type="button"
          onClick={setCustomMode}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            presetMode === 'custom'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Target className="w-4 h-4 mr-2" />
          Özel Hedefleme
        </button>
      </div>

      {presetMode === 'sports' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Trophy className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-800">Spor Verileri Modu Aktif</h4>
          </div>
          <p className="text-sm text-blue-700">
            Bu mod özellikle spor sitelerinden maç sonuçları, takım isimleri, lig bilgileri, 
            tarih ve ilk yarı sonuçlarını çekmek için optimize edilmiştir.
          </p>
          <div className="mt-3 text-xs text-blue-600">
            <strong>Çekilecek veriler:</strong> Lig ismi, Tarih, Ev sahibi takım, Deplasman takımı, 
            Maç sonucu, İlk yarı sonucu
          </div>
        </div>
      )}

      {/* Advanced Targeting Section */}
      {presetMode === 'custom' && (
        <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
        >
          <Target className="w-4 h-4 mr-2" />
          Gelişmiş Element Hedefleme
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="text-sm text-gray-600 mb-3">
              CSS seçicilerini girerek belirli elementleri hedefleyebilirsiniz. Boş bırakılan alanlar için otomatik algılama kullanılır.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ana Container Seçici
                </label>
                <input
                  type="text"
                  value={customSelectors.container}
                  onChange={(e) => handleSelectorChange('container', e.target.value)}
                  placeholder=".product-item, article, .card"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Başlık Seçici
                </label>
                <input
                  type="text"
                  value={customSelectors.title}
                  onChange={(e) => handleSelectorChange('title', e.target.value)}
                  placeholder="h1, h2, .title, .name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Açıklama Seçici
                </label>
                <input
                  type="text"
                  value={customSelectors.description}
                  onChange={(e) => handleSelectorChange('description', e.target.value)}
                  placeholder=".description, p, .summary"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Resim Seçici
                </label>
                <input
                  type="text"
                  value={customSelectors.image}
                  onChange={(e) => handleSelectorChange('image', e.target.value)}
                  placeholder="img, .image, .photo"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link Seçici
                </label>
                <input
                  type="text"
                  value={customSelectors.link}
                  onChange={(e) => handleSelectorChange('link', e.target.value)}
                  placeholder="a, .link, .url"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Fiyat Seçici
                </label>
                <input
                  type="text"
                  value={customSelectors.price}
                  onChange={(e) => handleSelectorChange('price', e.target.value)}
                  placeholder=".price, .cost, .amount"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetSelectors}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Seçicileri Temizle
              </button>
            </div>
          </div>
        )}
        </div>
      )}

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
        <Search className="w-5 h-5 mr-2" />
        {presetMode === 'sports' ? 'Maç Verilerini Çek' : 'Veriyi Çek'}
      </button>
    </form>
  );
};

export default UrlInput;