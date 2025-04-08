class LegalAnalyzer {
  constructor() {
    this.deadlineCalculator = new DeadlineCalculator();
    this.legalRules = this.loadLegalRules();
  }
  
  // Cargar reglas legales
  loadLegalRules() {
    return {
      // Reglas para detectar errores formales
      formalErrors: [
        {
          id: 'falta_firma',
          description: 'Falta de firma electrónica válida',
          pattern: text => !text.includes('firma electrónica') && !text.includes('firmado digitalmente'),
          severity: 'high',
          legalBasis: 'Art. 3.2 Ley 59/2003 de firma electrónica'
        },
        {
          id: 'falta_pie_recurso',
          description: 'Ausencia de pie de recurso',
          pattern: text => !text.toLowerCase().includes('recurso') || !text.toLowerCase().includes('plazo'),
          severity: 'high',
          legalBasis: 'Art. 40 Ley 39/2015 PACAP'
        },
        // Más reglas...
      ],
      
      // Reglas para detectar errores procedimentales
      proceduralErrors: [
        {
          id: 'falta_audiencia',
          description: 'Omisión del trámite de audiencia',
          pattern: text => text.includes('sanción') && !text.toLowerCase().includes('audiencia'),
          severity: 'high',
          legalBasis: 'Art. 82 Ley 39/2015 PACAP'
        },
        // Más reglas...
      ],
      
      // Reglas para detectar errores de cálculo
      calculationErrors: [
        // Implementar reglas específicas para detectar errores de cálculo
      ]
    };
  }
  
  async analyzeDocument(documentData) {
    try {
      // Identificar tipo de procedimiento
      const procedureType = this.identifyProcedureType(documentData);
      
      // Detectar errores
      const errors = await this.detectErrors(documentData, procedureType);
      
      // Calcular plazos aplicables
      const deadlines = this.deadlineCalculator.calculateDeadlines(
        documentData.data.fechaNotificacion,
        procedureType
      );
      
      // Evaluar opciones y generar estrategia
      const strategy = this.generateStrategy(documentData, errors);
      
      // Calcular probabilidad de éxito
      const successProbability = this.calculateSuccessProbability(errors);
      
      return {
        procedureType,
        errors,
        deadlines,
        strategy,
        successProbability
      };
    } catch (error) {
      console.error('Error en análisis legal:', error);
      throw new Error('No se pudo completar el análisis legal');
    }
  }
  
  // Identificar tipo de procedimiento
  identifyProcedureType(documentData) {
    const { documentType, text } = documentData;
    
    // Lógica para identificar el tipo específico de procedimiento
    if (documentType === 'sancion') {
      if (text.toLowerCase().includes('iva')) {
        return 'sancion_iva';
      } else if (text.toLowerCase().includes('irpf')) {
        return 'sancion_irpf';
      } else {
        return 'sancion_generica';
      }
    }
    
    // Otros tipos...
    
    return 'desconocido';
  }
  
  // Detectar errores según reglas
  async detectErrors(documentData, procedureType) {
    const { text } = documentData;
    const errors = [];
    
    // Comprobar errores formales
    this.legalRules.formalErrors.forEach(rule => {
      if (rule.pattern(text)) {
        errors.push({
          type: 'formal',
          id: rule.id,
          description: rule.description,
          severity: rule.severity,
          legalBasis: rule.legalBasis
        });
      }
    });
    
    // Comprobar errores procedimentales
    this.legalRules.proceduralErrors.forEach(rule => {
      if (rule.pattern(text)) {
        errors.push({
          type: 'procedural',
          id: rule.id,
          description: rule.description,
          severity: rule.severity,
          legalBasis: rule.legalBasis
        });
      }
    });
    
    // Comprobar errores de cálculo
    // Implementación más compleja...
    
    return errors;
  }
  
  // Generar estrategia basada en errores detectados
  generateStrategy(documentData, errors) {
    // Si hay errores graves, recomendar impugnación
    if (errors.some(e => e.severity === 'high')) {
      return {
        recommendation: 'impugnar',
        options: [
          {
            type: 'recurso_reposicion',
            description: 'Recurso de reposición',
            advantages: 'Rápido y sencillo',
            disadvantages: 'Resuelve el mismo órgano'
          },
          {
            type: 'reclamacion_economico_administrativa',
            description: 'Reclamación económico-administrativa',
            advantages: 'Resuelve órgano independiente',
            disadvantages: 'Proceso más largo'
          }
        ],
        primaryArguments: errors.filter(e => e.severity === 'high').map(e => e.description)
      };
    }
    
    // Si no hay errores graves pero hay importe, evaluar opciones de pago
    if (documentData.data.importe) {
      return {
        recommendation: 'pagar',
        options: [
          {
            type: 'pago_completo',
            description: 'Pago completo',
            advantages: 'Finaliza el procedimiento',
            disadvantages: 'Desembolso inmediato'
          },
          {
            type: 'aplazamiento',
            description: 'Solicitud de aplazamiento',
            advantages: 'Permite fraccionar el pago',
            disadvantages: 'Genera intereses'
          }
        ]
      };
    }
    
    // Caso por defecto
    return {
      recommendation: 'consultar_profesional',
      options: []
    };
  }
  
  // Calcular probabilidad de éxito
  calculateSuccessProbability(errors) {
    // Lógica simplificada para calcular probabilidad
    const highSeverityErrors = errors.filter(e => e.severity === 'high').length;
    const mediumSeverityErrors = errors.filter(e => e.severity === 'medium').length;
    
    if (highSeverityErrors > 0) {
      return 'alta';
    } else if (mediumSeverityErrors > 0) {
      return 'media';
    } else {
      return 'baja';
    }
  }
}

