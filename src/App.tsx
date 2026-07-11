import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { LandingPage } from './views/LandingPage';
import { Dashboard } from './views/Dashboard';
import { AdminPanel } from './views/AdminPanel';
import { ToolLayout } from './components/ToolLayout';
import { ToolDefinition } from './types';

const toolsList: ToolDefinition[] = [
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single consolidated document in any custom sequence.',
    category: 'pdf-edit',
    popular: true,
    color: 'bg-indigo-600'
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Extract specific page ranges or split a multi-page PDF into separate standalone documents.',
    category: 'pdf-edit',
    color: 'bg-emerald-600'
  },
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce PDF file sizes by optimizing embedded graphic assets without losing visual clarity.',
    category: 'pdf-edit',
    popular: true,
    color: 'bg-blue-600'
  },
  {
    id: 'pdf-to-img',
    name: 'PDF to Image',
    description: 'Convert PDF document pages into high-resolution standalone PNG raster images.',
    category: 'pdf-convert',
    color: 'bg-amber-600'
  },
  {
    id: 'img-to-pdf',
    name: 'Image to PDF',
    description: 'Compile and sequence local images (PNG, JPEG) into clean, printable vector PDF pages.',
    category: 'pdf-convert',
    color: 'bg-violet-600'
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Extract raw text structures and paragraph groupings into fully editable DOC text fields.',
    category: 'pdf-convert',
    color: 'bg-sky-600'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Compile Microsoft Word text formats and custom typographies into stable PDF formats.',
    category: 'pdf-convert',
    color: 'bg-rose-600'
  },
  {
    id: 'img-convert',
    name: 'Format Converter',
    description: 'Convert image assets seamlessly between high-performance formats: PNG, JPG, WEBP.',
    category: 'img-edit',
    color: 'bg-teal-600'
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PPT',
    description: 'Convert PDF document pages into editable Microsoft PowerPoint presentations.',
    category: 'pdf-convert',
    popular: true,
    color: 'bg-orange-600'
  },
  {
    id: 'ppt-to-pdf',
    name: 'PPT to PDF',
    description: 'Convert Microsoft PowerPoint presentations (.ppt, .pptx) into standard PDF documents.',
    category: 'pdf-convert',
    color: 'bg-red-700'
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables, records, and numeric columns from PDFs into fully functional Excel sheets.',
    category: 'pdf-convert',
    popular: true,
    color: 'bg-green-700'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Microsoft Excel spreadsheets (.xls, .xlsx) into high-fidelity printable vector PDF files.',
    category: 'pdf-convert',
    color: 'bg-emerald-700'
  }
];

function AppContent() {
  const { loading } = useApp();
  const [view, setView] = useState<string>('landing');
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);

  const handleSelectToolId = (toolId: string | null) => {
    if (toolId) {
      const tool = toolsList.find((t) => t.id === toolId);
      if (tool) {
        setSelectedTool(tool);
        setView('tool');
      }
    } else {
      setSelectedTool(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        {/* Loading spinner */}
        <div className="relative h-12 w-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping duration-1000" />
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Starting Application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans" id="applet-viewport">
      
      {/* Dynamic Navigation */}
      <Navbar 
        currentView={view} 
        setView={setView} 
        setSelectedToolId={handleSelectToolId} 
      />

      {/* Main viewport area */}
      <main className="flex-1">
        {view === 'landing' && (
          <LandingPage 
            onSelectTool={(tool) => {
              setSelectedTool(tool);
              setView('tool');
              window.scrollTo({ top: 0, behavior: 'instant' });
            }} 
            setView={setView}
          />
        )}

        {view === 'dashboard' && <Dashboard />}
        
        {view === 'admin' && <AdminPanel />}

        {view === 'tool' && selectedTool && (
          <ToolLayout 
            tool={selectedTool} 
            onBack={() => {
              setView('landing');
              setSelectedTool(null);
              window.scrollTo({ top: 0, behavior: 'instant' });
            }} 
          />
        )}
      </main>

      {/* Footer */}
      <Footer 
        setView={setView} 
        setSelectedToolId={handleSelectToolId} 
      />

      {/* Modals Overlay */}
      <AuthModal />
      <UpgradeModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
