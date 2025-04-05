/**
 * LegalDefense AI - Asistente Legal Inteligente
 * Módulo de procesamiento de documentos
 */

// Funciones para procesar documentos subidos por el usuario
const fileInput = document.getElementById('fileInput');

fileInput?.addEventListener('change', async function () {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
    const typedarray = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\\n';
    }

    console.log(\"Texto extraído:\", fullText);

    // Detectar datos clave como ejemplo
    const nombre = fullText.match(/(?:D[\\.ª]*\\s)?([A-ZÁÉÍÓÚÑ][^\\d]{3,})(?=\\sNIF)/i);
    const nif = fullText.match(/NIF[:\\s]*([0-9A-Z]{8,})/i);
    const expediente = fullText.match(/expediente[:\\s]*([A-Z0-9\\/-]+)/i);
    const importe = fullText.match(/importe[:\\s]*([0-9\\.,]+\\s?€?)/i);

    alert(
      `✅ Datos detectados:\\n\\n` +
      `👤 Nombre: ${nombre?.[1] || 'No encontrado'}\\n` +
      `🆔 NIF: ${nif?.[1] || 'No encontrado'}\\n` +
      `📁 Expediente: ${expediente?.[1] || 'No encontrado'}\\n` +
      `💰 Importe: ${importe?.[1] || 'No encontrado'}`
    );
  };

  reader.readAsArrayBuffer(file);
});
const DocumentProcessor = {
    // Simula la extracción de texto de diferentes tipos de documentos
    extractText: function(file) {
        return new Promise((resolve) => {
            // En una implementación real, aquí se utilizaría una biblioteca como pdf.js, 
            // docx.js o tesseract.js para extraer el texto del documento
            setTimeout(() => {
                // Simulamos texto extraído para demostración
                const extractedText = `
                    AGENCIA TRIBUTARIA
                    Delegación de Madrid
                    
                    PROPUESTA DE LIQUIDACIÓN
                    
                    Contribuyente: Juan Pérez Rodríguez
                    NIF: 12345678A
                    Expediente: A23-7654321/2023
                    
                    Por la presente se le notifica propuesta de liquidación correspondiente al
                    Impuesto sobre la Renta de las Personas Físicas, ejercicio 2021.
                    
                    Importe a ingresar: 3.256,78€
                    
                    Plazo para presentar alegaciones: 15 días hábiles desde la recepción de esta notificación.
                `;
                resolve(extractedText);
            }, 1500);
        });
    },
    
    // Extrae datos clave del texto del documento
    extractKeyData: function(text) {
        return new Promise((resolve) => {
            // En una implementación real, se utilizarían expresiones regulares o NLP
            // para extraer información específica del texto
            setTimeout(() => {
                // Datos simulados extraídos
                const data = {
                    nombre: 'Juan Pérez Rodríguez',
                    nif: '12345678A',
                    expediente: 'A23-7654321/2023',
                    fechaNotificacion: '15/03/2023',
                    organoEmisor: 'Agencia Tributaria - Delegación de Madrid',
                    importe: '3.256,78€',
                    concepto: 'Propuesta de liquidación (IRPF 2021)',
                    plazos: {
                        voluntario: '05/04/2023',
                        recurso: '05/04/2023'
                    }
                };
                resolve(data);
            }, 1000);
        });
    },
    
    // Detecta el tipo de documento
    detectDocumentType: function(text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulamos la detección del tipo de documento
                let documentType = 'Desconocido';
                
                if (text.includes('PROPUESTA DE LIQUIDACIÓN')) {
                    documentType = 'Propuesta de liquidación';
                } else if (text.includes('SANCIÓN') || text.includes('MULTA')) {
                    documentType = 'Sanción';
                } else if (text.includes('REQUERIMIENTO')) {
                    documentType = 'Requerimiento';
                } else if (text.includes('NOTIFICACIÓN')) {
                    documentType = 'Notificación';
                } else if (text.includes('RESOLUCIÓN')) {
                    documentType = 'Resolución';
                } else if (text.includes('ACTA')) {
                    documentType = 'Acta de inspección';
                }
                
                resolve(documentType);
            }, 800);
        });
    },
    
    // Valida el formato del documento
    validateDocument: function(file) {
        return new Promise((resolve) => {
            // Validar el tipo de archivo
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
            const isValidType = validTypes.includes(file.type);
            
            // Validar el tamaño del archivo (20MB máximo)
            const isValidSize = file.size <= 20 * 1024 * 1024;
            
            resolve({
                isValid: isValidType && isValidSize,
                errors: !isValidType ? ['Formato de archivo no válido'] : 
                        !isValidSize ? ['El archivo es demasiado grande (máximo 20MB)'] : []
            });
        });
    }
};

// Exportar el módulo
window.DocumentProcessor = DocumentProcessor;
// Cálculo de días hábiles
function sumarDiasHabiles(fecha, dias) {
  let resultado = new Date(fecha);
  let contador = 0;
  while (contador < dias) {
    resultado.setDate(resultado.getDate() + 1);
    const dia = resultado.getDay();
    if (dia !== 0 && dia !== 6) contador++; // Lunes a viernes
  }
  return resultado;
}

// Evento calcular plazo
document.getElementById('calcularPlazo')?.addEventListener('click', () => {
  const fechaStr = document.getElementById('fechaRecepcion').value;
  if (!fechaStr) return alert(\"Introduce la fecha de recepción por favor.\");

  const fechaRecepcion = new Date(fechaStr);
  const plazo = sumarDiasHabiles(fechaRecepcion, 10);
  const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };

  document.getElementById('plazoResultado').textContent =
    `📅 Plazo para responder: ${plazo.toLocaleDateString('es-ES', opciones)}`;
});
