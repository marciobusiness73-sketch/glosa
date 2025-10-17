import React, { useState } from 'react';
import type { GlosaData } from '../types';
import { extractDataFromFile } from '../services/geminiService';

interface Step1UploadProps {
  onDataExtracted: (data: Partial<GlosaData>) => void;
  initialData: GlosaData;
}

export const Step1Upload: React.FC<Step1UploadProps> = ({ onDataExtracted, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsLoading(true);
      setError(null);
      setFileName(file.name);

      try {
        const extractedData = await extractDataFromFile(file);
        onDataExtracted({ ...extractedData, fileName: file.name });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setFileName('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFileName('');
    setError(null);
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };
  
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">1. Importar Arquivo de Glosa</h2>
      <p className="text-gray-600 mb-6">Envie o arquivo contendo as informações da glosa (XLSX, CSV, PDF ou XML).</p>
      <div 
        className={`file-upload border-2 border-dashed ${isLoading ? 'border-blue-300 bg-blue-50 cursor-wait' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'} p-8 text-center rounded-lg transition-all`}
        onClick={() => !isLoading && document.getElementById('fileInput')?.click()}
      >
        <input type="file" id="fileInput" accept=".xlsx,.csv,.pdf,.xml" className="hidden" onChange={handleFileChange} disabled={isLoading} />
        <p className="text-gray-500"><i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'} text-3xl text-blue-500 mb-3`}></i></p>
        <p className="text-gray-700">{isLoading ? 'Analisando documento com IA...' : 'Arraste e solte o arquivo aqui ou clique para selecionar'}</p>
        
        {!isLoading && fileName && !error && <p className="text-green-600 mt-2 text-sm">Arquivo carregado: {fileName}</p>}
        {error && <p className="text-red-600 mt-2 text-sm font-semibold">{error}</p>}
      </div>
      <div className="flex justify-start mt-8">
        <button onClick={handleCancel} disabled={isLoading || !fileName} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Cancelar
        </button>
      </div>
    </div>
  );
};