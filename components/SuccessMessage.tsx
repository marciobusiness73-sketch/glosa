import React from 'react';
import type { GlosaData } from '../types';

// Declare external libraries loaded via CDN
declare const jspdf: any;
declare const docx: any;
declare const XLSX: any;

interface SuccessMessageProps {
  data: GlosaData;
  generatedText: string;
  onProcessAnother: () => void;
}

const DownloadButton: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex-1 min-w-[120px] bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2">
        <i className={`fas ${icon}`}></i>
        <span>{label}</span>
    </button>
);

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ data, generatedText, onProcessAnother }) => {
  const baseFileName = `Recurso_Glosa_${data.guiaNumber}_${new Date().getTime()}`;

  const downloadPdf = () => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("Recurso de Glosa", 10, 10);
    
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(generatedText, 180);
    doc.text(splitText, 10, 20);

    doc.save(`${baseFileName}.pdf`);
  };

  const downloadDocx = () => {
    try {
        const paragraphs = generatedText.split('\n').map(p => new docx.Paragraph({ children: [new docx.TextRun(p)] }));
        const doc = new docx.Document({ sections: [{ children: paragraphs }] });
        docx.Packer.toBlob(doc).then((blob: Blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${baseFileName}.docx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }).catch((error: Error) => {
            console.error("Erro ao gerar o arquivo DOCX:", error);
            alert("Não foi possível gerar o arquivo DOCX. Verifique o console para mais detalhes.");
        });
    } catch(e) {
        console.error("Erro ao gerar o arquivo DOCX:", e);
        alert("Não foi possível gerar o arquivo DOCX. Verifique o console para mais detalhes.");
    }
  };

  const downloadXlsx = () => {
    const worksheetData = [
      ["Número da Guia", data.guiaNumber],
      ["Total Glosado", data.totalGlosaValue],
      ["Total de Itens", data.totalGlosas],
      [],
      ["Paciente", "Cód. Procedimento", "Valor Glosado", "Justificativa"]
    ];
    data.glosaItems.forEach(item => {
      worksheetData.push([item.patientName, item.procedureCode, item.glosaValue, item.glosaJustification]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detalhes Recurso");
    XLSX.writeFile(wb, `${baseFileName}.xlsx`);
  };

  const downloadXml = () => {
    let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlString += `<recursoGlosa>\n`;
    xmlString += `  <guiaNumber>${data.guiaNumber}</guiaNumber>\n`;
    xmlString += `  <totalGlosaValue>${data.totalGlosaValue}</totalGlosaValue>\n`;
    xmlString += `  <totalGlosas>${data.totalGlosas}</totalGlosas>\n`;
    xmlString += `  <items>\n`;
    data.glosaItems.forEach(item => {
      xmlString += `    <item>\n`;
      xmlString += `      <patientName>${item.patientName}</patientName>\n`;
      xmlString += `      <insuranceId>${item.insuranceId}</insuranceId>\n`;
      xmlString += `      <procedureCode>${item.procedureCode}</procedureCode>\n`;
      xmlString += `      <glosaValue>${item.glosaValue}</glosaValue>\n`;
      xmlString += `      <glosaJustification>${item.glosaJustification}</glosaJustification>\n`;
      xmlString += `    </item>\n`;
    });
    xmlString += `  </items>\n`;
    xmlString += `  <textoRecurso><![CDATA[${generatedText}]]></textoRecurso>\n`;
    xmlString += `</recursoGlosa>`;

    const blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    const blob = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fadeIn text-center p-8 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-2xl font-bold text-green-800 mb-3"><i className="fas fa-check-circle mr-2"></i> Recurso Gerado com Sucesso!</h3>
      <p className="text-gray-700 mb-6">Selecione o formato desejado para baixar o recurso para este grupo.</p>
      
      <div className="flex flex-wrap justify-center gap-4">
        <DownloadButton icon="fa-file-pdf" label="PDF" onClick={downloadPdf} />
        <DownloadButton icon="fa-file-word" label="DOCX" onClick={downloadDocx} />
        <DownloadButton icon="fa-file-excel" label="XLSX" onClick={downloadXlsx} />
        <DownloadButton icon="fa-file-code" label="XML" onClick={downloadXml} />
        <DownloadButton icon="fa-file-alt" label="TXT" onClick={downloadTxt} />
      </div>

      <div className="mt-8">
        <button onClick={onProcessAnother} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-8 rounded transition-colors">
            Recorrer Outro Grupo
        </button>
      </div>
    </div>
  );
};