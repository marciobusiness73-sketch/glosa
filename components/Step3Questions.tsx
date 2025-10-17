
import React from 'react';
import type { GlosaData, YesNoEmpty } from '../types';
import { FileUpload } from './FileUpload';

interface Step3QuestionsProps {
  data: GlosaData;
  setData: (data: GlosaData) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Questions: React.FC<Step3QuestionsProps> = ({ data, setData, onNext, onBack }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setData({ ...data, [id]: value });
  };
  
  const handleFileChange = (field: keyof GlosaData) => (files: File[]) => {
    setData({ ...data, [field]: files });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">4. Detalhes para o Recurso</h2>
      <p className="text-gray-600 mb-6">Responda as perguntas abaixo para gerar um recurso de glosa robusto para o grupo selecionado.</p>

      <div className="space-y-6">
        {/* Medical Request */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 font-semibold mb-2">O procedimento/exame foi realizado conforme a solicitação médica?</label>
          <select id="medicalRequest" value={data.medicalRequest} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {data.medicalRequest === 'sim' && (
            <div className="mt-4">
              <FileUpload 
                onFilesChange={handleFileChange('medicalRequestFiles')} 
                files={data.medicalRequestFiles}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.png" 
                label="Anexe a prescrição médica ou justificativa"
              />
            </div>
          )}
        </div>

        {/* Contract Compliance */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 font-semibold mb-2">O procedimento está de acordo com o contrato/cobertura?</label>
          <select id="contractCompliance" value={data.contractCompliance} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {data.contractCompliance === 'sim' && (
            <div className="mt-4">
              <input type="text" id="contractClause" value={data.contractClause} onChange={handleChange} placeholder="Especifique a cláusula ou item do contrato" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          )}
        </div>

        {/* Prior Authorization */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 font-semibold mb-2">Houve autorização prévia para o procedimento?</label>
          <select id="priorAuthorization" value={data.priorAuthorization} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {data.priorAuthorization === 'sim' && (
            <div className="mt-4">
               <FileUpload 
                onFilesChange={handleFileChange('priorAuthorizationFiles')} 
                files={data.priorAuthorizationFiles}
                acceptedFormats=".pdf,.doc,.docx,.xml" 
                label="Anexe a guia de autorização"
              />
            </div>
          )}
        </div>

        {/* Correct Procedure Code */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 font-semibold mb-2">O código do procedimento está correto?</label>
          <select id="isCorrectProcedureCode" value={data.isCorrectProcedureCode} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {data.isCorrectProcedureCode === 'nao' && (
            <div className="mt-4">
              <input type="text" id="correctProcedureCode" value={data.correctProcedureCode} onChange={handleChange} placeholder="Qual o código correto?" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          )}
        </div>

        {/* Correct Value */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 font-semibold mb-2">O valor cobrado está de acordo com a tabela?</label>
          <select id="isCorrectValue" value={data.isCorrectValue} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {data.isCorrectValue === 'nao' && (
            <div className="mt-4">
              <input type="text" id="correctValue" value={data.correctValue} onChange={handleChange} placeholder="Qual o valor correto?" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          )}
        </div>

        {/* Additional Documents */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <label className="block text-gray-700 font-semibold mb-2">Há algum documento adicional que comprove a realização?</label>
          <select id="hasAdditionalDocuments" value={data.hasAdditionalDocuments} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
            <option value="">Selecione...</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
          {data.hasAdditionalDocuments === 'sim' && (
            <div className="mt-4">
              <FileUpload 
                onFilesChange={handleFileChange('additionalFiles')} 
                files={data.additionalFiles}
                acceptedFormats=".pdf,.doc,.docx,.jpg,.png,.txt,.zip" 
                label="Anexe documentos adicionais"
                multiple
              />
            </div>
          )}
        </div>
        
        {/* Technical Comments */}
        <div className="p-4 border border-gray-200 rounded-lg">
            <label htmlFor="technicalComments" className="block text-gray-700 font-semibold mb-2">Há algum comentário ou observação técnica?</label>
            <textarea id="technicalComments" value={data.technicalComments} onChange={handleChange} rows={3} placeholder="Digite aqui..." className="w-full p-2 border border-gray-300 rounded-md"></textarea>
        </div>

        {/* Deadline */}
        <div className="p-4 border border-gray-200 rounded-lg">
            <label htmlFor="deadline" className="block text-gray-700 font-semibold mb-2">Qual o prazo para envio do recurso?</label>
            <input type="date" id="deadline" value={data.deadline} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors">
          Voltar
        </button>
        <button onClick={onNext} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-colors">
          Gerar Pré-visualização
        </button>
      </div>
    </div>
  );
};