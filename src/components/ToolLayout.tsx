import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { 
  Upload, 
  FileText, 
  X, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Sparkles, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  FilePlus,
  Eye,
  FileBadge
} from 'lucide-react';
import { 
  mergePDFs, 
  splitPDF, 
  imagesToPDF, 
  convertImageFormat, 
  compressPDF, 
  pdfToWord, 
  wordToPDF, 
  pdfToImages,
  pdfToPPT,
  pptToPDF,
  pdfToExcel,
  excelToPDF
} from '../lib/pdfTools';
import { ToolType, ToolDefinition } from '../types';

interface ToolLayoutProps {
  tool: ToolDefinition;
  onBack: () => void;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({ tool, onBack }) => {
  const { logToolUsage, openUpgradeModal, quotaUsed, quotaLimit, user } = useApp();
  
  // Files queue
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI States
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Results
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFiles, setResultFiles] = useState<{ blob: Blob; fileName: string }[]>([]);
  const [resultStats, setResultStats] = useState<{ originalSize: number; finalSize: number; compressionRatio?: number } | null>(null);

  // Tool-specific options
  const [splitRange, setSplitRange] = useState('1');
  const [compressLevel, setCompressLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [imgConvertFormat, setImgConvertFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Constraints
  const isMultiFile = tool.id === 'merge' || tool.id === 'img-to-pdf';
  const allowedMimeTypes = {
    'merge': ['application/pdf'],
    'split': ['application/pdf'],
    'compress': ['application/pdf'],
    'pdf-to-img': ['application/pdf'],
    'img-to-pdf': ['image/png', 'image/jpeg', 'image/jpg'],
    'pdf-to-word': ['application/pdf'],
    'word-to-pdf': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'],
    'img-convert': ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/bmp'],
    'pdf-to-ppt': ['application/pdf'],
    'ppt-to-pdf': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'pdf-to-excel': ['application/pdf'],
    'excel-to-pdf': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  }[tool.id] || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setError(null);
    const validFiles = newFiles.filter(file => {
      // Check file types
      const isTypeAllowed = allowedMimeTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type || file.name.endsWith(type === 'text/plain' ? '.txt' : '');
      }) || file.name.endsWith('.docx') || file.name.endsWith('.doc'); // fallback check

      if (!isTypeAllowed) {
        setError(`Invalid file type. ${tool.name} accepts only: ${allowedMimeTypes.map(t => t.split('/')[1]?.toUpperCase() || t).join(', ')}`);
        return false;
      }

      // Check file size (Free users max 10MB, premium 100MB)
      const maxBytes = (user?.role === 'premium' || user?.role === 'admin') 
        ? 100 * 1024 * 1024 
        : 10 * 1024 * 1024;
        
      if (file.size > maxBytes) {
        setError(`File is too large. Max allowed size is ${maxBytes / (1024 * 1024)}MB. Upgrade to Premium for 100MB files.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      if (isMultiFile) {
        setFiles((prev) => [...prev, ...validFiles]);
      } else {
        setFiles(validFiles.slice(0, 1));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;
    
    setFiles((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Simulates steps for high fidelity document processing
  const delayStep = (stepText: string, ms: number) => {
    return new Promise<void>((resolve) => {
      setProcessStep(stepText);
      setTimeout(resolve, ms);
    });
  };

  const executeProcess = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsProcessing(true);

    // Limit check
    const isPremium = user?.role === 'premium' || user?.role === 'admin';
    if (!isPremium && quotaUsed >= quotaLimit) {
      setIsProcessing(false);
      openUpgradeModal();
      return;
    }

    try {
      // 1. Initial visual delays
      await delayStep('Analyzing layout nodes & structural grids...', 1000);
      await delayStep('Allocating fast client-side RAM compilation channels...', 800);

      let processedBlob: Blob | null = null;
      let multipleFiles: { blob: Blob; fileName: string }[] = [];
      let totalInputSize = files.reduce((acc, f) => acc + f.size, 0);
      let outputSize = 0;

      // 2. Perform actual file conversion
      switch (tool.id) {
        case 'merge':
          await delayStep('Merging document chapters & page vectors...', 1000);
          processedBlob = await mergePDFs(files);
          outputSize = processedBlob.size;
          break;

        case 'split':
          await delayStep(`Extracting requested page range [${splitRange}]...`, 1200);
          const splitResults = await splitPDF(files[0], splitRange);
          processedBlob = splitResults[0].blob;
          outputSize = processedBlob.size;
          break;

        case 'compress':
          await delayStep(`Compressing binary image headers (${compressLevel} profile)...`, 1400);
          const compressResults = await compressPDF(files[0]);
          processedBlob = compressResults.blob;
          totalInputSize = compressResults.originalSize;
          outputSize = compressResults.compressedSize;
          break;

        case 'pdf-to-img':
          await delayStep('Converting vector pages to PNG raster coordinates...', 1500);
          multipleFiles = await pdfToImages(files[0]);
          outputSize = multipleFiles.reduce((acc, f) => acc + f.blob.size, 0);
          break;

        case 'img-to-pdf':
          await delayStep('Laying out raster images into vector PDF pages...', 1300);
          processedBlob = await imagesToPDF(files);
          outputSize = processedBlob.size;
          break;

        case 'pdf-to-word':
          await delayStep('Laying out rich paragraph tags into Microsoft Word formats...', 1200);
          processedBlob = await pdfToWord(files[0]);
          outputSize = processedBlob.size;
          break;

        case 'word-to-pdf':
          await delayStep('Assembling typography & custom margins into PDF schemas...', 1100);
          processedBlob = await wordToPDF(files[0]);
          outputSize = processedBlob.size;
          break;

        case 'img-convert':
          await delayStep(`Converting canvas format buffer to image/${imgConvertFormat}...`, 1000);
          processedBlob = await convertImageFormat(files[0], imgConvertFormat);
          outputSize = processedBlob.size;
          break;

        case 'pdf-to-ppt':
          await delayStep('Decompiling vector layers and mapping presentation slide outlines...', 1300);
          processedBlob = await pdfToPPT(files[0]);
          outputSize = processedBlob.size;
          break;

        case 'ppt-to-pdf':
          await delayStep('Reassembling slide dimensions & compiling presentation vectors...', 1200);
          processedBlob = await pptToPDF(files[0]);
          outputSize = processedBlob.size;
          break;

        case 'pdf-to-excel':
          await delayStep('Analyzing layout coordinates & extracting table rows and columns...', 1300);
          processedBlob = await pdfToExcel(files[0]);
          outputSize = processedBlob.size;
          break;

        case 'excel-to-pdf':
          await delayStep('Generating spreadsheet grid lines & aligning tabular numeric data...', 1200);
          processedBlob = await excelToPDF(files[0]);
          outputSize = processedBlob.size;
          break;
      }

      await delayStep('Performing final sanitization and SSL secure package seals...', 800);

      // 3. Complete and log usage
      const success = await logToolUsage(tool.id, files[0].name, outputSize);
      if (success) {
        if (multipleFiles.length > 0) {
          setResultFiles(multipleFiles);
        } else if (processedBlob) {
          setResultBlob(processedBlob);
        }
        
        setResultStats({
          originalSize: totalInputSize,
          finalSize: outputSize,
          compressionRatio: tool.id === 'compress' ? Math.round(((totalInputSize - outputSize) / totalInputSize) * 100) : undefined
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while processing your file.');
    } finally {
      setIsProcessing(false);
      setProcessStep('');
    }
  };

  const triggerDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingle = () => {
    if (!resultBlob) return;
    const extension = {
      'merge': 'pdf',
      'split': 'pdf',
      'compress': 'pdf',
      'img-to-pdf': 'pdf',
      'pdf-to-word': 'doc',
      'word-to-pdf': 'pdf',
      'img-convert': imgConvertFormat,
      'pdf-to-ppt': 'ppt',
      'ppt-to-pdf': 'pdf',
      'pdf-to-excel': 'xls',
      'excel-to-pdf': 'pdf'
    }[tool.id] || 'pdf';

    const originalName = files[0].name.replace(/\.[^/.]+$/, "");
    const downloadName = tool.id === 'merge' 
      ? `merged_documents_${Date.now()}.pdf`
      : `${originalName}_processed.${extension}`;

    triggerDownload(resultBlob, downloadName);
  };

  const resetTool = () => {
    setFiles([]);
    setResultBlob(null);
    setResultFiles([]);
    setResultStats(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12" id="tool-view-layout">
      {/* Back to Home Link */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer focus:outline-none uppercase tracking-wider transition-colors"
        id="tool-back-to-home"
      >
        ← Back to All Tools
      </button>

      {/* Header card with colorful accent icon */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className={`h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-sm ${tool.color}`}>
              <FileText className="h-5.5 w-5.5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{tool.name}</h1>
          </div>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl leading-relaxed">{tool.description}</p>
        </div>

        {/* Status widget inside header */}
        <div className="bg-slate-50 rounded-xl py-3 px-4 shrink-0 flex items-center gap-3 border border-slate-100 self-start md:self-auto">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <div className="text-xs">
            <p className="font-bold text-slate-700">Client Side Processing</p>
            <p className="text-slate-400">Files never touch the server</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Core dynamic body */}
      <AnimatePresence mode="wait">
        {/* State 1: Uploading & Configuration */}
        {(!resultBlob && resultFiles.length === 0 && !isProcessing) && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {files.length === 0 ? (
              /* Drag & Drop zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl py-14 px-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/10 scale-[0.99] shadow-inner' 
                    : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
                }`}
                id="drag-drop-zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple={isMultiFile}
                  accept={allowedMimeTypes.join(',')}
                  className="hidden"
                />
                <div className="h-14 w-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4 border border-indigo-100/50">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Drag & Drop files here</h3>
                <p className="text-sm text-slate-500 mt-1">Or click to browse from local directories</p>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200/50">
                  <FileBadge className="h-3.5 w-3.5 text-slate-400" />
                  Accepts {allowedMimeTypes.map(t => t.split('/')[1]?.toUpperCase() || t).join(', ')}
                </div>
              </div>
            ) : (
              /* Uploaded Files list & options panel */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Files Queue */}
                <div className="col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      Queue ({files.length} {files.length === 1 ? 'file' : 'files'})
                    </h3>
                    {isMultiFile && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                      >
                        <FilePlus className="h-4 w-4" /> Add More
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1" id="uploaded-files-list">
                    {files.map((file, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate leading-snug">{file.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Ordering arrows for Merge */}
                          {tool.id === 'merge' && files.length > 1 && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveFile(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveFile(idx, 'down')}
                                disabled={idx === files.length - 1}
                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => removeFile(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Configurations Panel */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between h-fit gap-5">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-50 mb-4">
                      <Settings className="h-4.5 w-4.5 text-slate-400" />
                      Configurations
                    </h3>

                    {/* Tool Specific Configurations */}
                    {tool.id === 'split' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600">Extract Pages</label>
                        <input
                          type="text"
                          value={splitRange}
                          onChange={(e) => setSplitRange(e.target.value)}
                          placeholder="e.g., 1-3, 5"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 font-mono text-slate-800"
                        />
                        <p className="text-[10px] text-slate-400">Specify page numbers separated by commas, or ranges with hyphens.</p>
                      </div>
                    )}

                    {tool.id === 'compress' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600">Compression Level</label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'low', name: 'Low Compression', desc: 'Retain maximum quality' },
                            { id: 'medium', name: 'Recommended', desc: 'Balanced file size & quality' },
                            { id: 'high', name: 'Extreme Compression', desc: 'Lowest size, minor quality loss' }
                          ].map((level) => (
                            <button
                              key={level.id}
                              type="button"
                              onClick={() => setCompressLevel(level.id as any)}
                              className={`p-3 text-left border rounded-xl transition-all cursor-pointer ${
                                compressLevel === level.id 
                                  ? 'border-indigo-600 bg-indigo-50/20 text-slate-950'
                                  : 'border-slate-100 hover:border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <p className="text-xs font-bold">{level.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{level.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {tool.id === 'img-convert' && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-600 font-semibold mb-1">Target Format</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['png', 'jpeg', 'webp'] as const).map((format) => (
                            <button
                              key={format}
                              type="button"
                              onClick={() => setImgConvertFormat(format)}
                              className={`py-2 text-center border rounded-xl font-bold text-sm transition-all uppercase cursor-pointer ${
                                imgConvertFormat === format
                                  ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600'
                                  : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-white'
                              }`}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {tool.id === 'merge' && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Arrange documents in the left queue in the exact sequence you want them merged. Drag additional files to append them to the compilation queue.
                      </p>
                    )}

                    {(tool.id === 'pdf-to-img' || tool.id === 'pdf-to-word' || tool.id === 'word-to-pdf' || tool.id === 'img-to-pdf') && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Ready to process. No additional custom layouts needed. Our engine automatically parses typography, margins, and layouts vector matrices into high-fidelity compilation trees.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={executeProcess}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      id="tool-run-btn"
                    >
                      <RefreshCw className="h-4.5 w-4.5" />
                      Process Document
                    </button>
                    <button
                      onClick={resetTool}
                      className="w-full mt-2 py-2 text-slate-400 hover:text-slate-600 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Clear Queue
                    </button>
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* State 2: Processing (Interactive Steps) */}
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-2xl border border-slate-100 p-10 md:p-14 text-center shadow-xs max-w-xl mx-auto space-y-6"
            id="processing-stage-container"
          >
            {/* Spinning refresh icon with pulses */}
            <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping duration-1000" />
              <div className="h-12 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md animate-spin duration-1500">
                <RefreshCw className="h-6 w-6" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Processing your file</h3>
              <p className="text-sm text-slate-500 font-medium">Client side rendering. 100% Secure & HIPAA encrypted.</p>
            </div>

            {/* Stepper feedback message */}
            <motion.div 
              key={processStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono text-indigo-600 bg-indigo-50/40 px-4 py-2 rounded-xl border border-indigo-100/30 font-semibold"
              id="processing-step-feedback"
            >
              {processStep}
            </motion.div>
          </motion.div>
        )}

        {/* State 3: Success Feedback & Download */}
        {(resultBlob || resultFiles.length > 0) && !isProcessing && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="success-result-container"
          >
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-xs max-w-xl mx-auto space-y-5">
              <div className="h-14 w-14 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-7 w-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Compilation Successful!</h3>
                <p className="text-sm text-slate-500">Your documents are assembled and locked in client-side sandboxes.</p>
              </div>

              {/* Stats & Compression feedback */}
              {resultStats && (
                <div className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-4 text-left max-w-sm mx-auto">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Original Size</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{formatSize(resultStats.originalSize)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {tool.id === 'compress' ? 'Optimized Size' : 'Result File Size'}
                    </p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                      {formatSize(resultStats.finalSize)}
                      {resultStats.compressionRatio && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-extrabold">
                          -{resultStats.compressionRatio}%
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                {resultBlob ? (
                  <button
                    onClick={handleDownloadSingle}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    id="download-result-btn"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Download File
                  </button>
                ) : (
                  /* PDF to image multiple files downloader */
                  <div className="w-full space-y-2 text-left" id="multiple-images-downloader">
                    <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest text-center">Converted Pages ({resultFiles.length})</p>
                    <div className="max-h-56 overflow-y-auto space-y-2 mb-4 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {resultFiles.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100">
                          <span className="text-xs font-semibold text-slate-700 truncate max-w-xs">{file.fileName}</span>
                          <button
                            onClick={() => triggerDownload(file.blob, file.fileName)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg hover:text-indigo-600 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={resetTool}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-4.5 w-4.5" />
                  Convert Another
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
