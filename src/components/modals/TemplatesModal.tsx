import React from 'react';
import { TEMPLATES } from '../../constants/templates';
import { X, BookOpen, ArrowRight } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-export-ignore="true"
      className="fixed inset-0 z-[99999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-900">Choose a Knowledge Template</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                onSelectTemplate(tmpl.id);
                onClose();
              }}
              className="group flex flex-col justify-between p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/40 hover:shadow-md cursor-pointer transition-all active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-100/60 px-2 py-0.5 rounded-full">
                    {tmpl.category}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {tmpl.notes.length} notes
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
