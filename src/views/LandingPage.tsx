import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ToolDefinition, ToolType } from '../types';
import { ToolCard } from '../components/ToolCard';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Trash2, 
  ArrowRight, 
  CheckCircle, 
  Lock, 
  HelpCircle,
  FileText,
  Clock
} from 'lucide-react';

interface LandingPageProps {
  onSelectTool: (tool: ToolDefinition) => void;
  setView: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectTool, setView }) => {
  const { openUpgradeModal, openAuthModal, user } = useApp();
  const [activeCategory, setActiveCategory] = useState<'all' | 'pdf-edit' | 'pdf-convert' | 'img-edit'>('all');

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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

  const filteredTools = activeCategory === 'all' 
    ? toolsList 
    : toolsList.filter(t => t.category === activeCategory);

  const faqs = [
    {
      q: "Are my uploaded documents safe and private?",
      a: "Absolutely. PDF & Image Suite operates entirely within your browser client-side sandbox. Your files are never uploaded to our servers, assuring total immunity against security leaks, data harvesting, or telemetry tracking."
    },
    {
      q: "What are the limitations of the free tier?",
      a: "Free tier users can utilize any combination of document tools 3 times per day. Files processed under the free tier have a size limit of 10 MB per upload."
    },
    {
      q: "How does the browser-side compression work?",
      a: "Our engine uses client-side WebAssembly to compile and adjust PDF streams directly in RAM, optimizing image dimensions, subsetting fonts, and defragmenting structures."
    },
    {
      q: "Can I cancel my Premium subscription at any time?",
      a: "Yes. You can manage and instantly terminate your active subscription cycle directly from your User Dashboard with a single click. No hidden contracts."
    }
  ];

  return (
    <div className="space-y-16 pb-16" id="landing-page-root">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 border-b border-slate-100 py-20 sm:py-24" id="hero-banner">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> 100% Client-Side Encryption
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Seamless PDF & Image Tools <span className="text-indigo-600">Without the Server Cost</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Merge, split, compress, and convert files instantly in your browser. Rest easy knowing your confidential documents never leave your device.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a 
              href="#tools-grid-section"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-slate-900/10 flex items-center gap-1.5 cursor-pointer"
            >
              Get Started Free <ArrowRight className="h-4.5 w-4.5" />
            </a>
            {!user && (
              <button
                onClick={() => openAuthModal('register')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition-all shadow-xs cursor-pointer"
              >
                Create Account
              </button>
            )}
          </div>

          {/* Secure highlights badge bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-200/50 mt-12">
            <div className="flex items-center gap-2.5 justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600">Zero Server Storage</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center">
              <Zap className="h-5 w-5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600">Instant Compilations</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center">
              <Trash2 className="h-5 w-5 text-rose-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600">No Tracing Telemetry</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center">
              <Lock className="h-5 w-5 text-indigo-500 shrink-0" />
              <span className="text-xs font-bold text-slate-600">Strictly HIPAA Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tools & Categorized tab section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20" id="tools-grid-section">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Our Productivity Suites</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Click on any tool below to begin instant browser-native compilations.</p>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex flex-wrap justify-center gap-2 pb-2" id="category-tab-bar">
          {[
            { id: 'all', label: 'All Utilities' },
            { id: 'pdf-edit', label: 'PDF Editors' },
            { id: 'pdf-convert', label: 'PDF Converters' },
            { id: 'img-edit', label: 'Image Formats' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15'
                  : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="tools-grid">
          {filteredTools.map((tool) => (
            <ToolCard 
              key={tool.id}
              tool={tool}
              onClick={() => onSelectTool(tool)}
            />
          ))}
        </div>
      </section>

      {/* 3. Pricing Section */}
      <section className="bg-slate-50 border-y border-slate-100 py-16 sm:py-20" id="pricing-plans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">Get started for free or upgrade to support continuous development.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Standard Free</h3>
                <p className="text-slate-400 text-xs mt-1.5">For casual single uses and basic editing.</p>
                <div className="my-5 flex items-baseline gap-0.5 text-slate-900">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-xs font-semibold text-slate-400">/ forever</span>
                </div>
                <div className="h-px bg-slate-100 my-5" />
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>3 Free uses per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>Max file size: 10 MB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>Full client side privacy</span>
                  </li>
                </ul>
              </div>
              <button
                disabled={!!user}
                onClick={() => openAuthModal('register')}
                className="w-full py-2.5 mt-8 border border-slate-200 hover:border-slate-300 disabled:opacity-50 text-slate-700 font-bold rounded-xl text-sm transition-colors text-center cursor-pointer"
              >
                {user ? 'Logged In' : 'Sign Up Free'}
              </button>
            </div>

            {/* Premium Pro Tier */}
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-8 shadow-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" /> Best Value
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Premium Pro</h3>
                <p className="text-slate-400 text-xs mt-1.5">For professionals demanding raw heavy processing volume.</p>
                <div className="my-5 flex items-baseline gap-0.5 text-white">
                  <span className="text-4xl font-extrabold">$9</span>
                  <span className="text-xs font-semibold text-slate-400">/ month</span>
                </div>
                <div className="h-px bg-slate-800 my-5" />
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                    <span>Unlimited daily uses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                    <span>Max file size: 100 MB</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                    <span>Priority high speed queues</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                    <span>Dedicated 24/7 client support</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={openUpgradeModal}
                className="w-full py-2.5 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 text-center cursor-pointer"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Accordion section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="landing-faq">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">Have doubts or custom workspace questions? Find them here.</p>
        </div>

        <div className="space-y-3" id="faq-accordion-group">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 text-sm sm:text-base focus:outline-none cursor-pointer hover:bg-slate-50/55 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-indigo-500 shrink-0" />
                  {faq.q}
                </span>
                <span className="text-slate-400">{expandedFaq === idx ? '−' : '+'}</span>
              </button>
              
              {expandedFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-500 border-t border-slate-50/50 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
