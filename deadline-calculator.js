/**
 * LegalDefense AI - Asistente Legal Inteligente
 * Módulo de cálculo de plazos legales
 */

// Funciones para calcular plazos legales
const DeadlineCalculator = {
    // Calcula el plazo para pagar en periodo voluntario
    calculateVoluntaryPaymentDeadline: function(notificationDate) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // En una implementación real, se calcularía correctamente teniendo en cuenta
                // días hábiles, festivos, etc.
                
                // Simulamos un cálculo de 15 días hábiles
                const deadline = this._addBusinessDays(new Date(this._parseSpanishDate(notificationDate)), 15);
                
                resolve(this._formatSpanishDate(deadline));
            }, 500);
        });
    },
    
    // Calcula el plazo para presentar recurso de reposición
    calculateAppealDeadline: function(notificationDate) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulamos un cálculo de 15 días hábiles (mismo que el voluntario en este caso)
                const deadline = this._addBusinessDays(new Date(this._parseSpanishDate(notificationDate)), 15);
                
                resolve(this._formatSpanishDate(deadline));
            }, 500);
        });
    },
    
    // Calcula el plazo para presentar reclamación económico-administrativa
    calculateEconomicAdministrativeClaimDeadline: function(notificationDate) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulamos un cálculo de 30 días hábiles
                const deadline = this._addBusinessDays(new Date(this._parseSpanishDate(notificationDate)), 30);
                
                resolve(this._formatSpanishDate(deadline));
            }, 500);
        });
    },
    
    // Calcula el plazo para solicitar aplazamiento/fraccionamiento
    calculateDeferralDeadline: function(notificationDate) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // En periodo voluntario, hasta el fin del plazo de pago
                const deadline = this._addBusinessDays(new Date(this._parseSpanishDate(notificationDate)), 15);
                
                resolve(this._formatSpanishDate(deadline));
            }, 500);
        });
    },
    
    // Calcula todos los plazos relevantes
    calculateAllDeadlines: function(notificationDate) {
        return new Promise((resolve) => {
            Promise.all([
                this.calculateVoluntaryPaymentDeadline(notificationDate),
                this.calculateAppealDeadline(notificationDate),
                this.calculateEconomicAdministrativeClaimDeadline(notificationDate),
                this.calculateDeferralDeadline(notificationDate)
            ]).then(([voluntaryPayment, appeal, economicClaim, deferral]) => {
                resolve({
                    voluntario: voluntaryPayment,
                    recurso: appeal,
                    reclamacionEconomica: economicClaim,
                    aplazamiento: deferral
                });
            });
        });
    },
    
    // Verifica si un plazo ha vencido
    hasDeadlineExpired: function(deadline) {
        const deadlineDate = new Date(this._parseSpanishDate(deadline));
        const today = new Date();
        
        return today > deadlineDate;
    },
    
    // Calcula los días restantes hasta un plazo
    calculateRemainingDays: function(deadline) {
        const deadlineDate = new Date(this._parseSpanishDate(deadline));
        const today = new Date();
        
        // Diferencia en milisegundos
        const diffTime = deadlineDate - today;
        
        // Convertir a días
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays);
    },
    
    // Método auxiliar para añadir días hábiles a una fecha
    _addBusinessDays: function(date, days) {
        let result = new Date(date);
        let addedDays = 0;
        
        while (addedDays < days) {
            result.setDate(result.getDate() + 1);
            
            // Comprobar si es día hábil (no sábado ni domingo)
            if (result.getDay() !== 0 && result.getDay() !== 6) {
                addedDays++;
            }
        }
        
        return result;
    },
    
    // Método auxiliar para convertir fecha española (DD/MM/YYYY) a objeto Date
    _parseSpanishDate: function(dateString) {
        const parts = dateString.split('/');
        // Nota: los meses en JavaScript van de 0 a 11
        return new Date(parts[2], parts[1] - 1, parts[0]);
    },
    
    // Método auxiliar para formatear fecha en formato español
    _formatSpanishDate: function(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    }
};

// Exportar el módulo
window.DeadlineCalculator = DeadlineCalculator;
