import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// --- Helper Icons (Keep these as they are) ---
const UploadIcon = () => (
  <svg className="mx-auto h-12 w-12 text-zinc-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
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
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
// --- End Helper Icons ---

// Define your Flask backend URL (replace if it's hosted elsewhere)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Use env variable or default

export default function MainContent() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setUploadSuccess(false); // Reset status on new selection
    setFileError('');
    setSelectedFile(null); // Reset file state initially

    if (file) {
      // We rely on Flask backend for stricter type validation now,
      // but basic frontend check is still good UX.
      const allowedExtensions = ['.pdf', '.docx']; // Adjusted to match Flask backend's current capability
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
    // Use selectedFile.name for potential display, but Flask response filename is source of truth
    const originalFileNameAttempt = selectedFile.name;

    // --- ACTUAL API CALL to Flask Backend ---
    const formData = new FormData();
    // 'document' must match the key expected by Flask's request.files['document']
    formData.append('document', selectedFile);

    try {
      console.log(`Uploading ${originalFileNameAttempt} to backend...`);
      const response = await fetch(`${BACKEND_URL}/api/upload-and-process`, {
        method: 'POST',
        body: formData,
        // 'Content-Type': 'multipart/form-data' is set automatically by browser for FormData
      });

      const result = await response.json(); // Attempt to parse JSON regardless of status

      if (!response.ok) {
        // Use error message from backend if available, otherwise use status text
        throw new Error(result.error || `Upload failed: ${response.statusText} (Status: ${response.status})`);
      }

      // --- End Actual API Call ---

      setIsProcessing(false);

      if (result.success && result.documentId) {
          setUploadSuccess(true);
          console.log('Backend processing successful:', result.message);
          // Delay navigation slightly to show the success message
          setTimeout(() => {
            // Navigate with the ID and filename returned by the backend
            navigate('/result', {
                state: {
                    fileDetails: {
                        name: result.filename, // Use filename from backend response
                        id: result.documentId   // Use documentId from backend response
                    }
                }
            });
          }, 1500);
      } else {
          // Handle cases where backend responds 2xx but indicates failure logically
           throw new Error(result.error || result.message || 'Backend indicated failure without specific error.');
      }

    } catch (error) {
      console.error('Upload or Processing failed:', error);
      setIsProcessing(false);
      // Display the error message caught from fetch/backend
      setFileError(error.message || 'An unexpected error occurred during upload.');
    }
  };

  return (
    // Main container for the content area
    <div className="bg-neutral-900 text-neutral-200 pt-20 pb-12 px-4 min-h-[calc(100vh-80px)]"> {/* Example: Adjust min-h based on header */}

      {/* Card container for the uploader */}
      <div className="bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-xl mx-auto">

        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-center text-white">Document Upload</h1>
        <p className="text-zinc-400 text-center mb-8 text-sm sm:text-base">Upload a PDF or DOCX file to analyze.</p>

        {/* Custom File Input Area */}
        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className={`
              relative flex flex-col items-center justify-center w-full h-48 sm:h-56
              border-2 border-dashed rounded-lg cursor-pointer
              transition-colors duration-200 ease-in-out group
              ${fileError ? 'border-red-600 bg-red-900/20' : 'border-zinc-600 hover:border-indigo-500 focus-within:border-indigo-500 bg-zinc-700/30 hover:bg-zinc-700/50'}
              ${selectedFile && !fileError ? 'border-green-500 bg-green-900/20' : ''}
              ${isProcessing ? 'cursor-wait' : ''}
            `}
          >
            {/* Hidden actual file input */}
            <input
              id="file-upload"
              name="File" // Name attribute can be useful but FormData key is what matters
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              // Adjust accept based on allowed extensions
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={isProcessing}
            />

            {/* Visual Content */}
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2"> {/* Added padding for long names */}
              {!selectedFile && !isProcessing && !uploadSuccess && <UploadIcon />}
              {isProcessing && <LoadingSpinner />}
              <p className={`mb-2 text-sm font-semibold break-all ${selectedFile && !fileError ? 'text-green-400' : 'text-zinc-400 group-hover:text-indigo-400'} ${isProcessing ? 'text-indigo-400' : ''}`}>
                 {isProcessing ? 'Processing file...' : (uploadSuccess ? 'Processing Complete!' : (selectedFile ? selectedFile.name : 'Click or drag PDF/DOCX file here'))}
              </p>
              {!selectedFile && !isProcessing && !uploadSuccess && <p className="text-xs text-zinc-500">PDF, DOCX supported</p>}
              {selectedFile && !isProcessing && !uploadSuccess && !fileError &&
                <p className="text-xs text-green-500">File selected. Ready to upload & process.</p>
              }
               {uploadSuccess && !isProcessing &&
                <p className="text-xs text-green-500">Navigating to chat...</p>
              }
            </div>
          </label>
        </div>

        {/* Error Message Area */}
        {fileError && (
          <div role="alert" className="mb-4 py-3 px-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-md flex items-center">
            <XCircleIcon /> {fileError}
          </div>
        )}

        {/* Success Message Area - Optional, as navigation happens */}
        {/* You might choose to remove this specific message if the button text + delayed navigation is enough feedback */}
        {/* {uploadSuccess && !isProcessing && (
          <div role="alert" className="mb-4 py-3 px-4 bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-md flex items-center">
            <CheckCircleIcon /> File processed successfully! Navigating...
          </div>
        )} */}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleUploadAndTrain}
          // Disable if no file, processing, or after successful upload (before navigate)
          disabled={!selectedFile || isProcessing || uploadSuccess}
          className={`
            w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-indigo-500
            transition-all duration-200 ease-in-out transform active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-indigo-600
          `}
        >
          {isProcessing ? (
            <> <LoadingSpinner /> Processing... </>
          ) : (
            uploadSuccess ? 'Success! Redirecting...' : 'Upload and Process File'
          )}
        </button>

      </div>
    </div>
  );
}