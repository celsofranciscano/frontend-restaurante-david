import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    // Added by jspdf-autotable plugin
    lastAutoTable?: {
      finalY?: number;
      startPageNumber?: number;
    } | null;
    getLastAutoTable?: () => { finalY?: number } | null;
  }
}

export {};
