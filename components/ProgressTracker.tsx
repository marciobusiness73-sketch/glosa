import React from 'react';

interface ProgressTrackerProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Upload' },
  { number: 2, title: 'Confirmar' },
  { number: 3, title: 'Perguntas' },
  { number: 4, title: 'Pré-visualizar' },
  { number: 5, title: 'Sucesso' },
];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ currentStep }) => {
  return (
    <div className="flex items-start w-full mb-12">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLineActive = currentStep > index + 1;

        return (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 transform
                  ${isCompleted ? 'bg-green-500' : ''}
                  ${isActive ? 'bg-blue-500 ring-4 ring-blue-200 scale-110' : ''}
                  ${!isCompleted && !isActive ? 'bg-gray-300' : ''}
                `}
              >
                {isCompleted ? <i className="fas fa-check"></i> : step.number}
              </div>
              <p className={`mt-2 text-xs text-center font-semibold transition-colors duration-300 w-20 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 transition-colors duration-500 mt-5
                  ${isLineActive ? 'bg-blue-500' : 'bg-gray-300'}
                `}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
