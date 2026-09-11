import React, { useState } from 'react';
import { exportToPNG, exportToPDF, PDFExportOptions } from '../../utils/export';
import { X, FileText, Image as ImageIcon, Download, Loader2, Check } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasLayerElement: HTMLElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasLayerElement,
}) => {
  const [exportType, setExportType] = useState<'pdf' | 'png'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // PDF options
  const [format, setFormat] = useState<'a4' | 'a3' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [title, setTitle] = useState('My Thoughtscape');
  const [includeDate, setIncludeDate] = useState(true);
  const [includeBackground, setIncludeBackground] = useState(true);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!canvasLayerElement) return;

    setIsExporting(true);
    setSuccessMessage(null);

    try {
      if (exportType === 'png') {
        await exportToPNG(canvasLayerElement, `${title.toLowerCase().replace(/\s+/g, '-')}.png`, {
          pixelRatio: 2,
          backgroundColor: includeBackground ? '#FAF9F6' : null,
        });
        setSuccessMessage('PNG exported successfully!');
      } else {
        const options: PDFExportOptions = {
          format,
          orientation,
          title,
          includeDate,
          includeBackground,
        };
        await exportToPDF(canvasLayerElement, options, `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
        setSuccessMessage('PDF document generated successfully!');
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  };

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">Export Thoughtscape</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Export Type Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setExportType('pdf')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                exportType === 'pdf'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF Document</span>
            </button>

            <button
              onClick={() => setExportType('png')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                exportType === 'png'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>High-Res PNG Image</span>
            </button>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1.5">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {exportType === 'pdf' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Paper Format */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Page Size</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'a4' | 'a3' | 'letter')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="a4">A4 (Standard)</option>
                  <option value="a3">A3 (Poster / Large)</option>
                  <option value="letter">Letter</option>
                </select>
              </div>

              {/* Orientation */}
              <div>
                <label className="block text-slate-600 font-semibold mb-1.5">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'landscape' | 'portrait')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="landscape">Landscape (Recommended)</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBackground}
                onChange={(e) => setIncludeBackground(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>Include physical environment & texture (Uncheck for clean white paper)</span>
            </label>

            {exportType === 'pdf' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Include timestamp header</span>
              </label>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating {exportType.toUpperCase()}...</span>
              </>
            ) : successMessage ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Done!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download {exportType.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
