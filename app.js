// Aplicación principal del Asistente Legal Inteligente

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar componentes
  const documentProcessor = new DocumentProcessor();
  const legalAnalyzer = new LegalAnalyzer();
  const documentGenerator = new DocumentGenerator();
  const deadlineCalculator = new DeadlineCalculator();
  const legalReferenceSystem = new LegalReferenceSystem();
  
  // Referencias a elementos del DOM
  const dropzone = document.getElementById('document-dropzone');
  const fileInput = document.getElementById('file-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  
  // Variables de estado
  let currentDocument = null;
  let documentData = null;
  let processingDocument = false;
  
  // Inicializar chat con mensaje de bienvenida
  addMessage('assistant', 'Hola, soy tu asistente legal especializado en trámites con la AEAT. Puedes subir un documento para analizarlo o hacerme cualquier consulta.');
  
  // Configurar eventos de la zona de carga de documentos
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      
      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });
    
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) {
        handleFileUpload(fileInput.files[0]);
      }
    });
  }
  
  // Configurar eventos del chat
  if (chatInput && sendButton) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleUserMessage();
      }
    });
    
    sendButton.addEventListener('click', handleUserMessage);
  }
  
  // Función para manejar la carga de archivos
  async function handleFileUpload(file) {
    if (processingDocument) {
      addMessage('assistant', 'Ya estoy procesando un documento. Por favor, espera a que termine.');
      return;
    }
    
    // Validar tipo de archivo
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      addMessage('assistant', 'Formato de archivo no soportado. Por favor, sube un archivo PDF, JPG, PNG o DOCX.');
      return;
    }
    
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addMessage('assistant', 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return;
    }
    
    processingDocument = true;
    currentDocument = file;
    
    try {
      // Notificar al usuario
      addMessage('assistant', 'He detectado que has subido un documento. Estoy procesándolo y extrayendo los datos clave...');
      
      // Procesar documento
      documentData = await documentProcessor.processDocument(file);
      
      // Analizar documento
      const analysis = legalAnalyzer.analyzeDocument(documentData);
      
      // Calcular plazos
      const deadlines = deadlineCalculator.calculateDeadlines(documentData);
      
      // Mostrar resultados
      displayDocumentAnalysis(documentData, analysis, deadlines);
    } catch (error) {
      console.error('Error procesando documento:', error);
      addMessage('assistant', 'Lo siento, ha ocurrido un error al procesar el documento. Por favor, inténtalo de nuevo o sube un documento diferente.');
    } finally {
      processingDocument = false;
    }
  }
  
  // Función para manejar mensajes del usuario
  function handleUserMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Añadir mensaje del usuario al chat
    addMessage('user', message);
    chatInput.value = '';
    
    // Procesar mensaje
    processUserMessage(message);
  }
  
  // Función para procesar mensajes del usuario
  async function processUserMessage(message) {
    // Si hay un documento cargado, analizar la consulta en ese contexto
    if (documentData) {
      const response = await generateContextualResponse(message, documentData);
      addMessage('assistant', response);
    } else {
      // Sin documento, responder basado en el mensaje
      const response = await generateGeneralResponse(message);
      addMessage('assistant', response);
    }
  }
  
  // Función para generar respuesta contextual (con documento)
  async function generateContextualResponse(message, documentData) {
    const messageLower = message.toLowerCase();
    
    // Detectar intención del usuario
    if (messageLower.includes('plazo') || messageLower.includes('fecha límite') || messageLower.includes('cuando')) {
      // Consulta sobre plazos
      const deadlines = deadlineCalculator.calculateDeadlines(documentData);
      return formatDeadlinesResponse(deadlines);
    } else if (messageLower.includes('error') || messageLower.includes('defecto') || messageLower.includes('problema')) {
      // Consulta sobre errores
      const analysis = legalAnalyzer.analyzeDocument(documentData);
      return formatErrorsResponse(analysis);
    } else if (messageLower.includes('recurso') || messageLower.includes('reclamación') || messageLower.includes('impugnar')) {
      // Consulta sobre recursos
      return formatAppealOptions(documentData);
    } else if (messageLower.includes('generar') || messageLower.includes('crear') || messageLower.includes('documento')) {
      // Solicitud de generación de documento
      return 'Para generar un documento personalizado, necesito saber qué tipo de documento necesitas. ¿Quieres un recurso de reposición, una reclamación económico-administrativa o una solicitud de aplazamiento?';
    } else {
      // Consulta general sobre el documento
      return `Basado en el documento que has subido (${documentData.documentType}), puedo ayudarte con información sobre plazos, posibles errores o generación de documentos de respuesta. ¿Qué te gustaría saber específicamente?`;
    }
  }
  
  // Función para generar respuesta general (sin documento)
  async function generateGeneralResponse(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('plazo') || messageLower.includes('fecha')) {
      return 'Para calcular plazos legales precisos, necesito analizar el documento específico. ¿Podrías subir la notificación o documento de la AEAT?';
    } else if (messageLower.includes('recurso') || messageLower.includes('reclamación')) {
      return 'Puedo ayudarte a generar recursos o reclamaciones personalizados, pero primero necesito analizar el documento para entender el caso específico. ¿Podrías subir el documento?';
    } else if (messageLower.includes('sanción') || messageLower.includes('multa')) {
      return 'Las sanciones de la AEAT pueden ser recurridas si existen errores formales, procedimentales o de cálculo. Para un análisis detallado, necesitaría revisar el documento de sanción. ¿Puedes subirlo?';
    } else if (messageLower.includes('liquidación') || messageLower.includes('liquidacion')) {
      return 'Las propuestas de liquidación pueden ser impugnadas presentando alegaciones en el plazo establecido. Para ayudarte mejor, necesitaría analizar el documento. ¿Puedes subirlo?';
    } else if (messageLower.includes('requerimiento')) {
      return 'Los requerimientos de la AEAT deben atenderse en los plazos establecidos. Puedo ayudarte a entender qué información debes aportar y cómo hacerlo, pero necesitaría ver el documento. ¿Puedes subirlo?';
    } else {
      return 'Soy tu asistente legal especializado en trámites con la AEAT. Puedo analizar notificaciones, detectar errores, calcular plazos y generar documentos personalizados. Para empezar, sube un documento o hazme una consulta específica.';
    }
  }
  
  // Función para mostrar análisis del documento
  function displayDocumentAnalysis(documentData, analysis, deadlines) {
    // Construir mensaje con los datos extraídos
    let message = `📌 He analizado el documento y he identificado que se trata de ${getDocumentTypeName(documentData.documentType)}.\n\n`;
    
    message += '🔹 Datos Clave:\n';
    if (documentData.data.contribuyente) message += `✔ Contribuyente: ${documentData.data.contribuyente}\n`;
    if (documentData.data.nif) message += `✔ NIF/CIF: ${documentData.data.nif}\n`;
    if (documentData.data.expediente) message += `✔ Referencia Expediente: ${documentData.data.expediente}\n`;
    if (documentData.data.importe) message += `✔ Importe: ${documentData.data.importe}\n`;
    if (documentData.data.fechaNotificacion) message += `✔ Fecha de notificación: ${formatDate(documentData.data.fechaNotificacion)}\n`;
    if (documentData.data.organoEmisor) message += `✔ Órgano Emisor: ${documentData.data.organoEmisor}\n`;
    
    // Añadir información sobre plazos
    if (deadlines && Object.keys(deadlines).length > 0) {
      message += '\n📅 Plazos importantes:\n';
      for (const [key, value] of Object.entries(deadlines)) {
        message += `✔ ${key}: ${formatDate(value)}\n`;
      }
    }
    
    // Añadir información sobre errores detectados
    if (analysis && analysis.errors && analysis.errors.length > 0) {
      message += '\n⚠️ He detectado posibles errores o deficiencias:\n';
      analysis.errors.forEach(error => {
        message += `✔ ${error.description}\n`;
      });
    }
    
    // Añadir opciones disponibles
    message += '\n📌 Opciones Disponibles:\n';
    message += '✅ Puedo explicarte en detalle las implicaciones de este documento.\n';
    message += '✅ Puedo ayudarte a generar un documento de respuesta personalizado.\n';
    message += '✅ Puedo informarte sobre los plazos legales aplicables.\n\n';
    
    message += '¿En qué más puedo ayudarte?';
    
    // Mostrar mensaje
    addMessage('assistant', message);
  }
  
  // Función para formatear respuesta sobre plazos
  function formatDeadlinesResponse(deadlines) {
    let message = '📅 Plazos legales aplicables:\n\n';
    
    for (const [key, value] of Object.entries(deadlines)) {
      message += `✔ ${key}: ${formatDate(value)}\n`;
    }
    
    message += '\nRecuerda que estos plazos son de caducidad, lo que significa que una vez transcurridos no podrás ejercer tu derecho. ¿Necesitas que te explique algún plazo en particular?';
    
    return message;
  }
  
  // Función para formatear respuesta sobre errores
  function formatErrorsResponse(analysis) {
    if (!analysis || !analysis.errors || analysis.errors.length === 0) {
      return 'No he detectado errores formales, procedimentales o de cálculo evidentes en el documento. Sin embargo, podría haber aspectos sustantivos que requieran un análisis más profundo por parte de un profesional.';
    }
    
    let message = '⚠️ He detectado los siguientes posibles errores o deficiencias:\n\n';
    
    analysis.errors.forEach(error => {
      message += `✔ ${error.description}\n`;
      if (error.fundamento) message += `   Fundamento: ${error.fundamento}\n`;
      if (error.impacto) message += `   Impacto: ${error.impacto}\n\n`;
    });
    
    message += 'Estos errores podrían ser base para presentar un recurso o reclamación. ¿Te gustaría que te ayude a generar un documento para impugnar este acto?';
    
    return message;
  }
  
  // Función para formatear opciones de recurso
  function formatAppealOptions(documentData) {
    let message = '📝 Opciones para impugnar este acto:\n\n';
    
    if (documentData.documentType === 'sancion' || documentData.documentType === 'liquidacion') {
      message += '1️⃣ Recurso de reposición (15 días hábiles)\n';
      message += '   ✓ Más sencillo y rápido\n';
      message += '   ✓ Se presenta ante el mismo órgano que dictó el acto\n';
      message += '   ✓ No requiere representación legal\n\n';
      
      message += '2️⃣ Reclamación económico-administrativa (1 mes)\n';
      message += '   ✓ Se presenta ante un órgano independiente (TEAR/TEAC)\n';
      message += '   ✓ Mayor probabilidad de éxito en casos complejos\n';
      message += '   ✓ No requiere representación legal para cuantías menores\n\n';
    } else if (documentData.documentType === 'requerimiento') {
      message += '1️⃣ Contestación al requerimiento\n';
      message += '   ✓ Aportando la documentación o información solicitada\n';
      message += '   ✓ Explicando los motivos de imposibilidad, si aplica\n\n';
      
      message += '2️⃣ Solicitud de ampliación de plazo (si es necesario)\n';
      message += '   ✓ Debe presentarse antes de que venza el plazo original\n';
      message += '   ✓ Debe estar justificada\n\n';
    }
    
    message += '¿Qué opción prefieres? Puedo ayudarte a generar el documento correspondiente.';
    
    return message;
  }
  
  // Función para añadir mensaje al chat
  function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    
    // Formatear texto con saltos de línea
    const formattedText = text.replace(/\n/g, '<br>');
    messageElement.innerHTML = formattedText;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Función para obtener nombre legible del tipo de documento
  function getDocumentTypeName(type) {
    const types = {
      'sancion': 'una sanción tributaria',
      'liquidacion': 'una propuesta de liquidación',
      'requerimiento': 'un requerimiento de información',
      'acta': 'un acta de inspección',
      'desconocido': 'un documento de la AEAT'
    };
    
    return types[type] || 'un documento de la AEAT';
  }
  
  // Función para formatear fechas
  function formatDate(date) {
    if (!date) return 'Fecha no disponible';
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (isNaN(date.getTime())) {
      return 'Fecha no válida';
    }
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
});
