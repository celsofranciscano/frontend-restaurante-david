import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaccion, DetalleItem, Pago } from "@/modules/transacciones/types/transaccion.types";
import type { GastoCajaResponse } from "@/modules/caja/types/caja.types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface ResumenItem {
  nombre: string;
  cantidad: number;
  total: number;
  tipo: 'producto' | 'plato';
}

export interface ReporteCajaData {
  caja: {
    id: number;
    fecha: string;
    hora_apertura: string | null;
    hora_cierre: string | null;
    monto_inicial: number;
    cerrada: boolean | null;
    usuario_nombre?: string;
    b200?: number | null;
    b100?: number | null;
    b50?: number | null;
    b20?: number | null;
    b10?: number | null;
    b5?: number | null;
    m2?: number | null;
    m1?: number | null;
    m050?: number | null;
    m020?: number | null;
    m010?: number | null;
    monto_contado?: number;
    diferencia?: number;
    estado_diferencia?: 'exacto' | 'sobrante' | 'faltante';
    cierre_obs?: string | null;
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
    ventas_count?: number;
    promedio_venta?: number;
  };
  ventas: Transaccion[];
  gastos: GastoCajaResponse[];
  itemsMasVendidos?: ResumenItem[];
  ventasPorMesa?: { mesa: string; cantidad: number; total: number }[];
  ventasDetalladas?: (Transaccion & { items: DetalleItem[]; pagos: Pago[] })[];
}

const BILLETES = [
  { key: 'b200', label: 'Bs 200', valor: 200 },
  { key: 'b100', label: 'Bs 100', valor: 100 },
  { key: 'b50', label: 'Bs 50', valor: 50 },
  { key: 'b20', label: 'Bs 20', valor: 20 },
  { key: 'b10', label: 'Bs 10', valor: 10 },
  { key: 'b5', label: 'Bs 5', valor: 5 },
];

const MONEDAS = [
  { key: 'm2', label: 'Bs 2', valor: 2 },
  { key: 'm1', label: 'Bs 1', valor: 1 },
  { key: 'm050', label: 'Bs 0.50', valor: 0.5 },
  { key: 'm020', label: 'Bs 0.20', valor: 0.2 },
  { key: 'm010', label: 'Bs 0.10', valor: 0.1 },
];

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return format(date, "HH:mm");
  } catch {
    return "N/A";
  }
}

function getBilletesMonedas(caja: ReporteCajaData['caja']) {
  const billetes = BILLETES.map(b => ({
    label: b.label,
    valor: b.valor,
    cantidad: caja[b.key as keyof typeof caja] as number | null,
  })).filter(b => b.cantidad && b.cantidad > 0);

  const monedas = MONEDAS.map(m => ({
    label: m.label,
    valor: m.valor,
    cantidad: caja[m.key as keyof typeof caja] as number | null,
  })).filter(m => m.cantidad && m.cantidad > 0);

  return { billetes, monedas };
}

function addPageFooter(doc: jsPDF, pageWidth: number, pageCount: number): void {
  const footerY = 285;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    doc.setFillColor(26, 54, 93);
    doc.rect(0, footerY, pageWidth, 12, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Documento generado automaticamente - Sistema Restaurante V2", pageWidth / 2, footerY + 4, { align: "center" });
    doc.text(`Pagina ${i} de ${pageCount}  |  Generado: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`, pageWidth / 2, footerY + 9, { align: "center" });
  }
}

function checkNewPage(doc: jsPDF, currentY: number, minSpace: number): number {
  if (currentY > 275 - minSpace) {
    doc.addPage();
    return 15;
  }
  return currentY;
}

