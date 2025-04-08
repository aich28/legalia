/**
 * Calculador de plazos legales para el Asistente Legal Inteligente
 * Implementa funciones para calcular fechas límite considerando días hábiles y festivos
 */

// Verificar si la clase ya ha sido declarada para evitar duplicados
if (typeof window.DeadlineCalculator === 'undefined') {
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

        /**
         * Calcula plazos legales según el tipo de procedimiento
         * @param {Date|string} notificationDate - Fecha de notificación
         * @param {string} procedureType - Tipo de procedimiento
         * @returns {Object} - Objeto con los plazos calculados
         */
        calculateDeadlines(notificationDate, procedureType) {
            if (!notificationDate) {
                return {
                    message: 'Se necesita la fecha de notificación para calcular plazos'
                };
            }

            // Convertir a objeto Date si es string
            let notifDate;
            try {
                // Si es string, intentar convertir a Date
                if (typeof notificationDate === 'string') {
                    // Manejar diferentes formatos de fecha
                    if (notificationDate.includes('/')) {
                        // Formato DD/MM/YYYY
                        const parts = notificationDate.split('/');
                        if (parts.length === 3) {
                            const day = parseInt(parts[0], 10);
                            const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-11
                            const year = parseInt(parts[2], 10);
                            notifDate = new Date(year, month, day);
                        } else {
                            throw new Error('Formato de fecha inválido');
                        }
                    } else if (notificationDate.includes('-')) {
                        // Formato YYYY-MM-DD o DD-MM-YYYY
                        const parts = notificationDate.split('-');
                        if (parts.length === 3) {
                            // Determinar si es YYYY-MM-DD o DD-MM-YYYY
                            if (parts[0].length === 4) {
                                // YYYY-MM-DD
                                notifDate = new Date(notificationDate);
                            } else {
                                // DD-MM-YYYY
                                const day = parseInt(parts[0], 10);
                                const month = parseInt(parts[1], 10) - 1; // Meses en JS son 0-11
                                const year = parseInt(parts[2], 10);
                                notifDate = new Date(year, month, day);
                            }
                        } else {
                            throw new Error('Formato de fecha inválido');
                        }
                    } else {
                        // Intentar con el constructor Date estándar
                        notifDate = new Date(notificationDate);
                    }
                    
                    // Verificar si la fecha es válida
                    if (isNaN(notifDate.getTime())) {
                        throw new Error('Fecha inválida');
                    }
                } else {
                    // Si ya es un objeto Date, usarlo directamente
                    notifDate = notificationDate;
                }
            } catch (error) {
                console.error('Error al procesar la fecha de notificación:', error);
                return {
                    message: 'Error al procesar la fecha de notificación. Formato válido: DD/MM/YYYY o YYYY-MM-DD'
                };
            }

            // Calcular plazos según tipo de procedimiento
            switch(procedureType) {
                case 'sancion_iva':
                case 'sancion_irpf':
                case 'sancion_generica':
                    return {
                        voluntaryPayment: this.formatDate(this.addBusinessDays(notifDate, 30)),
                        reposicionDeadline: this.formatDate(this.addBusinessDays(notifDate, 15)),
                        economicAdminDeadline: this.formatDate(this.addMonths(notifDate, 1))
                    };
                
                case 'liquidacion_iva':
                case 'liquidacion_irpf':
                case 'liquidacion_generica':
                    return {
                        voluntaryPayment: this.formatDate(this.addBusinessDays(notifDate, 30)),
                        reposicionDeadline: this.formatDate(this.addBusinessDays(notifDate, 15)),
                        economicAdminDeadline: this.formatDate(this.addMonths(notifDate, 1))
                    };
                
                case 'requerimiento_informacion':
                case 'requerimiento_generico':
                    return {
                        responseDeadline: this.formatDate(this.addBusinessDays(notifDate, 10))
                    };
                
                case 'acta_inspeccion':
                    return {
                        alegacionesDeadline: this.formatDate(this.addBusinessDays(notifDate, 15))
                    };
                
                default:
                    return {
                        message: 'Tipo de procedimiento no reconocido'
                    };
            }
        }

        /**
         * Verifica si una fecha es día hábil (no fin de semana ni festivo)
         * @param {Date} date - Fecha a verificar
         * @returns {boolean} - true si es día hábil
         */
        isBusinessDay(date) {
            try {
                // Verificar que date es un objeto Date válido
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    throw new Error('Fecha inválida');
                }

                const day = date.getDay();
                
                // Sábado (6) o Domingo (0)
                if (day === 0 || day === 6) {
                    return false;
                }
                
                // Convertir la fecha a formato YYYY-MM-DD para comparar con festivos
                const dateString = this.formatDateISO(date);
                
                // Verificar si es festivo
                return !this.holidays.includes(dateString);
            } catch (error) {
                console.error('Error al verificar día hábil:', error);
                // En caso de error, asumir que es día hábil para evitar bloqueos
                return true;
            }
        }

        /**
         * Añade un número específico de días hábiles a una fecha
         * @param {Date} date - Fecha base
         * @param {number} days - Número de días hábiles a añadir
         * @returns {Date} - Nueva fecha con los días hábiles añadidos
         */
        addBusinessDays(date, days) {
            try {
                // Verificar que date es un objeto Date válido
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    throw new Error('Fecha inválida');
                }

                // Crear una copia de la fecha para no modificar la original
                const result = new Date(date.getTime());
                let businessDaysAdded = 0;
                
                // Añadir días uno por uno, verificando si son hábiles
                while (businessDaysAdded < days) {
                    result.setDate(result.getDate() + 1);
                    if (this.isBusinessDay(result)) {
                        businessDaysAdded++;
                    }
                }
                
                return result;
            } catch (error) {
                console.error('Error al añadir días hábiles:', error);
                // En caso de error, devolver la fecha original
                return date;
            }
        }

        /**
         * Añade un número específico de meses a una fecha
         * @param {Date} date - Fecha base
         * @param {number} months - Número de meses a añadir
         * @returns {Date} - Nueva fecha con los meses añadidos
         */
        addMonths(date, months) {
            try {
                // Verificar que date es un objeto Date válido
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    throw new Error('Fecha inválida');
                }

                // Crear una copia de la fecha para no modificar la original
                const result = new Date(date.getTime());
                
                // Añadir meses
                result.setMonth(result.getMonth() + months);
                
                // Si el día del mes original no existe en el mes resultante,
                // ajustar al último día del mes (ej. 31 de enero + 1 mes = 28/29 de febrero)
                const originalDay = date.getDate();
                const resultDay = result.getDate();
                
                if (originalDay !== resultDay) {
                    // Si los días no coinciden, es porque hemos "desbordado" al mes siguiente
                    // Retroceder al último día del mes anterior
                    result.setDate(0);
                }
                
                return result;
            } catch (error) {
                console.error('Error al añadir meses:', error);
                // En caso de error, devolver la fecha original
                return date;
            }
        }

        /**
         * Formatea una fecha en formato DD/MM/YYYY
         * @param {Date} date - Fecha a formatear
         * @returns {string} - Fecha formateada
         */
        formatDate(date) {
            try {
                // Verificar que date es un objeto Date válido
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    throw new Error('Fecha inválida');
                }

                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                
                return `${day}/${month}/${year}`;
            } catch (error) {
                console.error('Error al formatear fecha:', error);
                return 'Fecha inválida';
            }
        }

        /**
         * Formatea una fecha en formato YYYY-MM-DD (ISO)
         * @param {Date} date - Fecha a formatear
         * @returns {string} - Fecha formateada en formato ISO
         */
        formatDateISO(date) {
            try {
                // Verificar que date es un objeto Date válido
                if (!(date instanceof Date) || isNaN(date.getTime())) {
                    throw new Error('Fecha inválida');
                }

                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                
                return `${year}-${month}-${day}`;
            } catch (error) {
                console.error('Error al formatear fecha ISO:', error);
                return 'Fecha inválida';
            }
        }
    }

    // Asignar la clase al objeto window para evitar redeclaraciones
    window.DeadlineCalculator = DeadlineCalculator;
}

// Exportar la clase para uso en otros módulos
// Usar la instancia global si existe, o crear una nueva
const DeadlineCalculatorExport = window.DeadlineCalculator;
export default DeadlineCalculatorExport;
