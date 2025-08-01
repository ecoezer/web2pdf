import { useState } from 'react';
import { Globe, Download, FileText, Table } from 'lucide-react';
import UrlInput from './components/UrlInput';
import DataTable from './components/DataTable';
import ExportButtons from './components/ExportButtons';
import type { ScrapedData } from './types/ScrapedData';
import './App.css';

function App() {
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  const handleDataScraped = (data: ScrapedData[], url: string) => {
    setScrapedData(data);
    setCurrentUrl(url);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Globe className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Web Scraper</h1>
          </div>
          <p className="text-gray-600 text-lg">
            URL'den veri çekin, tablo halinde görüntüleyin ve JSON/PDF olarak export edin
          </p>
        </div>

        {/* URL Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <UrlInput 
            onDataScraped={handleDataScraped}
            onLoadingChange={handleLoadingChange}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
              <span className="text-gray-600">Veriler çekiliyor...</span>
            </div>
          </div>
        )}

        {/* Data Display Section */}
        {scrapedData.length > 0 && !loading && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Table className="w-6 h-6 text-indigo-600 mr-2" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Çekilen Veriler
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {scrapedData.length} öğe bulundu
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Kaynak URL: </span>
                <span className="text-sm font-mono text-indigo-600 break-all">
                  {currentUrl}
                </span>
              </div>

              <DataTable data={scrapedData} />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-indigo-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-800">
                  Export Seçenekleri
                </h3>
              </div>
              <ExportButtons data={scrapedData} url={currentUrl} />
            </div>
          </>
        )}

        {/* Empty State */}
        {scrapedData.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Henüz veri çekilmedi
            </h3>
            <p className="text-gray-500">
              Başlamak için yukarıdaki alana bir URL girin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;