function buildPDF(doc: jsPDF, data: ReporteCajaData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = pageWidth - 15;
  const contentWidth = pageWidth - 30;
  
  const primaryColor: [number, number, number] = [26, 54, 93];
  const secondaryColor: [number, number, number] = [51, 51, 51];
  const successColor: [number, number, number] = [0, 123, 86];
  const dangerColor: [number, number, number] = [200, 50, 50];
  const warningColor: [number, number, number] = [200, 140, 0];
  const lightGray: [number, number, number] = [245, 245, 245];
  const infoColor: [number, number, number] = [0, 123, 181];
  const purpleColor: [number, number, number] = [128, 90, 213];

  // ========== HEADER ==========
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE DE CAJA", pageWidth / 2, 16, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Restaurante V2", pageWidth / 2, 26, { align: "center" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestion Integral | Oruro, Bolivia", pageWidth / 2, 34, { align: "center" });
  doc.text(`Caja #${data.caja.id}  |  ${data.caja.fecha}`, pageWidth / 2, 41, { align: "center" });

  // ========== INFO BOX ==========
  let currentY = 52;
  doc.setFillColor(...lightGray);
  doc.roundedRect(marginLeft, currentY, contentWidth, 22, 2, 2, "F");
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  
  const labelCol1 = 20;
  const labelCol2 = 70;
  const labelCol3 = 125;
  const valueOffset = 38;
  
  doc.setFont("helvetica", "bold");
  doc.text("Hora Apertura:", labelCol1, currentY + 8);
  doc.text("Hora Cierre:", labelCol2, currentY + 8);
  doc.text("Cajero:", labelCol3, currentY + 8);
  
  doc.setFont("helvetica", "normal");
  doc.text(formatTime(data.caja.hora_apertura), labelCol1 + valueOffset, currentY + 8);
  doc.text(formatTime(data.caja.hora_cierre) || "En curso", labelCol2 + valueOffset, currentY + 8);
  doc.text(data.caja.usuario_nombre || "N/A", labelCol3 + 20, currentY + 8);
  
  const isCerrada = data.caja.cerrada === true;
  const estadoColor = isCerrada ? successColor : warningColor;
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Estado:", labelCol1, currentY + 17);
  doc.setFillColor(...estadoColor);
  doc.roundedRect(labelCol1 + 22, currentY + 11, 35, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(isCerrada ? "CERRADA" : "ABIERTA", labelCol1 + 24, currentY + 16);

  // ========== RESUMEN GENERAL ==========
  currentY += 30;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN GENERAL", marginLeft, currentY);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.line(marginLeft, currentY + 2, marginRight, currentY + 2);
  
  currentY += 7;
  
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 24;
  
  // Box 1 - Caja Inicial
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(marginLeft, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("CAJA INICIAL", marginLeft + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.monto_inicial.toFixed(2)}`, marginLeft + boxWidth / 2, currentY + 16, { align: "center" });
  
  // Box 2 - Total Ventas
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(marginLeft + boxWidth + 3, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...successColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL VENTAS", marginLeft + boxWidth + 3 + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.total_del_dia.toFixed(2)}`, marginLeft + boxWidth + 3 + boxWidth / 2, currentY + 16, { align: "center" });
  
  // Box 3 - Total Gastos
  doc.setFillColor(255, 235, 238);
  doc.roundedRect(marginLeft + (boxWidth + 3) * 2, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...dangerColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL GASTOS", marginLeft + (boxWidth + 3) * 2 + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Bs ${data.resumen.total_gastos.toFixed(2)}`, marginLeft + (boxWidth + 3) * 2 + boxWidth / 2, currentY + 16, { align: "center" });
  
  // Box 4 - Ventas Count
  doc.setFillColor(237, 231, 246);
  doc.roundedRect(marginLeft + (boxWidth + 3) * 3, currentY, boxWidth, boxHeight, 2, 2, "F");
  doc.setTextColor(...infoColor);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("NRO. VENTAS", marginLeft + (boxWidth + 3) * 3 + boxWidth / 2, currentY + 7, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text((data.resumen.ventas_count ?? 0).toString(), marginLeft + (boxWidth + 3) * 3 + boxWidth / 2, currentY + 16, { align: "center" });

  // ========== METODOS DE PAGO ==========
  currentY += 32;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("METODOS DE PAGO", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  const methodBoxWidth = (contentWidth - 3) / 2;
  
  // Efectivo
  doc.setFillColor(232, 245, 233);
  doc.roundedRect(marginLeft, currentY, methodBoxWidth, 18, 2, 2, "F");
  doc.setTextColor(...successColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("[E] EFECTIVO", marginLeft + 4, currentY + 7);
  doc.setFontSize(10);
  doc.text(`Bs ${data.resumen.ventas_efectivo.toFixed(2)}`, marginLeft + 4, currentY + 14);
  
  // QR
  doc.setFillColor(227, 242, 253);
  doc.roundedRect(marginLeft + methodBoxWidth + 3, currentY, methodBoxWidth, 18, 2, 2, "F");
  doc.setTextColor(...infoColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("[Q] PAGO QR", marginLeft + methodBoxWidth + 7, currentY + 7);
  doc.setFontSize(10);
  doc.text(`Bs ${data.resumen.ventas_qr.toFixed(2)}`, marginLeft + methodBoxWidth + 7, currentY + 14);

  // ========== APERTURA ==========
  currentY += 26;
  currentY = checkNewPage(doc, currentY, 70);
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("APERTURA DE CAJA", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  const { billetes: aperturaBilletes, monedas: aperturaMonedas } = getBilletesMonedas(data.caja);
  
  if (aperturaBilletes.length > 0 || aperturaMonedas.length > 0) {
    const detailData: string[][] = [];
    
    if (aperturaBilletes.length > 0) {
      aperturaBilletes.forEach((b: { label: string; valor: number; cantidad: number | null }) => {
        const subtotal = b.cantidad! * b.valor;
        detailData.push([b.label, `${b.cantidad}`, `x`, `Bs ${b.valor}`, `=`, `Bs ${subtotal.toFixed(2)}`]);
      });
    }
    
    if (aperturaMonedas.length > 0) {
      aperturaMonedas.forEach((m: { label: string; valor: number; cantidad: number | null }) => {
        const subtotal = m.cantidad! * m.valor;
        detailData.push([m.label, `${m.cantidad}`, `x`, `Bs ${m.valor}`, `=`, `Bs ${subtotal.toFixed(2)}`]);
      });
    }
    
    autoTable(doc, {
      startY: currentY,
      head: [["Denominacion", "Cant.", "", "Valor Unit.", "", "Subtotal"]],
      body: detailData,
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { halign: "center", cellWidth: 18 },
        2: { halign: "center", cellWidth: 8 },
        3: { halign: "right", cellWidth: 25 },
        4: { halign: "center", cellWidth: 8 },
        5: { halign: "right", cellWidth: 28 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ========== PRODUCTOS MAS VENDIDOS ==========
  if (data.itemsMasVendidos && data.itemsMasVendidos.length > 0) {
    currentY = checkNewPage(doc, currentY, 70);
    
    doc.setFillColor(...purpleColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("PRODUCTOS / PLATOS MAS VENDIDOS", marginLeft + 2, currentY + 2);
    
    currentY += 8;
    
    const productosData = data.itemsMasVendidos.map((item, idx) => [
      `${idx + 1}`,
      item.tipo === 'plato' ? 'Plato' : 'Producto',
      item.nombre,
      item.cantidad.toString(),
      `Bs ${item.total.toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Tipo", "Nombre", "Cant.", "Total"]],
      body: productosData,
      theme: "striped",
      headStyles: { fillColor: purpleColor, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "center", cellWidth: 25 },
        2: { cellWidth: 65 },
        3: { halign: "center", cellWidth: 25 },
        4: { halign: "right", cellWidth: 35 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ========== VENTAS POR MESA ==========
  if (data.ventasPorMesa && data.ventasPorMesa.length > 0) {
    currentY = checkNewPage(doc, currentY, 70);
    
    doc.setFillColor(...infoColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("VENTAS POR MESA / UBICACION", marginLeft + 2, currentY + 2);
    
    currentY += 8;
    
    const mesaData = data.ventasPorMesa.map((m, idx) => [
      `${idx + 1}`,
      m.mesa || 'Sin especificar',
      m.cantidad.toString(),
      `Bs ${m.total.toFixed(2)}`,
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Mesa/Ubicacion", "Ventas", "Total"]],
      body: mesaData,
      theme: "striped",
      headStyles: { fillColor: infoColor, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { halign: "center", cellWidth: 15 },
        1: { cellWidth: 85 },
        2: { halign: "center", cellWidth: 35 },
        3: { halign: "right", cellWidth: 40 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ========== DETALLE DE VENTAS ==========
  currentY = checkNewPage(doc, currentY, 80);
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DETALLE DE VENTAS", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  if (data.ventas.length > 0) {
    const ventasData = data.ventas.map(s => [
      `#${s.nro_reg}`,
      s.fecha?.split('T')[0] || '',
      formatTime(s.hora || null),
      s.mesa || '-',
      s.concepto || '-',
      `Bs ${parseFloat(s.monto_total).toFixed(2)}`,
      s.estado === 'cerrado' ? 'OK' : (s.estado === 'abierto' ? '--' : '..'),
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Fecha", "Hora", "Mesa", "Concepto", "Monto", "Est."]],
      body: ventasData,
      theme: "striped",
      headStyles: { fillColor: primaryColor, fontSize: 6, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 6 },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 20 },
        4: { cellWidth: 55 },
        5: { halign: "right", cellWidth: 25 },
        6: { halign: "center", cellWidth: 14 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;
  } else {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("No hay ventas registradas en esta caja.", marginLeft + 2, currentY + 4);
    currentY += 10;
  }

  // ========== GASTOS ==========
  if (data.gastos.length > 0) {
    currentY = checkNewPage(doc, currentY, 80);
    
    doc.setFillColor(...dangerColor);
    doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("GASTOS REGISTRADOS", marginLeft + 2, currentY + 2);
    
    currentY += 8;
    
    const gastosData = data.gastos.map(g => [
      g.id.toString(),
      g.descripcion,
      g.metodo_pago.toUpperCase(),
      `Bs ${g.monto.toFixed(2)}`,
      g.creado_en ? format(new Date(g.creado_en), "dd/MM HH:mm") : "N/A",
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [["#", "Descripcion", "Metodo", "Monto", "Fecha/Hora"]],
      body: gastosData,
      theme: "striped",
      headStyles: { fillColor: dangerColor, fontSize: 7, fontStyle: "bold", halign: "center" },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 75 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "center", cellWidth: 30 },
      },
      margin: { left: marginLeft, right: marginRight - marginLeft },
    });
    
    currentY = (doc as any).lastAutoTable.finalY + 8;
  }

  // ========== CIERRE ==========
  currentY = checkNewPage(doc, currentY, 90);
  
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginLeft, currentY - 3, contentWidth, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CIERRE DE CAJA", marginLeft + 2, currentY + 2);
  
  currentY += 8;
  
  doc.setFillColor(...lightGray);
  doc.roundedRect(marginLeft, currentY, contentWidth, 35, 2, 2, "F");
  
  const cierreY = currentY + 8;
  const cierreLeft = marginLeft + 5;
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(8);
  
  // Row 1
  doc.setFont("helvetica", "bold");
  doc.text("Caja Inicial:", cierreLeft, cierreY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...successColor);
  doc.text(`Bs ${data.resumen.monto_inicial.toFixed(2)}`, cierreLeft + 35, cierreY);
  
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Total Ventas:", cierreLeft + 70, cierreY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...successColor);
  doc.text(`Bs ${data.resumen.total_del_dia.toFixed(2)}`, cierreLeft + 105, cierreY);
  
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Total Gastos:", cierreLeft + 135, cierreY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dangerColor);
  doc.text(`Bs ${data.resumen.total_gastos.toFixed(2)}`, cierreLeft + 165, cierreY);
  
  // Row 2
  doc.setTextColor(...secondaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Efectivo Esperado:", cierreLeft, cierreY + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...successColor);
  doc.setFontSize(12);
  doc.text(`Bs ${data.resumen.efectivo_esperado.toFixed(2)}`, cierreLeft + 45, cierreY + 12);
  
  if (data.caja.monto_contado !== undefined) {
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Efectivo Contado:", cierreLeft + 100, cierreY + 12);
    doc.setTextColor(...successColor);
    doc.text(`Bs ${(data.caja.monto_contado || 0).toFixed(2)}`, cierreLeft + 145, cierreY + 12);
  }
  
  // Row 3 - Diferencia
  if (data.caja.monto_contado !== undefined) {
    const diferencia = data.caja.diferencia || 0;
    const estadoDif = data.caja.estado_diferencia || 'exacto';
    
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("Diferencia:", cierreLeft, cierreY + 22);
    
    doc.setTextColor(...(estadoDif === 'exacto' ? successColor : (estadoDif === 'sobrante' ? successColor : dangerColor)));
    doc.text(`${diferencia >= 0 ? '+' : ''}Bs ${diferencia.toFixed(2)}`, cierreLeft + 25, cierreY + 22);
    
    doc.setFont("helvetica", "normal");
    doc.text(`(${estadoDif.toUpperCase()})`, cierreLeft + 60, cierreY + 22);
  }
  
  currentY += 40;
  
  if (data.caja.cierre_obs) {
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Obs:", marginLeft, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(data.caja.cierre_obs, marginLeft + 10, currentY);
    currentY += 6;
  }

  // ========== FOOTER ==========
  addPageFooter(doc, pageWidth, doc.getNumberOfPages());
}

export function generateCajaReportPDF(data: ReporteCajaData): void {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  buildPDF(doc, data);
  const filename = `Reporte_Caja_${data.caja.id}_${data.caja.fecha}.pdf`;
  doc.save(filename);
}

export function generateCajaReportPDFDataUrl(data: ReporteCajaData): string {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  buildPDF(doc, data);
  return doc.output('datauristring');
}

export function generateGeneralReportPDF(
  cajas: ReporteCajaData[],
  fechaDesde?: string,
  fechaHasta?: string
): void {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  const primaryColor: [number, number, number] = [26, 54, 93];
  const secondaryColor: [number, number, number] = [51, 51, 51];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 55, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("REPORTE GENERAL DE CAJAS", pageWidth / 2, 18, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Restaurante V2", pageWidth / 2, 30, { align: "center" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestión Integral | Oruro, Bolivia", pageWidth / 2, 38, { align: "center" });
  
  if (fechaDesde || fechaHasta) {
    doc.text(`Período: ${fechaDesde || "Inicio"} - ${fechaHasta || "Fin"}`, pageWidth / 2, 46, { align: "center" });
  }

  // Summary totals
  let currentY = fechaDesde || fechaHasta ? 65 : 60;
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN GENERAL", 14, currentY);
  doc.line(14, currentY + 2, pageWidth - 14, currentY + 2);

  currentY += 10;

  const totalVentas = cajas.reduce((sum, c) => sum + c.resumen.total_del_dia, 0);
  const totalGastos = cajas.reduce((sum, c) => sum + c.resumen.total_gastos, 0);
  const totalInicial = cajas.reduce((sum, c) => sum + c.resumen.monto_inicial, 0);
  const totalVentasEfectivo = cajas.reduce((sum, c) => sum + c.resumen.ventas_efectivo, 0);
  const totalVentasQR = cajas.reduce((sum, c) => sum + c.resumen.ventas_qr, 0);
  const totalVentasCount = cajas.reduce((sum, c) => sum + c.ventas.length, 0);

  const summaryData = [
    ["Total Cajas", cajas.length.toString()],
    ["Total Ventas Registradas", totalVentasCount.toString()],
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
      0: { fontStyle: "bold", cellWidth: 70 },
      1: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
    tableWidth: 110,
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Each caja summary
  cajas.forEach((caja) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(...primaryColor);
    doc.rect(14, currentY, pageWidth - 28, 10, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`CAJA #${caja.caja.id} - ${caja.caja.fecha} - ${caja.caja.cerrada ? 'CERRADA' : 'ABIERTA'}`, 17, currentY + 7);
    
    currentY += 14;

    const miniData = [
      ["Inicial", `Bs ${caja.resumen.monto_inicial.toFixed(2)}`],
      ["Ventas", `Bs ${caja.resumen.total_del_dia.toFixed(2)}`],
      ["Efectivo", `Bs ${caja.resumen.ventas_efectivo.toFixed(2)}`],
      ["QR", `Bs ${caja.resumen.ventas_qr.toFixed(2)}`],
      ["Gastos", `Bs ${caja.resumen.total_gastos.toFixed(2)}`],
      [`(${caja.ventas.length} ventas)`, ""],
    ];

    autoTable(doc, {
      startY: currentY,
      body: miniData,
      theme: "grid",
      headStyles: { fillColor: [240, 240, 240], textColor: secondaryColor, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: "bold" },
        1: { halign: "right", cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 75,
    });

    currentY = (doc as any).lastAutoTable.finalY + 8;
  });

  // Footer
  addPageFooter(doc, pageWidth, doc.getNumberOfPages());

  const filename = `Reporte_General_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(filename);
}
