// src/components/MainContent.jsx (or your path)

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { useAuth } from "../auth/AuthContext";

// --- Icons (UploadIcon, CheckCircleIcon, XCircleIcon, LoadingSpinner, SunIcon, MoonIcon) ---
// (Keep your existing icon definitions here - I'm omitting them for brevity)
const UploadIcon = () => (
  <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);
const XCircleIcon = () => (
  <svg className="w-5 h-5 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
);
const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const SunIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-5a1 1 0 01-.999.999H17a1 1 0 110-2h.001A1 1 0 0118 10zm-17 .001H3a1 1 0 110-2h-.001a1 1 0 110 2zM16.071 4.929a1 1 0 01.707.293l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414a1 1 0 01.707-1.707zm-12.142 9.142a1 1 0 01.707.293l1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414a1 1 0 01.707-1.707zM17.485 16.071a1 1 0 01-.001-1.415l1.414-1.414a1 1 0 111.414 1.414l-1.414 1.414a1 1 0 01-1.413-.001zM4.929 3.929a1 1 0 01-.001-1.415l1.414-1.414a1 1 0 111.414 1.414L4.928 5.343a1 1 0 01-1.413-.001zM10 5a5 5 0 100 10 5 5 0 000-10z"></path>
  </svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
);
// --- End Icons ---


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function MainContent() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { token } = useAuth();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setUploadSuccess(false);
    setFileError('');
    setSelectedFile(null);

    if (file) {
      const allowedExtensions = ['.pdf', '.docx', '.doc', '.xlsx', '.pptx', '.txt'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (allowedExtensions.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        setFileError('Invalid file type. Please select a PDF or DOCX file.');
      }
    }
  };

  const handleUploadAndTrain = async () => {
    if (!selectedFile) {
      setFileError('Please select a file first.');
      return;
    }

    setIsProcessing(true);
    setFileError('');
    setUploadSuccess(false);
    const originalFileNameAttempt = selectedFile.name;

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      console.log(`Uploading ${originalFileNameAttempt} to backend...`);
      const response = await fetch(`${BACKEND_URL}/api/upload-and-process`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const result = await response.json(); // Parse JSON regardless of response.ok status to get error message

      if (!response.ok) { // Check response.ok after parsing
        throw new Error(result.error || result.message || `Upload failed: ${response.statusText} (Status: ${response.status})`);
      }

      setIsProcessing(false);

      if (result.success && result.documentId) {
        setUploadSuccess(true);
        console.log('Backend processing successful:', result.message);
        setTimeout(() => {
          navigate('/result', {
            state: {
              fileDetails: { // This 'id' will now be the integer chat session ID from user_documents table
                name: result.filename,
                id: result.documentId 
              }
            }
          });
        }, 1500);
      } else {
        throw new Error(result.error || result.message || 'Backend indicated failure without specific error.');
      }

    } catch (error) {
      console.error('Upload or Processing failed:', error);
      setIsProcessing(false);
      setFileError(error.message || 'An unexpected error occurred during upload.');
    }
  };

  // --- NEW: Handler to navigate to chat history view ---
  const handleViewHistory = () => {
    navigate('/result', { state: { showHistoryList: true } });
  };

  return (
    <div className={`
        pt-20 sm:pt-24 md:pt-32 pb-20 px-4 min-h-[calc(100vh-80px)] // Adjusted padding top
        ${theme === 'dark' ? 'bg-neutral-900 text-neutral-200' : 'bg-gray-100 text-gray-800'}
        transition-colors duration-300 ease-in-out
      `}>

      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className={`
            p-2 rounded-full
            ${theme === 'dark' ? 'bg-zinc-700 hover:bg-zinc-600 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-indigo-600'}
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${theme === 'dark' ? 'focus:ring-offset-neutral-900 focus:ring-yellow-500' : 'focus:ring-offset-gray-100 focus:ring-indigo-500'}
            transition-colors duration-200
          `}
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Card container for the uploader */}
      <div className={`
          p-6 sm:p-8 rounded-xl shadow-2xl max-w-xl mx-auto
          ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'}
          transition-colors duration-300 ease-in-out
        `}>

        <h1 className={`
            text-2xl sm:text-3xl font-bold mb-3 text-center
            ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}
          `}>Document Upload</h1>
        <p className={`
            text-center mb-8 text-sm sm:text-base
            ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}
          `}>Upload your file to start a new chat.</p>

        {/* Custom File Input Area (same as before) */}
        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className={`
              relative flex flex-col items-center justify-center w-full h-48 sm:h-56
              border-2 border-dashed rounded-lg cursor-pointer
              transition-colors duration-200 ease-in-out group
              ${isProcessing ? 'cursor-wait' : ''}
              ${fileError
                ? (theme === 'dark' ? 'border-red-600 bg-red-900/20' : 'border-red-500 bg-red-50')
                : (selectedFile
                    ? (theme === 'dark' ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50')
                    : (theme === 'dark' ? 'border-zinc-600 hover:border-indigo-500 focus-within:border-indigo-500 bg-zinc-700/30 hover:bg-zinc-700/50' : 'border-gray-300 hover:border-indigo-500 focus-within:border-indigo-500 bg-gray-50 hover:bg-gray-100')
                  )
              }
            `}
          >
            <input
              id="file-upload"
              name="document" // Note: 'name' attribute is 'File' with capital F, usually lowercase 'file'
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.docx,.doc,.xlsx,.pptx,.txt"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
              {!selectedFile && !isProcessing && !uploadSuccess && <UploadIcon />}
              {isProcessing && <LoadingSpinner />}
              <p className={`
                  mb-2 text-sm font-semibold break-all
                  ${isProcessing
                    ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600')
                    : (uploadSuccess
                        ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                        : (selectedFile && !fileError
                            ? (theme === 'dark' ? 'text-green-400' : 'text-green-600')
                            : (theme === 'dark' ? 'text-zinc-400 group-hover:text-indigo-400' : 'text-gray-500 group-hover:text-indigo-500')
                          )
                      )
                  }
                `}>
                {isProcessing ? 'Processing file...' : (uploadSuccess ? 'Processing Complete!' : (selectedFile ? selectedFile.name : 'Click or drag PDF/DOCX file here'))}
              </p>
              {!selectedFile && !isProcessing && !uploadSuccess &&
                <p className={`${theme === 'dark' ? 'text-xs text-zinc-500' : 'text-xs text-gray-400'}`}>PDF, DOCX supported</p>
              }
              {selectedFile && !isProcessing && !uploadSuccess && !fileError &&
                <p className={`${theme === 'dark' ? 'text-xs text-green-500' : 'text-xs text-green-600'}`}>File selected. Ready to upload & process.</p>
              }
              {uploadSuccess && !isProcessing &&
                <p className={`${theme === 'dark' ? 'text-xs text-green-500' : 'text-xs text-green-600'}`}>Navigating to chat...</p>
              }
            </div>
          </label>
        </div>

        {/* Error Message Area */}
        {fileError && (
          <div role="alert" className={`
              mb-4 py-3 px-4 text-sm rounded-md flex items-center
              ${theme === 'dark' ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-red-100 border border-red-400 text-red-700'}
            `}>
            <XCircleIcon /> {fileError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleUploadAndTrain}
          disabled={!selectedFile || isProcessing || uploadSuccess}
          className={`
            w-full flex justify-center items-center font-semibold py-3 px-4 rounded-lg shadow-md
            transition-all duration-200 ease-in-out transform active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
            ${theme === 'dark'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-indigo-500 disabled:hover:bg-indigo-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 disabled:hover:bg-indigo-600'
            }
          `}
        >
          {isProcessing ? (
            <> <LoadingSpinner /> Processing... </>
          ) : (
            uploadSuccess ? 'Success! Redirecting...' : 'Upload and Process File'
          )}
        </button>

        {/* --- NEW: View Chat History Button --- */}
        <div className="mt-6 text-center">
            <button
                type="button"
                onClick={handleViewHistory}
                className={`
                    px-6 py-2.5 rounded-lg shadow-md font-medium
                    transition-all duration-200 ease-in-out transform active:scale-[0.98]
                    ${theme === 'dark'
                        ? 'bg-zinc-600 text-white hover:bg-zinc-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-zinc-500'
                        : 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500'
                    }
                `}
            >
                View Chat History
            </button>
        </div>

      </div>
    </div>
  );
}