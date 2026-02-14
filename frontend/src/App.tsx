import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, X, Plus, FileDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import './App.css';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Force dark mode by default
document.documentElement.classList.add('dark');
document.body.style.backgroundColor = '#0f172a';
document.body.style.color = '#f8fafc';

// Buy Me a Coffee Component
const BuyMeCoffee = () => (
  <a 
    href="https://buymeacoffee.com/puvaanraaj" 
    target="_blank" 
    rel="noopener noreferrer"
    className="fixed bottom-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105 z-50"
    style={{ textDecoration: 'none' }}
  >
    <span>☕</span>
    <span>Buy me a coffee</span>
  </a>
);

type ConversionStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
type OutputFormat = 'docx' | 'pdf' | 'txt';

interface FormatOption {
  value: OutputFormat;
  label: string;
  icon: string;
  color: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'docx', label: 'Word', icon: '📄', color: 'from-blue-500 to-indigo-600' },
  { value: 'pdf', label: 'PDF', icon: '📕', color: 'from-red-500 to-rose-600' },
  { value: 'txt', label: 'Text', icon: '📝', color: 'from-emerald-500 to-teal-600' },
];

const EXTENSIONS: Record<OutputFormat, string> = {
  docx: '.docx',
  pdf: '.pdf',
  txt: '.txt',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('docx');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    setFiles(prev => [...prev, ...fileArray]);
    setStatus('idle');
    setErrorMessage('');
    setDownloadUrl('');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input so the same file can be re-added
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      setStatus('processing');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const response = await axios.post(
        `${apiUrl}/convert?output_format=${outputFormat}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          responseType: 'blob',
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setStatus('completed');
    } catch (error: unknown) {
      console.error('Error converting file:', error);
      setStatus('error');

      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const json = JSON.parse(text);
          setErrorMessage(json.detail || 'Failed to convert file.');
        } catch {
          setErrorMessage('Failed to convert file. Please try again.');
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message || 'Failed to convert file.');
      } else {
        setErrorMessage('Failed to convert file.');
      }
    }
  };

  const triggerDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      const baseName = files[0]?.name.split('.')[0] || 'document';
      const suffix = files.length > 1 ? `_and_${files.length - 1}_more` : '';
      link.setAttribute('download', `${baseName}${suffix}${EXTENSIONS[outputFormat]}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 mb-6">
            <span className="px-3 py-1 text-xs font-medium text-indigo-400">v2.0.0</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x p-2">
            DocuLens
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400">
            Transform images &amp; PDFs into editable documents — Word, PDF, or plain text.
          </p>
        </div>

        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl ring-1 ring-white/10 transition-all duration-500">
          <div className={cn("p-8 sm:p-12 transition-all duration-500", files.length > 0 ? "grid md:grid-cols-2 gap-12 items-start" : "")}>
            
            {/* ── Left Column: Upload Zone ─────────────────────────── */}
            <div className="space-y-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "group relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ease-out flex flex-col items-center justify-center",
                  files.length > 0
                    ? "border-indigo-500/50 bg-indigo-500/5 min-h-[160px]"
                    : "border-slate-700 hover:border-indigo-500/30 hover:bg-slate-800/80 min-h-[300px]",
                  status === 'processing' && "opacity-50 pointer-events-none",
                )}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  {files.length > 0 ? (
                    <div className="group-hover:translate-y-[-2px] transition-transform duration-300">
                      <div className="w-14 h-14 mx-auto bg-slate-900/50 rounded-xl flex items-center justify-center mb-3 group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] transition-shadow">
                        <Plus className="w-7 h-7 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-base font-medium text-slate-300">Add more files</p>
                      <p className="text-xs text-slate-500">Images or PDFs</p>
                    </div>
                  ) : (
                    <div className="group-hover:translate-y-[-4px] transition-transform duration-300">
                      <div className="w-20 h-20 mx-auto bg-slate-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-shadow">
                        <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-slate-200 mb-2">Drop your files here</p>
                        <p className="text-sm text-slate-500">or click to browse — supports JPG, PNG, WEBP, <strong className="text-indigo-400">PDF</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── File List ──────────────────────────────────────── */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>{files.length} file{files.length > 1 ? 's' : ''} · {formatFileSize(totalSize)}</span>
                    <button
                      onClick={() => { setFiles([]); setStatus('idle'); }}
                      className="text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {files.map((f, idx) => (
                      <div
                        key={`${f.name}-${f.size}-${idx}`}
                        className="flex items-center gap-3 bg-slate-900/40 rounded-xl px-4 py-3 border border-slate-700/30 group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{f.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{formatFileSize(f.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Actions & Status ───────────────────── */}
            <div className={cn("flex flex-col items-center justify-center", files.length > 0 ? "mt-0" : "mt-10")}>
              
              {status === 'idle' && files.length > 0 && (
                <div className="w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Convert</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">
                      {files.length} file{files.length > 1 ? 's' : ''} will be processed and merged into a single document.
                    </p>
                  </div>

                  {/* ── Output Format Selector ─────────────────────── */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Output Format</p>
                    <div className="flex gap-2 justify-center">
                      {FORMAT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setOutputFormat(opt.value)}
                          className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border",
                            outputFormat === opt.value
                              ? `bg-gradient-to-r ${opt.color} text-white border-transparent shadow-lg scale-[1.02]`
                              : "bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600 hover:text-white",
                          )}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Convert Button ─────────────────────────────── */}
                  <button
                    onClick={handleConvert}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
                  >
                    Convert to {FORMAT_OPTIONS.find(o => o.value === outputFormat)?.label}
                  </button>
                </div>
              )}

              {status === 'processing' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                    <Loader2 className="relative w-12 h-12 text-indigo-400 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-white">Analyzing {files.length} file{files.length > 1 ? 's' : ''}...</p>
                    <p className="text-sm text-slate-400 mt-1">AI is reading the layout and text</p>
                  </div>
                </div>
              )}

              {status === 'completed' && (
                <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-300">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                    <CheckCircle className="relative w-16 h-16 text-green-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Ready for Download!</h3>
                    <p className="text-slate-400">Your {outputFormat.toUpperCase()} has been generated successfully.</p>
                  </div>
                  <button
                    onClick={triggerDownload}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
                  >
                    <FileDown className="w-6 h-6" />
                    <span>Download {EXTENSIONS[outputFormat]}</span>
                  </button>
                  <button
                    onClick={() => { setFiles([]); setStatus('idle'); setDownloadUrl(''); }}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    Convert more files
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="w-full p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                  <div className="flex justify-center mb-4">
                    <AlertCircle className="w-10 h-10 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Conversion Failed</h3>
                  <p className="text-red-200/80 max-w-md mx-auto mb-6">{errorMessage}</p>
                  <button
                    onClick={handleConvert}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors border border-slate-700"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Changelog & Sponsor Section ──────────────────────── */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">

          {/* ── Changelog ──────────────────────────────────────── */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 ring-1 ring-white/5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-indigo-400">📋</span> Changelog
            </h2>
            <div className="space-y-4">
              {/* v2.0.0 */}
              <div className="border-l-2 border-indigo-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-indigo-400">v2.0.0</span>
                  <span className="text-xs text-slate-500">Feb 2026</span>
                </div>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✦</span> PDF input support — upload PDFs alongside images</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✦</span> Output format selector — export as Word, PDF, or plain text</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✦</span> Multi-file upload — batch process images &amp; PDFs into one document</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✦</span> Redesigned file management with drag-and-drop</li>
                </ul>
              </div>
              {/* v1.0.0 */}
              <div className="border-l-2 border-slate-700 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-400">v1.0.0</span>
                  <span className="text-xs text-slate-500">Initial Release</span>
                </div>
                <ul className="space-y-1 text-sm text-slate-500">
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Image to Word (.docx) conversion</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Google Cloud Vision OCR integration</li>
                  <li className="flex items-start gap-2"><span className="mt-0.5">•</span> Claude AI structure recovery</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Looking for Sponsor ────────────────────────────── */}
          <div className="relative bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6 ring-1 ring-indigo-400/10 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-[40px]" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-4 h-full justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-3xl">💛</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Looking for Sponsors</h2>
                <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Help keep DocuLens free and open-source. Your support funds server costs, AI API usage, and new features.
                </p>
              </div>
              <a
                href="https://buymeacoffee.com/puvaanraaj"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.03] transition-all duration-200"
                style={{ textDecoration: 'none' }}
              >
                <span className="text-lg">☕</span>
                <span>Become a Sponsor</span>
              </a>
              <p className="text-xs text-slate-600">Every contribution makes a difference</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            Powered by <span className="text-slate-400 font-semibold">Google Vision</span> &amp; <span className="text-slate-400 font-semibold">Claude 3.5</span>
          </p>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Puvaan Raaj. All rights reserved.
          </p>
        </div>
      </div>
      <BuyMeCoffee />
    </div>
  );
}

export default App;
