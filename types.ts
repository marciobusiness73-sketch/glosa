export enum Step {
  Upload = 1,
  Confirm = 2,
  Questions = 3,
  Preview = 4,
  Success = 5,
}

export type YesNoEmpty = 'sim' | 'nao' | '';

export interface GlosaItem {
  patientName: string;
  insuranceId: string;
  procedureCode: string;
  glosaValue: string;
  glosaJustification: string;
}

// Represents a group of glosa items to be processed together
export interface GlosaGroup {
  key: string; // Unique identifier for the group (e.g., "guia_justificativa")
  guiaNumber: string;
  glosaJustification: string;
  glosaItems: GlosaItem[];
  totalGlosas: number;
  totalGlosaValue: number;
}


export interface GlosaData {
  // Step 1 & 2
  fileName: string;
  guiaNumber: string;
  glosaItems: GlosaItem[];
  totalGlosas: number;
  totalGlosaValue: number;
  
  // Step 3
  medicalRequest: YesNoEmpty;
  medicalRequestFiles: File[];
  contractCompliance: YesNoEmpty;
  contractClause: string;
  priorAuthorization: YesNoEmpty;
  priorAuthorizationFiles: File[];
  isCorrectProcedureCode: YesNoEmpty;
  correctProcedureCode: string;
  isCorrectValue: YesNoEmpty;
  correctValue: string;
  hasAdditionalDocuments: YesNoEmpty;
  additionalFiles: File[];
  technicalComments: string;
  deadline: string;
}