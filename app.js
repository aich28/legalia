/**
 * LegalDefense AI - Asistente Legal Inteligente
 * Módulo principal de la aplicación
 */

// Inicialización del asistente cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const assistantButton = document.getElementById('assistant-button');
    const assistantChat = document.getElementById('assistant-chat');
    const closeAssistant = document.getElementById('close-assistant');
    const assistantBody = document.getElementById('assistant-body');
    const assistantInput = document.getElementById('assistant-input');
    const assistantSend = document.getElementById('assistant-send');
    const startAssistantBtn = document.getElementById('start-assistant-btn');
    const startAssistantBtn2 = document.getElementById('start-assistant-btn-2');
    
    // Estado del asistente
    const assistantState = {
        isOpen: false,
        currentStep: 'greeting',
        documentUploaded: false,
        documentData: null,
        documentType: null,
        documentErrors: null,
        legalFramework: null,
        strategy: null,
        legalOptions: null,
        userResponses: {},
        selectedOption: null
    };
    
    // Inicializar eventos
    initEvents();
    
    // Función para inicializar todos los eventos
    function initEvents() {
        // Evento para abrir/cerrar el asistente
        assistantButton.addEventListener('click', toggleAssistant);
        closeAssistant.addEventListener('click', toggleAssistant);
        
        // Eventos para los botones de inicio
        if (startAssistantBtn) {
            startAssistantBtn.addEventListener('click', openAssistant);
        }
        
        if (startAssistantBtn2) {
            startAssistantBtn2.addEventListener('click', openAssistant);
        }
        
        // Evento para enviar mensaje
        assistantSend.addEventListener('click', sendMessage);
        assistantInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Función para alternar la visibilidad del asistente
    function toggleAssistant() {
        assistantState.isOpen = !assistantState.isOpen;
        
        if (assistantState.isOpen) {
            assistantChat.style.display = 'flex';
            
            // Si es la primera vez que se abre, mostrar mensaje de bienvenida
            if (assistantBody.children.length === 0) {
                showWelcomeMessage();
            }
        } else {
            assistantChat.style.display = 'none';
        }
    }
    
    // Función para abrir el asistente
    function openAssistant() {
        if (!assistantState.isOpen) {
            assistantState.isOpen = true;
            assistantChat.style.display = 'flex';
            
            // Si es la primera vez que se abre, mostrar mensaje de bienvenida
            if (assistantBody.children.length === 0) {
                showWelcomeMessage();
            }
        }
    }
    
    // Función para mostrar mensaje de bienvenida
    function showWelcomeMessage() {
        addAssistantMessage('👋 ¡Hola! Soy tu Asistente Legal Inteligente. Estoy aquí para ayudarte con tus trámites ante la AEAT y otros órganos administrativos.');
        
        setTimeout(() => {
            addAssistantMessage('Puedo analizar documentos como requerimientos, sanciones o notificaciones, detectar errores y ayudarte a preparar la mejor respuesta posible.');
            
            setTimeout(() => {
                addAssistantMessage('¿Tienes algún documento que quieras analizar o prefieres contarme tu caso para que te oriente?');
                
                // Añadir opciones de respuesta rápida
                addQuickReplyOptions([
                    { text: 'Analizar un documento', action: 'upload_document' },
                    { text: 'Consultar sin documento', action: 'no_document' },
                    { text: '¿Cómo funciona?', action: 'how_it_works' }
                ]);
            }, 800);
        }, 800);
    }
    
    // Función para añadir mensaje del asistente
    function addAssistantMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        messageDiv.textContent = text;
        assistantBody.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Función para añadir mensaje del usuario
    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = text;
        assistantBody.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // Función para añadir indicador de escritura
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        typingDiv.id = 'typing-indicator';
        assistantBody.appendChild(typingDiv);
        scrollToBottom();
    }
    
    // Función para eliminar indicador de escritura
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Función para añadir opciones de respuesta rápida
    function addQuickReplyOptions(options) {
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                handleQuickReply(option.text, option.action);
            });
            optionsContainer.appendChild(button);
        });
        
        assistantBody.appendChild(optionsContainer);
        scrollToBottom();
    }
    
    // Función para manejar respuestas rápidas
    function handleQuickReply(text, action) {
        // Eliminar las opciones de respuesta rápida
        const optionsContainer = document.querySelector('.options-container');
        if (optionsContainer) {
            optionsContainer.remove();
        }
        
        // Añadir el mensaje del usuario
        addUserMessage(text);
        
        // Procesar la acción
        switch (action) {
            case 'upload_document':
                promptDocumentUpload();
                break;
            case 'no_document':
                startConversationWithoutDocument();
                break;
            case 'how_it_works':
                explainHowItWorks();
                break;
            case 'yes':
                handleYesResponse();
                break;
            case 'no':
                handleNoResponse();
                break;
            default:
                // Para otras acciones específicas
                processCustomAction(action);
                break;
        }
    }
    
    // Función para solicitar la carga de un documento
    function promptDocumentUpload() {
        addTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            addAssistantMessage('Para analizar tu documento, necesito que lo subas. Puedes arrastrar y soltar el archivo aquí:');
            
            // Crear área de carga de archivos
            const uploadArea = document.createElement('div');
            uploadArea.className = 'file-upload-area';
            uploadArea.innerHTML = `
                <i class="fas fa-cloud-upload-alt text-blue-500 text-2xl mb-2"></i>
                <p>Arrastra y suelta tu documento aquí o haz clic para seleccionarlo</p>
                <p class="text-xs text-gray-500 mt-2">Formatos aceptados: PDF, DOCX, JPG, PNG (Máx. 20MB)</p>
                <input type="file" class="file-upload-input" accept=".pdf,.docx,.jpg,.jpeg,.png">
            `;
            
            // Añadir eventos para la carga de archivos
            uploadArea.addEventListener('click', () => {
                const fileInput = uploadArea.querySelector('.file-upload-input');
                fileInput.click();
            });
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-blue-500');
                uploadArea.classList.add('bg-blue-50');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-blue-500');
                uploadArea.classList.remove('bg-blue-50');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-blue-500');
                uploadArea.classList.remove('bg-blue-50');
                
                if (e.dataTransfer.files.length > 0) {
                    handleFileUpload(e.dataTransfer.files[0]);
                }
            });
            
            const fileInput = uploadArea.querySelector('.file-upload-input');
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                }
            });
            
            assistantBody.appendChild(uploadArea);
            scrollToBottom();
        }, 1000);
    }
    
    // Función para manejar la carga de archivos
    function handleFileUpload(file) {
        // Eliminar el área de carga
        const uploadArea = document.querySelector('.file-upload-area');
        if (uploadArea) {
            uploadArea.remove();
        }
        
        // Validar el archivo
        DocumentProcessor.validateDocument(file).then(validation => {
            if (validation.isValid) {
                // Mostrar vista previa del documento
                showDocumentPreview(file);
                
                // Informar al usuario
                addAssistantMessage('He detectado que has subido un documento. Estoy procesándolo y extrayendo los datos clave...');
                addTypingIndicator();
                
                // Simular procesamiento del documento
                setTimeout(() => {
                    // Extraer texto del documento
                    DocumentProcessor.extractText(file).then(text => {
                        // Detectar tipo de documento
                        DocumentProcessor.detectDocumentType(text).then(documentType => {
                            assistantState.documentType = documentType;
                            
                            // Extraer datos clave
                            DocumentProcessor.extractKeyData(text).then(data => {
                                removeTypingIndicator();
                                assistantState.documentData = data;
                                assistantState.documentUploaded = true;
                                
                                // Mostrar resultados del análisis
                                showDocumentAnalysisResults(data, documentType);
                                
                                // Continuar con el análisis legal
                                performLegalAnalysis(data, documentType);
                            });
                        });
                    });
                }, 2000);
            } else {
                // Mostrar error
                addAssistantMessage(`No puedo procesar este archivo: ${validation.errors.join(', ')}. Por favor, intenta con otro documento.`);
                promptDocumentUpload();
            }
        });
    }
    
    // Función para mostrar vista previa del documento
    function showDocumentPreview(file) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'document-preview';
        
        // Determinar el icono según el tipo de archivo
        let icon = 'fa-file';
        if (file.type.includes('pdf')) {
            icon = 'fa-file-pdf';
        } else if (file.type.includes('word')) {
            icon = 'fa-file-word';
        } else if (file.type.includes('image')) {
            icon = 'fa-file-image';
        }
        
        // Formatear tamaño del archivo
        const fileSize = formatFileSize(file.size);
        
        previewDiv.innerHTML = `
            <i class="fas ${icon} text-blue-500"></i>
            <div class="document-preview-info">
                <div class="document-preview-name">${file.name}</div>
                <div class="document-preview-size">${fileSize}</div>
            </div>
            <div class="document-preview-remove">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // Añadir evento para eliminar el documento
        const removeButton = previewDiv.querySelector('.document-preview-remove');
        removeButton.addEventListener('click', () => {
            previewDiv.remove();
            assistantState.documentUploaded = false;
            assistantState.documentData = null;
            promptDocumentUpload();
        });
        
        assistantBody.appendChild(previewDiv);
        scrollToBottom();
    }
    
    // Función para formatear el tamaño del archivo
    function formatFileSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1048576) {
            return (bytes / 1024).toFixed(1) + ' KB';
        } else {
            return (bytes / 1048576).toFixed(1) + ' MB';
        }
    }
    
    // Función para mostrar resultados del análisis del documento
    function showDocumentAnalysisResults(data, documentType) {
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'analysis-result';
        
        resultsDiv.innerHTML = `
            <h4>Análisis del documento</h4>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Tipo:</div>
                <div class="analysis-result-value">${documentType}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Contribuyente:</div>
                <div class="analysis-result-value">${data.nombre}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">NIF/CIF:</div>
                <div class="analysis-result-value">${data.nif}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Expediente:</div>
                <div class="analysis-result-value">${data.expediente}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Fecha notificación:</div>
                <div class="analysis-result-value">${data.fechaNotificacion}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Órgano emisor:</div>
                <div class="analysis-result-value">${data.organoEmisor}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Importe:</div>
                <div class="analysis-result-value">${data.importe}</div>
            </div>
            <div class="analysis-result-item">
                <div class="analysis-result-label">Plazo respuesta:</div>
                <div class="analysis-result-value text-red-600 font-medium">Vence: ${data.plazos.recurso}</div>
            </div>
        `;
        
        assistantBody.appendChild(resultsDiv);
        scrollToBottom();
        
        // Calcular días restantes
        const remainingDays = DeadlineCalculator.calculateRemainingDays(data.plazos.recurso);
        
        // Informar al usuario sobre el plazo
        if (remainingDays > 0) {
            addAssistantMessage(`Tienes ${remainingDays} días para responder a esta notificación. Voy a analizar si contiene errores o deficiencias que puedan ser impugnados.`);
        } else {
            addAssistantMessage('El plazo para responder a esta notificación ha vencido. Sin embargo, analizaré si existen opciones legales disponibles en tu caso.');
        }
    }
    
    // Función para realizar análisis legal
    function performLegalAnalysis(documentData, documentType) {
        addTypingIndicator();
        
        // Detectar errores en el documento
        LegalAnalyzer.detectErrors(documentData, documentType).then(errors => {
            assistantState.documentErrors = errors;
            
            // Consultar marco legal aplicable
            LegalAnalyzer.consultLegalFramework(documentType, errors).then(legalFramework => {
                assistantState.legalFramework = legalFramework;
                
                // Evaluar estrategia legal
                LegalAnalyzer.evaluateStrategy(documentData, errors, legalFramework).then(strategy => {
                    assistantState.strategy = strategy;
                    
                    // Generar opciones legales
                    LegalAnalyzer.generateLegalOptions(documentData, errors, strategy).then(options => {
                        removeTypingIndicator();
                        assistantState.legalOptions = options;
                        
                        // Mostrar errores detectados
                        showDetectedErrors(errors);
                        
                        // Mostrar estrategia recomendada
                        showRecommendedStrategy(strategy, legalFramework);
                        
                        // Mostrar opciones legales
                        showLegalOptions(options);
                    });
                });
            });
        });
    }
    
    // Función para mostrar errores detectados
    function showDetectedErrors(errors) {
        if (errors.length === 0) {
            addAssistantMessage('No he detectado errores o deficiencias significativas en el documento. Sin embargo, podemos analizar otras opciones legales disponibles.');
            return;
        }
        
        addAssistantMessage(`He detectado ${errors.length} posibles errores o deficiencias en el documento:`);
        
        const errorsDiv = document.createElement('div');
        errorsDiv.className = 'analysis-result';
        
        let errorsHtml = '<h4>Deficiencias detectadas</h4>';
        
        errors.forEach(error => {
            let severityClass = '';
            let icon = '';
            
            switch (error.severity) {
                case 'alto':
                    severityClass = 'error-item';
                    icon = 'fa-times-circle text-red-500';
                    break;
                case 'medio':
                    severityClass = 'warning-item';
                    icon = 'fa-exclamation-circle text-orange-500';
                    break;
                default:
                    severityClass = 'success-item';
                    icon = 'fa-info-circle text-blue-500';
            }
            
            errorsHtml += `
                <div class="${severityClass}">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="ml-3">
                            <h5 class="text-sm font-medium">${getErrorTypeText(error.type)}</h5>
                            <p class="text-sm mt-1">${error.description}</p>
                            <p class="text-xs mt-1">Referencia legal: ${error.legalReference}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        errorsDiv.innerHTML = errorsHtml;
        assistantBody.appendChild(errorsDiv);
        scrollToBottom();
    }
    
    // Función para obtener texto descriptivo del tipo de error
    function getErrorTypeText(errorType) {
        switch (errorType) {
            case 'procedimental':
                return 'Error procedimental';
            case 'cálculo':
                return 'Error de cálculo';
            case 'formal':
                return 'Deficiencia formal';
            default:
                return 'Error';
        }
    }
    
    // Función para mostrar estrategia recomendada
    function showRecommendedStrategy(strategy, legalFramework) {
        addAssistantMessage('Basándome en el análisis, he elaborado la siguiente estrategia legal:');
        
        const strategyDiv = document.createElement('div');
        strategyDiv.className = 'analysis-result';
        
        let strategyHtml = '<h4>Estrategia recomendada</h4>';
        
        // Argumento principal
        strategyHtml += `
            <div class="success-item">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <i class="fas fa-check-circle text-green-500"></i>
                    </div>
                    <div class="ml-3">
                        <h5 class="text-sm font-medium">Argumento principal</h5>
                        <p class="text-sm mt-1">${strategy.mainArgument.description}</p>
                        <p class="text-xs mt-1">Base legal: ${strategy.mainArgument.legalBasis}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Argumentos secundarios
        strategy.secondaryArguments.forEach(arg => {
            strategyHtml += `
                <div class="warning-item">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-gavel text-blue-500"></i>
                        </div>
                        <div class="ml-3">
                            <h5 class="text-sm font-medium">Argumento secundario</h5>
                            <p class="text-sm mt-1">${arg.description}</p>
                            <p class="text-xs mt-1">Base legal: ${arg.legalBasis}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Jurisprudencia aplicable
        if (strategy.supportingJurisprudence && strategy.supportingJurisprudence.length > 0) {
            strategyHtml += `
                <div class="success-item">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-balance-scale text-purple-500"></i>
                        </div>
                        <div class="ml-3">
                            <h5 class="text-sm font-medium">Jurisprudencia aplicable</h5>
                            <p class="text-sm mt-1">${strategy.supportingJurisprudence.join(', ')}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Probabilidad de éxito
        strategyHtml += `
            <div class="mt-4">
                <h5 class="text-sm font-medium mb-2">Probabilidad de éxito estimada:</h5>
                <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div class="bg-green-600 h-2.5 rounded-full" style="width: ${strategy.successProbability}%"></div>
                    </div>
                    <span class="ml-3 text-sm font-medium">${strategy.successProbability}%</span>
                </div>
            </div>
        `;
        
        strategyDiv.innerHTML = strategyHtml;
        assistantBody.appendChild(strategyDiv);
        scrollToBottom();
    }
    
    // Función para mostrar opciones legales
    function showLegalOptions(options) {
        addAssistantMessage('Estas son las opciones legales disponibles en tu caso:');
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'analysis-result';
        
        let optionsHtml = '<h4>Opciones disponibles</h4>';
        
        options.forEach((option, index) => {
            const letterIndex = String.fromCharCode(65 + index); // A, B, C, ...
            const bgClass = option.recommended ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
            
            optionsHtml += `
                <div class="bg-white rounded-lg p-4 border border-gray-200 mb-3">
                    <div class="flex items-start">
                        <div class="${bgClass} rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">${letterIndex}</div>
                        <div>
                            <h5 class="font-bold text-gray-800">${option.name}</h5>
                            ${option.deadline ? `<div class="flex items-center text-sm text-red-600 mt-1 mb-2">
                                <i class="fas fa-clock mr-1"></i> Plazo: vence el ${option.deadline}
                            </div>` : ''}
                            ${option.amount ? `<div class="flex items-center text-sm text-gray-600 mt-1 mb-2">
                                <i class="fas fa-euro-sign mr-1"></i> Importe: ${option.amount}
                            </div>` : ''}
                            <p class="text-gray-700 text-sm mb-2">${option.description}</p>
                            ${option.consequences && option.consequences.length > 0 ? `
                                <div class="mt-3 flex flex-wrap gap-2">
                                    <span class="text-xs text-gray-500">Consecuencias:</span>
                                    ${option.consequences.map(c => {
                                        let colorClass = 'bg-gray-100 text-gray-800';
                                        let icon = 'fa-info-circle';
                                        
                                        if (c.type === 'positive') {
                                            colorClass = 'bg-green-100 text-green-800';
                                            icon = 'fa-plus-circle';
                                        } else if (c.type === 'negative') {
                                            colorClass = 'bg-red-100 text-red-800';
                                            icon = 'fa-minus-circle';
                                        }
                                        
                                        return `<span class="text-xs ${colorClass} px-2 py-1 rounded"><i class="fas ${icon} mr-1"></i> ${c.description}</span>`;
                                    }).join('')}
                                </div>
                            ` : ''}
                            <div class="mt-3">
                                <button class="option-select-button text-sm px-3 py-1 rounded ${option.recommended ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}" data-option-id="${option.id}">
                                    ${option.recommended ? 'Opción recomendada' : 'Seleccionar esta opción'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        optionsDiv.innerHTML = optionsHtml;
        assistantBody.appendChild(optionsDiv);
        
        // Añadir eventos a los botones de selección
        const selectButtons = optionsDiv.querySelectorAll('.option-select-button');
        selectButtons.forEach(button => {
            button.addEventListener('click', () => {
                const optionId = button.getAttribute('data-option-id');
                selectLegalOption(optionId, options);
            });
        });
        
        scrollToBottom();
        
        // Preguntar al usuario si desea continuar con la opción recomendada
        const recommendedOption = options.find(opt => opt.recommended);
        if (recommendedOption) {
            addAssistantMessage(`Te recomiendo la opción "${recommendedOption.name}". ¿Quieres que prepare el documento correspondiente?`);
            
            // Añadir opciones de respuesta rápida
            addQuickReplyOptions([
                { text: 'Sí, preparar documento', action: `prepare_document_${recommendedOption.id}` },
                { text: 'Ver otra opción', action: 'show_other_options' },
                { text: 'Tengo dudas', action: 'ask_questions' }
            ]);
        }
    }
    
    // Función para seleccionar una opción legal
    function selectLegalOption(optionId, options) {
        const selectedOption = options.find(opt => opt.id === optionId);
        assistantState.selectedOption = selectedOption;
        
        // Eliminar las opciones de respuesta rápida si existen
        const optionsContainer = document.querySelector('.options-container');
        if (optionsContainer) {
            optionsContainer.remove();
        }
        
        addUserMessage(`Quiero seleccionar la opción: ${selectedOption.name}`);
        
        addTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            
            addAssistantMessage(`Has seleccionado la opción "${selectedOption.name}". Voy a preparar el documento correspondiente.`);
            
            // Generar el documento según la opción seleccionada
            generateDocument(selectedOption);
        }, 1000);
    }
    
    // Función para procesar acciones personalizadas
    function processCustomAction(action) {
        // Acciones relacionadas con la preparación de documentos
        if (action.startsWith('prepare_document_')) {
            const optionId = action.replace('prepare_document_', '');
            const selectedOption = assistantState.legalOptions.find(opt => opt.id === optionId);
            
            if (selectedOption) {
                assistantState.selectedOption = selectedOption;
                
                addTypingIndicator();
                
                setTimeout(() => {
                    removeTypingIndicator();
                    
                    addAssistantMessage(`Voy a preparar un documento de ${selectedOption.name} personalizado para tu caso.`);
                    
                    // Generar el documento según la opción seleccionada
                    generateDocument(selectedOption);
                }, 1000);
            }
        }
        // Acción para mostrar otras opciones
        else if (action === 'show_other_options') {
            addAssistantMessage('Puedes revisar todas las opciones disponibles y seleccionar la que prefieras.');
        }
        // Acción para hacer preguntas
        else if (action === 'ask_questions') {
            addAssistantMessage('¿Qué dudas tienes sobre las opciones presentadas? Estoy aquí para aclarar cualquier aspecto.');
        }
    }
    
    // Función para generar documento
    function generateDocument(option) {
        addTypingIndicator();
        
        let documentPromise;
        
        // Seleccionar el tipo de documento a generar según la opción
        switch (option.id) {
            case 'alegaciones':
                documentPromise = DocumentGenerator.generateAllegationsDocument(
                    assistantState.documentData,
                    assistantState.documentErrors,
                    assistantState.strategy
                );
                break;
            case 'recurso':
                documentPromise = DocumentGenerator.generateAppealDocument(
                    assistantState.documentData,
                    assistantState.documentErrors,
                    assistantState.strategy
                );
                break;
            case 'aplazamiento':
                documentPromise = DocumentGenerator.generatePaymentDeferralDocument(
                    assistantState.documentData
                );
                break;
            case 'reclamacion':
                documentPromise = DocumentGenerator.generateEconomicAdministrativeClaimDocument(
                    assistantState.documentData,
                    assistantState.documentErrors,
                    assistantState.strategy
                );
                break;
            default:
                documentPromise = DocumentGenerator.generateAllegationsDocument(
                    assistantState.documentData,
                    assistantState.documentErrors,
                    assistantState.strategy
                );
        }
        
        // Procesar la promesa del documento
        documentPromise.then(documentContent => {
            removeTypingIndicator();
            
            // Mostrar vista previa del documento
            showDocumentPreview(documentContent, option);
            
            // Preguntar al usuario si desea descargar el documento
            addAssistantMessage('He generado el documento. ¿Quieres descargarlo en formato Word o PDF?');
            
            // Añadir opciones de respuesta rápida
            addQuickReplyOptions([
                { text: 'Descargar como Word', action: 'download_word' },
                { text: 'Descargar como PDF', action: 'download_pdf' },
                { text: 'Editar antes de descargar', action: 'edit_document' }
            ]);
        });
    }
    
    // Función para mostrar vista previa del documento generado
    function showDocumentPreview(documentContent, option) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'bg-white rounded-lg border border-gray-200 p-6 mb-4';
        
        previewDiv.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h4 class="font-bold text-lg text-gray-800">Vista previa del documento</h4>
                <div class="flex space-x-2">
                    <button class="text-blue-600 hover:text-blue-800 px-2 py-1 edit-document-btn">
                        <i class="fas fa-edit mr-1"></i> Editar
                    </button>
                </div>
            </div>
            <div class="border border-gray-200 rounded-lg p-4 mb-4 font-serif" style="height: 300px; overflow-y: auto;">
                ${documentContent}
            </div>
        `;
        
        // Añadir evento para editar el documento
        const editButton = previewDiv.querySelector('.edit-document-btn');
        editButton.addEventListener('click', () => {
            // Implementar funcionalidad de edición
            addUserMessage('Quiero editar el documento antes de descargarlo');
            addAssistantMessage('Para editar el documento, por favor descárgalo primero y realiza los cambios necesarios en tu editor de texto preferido.');
        });
        
        assistantBody.appendChild(previewDiv);
        scrollToBottom();
    }
    
    // Función para iniciar conversación sin documento
    function startConversationWithoutDocument() {
        addTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            
            addAssistantMessage('Para poder ayudarte mejor, necesito conocer algunos detalles sobre tu caso. ¿Podrías contarme brevemente de qué se trata?');
            
            // Añadir opciones comunes
            addQuickReplyOptions([
                { text: 'Requerimiento de Hacienda', action: 'case_tax_request' },
                { text: 'Sanción administrativa', action: 'case_administrative_penalty' },
                { text: 'Multa de tráfico', action: 'case_traffic_fine' },
                { text: 'Otro asunto', action: 'case_other' }
            ]);
        }, 1000);
    }
    
    // Función para explicar cómo funciona el asistente
    function explainHowItWorks() {
        addTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator();
            
            addAssistantMessage('El Asistente Legal Inteligente funciona en varios pasos:');
            
            setTimeout(() => {
                addAssistantMessage('1️⃣ Análisis de documentos: Puedes subir notificaciones, requerimientos o sanciones que hayas recibido. El sistema extraerá automáticamente la información clave.');
                
                setTimeout(() => {
                    addAssistantMessage('2️⃣ Detección de errores: Identifico posibles deficiencias formales, procedimentales o de cálculo que puedan ser impugnados.');
                    
                    setTimeout(() => {
                        addAssistantMessage('3️⃣ Estrategia legal: Basándome en la normativa y jurisprudencia aplicable, te recomiendo la mejor estrategia de defensa para tu caso específico.');
                        
                        setTimeout(() => {
                            addAssistantMessage('4️⃣ Generación de documentos: Creo escritos personalizados (alegaciones, recursos, solicitudes) listos para presentar ante la administración.');
                            
                            setTimeout(() => {
                                addAssistantMessage('¿Te gustaría probar el asistente ahora?');
                                
                                // Añadir opciones de respuesta rápida
                                addQuickReplyOptions([
                                    { text: 'Sí, analizar un documento', action: 'upload_document' },
                                    { text: 'Sí, consultar sin documento', action: 'no_document' },
                                    { text: 'No, solo explorando', action: 'just_exploring' }
                                ]);
                            }, 800);
                        }, 800);
                    }, 800);
                }, 800);
            }, 800);
        }, 1000);
    }
    
    // Función para manejar respuesta afirmativa
    function handleYesResponse() {
        // Implementar según el contexto actual
        addAssistantMessage('Perfecto. ¿En qué más puedo ayudarte?');
    }
    
    // Función para manejar respuesta negativa
    function handleNoResponse() {
        // Implementar según el contexto actual
        addAssistantMessage('Entiendo. ¿Hay algo más en lo que pueda ayudarte?');
    }
    
    // Función para enviar mensaje del usuario
    function sendMessage() {
        const message = assistantInput.value.trim();
        
        if (message === '') {
            return;
        }
        
        // Añadir mensaje del usuario
        addUserMessage(message);
        
        // Limpiar input
        assistantInput.value = '';
        
        // Procesar mensaje
        processUserMessage(message);
    }
    
    // Función para procesar mensaje del usuario
    function processUserMessage(message) {
        // Eliminar las opciones de respuesta rápida si existen
        const optionsContainer = document.querySelector('.options-container');
        if (optionsContainer) {
            optionsContainer.remove();
        }
        
        addTypingIndicator();
        
        // Simular procesamiento del mensaje
        setTimeout(() => {
            removeTypingIndicator();
            
            // Respuesta básica basada en palabras clave
            if (message.toLowerCase().includes('documento') || message.toLowerCase().includes('subir') || message.toLowerCase().includes('archivo')) {
                promptDocumentUpload();
            }
            else if (message.toLowerCase().includes('plazo') || message.toLowerCase().includes('fecha') || message.toLowerCase().includes('tiempo')) {
                if (assistantState.documentData && assistantState.documentData.plazos) {
                    const remainingDays = DeadlineCalculator.calculateRemainingDays(assistantState.documentData.plazos.recurso);
                    addAssistantMessage(`El plazo para responder vence el ${assistantState.documentData.plazos.recurso}. Tienes ${remainingDays} días restantes.`);
                } else {
                    addAssistantMessage('Para poder informarte sobre plazos específicos, necesitaría analizar el documento correspondiente. ¿Quieres subir un documento?');
                    
                    // Añadir opciones de respuesta rápida
                    addQuickReplyOptions([
                        { text: 'Sí, subir documento', action: 'upload_document' },
                        { text: 'No, tengo otra consulta', action: 'other_question' }
                    ]);
                }
            }
            else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('deficiencia') || message.toLowerCase().includes('defecto')) {
                if (assistantState.documentErrors) {
                    addAssistantMessage(`He detectado ${assistantState.documentErrors.length} posibles errores o deficiencias en el documento. ¿Quieres que te los explique en detalle?`);
                    
                    // Añadir opciones de respuesta rápida
                    addQuickReplyOptions([
                        { text: 'Sí, explicar en detalle', action: 'explain_errors' },
                        { text: 'No, tengo otra consulta', action: 'other_question' }
                    ]);
                } else {
                    addAssistantMessage('Para poder identificar errores o deficiencias, necesitaría analizar el documento correspondiente. ¿Quieres subir un documento?');
                    
                    // Añadir opciones de respuesta rápida
                    addQuickReplyOptions([
                        { text: 'Sí, subir documento', action: 'upload_document' },
                        { text: 'No, tengo otra consulta', action: 'other_question' }
                    ]);
                }
            }
            else if (message.toLowerCase().includes('ayuda') || message.toLowerCase().includes('funciona') || message.toLowerCase().includes('cómo')) {
                explainHowItWorks();
            }
            else {
                // Respuesta genérica
                addAssistantMessage('Entiendo. ¿Hay algo específico en lo que pueda ayudarte con tus trámites ante la AEAT u otros órganos administrativos?');
                
                // Añadir opciones de respuesta rápida
                addQuickReplyOptions([
                    { text: 'Analizar un documento', action: 'upload_document' },
                    { text: 'Consultar sin documento', action: 'no_document' },
                    { text: '¿Cómo funciona?', action: 'how_it_works' }
                ]);
            }
        }, 1500);
    }
    
    // Función para hacer scroll al final del chat
    function scrollToBottom() {
        assistantBody.scrollTop = assistantBody.scrollHeight;
    }
});
