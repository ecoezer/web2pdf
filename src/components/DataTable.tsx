import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BarChart3, Trophy } from 'lucide-react';
import type { ScrapedData } from '../types/ScrapedData';

interface DataTableProps {
  data: ScrapedData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Check if data contains statistics
  const isStatisticsData = currentData.some(item => 
    item.statistic || item.homeValue || item.awayValue
  );

  // Calculate percentage for progress bars
  const calculatePercentage = (homeValue: string, awayValue: string) => {
    const home = parseFloat(homeValue?.replace('%', '') || '0');
    const away = parseFloat(awayValue?.replace('%', '') || '0');
    const total = home + away;
    
    if (total === 0) return { homePercent: 50, awayPercent: 50 };
    
    return {
      homePercent: (home / total) * 100,
      awayPercent: (away / total) * 100
    };
  };

  return (
    <div className="space-y-4">
      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className={`text-white py-6 ${
          isStatisticsData 
            ? 'bg-blue-800'
            : 'bg-gradient-to-r from-blue-600 to-blue-700'
        }`}>
          <h2 className="text-xl font-bold text-center flex items-center justify-center">
            {isStatisticsData ? (
              <>
                <BarChart3 className="w-6 h-6 mr-2" />
                İstatistikler
              </>
            ) : (
              <>
                <Trophy className="w-6 h-6 mr-2" />
                Maç Sonuçları
              </>
            )}
          </h2>
        </div>
        
        {/* Table Content */}
        <div className={isStatisticsData ? "divide-y divide-gray-200 bg-white" : "divide-y divide-gray-100"}>
          {currentData.map((item, index) => (
            <div key={item.id || index} className={`py-4 px-6 transition-colors ${
              isStatisticsData 
                ? "bg-white hover:bg-gray-25" 
                : "bg-white hover:bg-gray-50"
            }`}>
              {isStatisticsData ? (
                /* Statistics Layout - Matching the image */
                <div className="flex items-center bg-gray-50 py-3 px-4 rounded-lg">
                  {/* Left side - Home team progress bar and value */}
                  <div className="flex items-center flex-1">
                    {/* Home Value */}
                    <div className="text-blue-800 font-bold text-lg min-w-[80px] text-right mr-3">
                      {item.homeValue || '0'}
                    </div>
                    {/* Home Progress Bar */}
                    <div className="flex-1 bg-blue-100 rounded-sm h-6 mr-4 relative overflow-hidden">
                      {(() => {
                        const { homePercent } = calculatePercentage(item.homeValue || '0', item.awayValue || '0');
                        return (
                          <div 
                            className="bg-blue-600 h-6 transition-all duration-700 ease-out"
                            style={{ width: `${homePercent}%` }}
                          />
                        );
                      })()}
                    </div>
                  </div>

                  {/* Center - Statistic Name */}
                  <div className="px-6 text-center min-w-[180px]">
                    <div className="text-gray-800 font-semibold text-base whitespace-nowrap">
                      {item.statistic || item.title || 'İstatistik'}
                    </div>
                  </div>

                  {/* Right side - Away team progress bar and value */}
                  <div className="flex items-center flex-1">
                    {/* Away Progress Bar */}
                    <div className="flex-1 bg-orange-100 rounded-sm h-6 ml-4 relative overflow-hidden">
                      {(() => {
                        const { awayPercent } = calculatePercentage(item.homeValue || '0', item.awayValue || '0');
                        return (
                          <div 
                            className="bg-orange-500 h-6 transition-all duration-700 ease-out"
                            style={{ width: `${awayPercent}%` }}
                          />
                        );
                      })()}
                    </div>
                    {/* Away Value */}
                    <div className="text-orange-600 font-bold text-lg min-w-[80px] text-left ml-3">
                      {item.awayValue || '0'}
                    </div>
                  </div>
                </div>
              ) : (
                /* Match Results Layout */
                <div className="flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-right flex-1">
                      <div className="text-blue-700 font-bold text-xl">
                        {item.homeTeam || 'Ev Sahibi'}
                      </div>
                    </div>
                  </div>

                  {/* Score Section */}
                  <div className="text-center px-8">
                    <div className="text-red-600 font-bold text-sm mb-1">MS</div>
                    <div className="text-blue-900 font-bold text-3xl mb-1">
                      {item.score || 'vs'}
                    </div>
                    {item.halftime && (
                      <div className="text-gray-600 text-sm">
                        İY: {item.halftime}
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-left flex-1">
                      <div className="text-blue-700 font-bold text-xl">
                        {item.awayTeam || 'Misafir'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-700">
            {startIndex + 1}-{Math.min(endIndex, data.length)} / {data.length} {isStatisticsData ? 'istatistik' : 'maç'} gösteriliyor
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;