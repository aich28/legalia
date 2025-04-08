/**
 * Sistema de Procesamiento de Documentos para el Asistente Legal Inteligente
 * Implementa OCR utilizando Tesseract.js para reconocimiento de texto en documentos
 * Incluye manejo de PDF con PDF.js y procesamiento de archivos DOCX
 */

class DocumentProcessor {
    constructor() {
        this.supportedFormats = ['pdf', 'jpg', 'jpeg', 'png', 'docx'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.tesseractWorker = null;
        this.pdfWorker = null;
        this.processingStatus = {
            isProcessing: false,
            progress: 0,
            message: ''
        };
        this.extractedData = null;
        this.errorMessage = null;
        
        // Inicializar los workers cuando se crea la instancia
        this.initTesseract();
        this.initPdfJs();
    }

    /**
     * Inicializa el worker de Tesseract.js
     */
    async initTesseract() {
        try {
            // Importar Tesseract.js dinámicamente
            if (typeof Tesseract === 'undefined') {
                // Cargar el script si no está disponible
                await this.loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
            }
            
            // Crear worker con configuración para español
            this.tesseractWorker = await Tesseract.createWorker({
                logger: progress => {
                    this.updateProgress(progress);
                }
            });
            
            // Inicializar worker y cargar modelo para español
            await this.tesseractWorker.loadLanguage('spa');
            await this.tesseractWorker.initialize('spa');
            console.log('Tesseract worker inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar Tesseract:', error);
            this.errorMessage = 'Error al inicializar el sistema de reconocimiento de texto.';
        }
    }

    /**
     * Inicializa PDF.js para procesamiento de archivos PDF
     */
    async initPdfJs() {
        try {
            // Importar PDF.js dinámicamente
            if (typeof pdfjsLib === 'undefined') {
                // Cargar el script si no está disponible
                await this.loadScript('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js');
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
            }
            console.log('PDF.js inicializado correctamente');
        } catch (error) {
            console.error('Error al inicializar PDF.js:', error);
            this.errorMessage = 'Error al inicializar el sistema de procesamiento de PDF.';
        }
    }

    /**
     * Carga un script externo de forma dinámica
     * @param {string} url - URL del script a cargar
     * @returns {Promise} - Promesa que se resuelve cuando el script está cargado
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = (error) => reject(new Error(`Error al cargar el script ${url}: ${error}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Actualiza el estado de progreso del procesamiento
     * @param {Object} progress - Objeto con información de progreso
     */
    updateProgress(progress) {
        if (progress.status === 'recognizing text') {
            this.processingStatus.progress = parseInt(progress.progress * 100);
            this.processingStatus.message = `Procesando documento... ${this.processingStatus.progress}%`;
            
            // Actualizar la interfaz de usuario con el progreso
            this.updateUI();
        }
    }

    /**
     * Actualiza la interfaz de usuario con el estado actual
     */
    updateUI() {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        // Buscar o crear el mensaje de estado
        let statusMessage = document.querySelector('.processing-status');
        if (!statusMessage) {
            statusMessage = document.createElement('div');
            statusMessage.className = 'message processing-status';
            chatContainer.appendChild(statusMessage);
        }

        // Actualizar el contenido del mensaje
        if (this.processingStatus.isProcessing) {
            statusMessage.innerHTML = `
                <div class="message-content">
                    <p>${this.processingStatus.message}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${this.processingStatus.progress}%"></div>
                    </div>
                </div>
            `;
        } else if (this.errorMessage) {
            statusMessage.innerHTML = `
                <div class="message-content error">
                    <p>${this.errorMessage}</p>
                </div>
            `;
        } else if (this.extractedData) {
            statusMessage.innerHTML = `
                <div class="message-content success">
                    <p>He detectado que has subido un documento. Estoy procesándolo y extrayendo los datos clave...</p>
                </div>
            `;
        }
    }

    /**
     * Verifica si un archivo es válido (formato y tamaño)
     * @param {File} file - Archivo a verificar
     * @returns {boolean} - true si el archivo es válido
     */
    isValidFile(file) {
        // Verificar tamaño
        if (file.size > this.maxFileSize) {
            this.errorMessage = `El archivo excede el tamaño máximo permitido (10MB).`;
            return false;
        }

        // Verificar formato
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.supportedFormats.includes(extension)) {
            this.errorMessage = `Formato de archivo no soportado. Formatos aceptados: ${this.supportedFormats.join(', ')}.`;
            return false;
        }

        return true;
    }

