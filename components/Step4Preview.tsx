
import React from 'react';

interface Step4PreviewProps {
  generatedText: string;
  isLoading: boolean;
  onNext: () => void;
  onBack: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Aguarde, a IA está gerando seu recurso...</p>
    </div>
);


export const Step4Preview: React.FC<Step4PreviewProps> = ({ generatedText, isLoading, onNext, onBack }) => {
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">5. Pré-visualização do Recurso</h2>
      <p className="text-gray-600 mb-6">Confira a pré-visualização do recurso de glosa gerado pela IA. Se necessário, volte para ajustar as informações.</p>

      <div className="resource-preview mt-4 p-5 border border-gray-300 rounded-md bg-gray-50 min-h-[300px] max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono text-sm">
        {isLoading ? <LoadingSpinner /> : <p>{generatedText}</p>}
      </div>
      
      {!isLoading && generatedText && !generatedText.startsWith("Ocorreu um erro") && (
        <div className="mt-6">
            <p className="text-gray-700 font-semibold mb-3">O texto gerado está correto?</p>
            <p className="text-sm text-gray-500 mb-4">Ao confirmar, você poderá baixar o recurso em diversos formatos.</p>
        </div>
      )}


      <div className="flex justify-between mt-8">
        <button onClick={onBack} disabled={isLoading} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-100">
          Voltar e Editar
        </button>
        <button onClick={onNext} disabled={isLoading || !generatedText || generatedText.startsWith("Ocorreu um erro")} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition-colors disabled:bg-green-300 disabled:cursor-not-allowed">
          Confirmar e Gerar Arquivos
        </button>
      </div>
    </div>
  );
};