// legal-analyzer.js (restaurado y mejorado con OCR y conexión a Platform)

import { extractDates, extractKeywords } from './deadline-calculator.js';
import { generateLegalResponse } from './document-generator.js';
import { getLegalReferences } from './legal-reference-system.js';

const OPENAI_API_KEY = 'sk-proj-3de9VaSMVD5CiB1PtQRoZbr1ryiz';
const ASSISTANT_ID = 'asst_yKlwg3LaE9vZSnqMJZF5aLnm';

export default class LegalAnalyzer {
  constructor() {
    this.analysisResults = {};
  }

  async analyzeDocument(documentData) {
    const { text, documentType } = documentData;

    const extractedKeywords = extractKeywords(text);
    const extractedDates = extractDates(text);
    const references = getLegalReferences(text);

    const platformSummary = await this.queryGPTAssistant(text);

    const legalResponse = generateLegalResponse({
      documentType,
      extractedKeywords,
      extractedDates,
      references,
      platformSummary
    });

    this.analysisResults = {
      documentType,
      keywords: extractedKeywords,
      dates: extractedDates,
      references,
      summary: platformSummary,
      response: legalResponse
    };

    return this.analysisResults;
  }

  async queryGPTAssistant(text) {
    try {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analiza el siguiente texto legal. Extrae los datos clave y proporciona una respuesta estructurada con base en la normativa tributaria española:\n\n${text}`
            }
          ]
        })
      });

      const threadData = await threadResponse.json();
      const threadId = threadData.id;

      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID
        })
      });

      const runData = await runResponse.json();
      const runId = runData.id;

      let status = 'in_progress';
      while (status === 'in_progress') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const checkRun = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
        });
        const checkData = await checkRun.json();
        status = checkData.status;
      }

      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
      });

      const messagesData = await messagesResponse.json();
      const assistantMessage = messagesData.data.find(m => m.role === 'assistant');

      return assistantMessage?.content || 'No se pudo obtener una respuesta del asistente.';
    } catch (error) {
      console.error('Error al consultar el asistente GPT Platform:', error);
      return 'Se produjo un error al intentar analizar el documento con IA.';
    }
  }

  getResults() {
    return this.analysisResults;
  }
}