    /**
     * Procesa un archivo y extrae su contenido
     * @param {File} file - Archivo a procesar
     * @returns {Promise<Object>} - Datos extraídos del documento
     */
    async processDocument(file) {
        try {
            // Reiniciar estado
            this.processingStatus.isProcessing = true;
            this.processingStatus.progress = 0;
            this.processingStatus.message = 'Iniciando procesamiento del documento...';
            this.extractedData = null;
            this.errorMessage = null;
            
            // Actualizar UI
            this.updateUI();

            // Verificar si el archivo es válido
            if (!this.isValidFile(file)) {
                this.processingStatus.isProcessing = false;
                this.updateUI();
                return null;
            }

            // Procesar según el tipo de archivo
            const extension = file.name.split('.').pop().toLowerCase();
            let text = '';

            if (extension === 'pdf') {
                text = await this.processPdf(file);
            } else if (['jpg', 'jpeg', 'png'].includes(extension)) {
                text = await this.processImage(file);
            } else if (extension === 'docx') {
                text = await this.processDocx(file);
            }

            // Analizar el texto extraído
            if (text && text.trim().length > 0) {
                this.extractedData = this.analyzeText(text);
                this.processingStatus.isProcessing = false;
                this.processingStatus.message = 'Documento procesado correctamente.';
                this.updateUI();
                return this.extractedData;
            } else {
                throw new Error('No se pudo extraer texto del documento.');
            }
        } catch (error) {
            console.error('Error al procesar el documento:', error);
            this.processingStatus.isProcessing = false;
            this.errorMessage = 'Lo siento, ha ocurrido un error al procesar el documento. Por favor, inténtalo de nuevo o sube un documento diferente.';
            this.updateUI();
            return null;
        }
    }

    /**
     * Procesa un archivo PDF y extrae su texto
     * @param {File} file - Archivo PDF a procesar
     * @returns {Promise<string>} - Texto extraído del PDF
     */
    async processPdf(file) {
        try {
            this.processingStatus.message = 'Procesando archivo PDF...';
            this.updateUI();

            // Convertir el archivo a ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            
            // Cargar el documento PDF
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            
            // Procesar cada página
            for (let i = 1; i <= pdf.numPages; i++) {
                this.processingStatus.progress = Math.floor((i / pdf.numPages) * 50); // Hasta 50% para extracción de PDF
                this.processingStatus.message = `Procesando página ${i} de ${pdf.numPages}...`;
                this.updateUI();
                
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n\n';
                
                // Si la página no tiene texto (posiblemente escaneada), usar OCR
                if (pageText.trim().length < 50) { // Umbral arbitrario para detectar páginas con poco texto
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    // Usar Tesseract para extraer texto de la imagen de la página
                    const ocrText = await this.recognizeTextFromCanvas(canvas);
                    if (ocrText && ocrText.trim().length > 0) {
                        fullText += ocrText + '\n\n';
                    }
                }
            }
            
            return fullText;
        } catch (error) {
            console.error('Error al procesar PDF:', error);
            throw new Error('Error al procesar el archivo PDF.');
        }
    }

