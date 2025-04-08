class LegalAssistant {
  constructor() {
    // Inicializar componentes
    this.documentProcessor = new DocumentProcessor();
    this.legalAnalyzer = new LegalAnalyzer();
    this.documentGenerator = new DocumentGenerator();
    
    // Inicializar UI
    this.initUI();
    
    // Estado de la conversación
    this.conversationState = {
      currentStep: 'initial',
      documentData: null,
      legalAnalysis: null,
      userInputs: {}
    };
  }
  
  // Inicializar interfaz de usuario
  initUI() {
    // Configurar zona de carga de documentos
    this.setupDropzone();
    
    // Configurar chat
    this.setupChat();
    
    // Iniciar conversación
    this.displayWelcomeMessage();
  }
  
  // Configurar zona de carga de documentos
  setupDropzone() {
    const dropzone = document.getElementById('document-dropzone');
    const fileInput = document.getElementById('file-input');
    
    // Evento de clic en la zona
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });
    
    // Evento de cambio en el input de archivo
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
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
  }
  
  // Configurar chat
  setupChat() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // Evento de envío de mensaje
    sendButton.addEventListener('click', () => {
      const message = chatInput.value.trim();
      if (message) {
        this.handleUserMessage(message);
        chatInput.value = '';
      }
    });
    
    // Enviar con Enter
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendButton.click();
      }
    });
  }
  
  // Mostrar mensaje de bienvenida
  displayWelcomeMessage() {
    this.addAssistantMessage(
      "Hola, soy tu asistente legal especializado en trámites con la AEAT y tribunales administrativos. " +
      "Puedo analizar documentos, calcular plazos, verificar errores y generar documentos personalizados " +
      "para responder a requerimientos, sanciones o reclamaciones. ¿Cómo puedo ayudarte hoy?"
    );
  }
  
  // Manejar carga de archivo
  async handleFileUpload(file) {
    try {
      // Mostrar mensaje de procesamiento
      this.addAssistantMessage("Estoy analizando el documento que has subido. Dame unos segundos para procesar la información...");
      
      // Procesar documento
      this.conversationState.currentStep = 'processing_document';
      const processedData = await this.documentProcessor.processDocument(file);
      this.conversationState.documentData = processedData;
      
      // Mostrar datos extraídos
      this.displayExtractedData(processedData);
      
      // Solicitar fecha de notificación
      this.askNotificationDate();
      
    } catch (error) {
      console.error('Error procesando documento:', error);
      this.addAssistantMessage("Lo siento, ha ocurrido un error al procesar el documento. Por favor, inténtalo de nuevo con otro archivo.");
    }
  }
  
  // Mostrar datos extraídos
  displayExtractedData(processedData) {
    const { documentType, data } = processedData;
    
    let typeText = 'documento';
    switch(documentType) {
      case 'sancion': typeText = 'sanción tributaria'; break;
      case 'liquidacion': typeText = 'liquidación'; break;
      case 'requerimiento': typeText = 'requerimiento'; break;
      case 'acta': typeText = 'acta de inspección'; break;
    }
    
    let message = `He analizado el documento. Se trata de una ${typeText}`;
    
    if (data.organoEmisor) {
      message += ` emitida por ${data.organoEmisor}`;
    }
    
    message += ".\n\n**Datos clave identificados:**\n";
    
    if (data.contribuyente) message += `- Contribuyente: ${data.contribuyente}`;
    if (data.nif) message += ` (NIF: ${data.nif})`;
    message += "\n";
    
    if (data.importe) message += `- Importe: ${data.importe}\n`;
    if (data.expediente) message += `- Referencia: ${data.expediente}\n`;
    
    this.addAssistantMessage(message);
  }
  
  // Solicitar fecha de notificación
  askNotificationDate() {
    this.conversationState.currentStep = 'asking_notification_date';
    this.addAssistantMessage("Para poder calcular los plazos exactos, necesito saber: **¿Qué día recibiste esta notificación?**");
  }
  
  // Manejar mensaje del usuario
  async handleUserMessage(message) {
    // Añadir mensaje a la conversación
    this.addUserMessage(message);
    
    // Procesar según el estado actual
    switch(this.conversationState.currentStep) {
      case 'asking_notification_date':
        await this.processNotificationDate(message);
        break;
      
      case 'asking_option_selection':
        await this.processOptionSelection(message);
        break;
      
      case 'asking_additional_info':
        await this.processAdditionalInfo(message);
        break;
      
      default:
        // Si no hay un documento cargado, preguntar por el caso
        if (!this.conversationState.documentData) {
          this.handleGeneralQuery(message);
        } else {
          this.addAssistantMessage("No estoy seguro de cómo procesar esa información en este momento. ¿Puedes aclarar tu consulta?");
        }
    }
  }
  
  // Procesar fecha de notificación
  async processNotificationDate(dateText) {
    try {
      // Intentar parsear la fecha
      const notificationDate = this.parseDate(dateText);
      
      if (!notificationDate) {
        this.addAssistantMessage("No he podido reconocer la fecha. Por favor, indícala en formato DD/MM/AAAA (por ejemplo, 15/08/2024).");
        return;
      }
      
      // Guardar fecha
      this.conversationState.userInputs.notificationDate = notificationDate;
      
      // Mostrar mensaje de análisis
      this.addAssistantMessage("Gracias por la información. Estoy analizando el documento y calculando los plazos aplicables...");
      
      // Actualizar datos del documento
      this.conversationState.documentData.data.fechaNotificacion = notificationDate;
      
      // Realizar análisis legal
      const legalAnalysis = await this.legalAnalyzer.analyzeDocument(this.conversationState.documentData);
      this.conversationState.legalAnalysis = legalAnalysis;
      
      // Mostrar resultados del análisis
      this.displayLegalAnalysis(legalAnalysis);
      
    } catch (error) {
      console.error('Error procesando fecha:', error);
      this.addAssistantMessage("Ha ocurrido un error al procesar la fecha. Por favor, inténtalo de nuevo.");
    }
  }
  
  // Parsear fecha de texto
  parseDate(dateText) {
    // Intentar varios formatos comunes
    const formats = [
      // DD/MM/YYYY
      {
        regex: /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/,
        process: (match) => new Date(match[3], match[2] - 1, match[1])
      },
      // Texto en español (15 de agosto de 2024)
      {
        regex: /(\d{1,2}) de ([a-zñ]+) de (\d{4})/i,
        process: (match) => {
          const months = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
          };
          return new Date(match[3], months[match[2].toLowerCase()], match[1]);
        }
      }
    ];
    
    // Probar cada formato
    for (const format of formats) {
      const match = dateText.match(format.regex);
      if (match) {
        const date = format.process(match);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    return null;
  }
  
  // Mostrar resultados del análisis legal
  displayLegalAnalysis(legalAnalysis) {
    const { deadlines, errors, strategy } = legalAnalysis;
    
    // Mostrar plazos
    let message = "Gracias por la información. ";
    
    if (deadlines) {
      message += "Estos son los plazos aplicables:\n\n";
      
      if (deadlines.voluntaryPayment) {
        message += `- **Pago en período voluntario**: hasta el ${this.formatDate(deadlines.voluntaryPayment)}\n`;
      }
      
      if (deadlines.reposicionDeadline) {
        message += `- **Recurso de reposición**: hasta el ${this.formatDate(deadlines.reposicionDeadline)}\n`;
      }
      
      if (deadlines.economicAdminDeadline) {
        message += `- **Reclamación económico-administrativa**: hasta el ${this.formatDate(deadlines.economicAdminDeadline)}\n`;
      }
      
      if (deadlines.responseDeadline) {
        message += `- **Plazo de respuesta**: hasta el ${this.formatDate(deadlines.responseDeadline)}\n`;
      }
      
      message += "\n";
    }
    
    // Mostrar errores detectados
    if (errors && errors.length > 0) {
      message += "He detectado los siguientes posibles errores o deficiencias:\n\n";
      
      errors.forEach((error, index) => {
        message += `${index + 1}. **${error.description}**`;
        if (error.legalBasis) {
          message += ` (${error.legalBasis})`;
        }
        message += "\n";
      });
      
      message += "\n";
    } else {
      message += "No he detectado errores formales o procedimentales significativos en el documento.\n\n";
    }
    
    // Mostrar estrategia recomendada
    if (strategy) {
      message += "**Estas son tus opciones:**\n\n";
      
      if (strategy.options && strategy.options.length > 0) {
        strategy.options.forEach((option, index) => {
          message += `${index + 1}. **${option.description}**: ${option.advantages}`;
          if (option.disadvantages) {
            message += `. Sin embargo, ${option.disadvantages.toLowerCase()}`;
          }
          message += "\n";
        });
      }
      
      if (strategy.recommendation) {
        message += `\nBasado en el análisis, la opción más recomendable sería **${strategy.recommendation}**`;
        
        if (strategy.primaryArguments && strategy.primaryArguments.length > 0) {
          message += `, utilizando como argumentos principales: ${strategy.primaryArguments.join(", ")}`;
        }
        
        message += ".\n";
      }
    }
    
    // Preguntar por la opción elegida
    message += "\n¿Qué opción te gustaría explorar? Puedo generar el documento correspondiente.";
    
    this.addAssistantMessage(message);
    this.conversationState.currentStep = 'asking_option_selection';
  }
  
  // Procesar selección de opción
  async processOptionSelection(message) {
    const lowerMessage = message.toLowerCase();
    
    // Determinar tipo de documento a generar
    let documentType = null;
    
    if (lowerMessage.includes('recurso') || lowerMessage.includes('impugnar') || lowerMessage.includes('opción 1')) {
      documentType = 'recurso_reposicion';
    } else if (lowerMessage.includes('aplazamiento') || lowerMessage.includes('fraccionar') || lowerMessage.includes('opción 2')) {
      documentType = 'aplazamiento';
    } else {
      // No se reconoce la opción
      this.addAssistantMessage("No he podido identificar claramente qué opción prefieres. ¿Podrías indicar si quieres presentar un recurso de reposición o solicitar un aplazamiento?");
      return;
    }
    
    // Solicitar información adicional
    this.conversationState.userInputs.selectedOption = documentType;
    this.askAdditionalInfo(documentType);
  }
  
  // Solicitar información adicional
  askAdditionalInfo(documentType) {
    this.conversationState.currentStep = 'asking_additional_info';
    
    if (documentType === 'recurso_reposicion') {
      this.addAssistantMessage("Para generar el recurso de reposición, necesito algunos datos adicionales:\n\n1. ¿Cuál es tu domicilio a efectos de notificaciones?\n2. ¿En qué localidad vas a presentar el recurso?");
    } else if (documentType === 'aplazamiento') {
      this.addAssistantMessage("Para generar la solicitud de aplazamiento, necesito algunos datos adicionales:\n\n1. ¿Cuál es tu domicilio a efectos de notificaciones?\n2. ¿Por cuántos meses deseas solicitar el aplazamiento?\n3. ¿Puedes explicar brevemente tu situación económica actual?");
    }
  }
  
  // Procesar información adicional
  async processAdditionalInfo(message) {
    // Guardar información adicional
    this.conversationState.userInputs.additionalInfo = message;
    
    // Generar documento
    this.addAssistantMessage("Gracias por la información. Estoy generando el documento personalizado...");
    
    try {
      const documentType = this.conversationState.userInputs.selectedOption;
      const document = await this.documentGenerator.generateDocument(
        documentType,
        this.conversationState.documentData,
        this.conversationState.legalAnalysis
      );
      
      // Mostrar documento generado
      this.displayGeneratedDocument(document);
      
      // Reiniciar estado para nueva consulta
      this.conversationState.currentStep = 'document_generated';
      
    } catch (error) {
      console.error('Error generando documento:', error);
      this.addAssistantMessage("Lo siento, ha ocurrido un error al generar el documento. Por favor, inténtalo de nuevo.");
    }
  }
  
  // Mostrar documento generado
  displayGeneratedDocument(document) {
    // Crear enlace de descarga
    const url = URL.createObjectURL(document.blob);
    
    let message = `He generado tu ${document.fileName.replace('.docx', '')}. Puedes descargarlo y presentarlo siguiendo estas instrucciones:\n\n`;
    
    // Añadir instrucciones según tipo de documento
    if (document.fileName.includes('Recurso')) {
      message += "1. Descarga el documento y revisa que todos los datos sean correctos\n";
      message += "2. Fírmalo (manual o digitalmente)\n";
      message += "3. Preséntalo antes de la fecha límite a través de:\n";
      message += "   - Sede electrónica de la AEAT\n";
      message += "   - Registro público presencial\n";
      message += "   - Correo administrativo\n\n";
      message += "4. Guarda copia y justificante de presentación\n\n";
    } else {
      message += "1. Descarga el documento y revisa que todos los datos sean correctos\n";
      message += "2. Fírmalo (manual o digitalmente)\n";
      message += "3. Preséntalo junto con la documentación que acredite tu situación económica\n";
      message += "4. Guarda copia y justificante de presentación\n\n";
    }
    
    message += `[Descargar documento](${url})`;
    
    this.addAssistantMessage(message);
    
    // Mensaje final
    setTimeout(() => {
      this.addAssistantMessage("¿Hay algo más en lo que pueda ayudarte?");
    }, 2000);
  }
  
  // Manejar consulta general
  handleGeneralQuery(message) {
    // Implementar lógica para consultas sin documento
    this.addAssistantMessage("Para ayudarte mejor, necesitaría analizar el documento específico de la AEAT. ¿Podrías subirlo utilizando la zona de carga de documentos?");
  }
  
  // Añadir mensaje del asistente
  addAssistantMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message assistant-message';
    messageElement.innerHTML = this.formatMessage(message);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Añadir mensaje del usuario
  addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Formatear mensaje (convertir markdown básico a HTML)
  formatMessage(message) {
    // Convertir saltos de línea
    let formatted = message.replace(/\n/g, '<br>');
    
    // Convertir negrita
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convertir enlaces
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-500 underline">$1</a>');
    
    return formatted;
  }
  
  // Formatear fecha
  formatDate(date) {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}

// Inicializar asistente cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
  window.legalAssistant = new LegalAssistant();
});
