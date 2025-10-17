import { GoogleGenAI } from "@google/genai";
import { GlosaData, GlosaItem } from '../types';

// Declare XLSX from SheetJS library loaded via CDN
declare var XLSX: any;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            mimeType: file.type,
            data: base64EncodedData,
        },
    };
};

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as ArrayBuffer);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};


export const extractDataFromFile = async (file: File): Promise<Partial<GlosaData>> => {
    const textBasedMimeTypes = ['text/csv', 'application/xml', 'text/xml', 'text/plain'];
    const supportedBinaryMimeTypes = ['application/pdf'];
    const xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const prompt = `Analise o documento de glosa e extraia o número da guia principal e uma lista de todos os itens glosados.
    Para cada item, extraia: nome do paciente, número da carteira, código do procedimento, valor glosado e a justificativa da glosa.
    
    Retorne os dados estritamente no formato JSON. O JSON deve ter a seguinte estrutura:
    {
      "guiaNumber": "string",
      "items": [
        {
          "patientName": "string",
          "insuranceId": "string",
          "procedureCode": "string",
          "glosaValue": "string",
          "glosaJustification": "string"
        }
      ]
    }

    Se uma informação específica não for encontrada, retorne uma string vazia para o campo correspondente.
    Se nenhum item glosado for encontrado, retorne a chave "items" com um array vazio.
    O JSON deve estar limpo, sem nenhum texto ou formatação adicional como \`\`\`json.`;

    let requestContents;

    if (textBasedMimeTypes.includes(file.type)) {
        const fileContentAsText = await readFileAsText(file);
        const fullPrompt = `Conteúdo do arquivo (${file.name}):\n\n${fileContentAsText}\n\n---\n\nInstrução: ${prompt}`;
        requestContents = { parts: [{ text: fullPrompt }] };
    } else if (supportedBinaryMimeTypes.includes(file.type)) {
        const filePart = await fileToGenerativePart(file);
        requestContents = { parts: [filePart, { text: prompt }] };
    } else if (file.type === xlsxMimeType || file.name.endsWith('.xlsx')) {
        try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);
            
            const fullPrompt = `O seguinte conteúdo foi extraído de uma planilha XLSX (${file.name}) e convertido para o formato CSV. Analise-o:\n\n${csvContent}\n\n---\n\nInstrução: ${prompt}`;
            requestContents = { parts: [{ text: fullPrompt }] };

        } catch (err) {
            console.error("Error processing XLSX file:", err);
            throw new Error("Não foi possível processar o arquivo XLSX. Verifique se o arquivo não está corrompido.");
        }
    } else {
        throw new Error(`Tipo de arquivo não suportado: ${file.type || file.name}. Use PDF, CSV, XML ou XLSX.`);
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: requestContents,
        });
        
        if (response.promptFeedback?.blockReason) {
             throw new Error(`A análise foi bloqueada por filtros de segurança (Motivo: ${response.promptFeedback.blockReason}). Verifique o conteúdo do arquivo.`);
        }

        if (!response.text || response.text.trim() === '') {
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                 throw new Error("A resposta da IA foi bloqueada por filtros de segurança. Isso pode acontecer com documentos contendo informações sensíveis.");
            }
            if (finishReason === 'RECITATION') {
                throw new Error("A resposta da IA foi bloqueada por conter material citado. Tente um arquivo diferente.");
            }
            if (finishReason === 'OTHER' || finishReason === 'MAX_TOKENS') {
                 throw new Error(`A IA encerrou a análise de forma inesperada (Motivo: ${finishReason}). O arquivo pode ser muito grande ou complexo.`);
            }
            throw new Error("A IA não retornou uma resposta para análise. O arquivo pode estar vazio ou em um formato ilegível.");
        }
        
        // Clean the response text to ensure it's valid JSON before parsing
        let jsonText = response.text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7, jsonText.length - 3).trim();
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.substring(3, jsonText.length - 3).trim();
        }
        
        const rawData = JSON.parse(jsonText);
        const glosaItems: GlosaItem[] = rawData.items || [];
        
        return {
            guiaNumber: rawData.guiaNumber,
            glosaItems: glosaItems,
        };

    } catch (error) {
        console.error("Error extracting data from file:", error);
        if (error instanceof Error) {
            // Propagate specific errors thrown from within the try block
            const specificErrors = ['segurança', 'inesperada', 'citado', 'XLSX', 'suportado', 'A IA não retornou'];
            if (specificErrors.some(e => error.message.includes(e))) {
                throw error;
            }
            if (error instanceof SyntaxError) {
                throw new Error("A IA retornou uma resposta em texto que não é um JSON válido. Verifique o conteúdo do arquivo.");
            }
        }
        throw new Error("Não foi possível extrair os dados do arquivo. A IA não conseguiu processar o documento. Verifique o conteúdo ou tente um formato diferente (PDF, CSV, XLSX).");
    }
};

