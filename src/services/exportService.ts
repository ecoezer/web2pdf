import jsPDF from 'jspdf';
import type { ScrapedData } from '../types/ScrapedData';

export const exportToJSON = (data: ScrapedData[], sourceUrl: string) => {
  const exportData = {
    metadata: {
      sourceUrl,
      exportDate: new Date().toISOString(),
      totalItems: data.length,
      exportedBy: 'Web Scraper App'
    },
    data
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `scraped-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (data: ScrapedData[], sourceUrl: string) => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  let yPosition = 20;

  // Title
  pdf.setFontSize(20);
  pdf.text('Web Scraper Raporu', 20, yPosition);
  yPosition += 15;

  // Metadata
  pdf.setFontSize(12);
  pdf.text(`Kaynak URL: ${sourceUrl}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Export Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, yPosition);
  yPosition += 10;
  pdf.text(`Toplam Öğe: ${data.length}`, 20, yPosition);
  yPosition += 20;

  // Data
  pdf.setFontSize(14);
  pdf.text('Çekilen Veriler:', 20, yPosition);
  yPosition += 15;

  data.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(12);
    pdf.setFont(pdf.getFont().fontName, 'bold');
    pdf.text(`${index + 1}. ${item.title || 'Başlık Yok'}`, 20, yPosition);
    yPosition += 8;

    pdf.setFont(pdf.getFont().fontName, 'normal');
    pdf.setFontSize(10);

    // Add other fields
    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'title' && value) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        const text = `${key}: ${String(value).substring(0, 100)}${String(value).length > 100 ? '...' : ''}`;
        pdf.text(text, 25, yPosition);
        yPosition += 6;
      }
    });

    yPosition += 5; // Space between items
  });

  pdf.save(`scraped-data-${new Date().toISOString().split('T')[0]}.pdf`);
};