// Clase para cálculo de plazos
class DeadlineCalculator {
  constructor() {
    this.holidays = this.loadHolidays();
  }
  
  // Cargar festivos nacionales
  loadHolidays() {
    // En una implementación real, estos datos vendrían de una API o base de datos
    return [
      '2025-01-01', // Año Nuevo
      '2025-01-06', // Reyes
      '2025-04-18', // Viernes Santo
      '2025-05-01', // Día del Trabajo
      '2025-08-15', // Asunción
      '2025-10-12', // Fiesta Nacional
      '2025-11-01', // Todos los Santos
      '2025-12-06', // Constitución
      '2025-12-08', // Inmaculada
      '2025-12-25'  // Navidad
    ];
  }
  
  calculateDeadlines(notificationDate, procedureType) {
    if (!notificationDate) {
      return {
        message: 'Se necesita la fecha de notificación para calcular plazos'
      };
    }
    
    // Convertir a objeto Date si es string
    const notifDate = typeof notificationDate === 'string' 
      ? new Date(notificationDate) 
      : notificationDate;
    
    // Calcular plazos según tipo de procedimiento
    switch(procedureType) {
      case 'sancion_iva':
      case 'sancion_irpf':
      case 'sancion_generica':
        return {
          voluntaryPayment: this.addBusinessDays(notifDate, 30),
          reposicionDeadline: this.addBusinessDays(notifDate, 15),
          economicAdminDeadline: this.addMonths(notifDate, 1)
        };
      
      case 'liquidacion':
        return {
          voluntaryPayment: this.addBusinessDays(notifDate, 30),
          reposicionDeadline: this.addBusinessDays(notifDate, 15),
          economicAdminDeadline: this.addMonths(notifDate, 1)
        };
      
      case 'requerimiento':
        return {
          responseDeadline: this.addBusinessDays(notifDate, 10)
        };
      
      default:
        return {
          genericDeadline: this.addBusinessDays(notifDate, 10),
          message: 'Plazos genéricos, consultar documento específico'
        };
    }
  }
  
  // Verificar si es día hábil
  isBusinessDay(date) {
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
    
    if (isWeekend) return false;
    
    // Comprobar si es festivo
    const dateString = date.toISOString().split('T')[0];
    return !this.holidays.includes(dateString);
  }
  
  // Añadir días hábiles a una fecha
  addBusinessDays(date, days) {
    let currentDate = new Date(date);
    let remainingDays = days;
    
    while (remainingDays > 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Agosto es inhábil para plazos administrativos
      if (currentDate.getMonth() === 7) continue;
      
      if (this.isBusinessDay(currentDate)) {
        remainingDays--;
      }
    }
    
    return currentDate;
  }
  
  // Añadir meses a una fecha
  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
}
