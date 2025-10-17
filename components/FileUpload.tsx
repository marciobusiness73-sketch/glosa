import React, { useState, useCallback, useRef, useEffect } from 'react';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
  acceptedFormats: string;
  multiple?: boolean;
  label: string;
  files: File[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, acceptedFormats, multiple = false, label, files }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'idle'; message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (feedback.type === 'success' || feedback.type === 'error') {
      const timer = setTimeout(() => {
        setFeedback({ type: 'idle' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const validateAndProcessFiles = useCallback((incomingFiles: File[]) => {
    const acceptedMimeTypesAndExtensions = acceptedFormats.split(',').map(f => f.trim().toLowerCase());
    
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    incomingFiles.forEach(file => {
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const mimeType = file.type.toLowerCase();

      const isAccepted = acceptedMimeTypesAndExtensions.some(acceptedFormat => {
        if (acceptedFormat.startsWith('.')) {
          return fileExtension === acceptedFormat;
        }
        if (acceptedFormat.endsWith('/*')) {
          return mimeType.startsWith(acceptedFormat.slice(0, -1));
        }
        return mimeType === acceptedFormat;
      });

      if (isAccepted) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map(f => f.name).join(', ');
      setFeedback({ type: 'error', message: `Tipo de arquivo não suportado: ${invalidNames}` });
    } else if (validFiles.length > 0) {
      setFeedback({ type: 'success', message: 'Arquivo(s) carregado(s) com sucesso!' });
    }

    if (validFiles.length > 0) {
      const currentFiles = multiple ? [...files] : [];
      const newUniqueFiles = validFiles.filter(vf => !currentFiles.some(cf => cf.name === vf.name && cf.size === vf.size));
      const updatedFiles = [...currentFiles, ...newUniqueFiles];
      onFilesChange(updatedFiles);
    }
  }, [acceptedFormats, files, multiple, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHighlighted(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsHighlighted(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHighlighted(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length) {
      validateAndProcessFiles(droppedFiles);
    }
  }, [validateAndProcessFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      validateAndProcessFiles(selectedFiles);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const getBorderClass = () => {
    if (isHighlighted) return 'border-blue-500 bg-blue-50';
    if (feedback.type === 'success') return 'border-green-500 bg-green-50';
    if (feedback.type === 'error') return 'border-red-500 bg-red-50';
    return 'border-gray-300';
  };

  return (
    <div>
      <div
        className={`border-2 border-dashed ${getBorderClass()} p-6 text-center rounded-lg cursor-pointer transition-all duration-300`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        aria-label="File upload area"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={acceptedFormats}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        <p className="text-gray-500"><i className="fas fa-file-upload mr-2"></i> {label}</p>
      </div>
      {feedback.message && (
        <p className={`mt-2 text-sm text-center ${feedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`} role="alert">
          {feedback.message}
        </p>
      )}
      {files.length > 0 && (
        <div className="mt-3 p-3 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
          <ul aria-label="Uploaded files">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center min-w-0">
                  <i className="fas fa-check-circle text-green-500 mr-2 flex-shrink-0" aria-hidden="true"></i>
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(index)} 
                  className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};