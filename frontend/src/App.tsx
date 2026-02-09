import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, FileType } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import './App.css';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Force dark mode by default
document.documentElement.classList.add('dark');
document.body.style.backgroundColor = '#0f172a'; // Match Tailwind slate-900
document.body.style.color = '#f8fafc'; // Match Tailwind slate-50

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

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setErrorMessage('');
      setDownloadUrl('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus('idle');
      setErrorMessage('');
      setDownloadUrl('');
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('processing');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
      const response = await axios.post(`${apiUrl}/convert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob', // Important for downloading files
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
      setStatus('completed');
    } catch (error: any) {
      console.error('Error converting file:', error);
      setStatus('error');
      if (error.response && error.response.data instanceof Blob) {
         // Try to read the error message from the blob
         const text = await error.response.data.text();
         try {
             const json = JSON.parse(text);
             setErrorMessage(json.detail || 'Failed to convert file.');
         } catch {
             setErrorMessage('Failed to convert file. Please try again.');
         }
      } else {
          setErrorMessage(error.message || 'Failed to convert file.');
      }
    }
  };

  const triggerDownload = () => {
      if (downloadUrl) {
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', `${file?.name.split('.')[0] || 'document'}.docx`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50 mb-6">
            <span className="px-3 py-1 text-xs font-medium text-indigo-400">v1.0.0</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x p-2">
            Image to Docx
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400">
            Transform your physical documents into editable Word files instantly using advanced AI vision.
          </p>
        </div>

        <div className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl ring-1 ring-white/10">
          <div className="p-8 sm:p-12">
            {/* Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ease-out",
                file 
                  ? "border-indigo-500/50 bg-indigo-500/5" 
                  : "border-slate-700 hover:border-indigo-500/30 hover:bg-slate-800/80",
                status === 'processing' && "opacity-50 pointer-events-none"
              )}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <div className="flex flex-col items-center justify-center space-y-6">
                {file ? (
                  <div className="transform transition-all duration-300 scale-100">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white mb-1">{file?.name}</p>
                      <p className="text-sm text-slate-400 font-mono">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                        className="mt-6 text-sm text-red-400 hover:text-red-300 font-medium transition-colors py-2 px-4 rounded-full hover:bg-red-500/10"
                    >
                        Remove file
                    </button>
                  </div>
                ) : (
                  <div className="group-hover:translate-y-[-4px] transition-transform duration-300">
                    <div className="w-20 h-20 mx-auto bg-slate-900/50 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] transition-shadow">
                      <Upload className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-slate-200 mb-2">Drop your image here</p>
                      <p className="text-sm text-slate-500">or click to browse supports JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Status */}
            <div className="mt-10 flex flex-col items-center justify-center">
              {status === 'idle' && file && (
                <button
                  onClick={handleConvert}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200"
                >
                  Convert to Word Doc
                </button>
              )}

              {status === 'processing' && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                    <Loader2 className="relative w-12 h-12 text-indigo-400 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-white">Analyzing document structure...</p>
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
                    <p className="text-slate-400">Your document has been successfully converted.</p>
                  </div>
                  <button
                    onClick={triggerDownload}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
                  >
                    <FileType className="w-6 h-6" />
                    <span>Download .docx</span>
                  </button>
                  <button 
                    onClick={() => { setFile(null); setStatus('idle'); }}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    Convert another file
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

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            Powered by <span className="text-slate-400 font-semibold">Google Vision</span> & <span className="text-slate-400 font-semibold">Claude 3.5</span>
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
