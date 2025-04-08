class LegalAssistant {
  constructor() {
    // Inicializar componentes
    this.documentProcessor = new DocumentProcessor();
    this.legalAnalyzer = new LegalAnalyzer();
    this.documentGenerator = new DocumentGenerator();
    this.legalReferenceSystem = new LegalReferenceSystem();
    
    // Estado del asistente
    this.currentCase = null;
    this.currentAnalysis = null;
    this.processingDocument = false;
    
    // Inicializar interfaz
    this.initializeUI();
  }
  
  // Inicializar interfaz de usuario
  initializeUI() {
    // Configurar zona de carga de documentos
    this.setupDocumentDropzone();
    
    // Configurar chat
    this.setupChatInterface();
    
    // Añadir mensaje de bienvenida
    this.addAssistantMessage(
      "Hola, soy tu asistente legal especializado en trámites con la AEAT y tribunales administrativos. " +
      "Puedo analizar documentos, calcular plazos, verificar errores y generar documentos personalizados " +
      "para responder a requerimientos, sanciones o reclamaciones. ¿Cómo puedo ayudarte hoy?"
    );
  }
  
  // Configurar zona de carga de documentos
  setupDocumentDropzone() {
    const dropzone = document.getElementById('document-dropzone');
    const fileInput = document.getElementById('file-input');
    
    if (!dropzone || !fileInput) return;
    
    // Evento de clic en la zona
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });
    
    // Eventos de arrastrar y soltar
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
      
      if (e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });
    
    // Evento de selección de archivo
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        this.handleFileUpload(fileInput.files[0]);
      }
    });
  }
  
  // Configurar interfaz de chat
  setupChatInterface() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    if (!chatInput || !sendButton) return;
    
    // Evento de envío de mensaje
    sendButton.addEventListener('click', () => {
      this.handleUserMessage();
    });
    
    // Evento de tecla Enter
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUserMessage();
      }
    });
  }
  
  // Manejar carga de archivo
  async handleFileUpload(file) {
    try {
      // Verificar tipo de archivo
      if (!this.isValidFileType(file)) {
        this.addAssistantMessage("Lo siento, solo puedo procesar archivos PDF, JPG, PNG o DOCX. Por favor, sube un archivo en formato compatible.");
        return;
      }
      
      // Verificar tamaño de archivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        this.addAssistantMessage("El archivo es demasiado grande. Por favor, sube un archivo de menos de 10MB.");
        return;
      }
      
      // Mostrar mensaje de procesamiento
      this.addAssistantMessage("He detectado que has subido un documento. Estoy procesándolo y extrayendo los datos clave...");
      this.processingDocument = true;
      
      // Procesar documento
      const documentData = await this.documentProcessor.processDocument(file);
      this.currentCase = documentData;
      
      // Analizar documento
      this.currentAnalysis = await this.legalAnalyzer.analyzeDocument(documentData);
      
      // Mostrar resultados
      this.displayDocumentAnalysis();
      
      this.processingDocument = false;
    } catch (error) {
      console.error('Error procesando documento:', error);
      this.addAssistantMessage("Lo siento, ha ocurrido un error al procesar el documento. Por favor, inténtalo de nuevo o sube un documento diferente.");
      this.processingDocument = false;
    }
  }
  
  // Verificar tipo de archivo válido
  isValidFileType(file) {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return validTypes.includes(file.type);
  }
  
  // Manejar mensaje del usuario
  handleUserMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Añadir mensaje del usuario al chat
    this.addUserMessage(message);
    
    // Limpiar input
    chatInput.value = '';
    
    // Procesar mensaje
    this.processUserMessage(message);
  }
  
  // Procesar mensaje del usuario
  async processUserMessage(message) {
    // Si estamos procesando un documento, informar al usuario
    if (this.processingDocument) {
      this.addAssistantMessage("Estoy procesando tu documento. Dame un momento para terminar el análisis.");
      return;
    }
    
    // Detectar intención del mensaje
    const intent = this.detectIntent(message);
    
    switch (intent) {
      case 'solicitar_recurso':
        await this.handleRecursoRequest();
        break;
      
      case 'solicitar_aplazamiento':
        await this.handleAplazamientoRequest();
        break;
      
      case 'consultar_plazos':
        this.handlePlazosRequest();
        break;
      
      case 'consultar_normativa':
        this.handleNormativaRequest(message);
        break;
      
      case 'saludar':
        this.addAssistantMessage("¡Hola! Estoy aquí para ayudarte con tus trámites ante la AEAT. ¿En qué puedo asistirte hoy?");
        break;
      
      case 'agradecer':
        this.addAssistantMessage("¡De nada! Estoy aquí para ayudarte. ¿Hay algo más en lo que pueda asistirte?");
        break;
      
      case 'despedir':
        this.addAssistantMessage("¡Hasta pronto! Si necesitas más ayuda en el futuro, estaré aquí para asistirte con tus trámites ante la AEAT.");
        break;
      
      default:
        // Si tenemos un caso activo, intentar responder en contexto
        if (this.currentCase) {
          this.handleContextualQuestion(message);
        } else {
          this.handleGeneralQuestion(message);
        }
        break;
    }
  }
  
  // Detectar intención del mensaje
  detectIntent(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('recurso') || messageLower.includes('impugnar') || messageLower.includes('reclamar')) {
      return 'solicitar_recurso';
    } else if (messageLower.includes('aplazamiento') || messageLower.includes('fraccionar') || messageLower.includes('pagar a plazos')) {
      return 'solicitar_aplazamiento';
    } else if (messageLower.includes('plazo') || messageLower.includes('fecha límite') || messageLower.includes('cuándo')) {
      return 'consultar_plazos';
    } else if (messageLower.includes('ley') || messageLower.includes('normativa') || messageLower.includes('artículo')) {
      return 'consultar_normativa';
    } else if (messageLower.includes('hola') || messageLower.includes('buenos días') || messageLower.includes('buenas tardes')) {
      return 'saludar';
    } else if (messageLower.includes('gracias') || messageLower.includes('te lo agradezco')) {
      return 'agradecer';
    } else if (messageLower.includes('adiós') || messageLower.includes('hasta luego') || messageLower.includes('chao')) {
      return 'despedir';
    }
    
    return 'general';
  }
  
  // Mostrar análisis del documento
  displayDocumentAnalysis() {
    if (!this.currentCase || !this.currentAnalysis) return;
    
    // Formatear datos extraídos
    let message = "📌 He analizado el documento y he extraído la siguiente información:\n\n";
    
    message += "🔹 **Datos Clave:**\n";
    
    if (this.currentCase.data.organoEmisor) {
      message += `✔ Órgano Emisor: ${this.currentCase.data.organoEmisor}\n`;
    }
    
    if (this.currentCase.data.expediente) {
      message += `✔ Referencia Expediente: ${this.currentCase.data.expediente}\n`;
    }
    
    if (this.currentCase.data.nif) {
      message += `✔ NIF: ${this.currentCase.data.nif}`;
      if (this.currentCase.data.contribuyente) {
        message += ` (${this.currentCase.data.contribuyente})`;
      }
      message += "\n";
    }
    
    if (this.currentCase.data.importe) {
      message += `✔ Importe: ${this.currentCase.data.importe}\n`;
    }
    
    // Añadir información de plazos
    if (this.currentAnalysis.deadlines) {
      message += "\n⏱ **Plazos Importantes:**\n";
      
      const deadlineCalculator = new DeadlineCalculator();
      const deadlinesInfo = deadlineCalculator.getDeadlinesInfo(this.currentAnalysis.deadlines);
      
      for (const key in deadlinesInfo) {
        const deadline = deadlinesInfo[key];
        let deadlineLabel = '';
        
        switch(key) {
          case 'voluntaryPayment':
            deadlineLabel = 'Pago en período voluntario';
            break;
          case 'reposicionDeadline':
            deadlineLabel = 'Recurso de reposición';
            break;
          case 'economicAdminDeadline':
            deadlineLabel = 'Reclamación económico-administrativa';
            break;
          case 'responseDeadline':
            deadlineLabel = 'Respuesta al requerimiento';
            break;
          case 'alegacionesDeadline':
            deadlineLabel = 'Presentación de alegaciones';
            break;
          default:
            deadlineLabel = key;
        }
        
        message += `✔ ${deadlineLabel}: ${deadline.formatted}`;
        
        if (deadline.alert.severity === 'high' || deadline.alert.severity === 'critical') {
          message += ` ⚠️ ${deadline.alert.message}`;
        }
        
        message += "\n";
      }
    }
    
    // Añadir información de errores detectados
    if (this.currentAnalysis.errors && this.currentAnalysis.errors.length > 0) {
      message += "\n🚨 **Posibles Errores Detectados:**\n";
      
      this.currentAnalysis.errors.forEach((error, index) => {
        message += `${index + 1}. ${error.description} (${error.legalBasis})\n`;
      });
    }
    
    // Añadir opciones disponibles
    message += "\n📌 **Opciones Disponibles:**\n";
    
    if (this.currentAnalysis.strategy) {
      if (this.currentAnalysis.strategy.recommendation === 'impugnar') {
        message += "✅ Impugnar el acto administrativo (recomendado)\n";
        message += "✅ Solicitar un aplazamiento o fraccionamiento\n";
      } else if (this.currentAnalysis.strategy.recommendation === 'pagar') {
        message += "✅ Pago antes del vencimiento\n";
        message += "✅ Solicitar un aplazamiento o fraccionamiento\n";
        message += "✅ Recurso de reposición o reclamación económico-administrativa si existen errores en la liquidación\n";
      } else {
        message += "✅ Consultar con un profesional para este caso específico\n";
      }
    } else {
      message += "✅ Pago antes del vencimiento\n";
      message += "✅ Solicitar un aplazamiento o fraccionamiento\n";
      message += "✅ Recurso de reposición o reclamación económico-administrativa\n";
    }
    
    message += "\n⚠ ¿Qué opción prefieres? Si deseas recurrir, primero revisemos si hay fundamentos legales sólidos. Podemos estudiarlo juntos.";
    
    // Añadir mensaje al chat
    this.addAssistantMessage(message);
  }
  
  // Manejar solicitud de recurso
  async handleRecursoRequest() {
    if (!this.currentCase || !this.currentAnalysis) {
      this.addAssistantMessage("Para ayudarte con un recurso, necesito analizar primero el documento que quieres impugnar. Por favor, sube el documento para que pueda asistirte mejor.");
      return;
    }
    
    // Verificar si hay fundamentos para recurso
    const hasSolidGrounds = this.currentAnalysis.errors && this.currentAnalysis.errors.some(e => e.severity === 'high');
    
    if (hasSolidGrounds) {
      this.addAssistantMessage(
        "Basándome en el análisis del documento, existen fundamentos sólidos para presentar un recurso. " +
        "Puedo generar un recurso de reposición personalizado con los errores detectados. " +
        "¿Deseas que prepare este documento para ti?"
      );
    } else {
      this.addAssistantMessage(
        "He revisado el documento y no he detectado errores graves que proporcionen fundamentos sólidos para un recurso. " +
        "Sin embargo, si consideras que existen motivos adicionales, puedo ayudarte a preparar un recurso. " +
        "¿Deseas continuar con la preparación del recurso?"
      );
    }
  }
  
  // Manejar solicitud de aplazamiento
  async handleAplazamientoRequest() {
    if (!this.currentCase || !this.currentAnalysis) {
      this.addAssistantMessage("Para ayudarte con un aplazamiento, necesito analizar primero el documento correspondiente. Por favor, sube el documento para que pueda asistirte mejor.");
      return;
    }
    
    if (!this.currentCase.data.importe) {
      this.addAssistantMessage("Para solicitar un aplazamiento, necesito conocer el importe de la deuda. ¿Podrías indicarme cuál es el importe que deseas aplazar?");
      return;
    }
    
    this.addAssistantMessage(
      "Puedo ayudarte a preparar una solicitud de aplazamiento para la deuda de " + this.currentCase.data.importe + ". " +
      "Para completar la solicitud, necesitaré algunos datos adicionales:\n\n" +
      "1. ¿Por cuántos meses deseas solicitar el aplazamiento?\n" +
      "2. ¿Prefieres un aplazamiento (pago único al final) o fraccionamiento (pagos mensuales)?\n" +
      "3. ¿Cuál es el motivo de tu solicitud de aplazamiento? (dificultades económicas temporales, etc.)"
    );
  }
  
  // Manejar consulta de plazos
  handlePlazosRequest() {
    if (!this.currentCase || !this.currentAnalysis || !this.currentAnalysis.deadlines) {
      this.addAssistantMessage("Para calcular los plazos aplicables, necesito analizar primero el documento correspondiente. Por favor, sube el documento para que pueda asistirte mejor.");
      return;
    }
    
    // Formatear información de plazos
    let message = "📅 **Plazos aplicables a tu caso:**\n\n";
    
    const deadlineCalculator = new DeadlineCalculator();
    const deadlinesInfo = deadlineCalculator.getDeadlinesInfo(this.currentAnalysis.deadlines);
    
    for (const key in deadlinesInfo) {
      const deadline = deadlinesInfo[key];
      let deadlineLabel = '';
      
      switch(key) {
        case 'voluntaryPayment':
          deadlineLabel = 'Pago en período voluntario';
          break;
        case 'reposicionDeadline':
          deadlineLabel = 'Recurso de reposición';
          break;
        case 'economicAdminDeadline':
          deadlineLabel = 'Reclamación económico-administrativa';
          break;
        case 'responseDeadline':
          deadlineLabel = 'Respuesta al requerimiento';
          break;
        case 'alegacionesDeadline':
          deadlineLabel = 'Presentación de alegaciones';
          break;
        default:
          deadlineLabel = key;
      }
      
      message += `📌 **${deadlineLabel}**: ${deadline.formatted}`;
      
      if (deadline.alert.remainingDays > 0) {
        message += ` (quedan ${deadline.alert.remainingDays} días)`;
      } else if (deadline.alert.remainingDays === 0) {
        message += ` (último día hoy)`;
      } else {
        message += ` (plazo vencido hace ${Math.abs(deadline.alert.remainingDays)} días)`;
      }
      
      if (deadline.alert.severity === 'high' || deadline.alert.severity === 'critical') {
        message += ` ⚠️ ${deadline.alert.message}`;
      }
      
      message += "\n\n";
    }
    
    message += "Estos plazos están calculados según la normativa vigente, considerando días hábiles y festivos nacionales. " +
               "Recuerda que agosto es inhábil para plazos administrativos.";
    
    this.addAssistantMessage(message);
  }
  
  // Manejar consulta de normativa
  handleNormativaRequest(message) {
    if (!this.currentCase || !this.currentAnalysis) {
      // Buscar referencias generales
      const references = this.legalReferenceSystem.findRelevantReferences('general');
      const formattedReferences = this.legalReferenceSystem.formatReferencesForDisplay(references);
      
      this.addAssistantMessage(
        "Aquí tienes algunas referencias normativas generales que podrían ser útiles:\n\n" +
        formattedReferences
      );
      return;
    }
    
    // Buscar referencias específicas para el caso actual
    const references = this.legalReferenceSystem.findRelevantReferences(
      this.currentAnalysis.procedureType,
      this.currentAnalysis.errors ? this.currentAnalysis.errors.map(e => e.id) : []
    );
    
    const formattedReferences = this.legalReferenceSystem.formatReferencesForDisplay(references);
    
    this.addAssistantMessage(
      "Basándome en tu caso, estas son las referencias normativas más relevantes:\n\n" +
      formattedReferences
    );
  }
  
  // Manejar pregunta contextual (con caso activo)
  handleContextualQuestion(message) {
    const messageLower = message.toLowerCase();
    
    // Intentar responder según el contexto del caso
    if (messageLower.includes('error') || messageLower.includes('defecto')) {
      this.explainErrors();
    } else if (messageLower.includes('probabilidad') || messageLower.includes('éxito') || messageLower.includes('posibilidades')) {
      this.explainSuccessProbability();
    } else if (messageLower.includes('documento') || messageLower.includes('generar') || messageLower.includes('crear')) {
      this.explainDocumentOptions();
    } else {
      // Respuesta genérica contextual
      this.addAssistantMessage(
        "Basándome en el documento que has subido, puedo ayudarte con:\n\n" +
        "1. Explicar en detalle los errores detectados\n" +
        "2. Calcular la probabilidad de éxito de un recurso\n" +
        "3. Generar documentos personalizados (recursos, solicitudes de aplazamiento)\n" +
        "4. Consultar normativa y jurisprudencia aplicable\n\n" +
        "¿En cuál de estas opciones estás interesado?"
      );
    }
  }
  
  // Manejar pregunta general (sin caso activo)
  handleGeneralQuestion(message) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('documento') || messageLower.includes('subir') || messageLower.includes('analizar')) {
      this.addAssistantMessage(
        "Para analizar un documento, simplemente súbelo en la zona de carga que aparece a la izquierda. " +
        "Puedo procesar notificaciones, sanciones, requerimientos y otros documentos de la AEAT. " +
        "Una vez subido, extraeré automáticamente la información relevante, detectaré posibles errores " +
        "y te presentaré las opciones disponibles."
      );
    } else if (messageLower.includes('recurso') || messageLower.includes('reclamación')) {
      this.addAssistantMessage(
        "Puedo ayudarte a preparar recursos contra actos administrativos de la AEAT. " +
        "Los tipos de recursos más comunes son:\n\n" +
        "1. **Recurso de reposición**: Se presenta ante el mismo órgano que dictó el acto, en un plazo de 15 días hábiles.\n" +
        "2. **Reclamación económico-administrativa**: Se presenta ante el TEAR o TEAC, en un plazo de 1 mes.\n\n" +
        "Para ayudarte con un recurso específico, necesito analizar el documento que quieres impugnar. " +
        "¿Tienes el documento disponible para subirlo?"
      );
    } else if (messageLower.includes('aplazamiento') || messageLower.includes('fraccionar')) {
      this.addAssistantMessage(
        "Puedo ayudarte a solicitar aplazamientos o fraccionamientos de pago ante la AEAT. " +
        "Para ello necesitarás:\n\n" +
        "1. Justificar dificultades económico-financieras transitorias\n" +
        "2. Proponer un plan de pagos realista\n" +
        "3. En algunos casos, ofrecer garantías (como aval bancario)\n\n" +
        "Para preparar una solicitud personalizada, necesito analizar el documento de la deuda. " +
        "¿Tienes el documento disponible para subirlo?"
      );
    } else {
      this.addAssistantMessage(
        "Soy tu asistente legal especializado en trámites con la AEAT. Puedo ayudarte con:\n\n" +
        "1. Análisis de notificaciones, sanciones y requerimientos\n" +
        "2. Detección de errores formales, procedimentales o de cálculo\n" +
        "3. Cálculo de plazos legales\n" +
        "4. Generación de recursos y solicitudes personalizadas\n" +
        "5. Consulta de normativa y jurisprudencia aplicable\n\n" +
        "Para empezar, puedes subir un documento para que lo analice o hacerme una pregunta específica sobre tu caso."
      );
    }
  }
  
  // Explicar errores detectados
  explainErrors() {
    if (!this.currentAnalysis || !this.currentAnalysis.errors || this.currentAnalysis.errors.length === 0) {
      this.addAssistantMessage("No he detectado errores significativos en el documento analizado. Sin embargo, esto no significa que no existan motivos para impugnarlo basados en tu situación particular.");
      return;
    }
    
    let message = "📋 **Análisis detallado de los errores detectados:**\n\n";
    
    // Agrupar errores por tipo
    const formalErrors = this.currentAnalysis.errors.filter(e => e.type === 'formal');
    const proceduralErrors = this.currentAnalysis.errors.filter(e => e.type === 'procedural');
    const calculationErrors = this.currentAnalysis.errors.filter(e => e.type === 'calculation');
    
    // Explicar errores formales
    if (formalErrors.length > 0) {
      message += "🔹 **Errores formales:**\n";
      formalErrors.forEach((error, index) => {
        message += `${index + 1}. **${error.description}**\n`;
        message += `   Base legal: ${error.legalBasis}\n`;
        message += `   Importancia: ${this.getSeverityText(error.severity)}\n\n`;
      });
    }
    
    // Explicar errores procedimentales
    if (proceduralErrors.length > 0) {
      message += "🔹 **Errores procedimentales:**\n";
      proceduralErrors.forEach((error, index) => {
        message += `${index + 1}. **${error.description}**\n`;
        message += `   Base legal: ${error.legalBasis}\n`;
        message += `   Importancia: ${this.getSeverityText(error.severity)}\n\n`;
      });
    }
    
    // Explicar errores de cálculo
    if (calculationErrors.length > 0) {
      message += "🔹 **Errores de cálculo:**\n";
      calculationErrors.forEach((error, index) => {
        message += `${index + 1}. **${error.description}**\n`;
        message += `   Base legal: ${error.legalBasis}\n`;
        message += `   Importancia: ${this.getSeverityText(error.severity)}\n\n`;
      });
    }
    
    message += "Estos errores pueden ser utilizados como fundamento para impugnar el acto administrativo. " +
               "¿Deseas que prepare un recurso basado en estos errores?";
    
    this.addAssistantMessage(message);
  }
  
  // Obtener texto de severidad
  getSeverityText(severity) {
    switch(severity) {
      case 'high':
        return 'Alta - Error grave que puede invalidar el acto';
      case 'medium':
        return 'Media - Error significativo que puede ser impugnable';
      case 'low':
        return 'Baja - Error menor que podría no ser suficiente por sí solo';
      default:
        return severity;
    }
  }
  
  // Explicar probabilidad de éxito
  explainSuccessProbability() {
    if (!this.currentAnalysis || !this.currentAnalysis.successProbability) {
      this.addAssistantMessage("No puedo calcular la probabilidad de éxito sin analizar primero un documento. Por favor, sube el documento para que pueda realizar un análisis completo.");
      return;
    }
    
    let message = "⚖️ **Análisis de probabilidad de éxito:**\n\n";
    
    switch(this.currentAnalysis.successProbability) {
      case 'alta':
        message += "Basándome en los errores detectados, la probabilidad de éxito es **ALTA**.\n\n" +
                   "He identificado errores graves que podrían invalidar el acto administrativo. " +
                   "La jurisprudencia y doctrina administrativa suelen ser favorables en casos similares. " +
                   "Recomendaría presentar un recurso fundamentado en estos errores.";
        break;
      
      case 'media':
        message += "Basándome en los errores detectados, la probabilidad de éxito es **MEDIA**.\n\n" +
                   "He identificado algunos errores que podrían ser impugnables, aunque no son de máxima gravedad. " +
                   "El resultado dependerá de cómo se argumenten estos errores y de las circunstancias específicas del caso. " +
                   "Podrías considerar presentar un recurso, pero ten en cuenta que el resultado es incierto.";
        break;
      
      case 'baja':
        message += "Basándome en el análisis realizado, la probabilidad de éxito es **BAJA**.\n\n" +
                   "No he detectado errores significativos que puedan fundamentar sólidamente un recurso. " +
                   "Sin embargo, podrías considerar otras opciones como solicitar un aplazamiento o fraccionamiento " +
                   "si tienes dificultades para realizar el pago.";
        break;
      
      default:
        message += "No he podido determinar con precisión la probabilidad de éxito basándome únicamente en el documento analizado. " +
                   "Para una evaluación más precisa, sería recomendable consultar con un profesional que pueda analizar todos los detalles de tu caso.";
    }
    
    this.addAssistantMessage(message);
  }
  
  // Explicar opciones de documentos
  explainDocumentOptions() {
    if (!this.currentCase || !this.currentAnalysis) {
      this.addAssistantMessage("Para generar documentos personalizados, necesito analizar primero el documento correspondiente. Por favor, sube el documento para que pueda asistirte mejor.");
      return;
    }
    
    let message = "📄 **Documentos que puedo generar para tu caso:**\n\n";
    
    // Opciones según tipo de procedimiento
    if (this.currentAnalysis.procedureType.includes('sancion') || this.currentAnalysis.procedureType.includes('liquidacion')) {
      message += "1. **Recurso de reposición**: Documento para impugnar el acto administrativo ante el mismo órgano que lo dictó.\n\n";
      message += "2. **Reclamación económico-administrativa**: Documento para impugnar el acto ante el Tribunal Económico-Administrativo.\n\n";
      message += "3. **Solicitud de aplazamiento/fraccionamiento**: Documento para solicitar el pago a plazos de la deuda.\n\n";
    } else if (this.currentAnalysis.procedureType.includes('requerimiento')) {
      message += "1. **Escrito de respuesta al requerimiento**: Documento para responder formalmente al requerimiento de información.\n\n";
      message += "2. **Solicitud de ampliación de plazo**: Documento para solicitar más tiempo para responder al requerimiento.\n\n";
    } else if (this.currentAnalysis.procedureType.includes('acta')) {
      message += "1. **Escrito de alegaciones**: Documento para presentar alegaciones contra el acta de inspección.\n\n";
    }
    
    message += "Todos los documentos se generarán personalizados con los datos extraídos del documento analizado y los errores detectados. " +
               "¿Qué documento te gustaría generar?";
    
    this.addAssistantMessage(message);
  }
  
  // Añadir mensaje del asistente al chat
  addAssistantMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message assistant-message';
    messageElement.innerHTML = this.formatMessage(text);
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Añadir mensaje del usuario al chat
  addUserMessage(text) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = text;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Formatear mensaje con Markdown simple
  formatMessage(text) {
    // Convertir saltos de línea
    let formatted = text.replace(/\n/g, '<br>');
    
    // Formatear negritas
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Formatear cursivas
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Formatear enlaces
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 underline">$1</a>');
    
    return formatted;
  }
}

// Inicializar asistente cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  window.legalAssistant = new LegalAssistant();
});
