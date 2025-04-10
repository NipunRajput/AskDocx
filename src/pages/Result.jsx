import { useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useEffect, useState } from 'react';
// Assuming fetchGrokResponse exists and works
import fetchGrokResponse from '../api/api.js';

// --- Reusable Icons (Import or define as needed) ---
const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
const XCircleIcon = () => (
  <svg className="w-5 h-5 mr-2 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
);
// --- End Icons ---

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const fileDetails = location.state?.fileDetails;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If no file details are passed, show an error and maybe redirect
    if (!fileDetails?.name) {
      console.error('Result page loaded without file details.');
      setError('No document selected. Please go back and upload a document first.');
      // Optional: Redirect back to upload page after a delay
      // setTimeout(() => navigate('/'), 3000);
    } else {
      console.log('File details received in Result:', fileDetails.name);
    }
  }, [fileDetails, navigate]); // Added navigate dependency

  const handleAskQuestion = async () => {
    // Basic validation
    if (!fileDetails?.name) {
      setError('Cannot ask question: Document context is missing.');
      return;
    }
    if (!question.trim()) {
      setError('Please enter a question.');
      return;
    }

    setLoadingAnswer(true);
    setError('');
    setAnswer(''); // Clear previous answer

    try {
      // Construct the query for the API
      // Adjust the prompt based on how your API expects it
      const query = `Based on the document "${fileDetails.name}", answer the following question: "${question}"`;
      console.log("Sending query:", query);

      const response = await fetchGrokResponse(query); // Call your API function

      if (typeof response !== 'string') {
         // Handle cases where API might not return a simple string if applicable
         console.warn("API response might not be a string:", response);
         setAnswer(JSON.stringify(response, null, 2)); // Display raw JSON as fallback
      } else {
         setAnswer(response);
      }

    } catch (err) {
      console.error("API Error:", err);
      setError(`Failed to get answer: ${err.message || 'An unknown error occurred.'}`);
      setAnswer(''); // Ensure answer is cleared on error
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    // Main container - uses padding for spacing from header/footer
    // This assumes App.jsx has flex-grow on the <main> tag wrapping Routes
    <div className="text-neutral-200 pt-12 sm:pt-16 pb-12 px-4">

      {/* Card container for better structure */}
      <div className="bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-xl max-w-4xl mx-auto"> {/* Increased max-w */}

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-white">Ask About Your Document</h1>
        {fileDetails?.name && (
          <p className="text-sm text-zinc-400 text-center mb-8">
            Document: <span className="font-medium text-zinc-300 break-all">{fileDetails.name}</span> {/* Added break-all */}
          </p>
        )}

        {/* Question Input Section */}
        <div className="mb-5">
          <label htmlFor="question" className="block text-sm font-medium text-zinc-300 mb-1">
            Your Question
          </label>
          {/* Using textarea allows for longer questions */}
          <textarea
            id="question"
            rows="3" // Adjust rows as needed
            className="block w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md shadow-sm placeholder-zinc-400 text-white
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                       disabled:opacity-70"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., What are the key findings mentioned in the report?"
            disabled={loadingAnswer} // Disable input while loading
          />
        </div>

        {/* Error Message Display */}
        {error && (
          <div role="alert" className="mb-4 py-3 px-4 bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-md flex items-start">
            <XCircleIcon />
            <span className="ml-2">{error}</span> {/* Ensure icon and text align nicely */}
          </div>
        )}

        {/* Ask Button */}
        <button
          type="button"
          onClick={handleAskQuestion}
          // Disable button if loading, error state prevents submission, no file, or empty question
          disabled={loadingAnswer || !fileDetails?.name || !question.trim()}
          className={`
            w-full flex justify-center items-center bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md
            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-indigo-500
            transition-all duration-200 ease-in-out transform active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-indigo-600
          `}
        >
          {loadingAnswer ? (
            <> <LoadingSpinner /> Asking... </>
          ) : (
            'Ask Question'
          )}
        </button>

        {/* Divider and Answer Area - only show if loading or answer exists */}
        {(loadingAnswer || answer) && <hr className="my-8 border-zinc-700" />}

        {/* Loading Indicator for Answer */}
        {loadingAnswer && (
          <div className="text-center py-4">
            <LoadingSpinner />
            <p className="text-zinc-400 text-sm mt-2">Fetching answer from AI...</p>
          </div>
        )}

        {/* Answer Display Area - only show if answer exists and not loading */}
        {answer && !loadingAnswer && (
          <div className="space-y-3"> {/* Add space between title and content */}
            <h3 className="text-lg font-semibold text-white">Answer:</h3>
            {/* Style the container for the answer */}
            <div className="bg-zinc-900 p-4 rounded-md border border-zinc-700 max-h-[50vh] overflow-y-auto custom-scrollbar"> {/* Added max-h and overflow */}
              {/* `whitespace-pre-wrap` preserves line breaks/spaces from the API and wraps text */}
              {/* `font-mono` can be good for code or structured text, optional otherwise */}
              <p className="text-zinc-200 text-sm whitespace-pre-wrap font-mono">
                {answer}
              </p>
            </div>
          </div>
        )}

      </div> {/* End Card */}
    </div> // End Main Container
  );
}

// Optional: Add custom scrollbar styles in your global CSS if desired
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #27272a; // zinc-800
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #52525b; // zinc-600
  border-radius: 4px;
  border: 2px solid #27272a; // zinc-800
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #71717a; // zinc-500
}
*/