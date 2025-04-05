const DocumentProcessor = {
  async procesar(file) {
    const text = await this.extractText(file);
    const tipo = this.detectDocumentType(text);
    const datos = this.extractKeyData(text);
    return { tipo, texto: text, ...datos };
  },

  async extractText(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async function () {
        try {
          const typedarray = new Uint8Array(reader.result);
          const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          resolve(fullText.trim());
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  },

  detectDocumentType(text) {
    if (/propuesta de liquidaci[óo]n/i.test(text)) return "Propuesta de Liquidación";
    if (/requerimiento de informaci[óo]n/i.test(text)) return "Requerimiento de Información";
    if (/inicio del procedimiento sancionador/i.test(text)) return "Procedimiento Sancionador";
    return "Desconocido";
  },

  extractKeyData(text) {
    const nombre = text.match(/D[\.ª]*\s+([A-ZÁÉÍÓÚÑ][^\d]{3,})(?=\sNIF|\scon NIF)/i)?.[1] || null;
    const cif = text.match(/NIF[:\s]*([0-9A-Z]{8,})/i)?.[1] || null;
    const expediente = text.match(/expediente[:\s]*([A-Z0-9\/-]+)/i)?.[1] || null;
    const importe = text.match(/importe(?: total)?[:\s]*([0-9\.,]+\s?€?)/i)?.[1] || null;

    return { nombre, cif, expediente, importe };
  }
};

