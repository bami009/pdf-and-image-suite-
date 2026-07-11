import React from 'react';
import { motion } from 'motion/react';
import { ToolDefinition } from '../types';
import { 
  Merge as MergeIcon, 
  Scissors, 
  FileDown, 
  Image as ImageIcon, 
  FileImage, 
  FileText, 
  FileSpreadsheet, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  onClick: () => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  
  // Choose icon dynamically
  const getIcon = () => {
    switch (tool.id) {
      case 'merge':
        return <MergeIcon className="h-6 w-6" />;
      case 'split':
        return <Scissors className="h-6 w-6" />;
      case 'compress':
        return <FileDown className="h-6 w-6" />;
      case 'pdf-to-img':
        return <FileImage className="h-6 w-6" />;
      case 'img-to-pdf':
        return <ImageIcon className="h-6 w-6" />;
      case 'pdf-to-word':
        return <FileText className="h-6 w-6" />;
      case 'word-to-pdf':
        return <FileSpreadsheet className="h-6 w-6" />;
      case 'img-convert':
        return <RefreshCw className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  return (
    <motion.button
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative text-left p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-48 transition-all hover:border-indigo-100 hover:shadow-md cursor-pointer group"
      id={`tool-card-${tool.id}`}
    >
      {tool.popular && (
        <div className="absolute top-4 right-4 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
          <Sparkles className="h-2.5 w-2.5" /> Popular
        </div>
      )}

      <div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-md ${tool.color}`}>
          {getIcon()}
        </div>
        
        <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
          {tool.name}
        </h3>
        
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
        <span>Process files now</span>
        <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform">→</span>
      </div>
    </motion.button>
  );
};
