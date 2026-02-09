import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, FileType } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Image to Word Converter
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Convert photos of documents into editable .docx files instantly.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-8 space-y-8">
            {/* Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ease-in-out group",
                file ? "border-indigo-300 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
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
              
              <div className="flex flex-col items-center justify-center space-y-4">
                {file ? (
                  <>
                    <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
                      <FileText className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                        Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-100 rounded-full text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <Upload className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions & Status */}
            <div className="flex flex-col items-center justify-center space-y-6">
              {status === 'idle' && file && (
                <button
                  onClick={handleConvert}
                  className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
                >
                  Convert to Word
                </button>
              )}

              {status === 'processing' && (
                <div className="flex flex-col items-center space-y-3 animate-pulse">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-lg font-medium text-gray-700">Processing document...</p>
                  <p className="text-sm text-gray-500">This might take a few seconds.</p>
                </div>
              )}

              {status === 'completed' && (
                <div className="flex flex-col items-center space-y-4 w-full">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-8 h-8" />
                    <span className="text-xl font-bold">Conversion Complete!</span>
                  </div>
                  <button
                    onClick={triggerDownload}
                    className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-xl font-semibold shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2"
                  >
                    <FileType className="w-5 h-5" />
                    <span>Download .docx</span>
                  </button>
                  <button 
                    onClick={() => { setFile(null); setStatus('idle'); }}
                    className="text-sm text-gray-500 hover:text-indigo-600 underline"
                  >
                    Convert another file
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex flex-col items-center space-y-2 text-center">
                   <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-6 h-6" />
                    <span className="text-lg font-medium">Conversion Failed</span>
                  </div>
                  <p className="text-red-500 max-w-md">{errorMessage}</p>
                   <button 
                    onClick={handleConvert}
                    className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          <p>Powered by Google Vision & Claude 3</p>
        </div>
      </div>
    </div>
  );
}

export default App;
