import React, { useState, useCallback } from 'react';
import { Step1Upload } from './components/Step1Upload';
import { Step2Confirm } from './components/Step2Confirm';
import { Step3Questions } from './components/Step3Questions';
import { Step4Preview } from './components/Step4Preview';
import { SuccessMessage } from './components/SuccessMessage';
import { ProgressTracker } from './components/ProgressTracker';
import { generateAppealText } from './services/geminiService';
import { Step, GlosaData, GlosaGroup, GlosaItem } from './types';

const initialData: GlosaData = {
  fileName: '',
  guiaNumber: '',
  glosaItems: [],
  totalGlosas: 0,
  totalGlosaValue: 0,
  medicalRequest: '',
  medicalRequestFiles: [],
  contractCompliance: '',
  contractClause: '',
  priorAuthorization: '',
  priorAuthorizationFiles: [],
  isCorrectProcedureCode: '',
  correctProcedureCode: '',
  isCorrectValue: '',
  correctValue: '',
  hasAdditionalDocuments: '',
  additionalFiles: [],
  technicalComments: '',
  deadline: '',
};

function App() {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Upload);
  const [data, setData] = useState<GlosaData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  
  // New state for the group workflow
  const [glosaGroups, setGlosaGroups] = useState<GlosaGroup[]>([]);
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null);
  const [processedGroupKeys, setProcessedGroupKeys] = useState<Set<string>>(new Set());

  const handleDataExtracted = (extractedData: Partial<GlosaData>) => {
    const items = extractedData.glosaItems || [];
    
    // Group items by guiaNumber and glosaJustification
    const groupsMap: { [key: string]: GlosaGroup } = {};
    items.forEach(item => {
      const guia = item.insuranceId || extractedData.guiaNumber || 'GUIA_NAO_IDENTIFICADA';
      const just = item.glosaJustification || 'JUSTIFICATIVA_NAO_IDENTIFICADA';
      const key = `${guia}::${just}`;

      if (!groupsMap[key]) {
        groupsMap[key] = {
          key: key,
          guiaNumber: guia,
          glosaJustification: just,
          glosaItems: [],
          totalGlosas: 0,
          totalGlosaValue: 0
        };
      }
      groupsMap[key].glosaItems.push(item);
    });

    const groupsArray = Object.values(groupsMap).map(group => {
      const totalGlosaValue = group.glosaItems.reduce((sum, item) => {
        const valueString = (item.glosaValue || '0').replace(/\./g, '').replace(',', '.');
        const value = parseFloat(valueString);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      return { ...group, totalGlosas: group.glosaItems.length, totalGlosaValue };
    });

    setGlosaGroups(groupsArray);
    setCurrentStep(Step.Confirm);
  };

  const handleSelectGroup = (group: GlosaGroup) => {
    setData({
      ...initialData,
      fileName: data.fileName,
      guiaNumber: group.guiaNumber,
      glosaItems: group.glosaItems,
      totalGlosas: group.totalGlosas,
      totalGlosaValue: group.totalGlosaValue
    });
    setSelectedGroupKey(group.key);
  };

  const handleDeselectGroup = () => {
    setSelectedGroupKey(null);
    setData(initialData); // Clear specific group data
  };

  const handleGeneratePreview = async () => {
    setIsLoading(true);
    setCurrentStep(Step.Preview);
    try {
      const text = await generateAppealText(data);
      setGeneratedText(text);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setGeneratedText(`Ocorreu um erro ao gerar o texto do recurso: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProcessAnother = () => {
    if(selectedGroupKey) {
        setProcessedGroupKeys(prev => new Set(prev).add(selectedGroupKey));
    }
    setSelectedGroupKey(null);
    setGeneratedText('');
    setData(initialData);
    setCurrentStep(Step.Confirm);
  };

  const handleStartOver = () => {
    setData(initialData);
    setGeneratedText('');
    setGlosaGroups([]);
    setSelectedGroupKey(null);
    setProcessedGroupKeys(new Set());
    setCurrentStep(Step.Upload);
  };


  const renderStep = () => {
    switch (currentStep) {
      case Step.Upload:
        return <Step1Upload onDataExtracted={handleDataExtracted} initialData={initialData} />;
      case Step.Confirm:
        return <Step2Confirm 
                    data={data}
                    groups={glosaGroups}
                    selectedGroupKey={selectedGroupKey}
                    processedGroupKeys={processedGroupKeys}
                    onSelectGroup={handleSelectGroup}
                    onDeselectGroup={handleDeselectGroup}
                    onNext={() => setCurrentStep(Step.Questions)}
                    onStartOver={handleStartOver}
                />;
      case Step.Questions:
        return <Step3Questions 
                  data={data} 
                  setData={setData} 
                  onNext={handleGeneratePreview} 
                  onBack={() => setCurrentStep(Step.Confirm)} 
                />;
      case Step.Preview:
        return <Step4Preview 
                  generatedText={generatedText} 
                  isLoading={isLoading} 
                  onNext={() => setCurrentStep(Step.Success)}
                  onBack={() => setCurrentStep(Step.Questions)} 
                />;
      case Step.Success:
        return <SuccessMessage data={data} generatedText={generatedText} onProcessAnother={handleProcessAnother}/>;
      default:
        return <div>Etapa desconhecida</div>;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="container max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">📄 Aplicativo de Recurso de Glosa</h1>
                <p className="text-gray-500 mt-2">Siga os passos abaixo para gerar seu recurso de glosa automaticamente com IA.</p>
            </div>
            <div className="mt-8">
                <ProgressTracker currentStep={currentStep} />
                {renderStep()}
            </div>
        </div>
    </div>
  );
}

export default App;
