import { WorkspaceData } from '../types';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { sanitizeWorkspaceData } from './storage';

export function exportWorkspaceJSON(data: WorkspaceData, filename = 'thoughtscape-backup.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importWorkspaceJSON(file: File): Promise<WorkspaceData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON workspace format');
        }

        const sanitized = sanitizeWorkspaceData(parsed);
        resolve(sanitized);
      } catch {
        reject(new Error('Failed to parse Thoughtscape workspace backup. Please ensure it is a valid JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}

export interface ExportImageOptions {
  pixelRatio?: number;
  backgroundColor?: string | null;
  quality?: number;
}

export async function exportToPNG(
  element: HTMLElement,
  filename = 'thoughtscape-export.png',
  options: ExportImageOptions = {}
): Promise<string> {
  const { pixelRatio = 2, backgroundColor = '#FAF9F6' } = options;

  const dataUrl = await toPng(element, {
    pixelRatio,
    backgroundColor: backgroundColor || undefined,
    cacheBust: true,
    filter: (node) => {
      if (node instanceof HTMLElement && node.dataset.exportIgnore === 'true') {
        return false;
      }
      return true;
    },
  });

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  return dataUrl;
}

export interface PDFExportOptions {
  format: 'a4' | 'a3' | 'letter';
  orientation: 'portrait' | 'landscape';
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
  includeBackground?: boolean;
}

export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions,
  filename = 'thoughtscape-export.pdf'
) {
  const {
    format = 'a4',
    orientation = 'landscape',
    title = 'My Thoughtscape',
    includeDate = true,
    includeBackground = true,
  } = options;

  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: includeBackground ? '#FAF9F6' : '#FFFFFF',
    cacheBust: true,
    filter: (node) => {
      if (node instanceof HTMLElement && node.dataset.exportIgnore === 'true') {
        return false;
      }
      return true;
    },
  });

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 12;
  const headerHeight = title ? 16 : 0;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2 - headerHeight;

  if (title) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(29, 78, 216); // Royal Blue
    pdf.text(title, margin, margin + 6);

    if (includeDate) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      const dateStr = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      pdf.text(dateStr, pageWidth - margin, margin + 6, { align: 'right' });
    }
  }

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const imgRatio = img.width / img.height;
  let renderWidth = usableWidth;
  let renderHeight = usableWidth / imgRatio;

  if (renderHeight > usableHeight) {
    renderHeight = usableHeight;
    renderWidth = usableHeight * imgRatio;
  }

  const xOffset = margin + (usableWidth - renderWidth) / 2;
  const yOffset = margin + headerHeight + (usableHeight - renderHeight) / 2;

  pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');

  // Subtle footer branding
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text('Thoughtscape', margin, pageHeight - 5);

  pdf.save(filename);
}
