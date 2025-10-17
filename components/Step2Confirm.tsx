import React from 'react';
import type { GlosaData, GlosaGroup } from '../types';

interface Step2ConfirmProps {
  data: GlosaData;
  groups: GlosaGroup[];
  selectedGroupKey: string | null;
  processedGroupKeys: Set<string>;
  onSelectGroup: (group: GlosaGroup) => void;
  onDeselectGroup: () => void;
  onStartOver: () => void;
  onNext: () => void;
}

const SummaryCard: React.FC<{ label: string; value: string | number; icon: string; }> = ({ label, value, icon }) => (
    <div className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
        <div className={`text-2xl text-blue-500 mr-4 ${icon}`}></div>
        <div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-xl font-bold text-gray-800">{value}</div>
        </div>
    </div>
);

const GroupSelection: React.FC<{ groups: GlosaGroup[], onSelectGroup: (group: GlosaGroup) => void, processedKeys: Set<string>, onStartOver: () => void }> = ({ groups, onSelectGroup, processedKeys, onStartOver }) => (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">2. Selecionar Grupo para Recurso</h2>
        <p className="text-gray-600 mb-6">A IA encontrou os seguintes grupos de glosas no arquivo. Selecione um grupo para iniciar o processo de recurso.</p>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {groups.map(group => {
                const isProcessed = processedKeys.has(group.key);
                return (
                    <div key={group.key} className={`p-4 border rounded-lg flex justify-between items-center transition-all duration-300 ${isProcessed ? 'bg-green-100 border-green-300 shadow-sm' : 'bg-white hover:shadow-md'}`}>
                        <div>
                            <p className={`font-bold ${isProcessed ? 'text-green-900' : 'text-gray-800'}`}>Guia: {group.guiaNumber}</p>
                            <p className={`text-sm truncate max-w-md ${isProcessed ? 'text-green-800' : 'text-gray-600'}`}>Justificativa: "{group.glosaJustification}"</p>
                            <p className={`text-sm mt-1 ${isProcessed ? 'text-green-700' : 'text-gray-500'}`}>{group.totalGlosas} item(s) - Total: R$ {group.totalGlosaValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <button 
                            onClick={() => onSelectGroup(group)} 
                            disabled={isProcessed}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isProcessed ? <><i className="fas fa-check"></i> Concluído</> : 'Processar'}
                        </button>
                    </div>
                );
            })}
        </div>
         <div className="flex justify-between mt-8">
            <button onClick={onStartOver} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors">
              Enviar Outro Arquivo
            </button>
        </div>
    </div>
);

const ConfirmationDetails: React.FC<{ data: GlosaData, onNext: () => void, onBack: () => void }> = ({ data, onNext, onBack }) => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">3. Confirmar Dados do Grupo</h2>
      <p className="text-gray-600 mb-6">Verifique os dados extraídos para o grupo selecionado. Se estiver correto, continue para responder as perguntas.</p>
      <div className="space-y-6">
        <div>
            <label className="block text-gray-700 font-semibold mb-2">Número da Guia:</label>
            <input type="text" value={data.guiaNumber} readOnly className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none text-gray-900 font-medium" />
        </div>
        <div className="flex gap-4">
            <SummaryCard label="Total de Glosas no Grupo" value={data.totalGlosas} icon="fas fa-file-invoice" />
            <SummaryCard label="Valor Total do Grupo" value={`R$ ${data.totalGlosaValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon="fas fa-dollar-sign" />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Itens no Grupo:</h3>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cód. Procedimento</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.glosaItems.map((item, index) => (
                            <tr key={index}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.patientName || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.procedureCode || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.glosaValue || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {data.glosaItems.length === 0 && <p className="p-4 text-center text-gray-500">Nenhum item encontrado.</p>}
            </div>
        </div>
      </div>
      <div className="flex justify-between mt-8">
        <button onClick={onBack} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors">
          Voltar para Lista
        </button>
        <button onClick={onNext} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-colors">
          Confirmar e Continuar
        </button>
      </div>
    </div>
);


export const Step2Confirm: React.FC<Step2ConfirmProps> = ({ data, groups, selectedGroupKey, onSelectGroup, onDeselectGroup, onNext, onStartOver, processedGroupKeys }) => {
  return (
    <div className="animate-fadeIn">
        {selectedGroupKey ? 
            <ConfirmationDetails data={data} onNext={onNext} onBack={onDeselectGroup} /> : 
            <GroupSelection groups={groups} onSelectGroup={onSelectGroup} processedKeys={processedGroupKeys} onStartOver={onStartOver}/>
        }
    </div>
  );
};