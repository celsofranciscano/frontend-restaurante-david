export function calculateElapsedMinutes(fechaStr?: string, horaStr?: string): number {
    if (!fechaStr || !horaStr) return 0;
    
    try {
        let fechaHora: Date;
        
        if (horaStr.includes(' - ')) {
            // Formato: "HH:mm - dd/MM/yyyy"
            const [hora, fecha] = horaStr.split(' - ');
            const [horas, minutos] = hora.split(':');
            const [dia, mes, anio] = fecha.split('/');
            fechaHora = new Date(
                parseInt(anio), 
                parseInt(mes) - 1, 
                parseInt(dia), 
                parseInt(horas), 
                parseInt(minutos)
            );
        } else {
            // Formato ISO o timestamp
            fechaHora = new Date(horaStr);
        }
        
        const now = new Date();
        const diffMs = now.getTime() - fechaHora.getTime();
        return Math.floor(diffMs / 60000);
    } catch (e) {
        console.error('Error calculando tiempo transcurrido:', e);
        return 0;
    }
}
