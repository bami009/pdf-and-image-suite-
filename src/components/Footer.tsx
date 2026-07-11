import React from 'react';
import { FileText, ShieldCheck, Heart, Trash2, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setView: (view: string) => void;
  setSelectedToolId: (toolId: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView, setSelectedToolId }) => {
  const handleToolClick = (toolId: string) => {
    setView('landing');
    setSelectedToolId(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    setView('landing');
    setSelectedToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 mt-auto" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-800 pb-12 mb-12">
          {/* Brand block */}
          <div className="col-span-2 space-y-4">
            <button 
              onClick={handleHomeClick}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
              id="footer-brand"
            >
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                PDF & Image Suite<span className="text-indigo-400 font-black italic">.</span>
              </span>
            </button>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Experience the web's most elegant, private, and lightning-fast toolkit for document and image processing. Built entirely with client-side WebAssembly and modern canvas vector compilation.
            </p>
            {/* Secure Badges */}
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span>SSL Encrypted & HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <Trash2 className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                <span>Auto-deletion of processed files (0% Retained)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Edit tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Edit PDF</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => handleToolClick('merge')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  Merge PDF
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleToolClick('split')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  Split PDF
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleToolClick('compress')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  Compress PDF
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Convert PDF */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Convert PDF</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => handleToolClick('pdf-to-img')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  PDF to Image
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleToolClick('img-to-pdf')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  Image to PDF
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleToolClick('pdf-to-word')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  PDF to Word
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleToolClick('word-to-pdf')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  Word to PDF
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Convert Images */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-4">Convert Image</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={() => handleToolClick('img-convert')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
                >
                  Format Converter
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} PDF & Image Suite. All rights reserved globally.</p>
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span>for frictionless productivity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