    /**
     * Procesa una imagen y extrae su texto mediante OCR
     * @param {File} file - Archivo de imagen a procesar
     * @returns {Promise<string>} - Texto extraído de la imagen
     */
    async processImage(file) {
        try {
            this.processingStatus.message = 'Procesando imagen con OCR...';
            this.updateUI();
            
            // Crear URL para la imagen
            const imageUrl = URL.createObjectURL(file);
            
            // Asegurarse de que el worker de Tesseract está inicializado
            if (!this.tesseractWorker) {
                await this.initTesseract();
            }
            
            // Reconocer texto de la imagen
            const result = await this.tesseractWorker.recognize(imageUrl);
            
            // Liberar URL
            URL.revokeObjectURL(imageUrl);
            
            return result.data.text;
        } catch (error) {
            console.error('Error al procesar imagen:', error);
            throw new Error('Error al procesar la imagen con OCR.');
        }
    }

    /**
     * Reconoce texto de un elemento canvas usando Tesseract
     * @param {HTMLCanvasElement} canvas - Elemento canvas con la imagen
     * @returns {Promise<string>} - Texto reconocido
     */
    async recognizeTextFromCanvas(canvas) {
        try {
            // Asegurarse de que el worker de Tesseract está inicializado
            if (!this.tesseractWorker) {
                await this.initTesseract();
            }
            
            // Reconocer texto del canvas
            const result = await this.tesseractWorker.recognize(canvas);
            return result.data.text;
        } catch (error) {
            console.error('Error en OCR de canvas:', error);
            return '';
        }
    }

    /**
     * Procesa un archivo DOCX y extrae su texto
     * @param {File} file - Archivo DOCX a procesar
     * @returns {Promise<string>} - Texto extraído del DOCX
     */
    async processDocx(file) {
        try {
            this.processingStatus.message = 'Procesando archivo DOCX...';
            this.updateUI();
            
            // Cargar docx.js si no está disponible
            if (typeof docx === 'undefined') {
                await this.loadScript('https://cdn.jsdelivr.net/npm/docx@8.2.2/build/index.min.js');
            }
            
            // Leer el archivo
            const arrayBuffer = await file.arrayBuffer();
            
            // Extraer texto usando docx.js
            const result = await docx.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            console.error('Error al procesar DOCX:', error);
            throw new Error('Error al procesar el archivo DOCX.');
        }
    }

    /**
     * Analiza el texto extraído para identificar información relevante
     * @param {string} text - Texto extraído del documento
     * @returns {Object} - Datos estructurados extraídos del texto
     */
    analyzeText(text) {
        // Implementación básica de extracción de datos
        // En una implementación real, esto sería mucho más sofisticado
        const data = {
            rawText: text,
            tipoDocumento: this.detectarTipoDocumento(text),
            fechas: this.extraerFechas(text),
            importes: this.extraerImportes(text),
            nif: this.extraerNIF(text),
            numeroExpediente: this.extraerNumeroExpediente(text),
            plazos: this.calcularPlazos(text)
        };
        
        return data;
    }

    /**
     * Detecta el tipo de documento basado en su contenido
     * @param {string} text - Texto del documento
     * @returns {string} - Tipo de documento detectado
     */
    detectarTipoDocumento(text) {
        const textNormalizado = text.toLowerCase();
        
        if (textNormalizado.includes('liquidación') || textNormalizado.includes('liquidacion')) {
            return 'Liquidación';
        } else if (textNormalizado.includes('sanción') || textNormalizado.includes('sancion')) {
            return 'Sanción';
        } else if (textNormalizado.includes('requerimiento')) {
            return 'Requerimiento';
        } else if (textNormalizado.includes('notificación') || textNormalizado.includes('notificacion')) {
            return 'Notificación';
        } else {
            return 'Documento AEAT';
        }
    }

    /**
     * Extrae fechas del texto usando expresiones regulares
     * @param {string} text - Texto del documento
     * @returns {Array} - Lista de fechas encontradas
     */
    extraerFechas(text) {
        const fechas = [];
        
        // Patrones de fecha comunes en documentos de la AEAT
        const patronesFecha = [
            /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/g,  // dd/mm/yyyy o dd-mm-yyyy
            /(\d{1,2}) de ([a-zA-Záéíóúü]+) de (\d{2,4})/gi  // dd de mes de yyyy
        ];
        
        // Buscar fechas con cada patrón
        patronesFecha.forEach(patron => {
            let match;
            while ((match = patron.exec(text)) !== null) {
                fechas.push(match[0]);
            }
        });
        
        return fechas;
    }

