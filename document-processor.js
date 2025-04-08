class DocumentProcessor {
  constructor() {
    this.worker = null;
    this.initializeOCR();
  }

  async initializeOCR() {
    // Inicializar Tesseract con soporte para español
    this.worker = Tesseract.createWorker({
      logger: m => console.log(m)
    });
    await this.worker.load();
    await this.worker.loadLanguage('spa');
    await this.worker.initialize('spa');
  }

  async processDocument(file) {
    try {
      // Mostrar indicador de progreso
      this.updateProgress('Procesando documento...');
      
      // Convertir archivo a formato procesable
      const imageData = await this.fileToImageData(file);
      
      // Realizar OCR
      const { data } = await this.worker.recognize(imageData);
      const extractedText = data.text;
      
      // Clasificar documento
      const documentType = this.classifyDocument(extractedText);
      
      // Extraer datos clave
      const extractedData = this.extractKeyData(extractedText, documentType);
      
      // Validar datos
      const validatedData = this.validateData(extractedData);
      
      return {
        documentType,
        text: extractedText,
        data: validatedData
      };
    } catch (error) {
      console.error('Error procesando documento:', error);
      throw new Error('No se pudo procesar el documento. Por favor, inténtalo de nuevo.');
    }
  }
  
  // Convertir archivo a formato de imagen
  async fileToImageData(file) {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        // Procesar imagen directamente
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error leyendo archivo'));
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // Procesar PDF (requiere pdf.js)
        this.processPDF(file).then(resolve).catch(reject);
      } else {
        reject(new Error('Formato de archivo no soportado'));
      }
    });
  }
  
  // Método para procesar PDFs
  async processPDF(file) {
    // Cargar PDF.js si no está ya cargado
    if (!window.pdfjsLib) {
      window.pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';
    }
    
    try {
      // Convertir archivo a ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Cargar documento PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Para simplificar, procesamos solo la primera página
      // En una implementación completa, procesaríamos todas las páginas
      const page = await pdf.getPage(1);
      
      // Renderizar página a canvas
      const viewport = page.getViewport({ scale: 2.0 }); // Escala alta para mejor OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Devolver imagen como data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error procesando PDF:', error);
      throw new Error('No se pudo procesar el archivo PDF');
    }
  }
  
  // Clasificar tipo de documento
  classifyDocument(text) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('sanción') || textLower.includes('sancion')) {
      return 'sancion';
    } else if (textLower.includes('liquidación') || textLower.includes('liquidacion')) {
      return 'liquidacion';
    } else if (textLower.includes('requerimiento')) {
      return 'requerimiento';
    } else if (textLower.includes('acta')) {
      return 'acta';
    } else {
      return 'desconocido';
    }
  }
  
  // Extraer datos clave según tipo de documento
  extractKeyData(text, documentType) {
    const data = {
      contribuyente: this.extractContribuyente(text),
      nif: this.extractNIF(text),
      expediente: this.extractExpediente(text),
      importe: this.extractImporte(text),
      fechaNotificacion: this.extractFecha(text),
      organoEmisor: this.extractOrgano(text)
    };
    
    return data;
  }
  
  // Métodos de extracción específicos
  extractNIF(text) {
    // Patrón para NIF/CIF
    const nifPattern = /\b[0-9A-Z][0-9]{7}[A-Z]\b|\b[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[0-9A-J]\b/g;
    const matches = text.match(nifPattern);
    return matches ? matches[0] : null;
  }
  
  extractImporte(text) {
    // Patrón para importes monetarios
    const importePattern = /\b\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s*(?:€|EUR|euros)\b|\b\d+,\d{2}\s*(?:€|EUR|euros)\b/g;
    const matches = text.match(importePattern);
    return matches ? matches[0] : null;
  }
  
  extractContribuyente(text) {
    // Esta es una implementación simplificada
    // En una implementación real, usaríamos técnicas de NLP más avanzadas
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('contribuyente') || 
          line.toLowerCase().includes('obligado') ||
          line.toLowerCase().includes('interesado')) {
        return line.replace(/contribuyente|obligado|interesado/i, '').trim();
      }
    }
    return null;
  }
  
  extractExpediente(text) {
    // Patrones comunes para referencias de expedientes
    const patterns = [
      /\b[A-Z][0-9]{10}\b/,  // Formato AEAT común
      /\b[0-9]{4}[A-Z]{3}[0-9]{8}[A-Z]{2}\b/,  // Otro formato AEAT
      /\bEXP\.?\s*[0-9A-Z\-\/]+\b/i,  // Formato genérico EXP
      /\bREF\.?\s*[0-9A-Z\-\/]+\b/i   // Formato genérico REF
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }
  
  extractFecha(text) {
    // Patrones para fechas en formato español
    const patterns = [
      // DD/MM/YYYY
      /\b([0-2]?[0-9]|3[01])[\/\-\.]([0-1]?[0-9])[\/\-\.]([0-9]{4})\b/,
      // Texto (15 de agosto de 2024)
      /\b([0-2]?[0-9]|3[01])\s+de\s+([a-zñ]+)\s+de\s+([0-9]{4})\b/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.toString().includes('de')) {
          // Convertir mes en texto a número
          const months = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
          };
          return new Date(match[3], months[match[2].toLowerCase()], match[1]);
        } else {
          return new Date(match[3], match[2] - 1, match[1]);
        }
      }
    }
    
    return null;
  }
  
  extractOrgano(text) {
    // Buscar menciones a órganos de la AEAT
    const patterns = [
      /\bDelegación\s+(?:Especial|Provincial)?\s+de\s+[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+\b/i,
      /\bAdministración\s+de\s+[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+\b/i,
      /\bDependencia\s+(?:Regional|Provincial)?\s+de\s+[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+\b/i,
      /\bAgencia\s+Tributaria\b/i,
      /\bAEAT\b/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }
  
  // Validar datos extraídos
  validateData(data) {
    // Implementar validaciones básicas
    return data;
  }
  
  // Actualizar progreso
  updateProgress(message) {
    // Implementar actualización de UI
    console.log(message);
  }
}
