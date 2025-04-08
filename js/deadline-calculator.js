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
      
      case 'liquidacion_iva':
      case 'liquidacion_irpf':
      case 'liquidacion_generica':
        return {
          voluntaryPayment: this.addBusinessDays(notifDate, 30),
          reposicionDeadline: this.addBusinessDays(notifDate, 15),
          economicAdminDeadline: this.addMonths(notifDate, 1)
        };
      
      case 'requerimiento_informacion':
      case 'requerimiento_generico':
        return {
          responseDeadline: this.addBusinessDays(notifDate, 10)
        };
      
      case 'acta_inspeccion':
        return {
          alegacionesDeadline: this.addBusinessDays(notifDate, 15)
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
  
  // Formatear fecha para mostrar
  formatDate(date) {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
  
  // Calcular días restantes desde hoy
  calculateRemainingDays(deadline) {
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  // Generar mensaje de alerta según proximidad del plazo
  getDeadlineAlert(deadline) {
    const remainingDays = this.calculateRemainingDays(deadline);
    
    if (remainingDays < 0) {
      return {
        message: 'Plazo vencido',
        severity: 'critical',
        remainingDays
      };
    } else if (remainingDays <= 3) {
      return {
        message: 'Plazo muy próximo a vencer',
        severity: 'high',
        remainingDays
      };
    } else if (remainingDays <= 7) {
      return {
        message: 'Plazo próximo a vencer',
        severity: 'medium',
        remainingDays
      };
    } else {
      return {
        message: 'Plazo en curso',
        severity: 'low',
        remainingDays
      };
    }
  }
  
  // Obtener información completa de plazos con alertas
  getDeadlinesInfo(deadlines) {
    const result = {};
    
    for (const key in deadlines) {
      if (deadlines[key] instanceof Date) {
        result[key] = {
          date: deadlines[key],
          formatted: this.formatDate(deadlines[key]),
          alert: this.getDeadlineAlert(deadlines[key])
        };
      }
    }
    
    return result;
  }
}
