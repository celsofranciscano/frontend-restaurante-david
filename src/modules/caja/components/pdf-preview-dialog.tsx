import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReporteCajaData } from "@/modules/caja/services/pdf-report.service";

interface PdfPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: ReporteCajaData | null;
    onDownload: () => void;
}

export function PdfPreviewDialog({ open, onOpenChange, data, onDownload }: PdfPreviewDialogProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setPdfUrl(null);
        }
    }, [open]);

    const handlePreview = async () => {
        if (!data) return;
        
        setLoading(true);
        try {
            const { generateCajaReportPDFDataUrl } = await import("@/modules/caja/services/pdf-report.service");
            const url = generateCajaReportPDFDataUrl(data);
            setPdfUrl(url);
        } catch (error) {
            console.error("Error generating preview:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            {/* Header Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                        <h2 className="font-semibold">Vista Previa del Reporte</h2>
                        <p className="text-sm text-muted-foreground">
                            {data ? `Caja #${data.caja.id} - ${data.caja.fecha}` : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!pdfUrl && (
                        <Button onClick={handlePreview} disabled={loading} className="gap-2">
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4" />
                            )}
                            {loading ? "Generando..." : "Generar Vista Previa"}
                        </Button>
                    )}
                    {pdfUrl && (
                        <Button onClick={onDownload} className="gap-2 bg-success hover:bg-success/90">
                            <Download className="h-4 w-4" />
                            Descargar PDF
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="gap-2">
                        <X className="h-4 w-4" />
                        Cerrar
                    </Button>
                </div>
            </div>

            {/* PDF Container - Full Viewport */}
            <div className="fixed top-[72px] left-0 right-0 bottom-0 bg-muted/50">
                {!pdfUrl ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className={cn(
                            "w-24 h-24 rounded-full bg-muted flex items-center justify-center",
                            loading && "animate-pulse"
                        )}>
                            <FileText className={cn(
                                "h-12 w-12 text-muted-foreground/50",
                                loading && "animate-pulse"
                            )} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium mb-1">
                                {loading ? "Generando vista previa..." : "Vista Previa del PDF"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {loading 
                                    ? "El reporte se está generando, espere un momento..." 
                                    : "Haga clic en 'Generar Vista Previa' para cargar el documento"}
                            </p>
                        </div>
                        {!loading && (
                            <Button onClick={handlePreview} size="lg" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Generar Vista Previa
                            </Button>
                        )}
                        {loading && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Procesando...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="PDF Preview"
                    />
                )}
            </div>
        </div>
    );
}
