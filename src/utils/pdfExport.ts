import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(elementId: string, filename: string = 'report.pdf'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#1A2332',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;
  const imgFinalWidth = imgWidth * ratio;
  const imgFinalHeight = imgHeight * ratio;

  let heightLeft = imgFinalHeight;
  let position = imgY;

  pdf.addImage(imgData, 'PNG', imgX, position, imgFinalWidth, imgFinalHeight);
  heightLeft -= pdfHeight - 20;

  while (heightLeft > 0) {
    position = heightLeft - imgFinalHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', imgX, position, imgFinalWidth, imgFinalHeight);
    heightLeft -= pdfHeight - 20;
  }

  pdf.save(filename);
}
