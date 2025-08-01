import React from 'react';
import { Download, FileText } from 'lucide-react';
import { ScrapedData } from '../types/ScrapedData';
import { exportToJSON, exportToPDF } from '../services/exportService';

interface ExportButtonsProps {
  data: ScrapedData[];
  url: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, url }) => {
  const handleJSONExport = () => {
    exportToJSON(data, url);
  };

  const handlePDFExport = async () => {
    await exportToPDF(data, url);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={handleJSONExport}
        className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        <FileText className="w-5 h-5 mr-2" />
        JSON Olarak İndir
      </button>
      
      <button
        onClick={handlePDFExport}
        className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
      >
        <Download className="w-5 h-5 mr-2" />
        PDF Olarak İndir
      </button>
    </div>
  );
};

export default ExportButtons;