export const generateAppealText = async (data: GlosaData): Promise<string> => {
  const commonJustification = data.glosaItems[0]?.glosaJustification || 'Não informada';

  const itemsDetails = data.glosaItems.map((item, index) => `
    - Item ${index + 1}: Paciente: ${item.patientName || 'Não informado'} | Carteira: ${item.insuranceId || 'Não informada'} | Procedimento: ${item.procedureCode || 'Não informado'} | Valor: ${item.glosaValue || 'Não informado'}
  `).join('');

  const prompt = `
    Você é um especialista em faturamento médico e recursos de glosa no Brasil. Com base nas informações a seguir, redija uma carta de recurso formal e profissional para a operadora de saúde. A carta deve ser clara, concisa e persuasiva, abordando um grupo de itens glosados pelo mesmo motivo sob a mesma guia. Use um tom respeitoso e técnico. Estruture a carta com cabeçalho, saudação, corpo do texto detalhando os argumentos, e uma conclusão com despedida.

    **Dados Gerais da Guia:**
    - Número da Guia: ${data.guiaNumber || 'Não informado'}
    
    **Grupo de Itens em Recurso:**
    - Justificativa da Operadora (comum a todos os itens): "${commonJustification}"
    - Quantidade de Itens neste grupo: ${data.totalGlosas}
    - Valor Total deste grupo: R$ ${data.totalGlosaValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

    **Itens Afetados:**
    ${itemsDetails}

    **Argumentos para o Recurso:**
    - O procedimento foi realizado conforme a solicitação médica? ${data.medicalRequest === 'sim' ? 'Sim, prescrição em anexo.' : 'Não aplicável ou não.'}
    - O procedimento está de acordo com o contrato/cobertura? ${data.contractCompliance === 'sim' ? `Sim, conforme cláusula/item: ${data.contractClause || 'especificado no contrato'}` : 'Não aplicável ou não.'}
    - Houve autorização prévia para o procedimento? ${data.priorAuthorization === 'sim' ? 'Sim, guia de autorização em anexo.' : 'Não aplicável ou não.'}
    - O código do procedimento faturado está correto? ${data.isCorrectProcedureCode === 'sim' ? 'Sim.' : `Não, o código correto é: ${data.correctProcedureCode || 'a ser verificado'}`}
    - O valor cobrado está de acordo com a tabela acordada? ${data.isCorrectValue === 'sim' ? 'Sim.' : `Não, o valor correto é: ${data.correctValue || 'a ser verificado'}`}
    - Comentários Técnicos Adicionais: ${data.technicalComments || "Nenhum."}
    - Prazo para envio do recurso: ${data.deadline ? new Date(data.deadline).toLocaleDateString('pt-BR') : 'Não especificado'}

    **Documentação de Suporte Anexada:**
    ${data.medicalRequestFiles.length > 0 ? '- Cópia da Prescrição Médica\n' : ''}
    ${data.priorAuthorizationFiles.length > 0 ? '- Cópia da Guia de Autorização\n' : ''}
    ${data.additionalFiles.length > 0 ? `- Outros documentos comprobatórios (${data.additionalFiles.length} arquivo(s))\n` : ''}
    
    Gere o texto completo do recurso em português do Brasil. O texto deve ser coeso e focar na justificativa comum para todos os itens listados.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    if (response.promptFeedback?.blockReason) {
        return `A geração do recurso foi bloqueada por filtros de segurança (Motivo: ${response.promptFeedback.blockReason}).`;
    }

    if (!response.text || response.text.trim() === '') {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
          return "A geração do texto foi bloqueada por filtros de segurança. Por favor, revise os dados de entrada.";
      }
      return "A IA gerou uma resposta vazia. Por favor, revise os dados fornecidos e tente novamente.";
    }
    return response.text;
  } catch (error) {
    console.error("Error generating appeal text:", error);
    return "Ocorreu um erro ao gerar o texto do recurso. Por favor, tente novamente.";
  }
};