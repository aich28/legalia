// document-processor.js (versión modificada con Google Cloud Vision OCR)

const GOOGLE_VISION_API_KEY = 'AIzaSyAvPqRKEwhIzcVF0G3Y8SfsiyuwRHIXBgI';

class DocumentProcessor {
  constructor() {
    // Ya no usamos Tesseract, por lo que no se inicializa nada
  }

  async processDocument(file) {
    try {
      this.updateProgress('Procesando documento...');

      const imageData = await this.fileToImageData(file);
      const extractedText = await this.extractTextWithGoogleVision(imageData);

      const documentType = this.classifyDocument(extractedText);
      const extractedData = this.extractKeyData(extractedText, documentType);
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

  async extractTextWithGoogleVision(imageDataUrl) {
    const base64 = imageDataUrl.split(',')[1];

    const body = {
      requests: [
        {
          image: { content: base64 },
          features: [ { type: 'DOCUMENT_TEXT_DETECTION' } ]
        }
      ]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.responses?.[0]?.fullTextAnnotation?.text || '';
  }

  async fileToImageData(file) {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error leyendo archivo'));
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        this.processPDF(file).then(resolve).catch(reject);
      } else {
        reject(new Error('Formato de archivo no soportado'));
      }
    });
  }

  async processPDF(file) {
    try {
      if (!window.pdfjsLib) {
        window.pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/build/pdf.min.js');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/build/pdf.worker.min.js';
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error procesando PDF:', error);
      throw new Error('No se pudo procesar el archivo PDF. Verifica que sea un PDF válido.');
    }
  }

  // Métodos classifyDocument, extractKeyData, extractNIF, extractImporte,
  // extractContribuyente, extractExpediente, extractFecha, extractOrgano, validateData y updateProgress
  // se mantienen sin cambios respecto a la versión anterior

  // ... (se conservan igual que en el archivo original)
}

export default DocumentProcessor;

