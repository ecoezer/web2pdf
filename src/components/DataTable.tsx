import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      {/* Match Results Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4">
          <h2 className="text-xl font-bold text-center">Maç Sonuçları</h2>
        </div>
        
        {/* Table Content */}
        <div className="divide-y divide-gray-200">
          {currentData.map((item, index) => (
            <div key={item.id || index} className="bg-gray-50 py-4 px-6">
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
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            {startIndex + 1}-{Math.min(endIndex, data.length)} / {data.length} maç gösteriliyor
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                    className={`px-3 py-1 rounded-md text-sm ${
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
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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