/**
 * Date and time formatting utilities for the application
 * Handles both ISO dates and pre-formatted strings from backend
 */

/**
 * Safely formats a date string to DD/MM/YYYY format
 * Handles both ISO dates and already-formatted strings
 * @param dateStr - ISO date string, formatted string, or date object
 * @returns Formatted date string
 */
export const formatDate = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr) return '-';

    // If it's already a formatted string (DD/MM/YYYY), return as-is
    if (typeof dateStr === 'string' && dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return dateStr;
    }

    try {
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return '-';
        }

        return date.toLocaleDateString('es-BO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return '-';
    }
};

/**
 * Safely formats a time string to HH:mm format
 * Handles both ISO timestamps and pre-formatted strings
 * @param timeStr - ISO timestamp string, formatted string, or date object
 * @returns Formatted time string
 */
export const formatTime = (timeStr: string | Date | null | undefined): string => {
    if (!timeStr) return '-';

    // If it's already a formatted time string (HH:mm), extract it
    if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}/)) {
        return timeStr.substring(0, 5); // Extract HH:mm
    }

    try {
        const time = typeof timeStr === 'string' ? new Date(timeStr) : timeStr;

        // Check if date is valid
        if (isNaN(time.getTime())) {
            return '-';
        }

        return time.toLocaleTimeString('es-BO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return '-';
    }
};

/**
 * Formats a date and time together
 * @param dateStr - Date string
 * @param timeStr - Time string
 * @returns Combined formatted string
 */
export const formatDateTime = (dateStr: string | Date | null | undefined, timeStr?: string | Date | null | undefined): string => {
    const formattedDate = formatDate(dateStr);
    const formattedTime = timeStr ? formatTime(timeStr) : formatTime(dateStr);

    return `${formattedDate} ${formattedTime}`;
};
