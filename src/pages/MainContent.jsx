import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
// Assuming fetchGrokResponse exists for the actual API call later
// import fetchGrokResponse from '../api/api';

// --- Helper Icons (Replace with your preferred icon library like react-icons) ---
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

export default function MainContent() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // Combined upload/train state
  const [uploadSuccess, setUploadSuccess] = useState(false);
  // NOTE: Removed question/answer/loadingAnswer states as this component now focuses
  // purely on upload and then navigates away. If Q&A happens here, add them back.

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setUploadSuccess(false); // Reset status on new selection
    setFileError('');
    setSelectedFile(null); // Reset file state initially

    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      // Add mime types for .doc and .docx explicitly if needed, though the above usually cover them
      const allowedExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        setFileError('Invalid file type. Please select a PDF, DOC, or DOCX file.');
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
    const fileName = selectedFile.name;

    // --- SIMULATED API CALL ---
    // Replace this block with your actual API call logic
    console.log('Simulating upload and processing for:', fileName);
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate network delay
    const success = true; // Simulate API success/failure
    // --- End Simulation ---

    if (success) {
      setIsProcessing(false);
      setUploadSuccess(true);
      console.log('Simulated success, navigating...');
      // Delay navigation slightly to show the success message
      setTimeout(() => {
        navigate('/result', { state: { fileDetails: { name: fileName } } });
      }, 1500);
    } else {
      // Handle API errors
      setIsProcessing(false);
      setFileError('Failed to process the file. Please try again.');
    }
  };

  return (
    // Main container for the content area
    // Removed fixed positioning, added padding. Assumes parent handles centering/full width.
    // Adjust min-h based on your header/footer height if they are fixed/sticky.
    <div className="bg-neutral-900 text-neutral-200 pt-20 pb-12 px-4 min-h-[calc(100vh-80px)]"> {/* Example: 80px for header */}

      {/* Card container for the uploader */}
      <div className="bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-2xl max-w-xl mx-auto">

        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-center text-white">Document Upload</h1>
        <p className="text-zinc-400 text-center mb-8 text-sm sm:text-base">Upload a PDF, DOC, or DOCX file to analyze.</p>

        {/* Custom File Input Area */}
        <div className="mb-6">
          <label
            htmlFor="file-upload"
            className={`
              relative flex flex-col items-center justify-center w-full h-48 sm:h-56
              border-2 border-dashed rounded-lg cursor-pointer
              transition-colors duration-200 ease-in-out group
              ${fileError ? 'border-red-600 bg-red-900/20' : 'border-zinc-600 hover:border-indigo-500 focus-within:border-indigo-500 bg-zinc-700/30 hover:bg-zinc-700/50'}
              ${selectedFile ? 'border-green-500 bg-green-900/20' : ''}
            `}
          >
            {/* Hidden actual file input */}
            <input
              id="file-upload"
              name="File"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Hidden but covers the area
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={isProcessing}
            />

            {/* Visual Content */}
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              {!selectedFile && !isProcessing && <UploadIcon />}
              <p className={`mb-2 text-sm font-semibold ${selectedFile ? 'text-green-400' : 'text-zinc-400 group-hover:text-indigo-400'}`}>
                {isProcessing ? 'Processing...' : (selectedFile ? selectedFile.name : 'Click or drag file to upload')}
              </p>
              {!selectedFile && !isProcessing && <p className="text-xs text-zinc-500">PDF, DOC, DOCX (MAX. XM)</p>}
              {selectedFile && !isProcessing && !uploadSuccess &&
                <p className="text-xs text-green-500">File selected. Ready to upload.</p>
              }
              {isProcessing && <LoadingSpinner/>}

            </div>
          </label>
        </div>

        {/* Error Message Area */}
        {fileError && (
          <div role="alert" className="mb-4 py-3 px-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-md flex items-center">
            <XCircleIcon /> {fileError}
          </div>
        )}

        {/* Success Message Area */}
        {uploadSuccess && !isProcessing && (
          <div role="alert" className="mb-4 py-3 px-4 bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-md flex items-center">
            <CheckCircleIcon /> File processed successfully! Navigating...
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button" // Explicitly type="button"
          onClick={handleUploadAndTrain}
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
             uploadSuccess ? 'Success!' : 'Upload and Process File'
          )}
        </button>

      </div>
    </div>
  );
}