    /**
     * Extrae importes monetarios del texto
     * @param {string} text - Texto del documento
     * @returns {Array} - Lista de importes encontrados
     */
    extraerImportes(text) {
        const importes = [];
        
        // Patrón para importes monetarios
        const patronImporte = /(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?) ?(?:€|EUR|euros)/g;
        
        // Buscar importes
        let match;
        while ((match = patronImporte.exec(text)) !== null) {
            importes.push(match[0]);
        }
        
        return importes;
    }

    /**
     * Extrae NIF/CIF del texto
     * @param {string} text - Texto del documento
     * @returns {string|null} - NIF/CIF encontrado o null
     */
    extraerNIF(text) {
        // Patrón para NIF/CIF
        const patronNIF = /[A-Z0-9]{1}[0-9]{7}[A-Z0-9]{1}/g;
        
        const match = patronNIF.exec(text);
        return match ? match[0] : null;
    }

    /**
     * Extrae número de expediente del texto
     * @param {string} text - Texto del documento
     * @returns {string|null} - Número de expediente o null
     */
    extraerNumeroExpediente(text) {
        // Varios patrones comunes para números de expediente de la AEAT
        const patronesExpediente = [
            /Expediente:? ([A-Z0-9\-\/]+)/i,
            /Nº Expediente:? ([A-Z0-9\-\/]+)/i,
            /Referencia:? ([A-Z0-9\-\/]+)/i
        ];
        
        for (const patron of patronesExpediente) {
            const match = patron.exec(text);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    /**
     * Calcula plazos relevantes basados en el contenido del documento
     * @param {string} text - Texto del documento
     * @returns {Object} - Información de plazos
     */
    calcularPlazos(text) {
        const plazos = {
            fechaNotificacion: null,
            fechaLimiteVoluntaria: null,
            fechaLimiteRecurso: null
        };
        
        // Buscar fecha de notificación
        const patronFechaNotificacion = /fecha de notificación:? (\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i;
        const matchNotificacion = patronFechaNotificacion.exec(text);
        
        if (matchNotificacion) {
            plazos.fechaNotificacion = matchNotificacion[1];
            
            // Calcular fecha límite de pago en voluntaria (generalmente 20 días hábiles)
            // y fecha límite para recurso (generalmente 1 mes)
            // Esto requeriría una implementación más compleja con cálculo de días hábiles
            
            // Implementación simplificada para demostración
            if (plazos.fechaNotificacion) {
                const partesFecha = plazos.fechaNotificacion.split(/[-\/]/);
                if (partesFecha.length === 3) {
                    const fechaBase = new Date(
                        partesFecha[2].length === 2 ? `20${partesFecha[2]}` : partesFecha[2],
                        partesFecha[1] - 1,
                        partesFecha[0]
                    );
                    
                    // Fecha límite voluntaria: 20 días hábiles (aproximadamente 28 días naturales)
                    const fechaVoluntaria = new Date(fechaBase);
                    fechaVoluntaria.setDate(fechaBase.getDate() + 28);
                    plazos.fechaLimiteVoluntaria = `${fechaVoluntaria.getDate()}/${fechaVoluntaria.getMonth() + 1}/${fechaVoluntaria.getFullYear()}`;
                    
                    // Fecha límite recurso: 1 mes
                    const fechaRecurso = new Date(fechaBase);
                    fechaRecurso.setMonth(fechaBase.getMonth() + 1);
                    plazos.fechaLimiteRecurso = `${fechaRecurso.getDate()}/${fechaRecurso.getMonth() + 1}/${fechaRecurso.getFullYear()}`;
                }
            }
        }
        
        return plazos;
    }

    /**
     * Libera recursos cuando el procesador ya no es necesario
     */
    async dispose() {
        if (this.tesseractWorker) {
            await this.tesseractWorker.terminate();
            this.tesseractWorker = null;
        }
    }
}

// Crear instancia global del procesador de documentos
const documentProcessor = new DocumentProcessor();

// Configurar el área de carga de archivos
document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.querySelector('.drop-area');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.docx';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    if (dropArea) {
        // Prevenir comportamiento por defecto de arrastrar y soltar
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Resaltar área al arrastrar
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight() {
            dropArea.classList.add('highlight');
        }

        function unhighlight() {
            dropArea.classList.remove('highlight');
        }

        // Manejar archivos soltados
        dropArea.addEventListener('drop', handleDrop, false);
        
        // Manejar clic en el área para seleccionar archivo
        dropArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // Manejar selección de archivo
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFiles(fileInput.files);
            }
        });

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

        function handleFiles(files) {
            if (files.length > 0) {
                const file = files[0]; // Procesar solo el primer archivo
                processFile(file);
            }
        }

        async function processFile(file) {
            try {
                // Procesar el documento
                const result = await documentProcessor.processDocument(file);
                
                if (result) {
                    // Mostrar los datos extraídos en la interfaz
                    displayExtractedData(result);
                }
            } catch (error) {
                console.error('Error al procesar el archivo:', error);
                // Mostrar mensaje de error en la interfaz
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'message error';
                    errorMessage.innerHTML = `
                        <div class="message-content">
                            <p>Lo siento, ha ocurrido un error al procesar el documento. Por favor, inténtalo de nuevo o sube un documento diferente.</p>
                        </div>
                    `;
                    chatContainer.appendChild(errorMessage);
                }
            }
        }

        function displayExtractedData(data) {
            const chatContainer = document.querySelector('.chat-container');
            if (!chatContainer) return;
            
            // Crear mensaje con los datos extraídos
            const dataMessage = document.createElement('div');
            dataMessage.className = 'message';
            
            let content = `
                <div class="message-content">
                    <p>He detectado que has subido un documento de tipo: <strong>${data.tipoDocumento}</strong></p>
            `;
            
            if (data.numeroExpediente) {
                content += `<p>Número de expediente: <strong>${data.numeroExpediente}</strong></p>`;
            }
            
            if (data.nif) {
                content += `<p>NIF/CIF: <strong>${data.nif}</strong></p>`;
            }
            
            if (data.fechas && data.fechas.length > 0) {
                content += `<p>Fechas relevantes:</p><ul>`;
                data.fechas.forEach(fecha => {
                    content += `<li>${fecha}</li>`;
                });
                content += `</ul>`;
            }
            
            if (data.importes && data.importes.length > 0) {
                content += `<p>Importes detectados:</p><ul>`;
                data.importes.forEach(importe => {
                    content += `<li>${importe}</li>`;
                });
                content += `</ul>`;
            }
            
            if (data.plazos.fechaLimiteVoluntaria) {
                content += `<p>Fecha límite de pago en voluntaria: <strong>${data.plazos.fechaLimiteVoluntaria}</strong></p>`;
            }
            
            if (data.plazos.fechaLimiteRecurso) {
                content += `<p>Fecha límite para presentar recurso: <strong>${data.plazos.fechaLimiteRecurso}</strong></p>`;
            }
            
            content += `
                    <p>¿Qué te gustaría hacer con este documento?</p>
                    <ul>
                        <li>Analizar posibles errores</li>
                        <li>Generar un recurso</li>
                        <li>Calcular plazos detallados</li>
                        <li>Consultar normativa aplicable</li>
                    </ul>
                </div>
            `;
            
            dataMessage.innerHTML = content;
            chatContainer.appendChild(dataMessage);
            
            // Scroll al final del chat
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
});

// Exportar el procesador para uso en otros módulos
export default documentProcessor;

