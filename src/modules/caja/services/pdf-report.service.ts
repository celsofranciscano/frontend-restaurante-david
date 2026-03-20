import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaccion } from "@/modules/transacciones/types/transaccion.types";
import type { GastoCajaResponse } from "@/modules/caja/types/caja.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReporteCajaData {
  caja: {
    id: number;
    fecha: string;
    hora_apertura: string | null;
    hora_cierre: string | null;
    monto_inicial: number;
    cerrada: boolean | null;
    usuario_nombre?: string;
  };
  resumen: {
    monto_inicial: number;
    ventas_efectivo: number;
    ventas_qr: number;
    gastos_efectivo: number;
    gastos_qr: number;
    efectivo_esperado: number;
    total_qr: number;
    total_del_dia: number;
    total_gastos: number;
  };
  ventas: Transaccion[];
  gastos: GastoCajaResponse[];
}

export function generateCajaReportPDF(data: ReporteCajaData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [26, 54, 93];
  const secondaryColor: [number, number, number] = [51, 51, 51];
  const accentColor: [number, number, number] = [0, 123, 86];
  const lightGray: [number, number, number] = [245, 245, 245];

  // Header with letterhead
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RESTAURANTE V2", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestión Integral", pageWidth / 2, 26, { align: "center" });
  doc.text("La Paz, Bolivia", pageWidth / 2, 32, { align: "center" });
  
  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE CAJA", pageWidth / 2, 42, { align: "center" });

  // Report info box
  const infoY = 52;
  doc.setFillColor(...lightGray);
  doc.rect(10, infoY, pageWidth - 20, 28, "F");
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  const leftX = 15;
  const rightX = pageWidth / 2 + 5;
  let infoLine = infoY + 8;
  
  doc.text("Caja:", leftX, infoLine);
  doc.text("Fecha:", rightX, infoLine);
  
  doc.setFont("helvetica", "normal");
  doc.text(`#${data.caja.id}`, leftX + 25, infoLine);
  doc.text(data.caja.fecha, rightX + 25, infoLine);
  
  infoLine += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Hora Apertura:", leftX, infoLine);
  doc.text("Hora Cierre:", rightX, infoLine);
  
  doc.setFont("helvetica", "normal");
  const horaApertura = data.caja.hora_apertura?.split("T")[1]?.substring(0, 5) || "N/A";
  const horaCierre = data.caja.hora_cierre?.split("T")[1]?.substring(0, 5) || (data.caja.cerrada ? "N/A" : "En curso");
  doc.text(horaApertura, leftX + 40, infoLine);
  doc.text(horaCierre, rightX + 35, infoLine);
  
  infoLine += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Responsable:", leftX, infoLine);
  doc.text("Estado:", rightX, infoLine);
  
  doc.setFont("helvetica", "normal");
  doc.text(data.caja.usuario_nombre || "N/A", leftX + 40, infoLine);
  const isCerrada = data.caja.cerrada === true;
  const statusColor: [number, number, number] = isCerrada ? accentColor : [220, 140, 0];
  doc.setTextColor(...statusColor);
  doc.text(isCerrada ? "CERRADA" : "ABIERTA", rightX + 28, infoLine);

  // Summary section
  const summaryY = infoY + 36;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN FINANCIERO", 14, summaryY);
  
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, summaryY + 2, pageWidth - 14, summaryY + 2);

  // Summary boxes
  const boxWidth = (pageWidth - 30) / 3;
  const boxHeight = 22;
  const boxY = summaryY + 6;
  
  // Box 1 - Inicial
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(10, boxY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("MONTO INICIAL", 10 + boxWidth / 2, boxY + 7, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.monto_inicial.toFixed(2)}`, 10 + boxWidth / 2, boxY + 15, { align: "center" });
  
  // Box 2 - Ventas
  doc.setFillColor(240, 251, 245);
  doc.roundedRect(15 + boxWidth, boxY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL VENTAS", 15 + boxWidth + boxWidth / 2, boxY + 7, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text(`Bs ${data.resumen.total_del_dia.toFixed(2)}`, 15 + boxWidth + boxWidth / 2, boxY + 15, { align: "center" });
  
  // Box 3 - Gastos
  doc.setFillColor(255, 245, 245);
  doc.roundedRect(20 + boxWidth * 2, boxY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL GASTOS", 20 + boxWidth * 2 + boxWidth / 2, boxY + 7, { align: "center" });
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 60, 60);
  doc.text(`Bs ${data.resumen.total_gastos.toFixed(2)}`, 20 + boxWidth * 2 + boxWidth / 2, boxY + 15, { align: "center" });

  // Sales detail table
  let currentY = boxY + boxHeight + 12;
  
  if (data.ventas.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLE DE VENTAS", 14, currentY);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    
    currentY += 5;
    
    const salesTableData = data.ventas.map((v) => [
      v.nro_reg.toString(),
      v.fecha,
      v.concepto || "-",
      v.cliente || "-",
      `Bs ${parseFloat(v.monto_total).toFixed(2)}`,
      `Bs ${parseFloat(v.monto_pagado).toFixed(2)}`,
      `Bs ${parseFloat(v.monto_pendiente).toFixed(2)}`,
      v.estado,
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Fecha", "Concepto", "Cliente", "Total", "Pagado", "Pendiente", "Estado"]],
      body: salesTableData,
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor, 
        fontSize: 8,
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { halign: "right", cellWidth: 22 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", cellWidth: 22 },
        7: { halign: "center", cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Expenses detail table
  if (data.gastos.length > 0) {
    // Check if we need a new page
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("GASTOS REGISTRADOS", 14, currentY);
    doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);
    
    currentY += 5;
    
    const expensesTableData = data.gastos.map((g) => [
      g.id.toString(),
      g.descripcion,
      g.metodo_pago.toUpperCase(),
      `Bs ${g.monto.toFixed(2)}`,
      g.creado_en ? new Date(g.creado_en).toLocaleString("es-BO") : "N/A",
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Descripción", "Método", "Monto", "Fecha/Hora"]],
      body: expensesTableData,
      theme: "striped",
      headStyles: { 
        fillColor: primaryColor, 
        fontSize: 8,
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 70 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "center", cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setFillColor(...primaryColor);
    doc.rect(0, 280, pageWidth, 17, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Documento generado automáticamente - Sistema Restaurante V2", pageWidth / 2, 288, { align: "center" });
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, 293, { align: "center" });
    doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, pageWidth / 2, 298, { align: "center" });
  }

  // Save
  const filename = `Reporte_Caja_${data.caja.id}_${data.caja.fecha}.pdf`;
  doc.save(filename);
}

export function generateGeneralReportPDF(
  cajas: ReporteCajaData[],
  fechaDesde?: string,
  fechaHasta?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const primaryColor: [number, number, number] = [26, 54, 93];
  const secondaryColor: [number, number, number] = [51, 51, 51];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RESTAURANTE V2", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestión Integral", pageWidth / 2, 26, { align: "center" });
  doc.text("La Paz, Bolivia", pageWidth / 2, 32, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE GENERAL DE CAJAS", pageWidth / 2, 42, { align: "center" });

  // Date range
  if (fechaDesde || fechaHasta) {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const rangeText = `Período: ${fechaDesde || "Inicio"} - ${fechaHasta || "Fin"}`;
    doc.text(rangeText, pageWidth / 2, 52, { align: "center" });
  }

  // Summary totals
  let currentY = 60;
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN GENERAL", 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);

  currentY += 8;

  const totalVentas = cajas.reduce((sum, c) => sum + c.resumen.total_del_dia, 0);
  const totalGastos = cajas.reduce((sum, c) => sum + c.resumen.total_gastos, 0);
  const totalInicial = cajas.reduce((sum, c) => sum + c.resumen.monto_inicial, 0);
  const totalVentasEfectivo = cajas.reduce((sum, c) => sum + c.resumen.ventas_efectivo, 0);
  const totalVentasQR = cajas.reduce((sum, c) => sum + c.resumen.ventas_qr, 0);

  const summaryData = [
    ["Total Cajas", cajas.length.toString()],
    ["Monto Inicial Total", `Bs ${totalInicial.toFixed(2)}`],
    ["Ventas Efectivo", `Bs ${totalVentasEfectivo.toFixed(2)}`],
    ["Ventas QR", `Bs ${totalVentasQR.toFixed(2)}`],
    ["Total Ventas", `Bs ${totalVentas.toFixed(2)}`],
    ["Total Gastos", `Bs ${totalGastos.toFixed(2)}`],
  ];

  autoTable(doc, {
    startY: currentY,
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: primaryColor, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 100,
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Each caja detail
  cajas.forEach((caja) => {
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    // Caja header
    doc.setFillColor(...primaryColor);
    doc.rect(14, currentY, pageWidth - 28, 10, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`CAJA #${caja.caja.id} - ${caja.caja.fecha}`, 17, currentY + 7);
    
    currentY += 14;

    // Mini summary
    const miniData = [
      ["Inicial", `Bs ${caja.resumen.monto_inicial.toFixed(2)}`],
      ["Ventas", `Bs ${caja.resumen.total_del_dia.toFixed(2)}`],
      ["Gastos", `Bs ${caja.resumen.total_gastos.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: currentY,
      body: miniData,
      theme: "grid",
      headStyles: { fillColor: [240, 240, 240], textColor: secondaryColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { halign: "right", cellWidth: 30 },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 60,
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...primaryColor);
    doc.rect(0, 280, pageWidth, 17, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Documento generado automáticamente - Sistema Restaurante V2", pageWidth / 2, 288, { align: "center" });
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, 293, { align: "center" });
    doc.text(`Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, pageWidth / 2, 298, { align: "center" });
  }

  const filename = `Reporte_General_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(filename);
}
