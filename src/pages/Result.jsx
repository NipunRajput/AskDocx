import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

// --- Reusable Icons (Keep these as they are) ---
const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
const XCircleIcon = () => (
    <svg className="w-5 h-5 mr-2 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
);
const PaperAirplaneIcon = () => ( // Icon for Send button
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path d="M3.105 3.105a.75.75 0 01.814-.132l14.686 4.895a.75.75 0 010 1.264l-14.686 4.895a.75.75 0 01-.814-.132l-.895-.895a.75.75 0 01.132-.814l6.036-6.036a.75.75 0 000-1.06l-6.036-6.036a.75.75 0 01-.132-.814l.895-.895z" />
      <path d="M16.75 7.99l-4.895-1.632a.75.75 0 01-.355-1.023l-.895-.895a.75.75 0 011.023-.355l6.527 2.176a.75.75 0 010 1.264l-6.527 2.176a.75.75 0 01-1.023-.355l.895-.895a.75.75 0 01.355-1.023l4.895-1.632z" />
    </svg>
);
// --- End Icons ---

// Define your Flask backend URL (replace if it's hosted elsewhere)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'; // Use env variable or default

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  // Expect state: { fileDetails: { name: 'filename.pdf', id: 'uuid-...' } }
  const fileDetails = location.state?.fileDetails;

  // State for the conversation history
  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Ref for scrolling the chat history
  const chatHistoryRef = useRef(null);

  // Effect to check for file details on load
  useEffect(() => {
    // Check for both name and the ID from the backend
    if (!fileDetails?.name || !fileDetails?.id) {
      console.error('Result page loaded without file details or ID.');
      setError('Document context missing or invalid. Please go back and upload a document first.');
      // Optional: Redirect back after a delay
      // const timer = setTimeout(() => navigate('/'), 3000);
      // return () => clearTimeout(timer); // Cleanup timer on unmount
    } else {
      console.log('File details received in Result:', fileDetails);
      // Add a welcoming message from the AI
      setConversation([
          { id: Date.now(), sender: 'ai', text: `File "${fileDetails.name}" processed! Ask me anything about its content.` }
      ]);
    }
    // Only run on initial load or if fileDetails/navigate changes (though navigate should be stable)
  }, [fileDetails, navigate]); // Include fileDetails and navigate

  // Effect to scroll chat history to the bottom when conversation updates
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSendMessage = async () => {
    const questionText = currentQuestion.trim();

    // Validation
    if (!fileDetails?.id) { // Check specifically for the ID needed by the backend
      setError('Cannot ask question: Document context ID is missing.');
      return;
    }
    if (!questionText) {
      setError('Please enter a question.');
      // Clear error after a delay?
      // setTimeout(() => setError(''), 3000);
      return;
    }

    // Add user's question to conversation
    const userMessage = { id: Date.now(), sender: 'user', text: questionText };
    setConversation(prev => [...prev, userMessage]);
    setCurrentQuestion(''); // Clear input field
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      // --- Call Flask Backend API to Ask Question ---
      console.log(`Sending question about doc ID ${fileDetails.id} to backend...`);
      const response = await fetch(`${BACKEND_URL}/api/ask-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: fileDetails.id, // Send the ID obtained from the upload step
          question: questionText
        }),
      });

      const result = await response.json(); // Attempt to parse JSON

      if (!response.ok) {
         // Use error message from backend if available
         throw new Error(result.error || `Backend request failed: ${response.statusText} (Status: ${response.status})`);
      }
      // --- End Backend API Call ---

      if (result.success && result.answer) {
          // Add AI's answer to conversation
          const aiMessage = { id: Date.now() + 1, sender: 'ai', text: result.answer }; // Ensure unique ID
          setConversation(prev => [...prev, aiMessage]);
      } else {
          // Handle cases where backend responds 2xx but indicates failure logically
          throw new Error(result.error || 'Backend did not provide a valid answer.');
      }

    } catch (err) {
      console.error("Error during question asking:", err);
      const errorMessage = `Sorry, I encountered an error: ${err.message || 'An unknown error occurred.'}`;
      setError(errorMessage); // Show error in the dedicated error area
      // Optionally add an error message to the chat flow too:
      // const errorMsg = { id: Date.now() + 1, sender: 'ai', text: errorMessage, isError: true };
      // setConversation(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press in textarea to send message
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, allow Shift+Enter for newline
      event.preventDefault(); // Prevent default newline insertion
      if (!isLoading && currentQuestion.trim()) {
          handleSendMessage();
      }
    }
  };

  // --- Auto-resize Textarea ---
  const textAreaRef = useRef(null);
  useEffect(() => {
    if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto'; // Reset height
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`; // Set to scroll height
    }
  }, [currentQuestion]); // Adjust height when text changes

  return (
    // Main container with padding and flex to fill height
    <div className="bg-neutral-900 text-neutral-200 pt-12 sm:pt-16 pb-6 px-4 flex flex-col h-screen"> {/* Use h-screen for full viewport height */}

      {/* Card container - make it grow and define its structure */}
      <div className="bg-zinc-800 rounded-xl shadow-xl max-w-4xl mx-auto w-full flex flex-col flex-grow overflow-hidden"> {/* Add overflow-hidden */}

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-700 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-white mb-1">Chat with Document</h1>
          {/* Display filename if available */}
          {fileDetails?.name && (
            <p className="text-xs sm:text-sm text-zinc-400 text-center break-all" title={fileDetails.name}>
              Context: <span className="font-medium text-zinc-300">{fileDetails.name}</span>
            </p>
          )}
           {/* Show error if file details were missing on load */}
           {!fileDetails?.id && error && (
                 <p className="text-xs text-red-400 text-center mt-1">{error}</p>
           )}
        </div>

        {/* Chat History Area - make it scrollable */}
        <div
          ref={chatHistoryRef}
          // Use flex-grow to take available space, add overflow-y-auto
          className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar"
          style={{ maxHeight: 'calc(100vh - 200px)' }} // Example constraint, adjust based on header/input height
          >
          {conversation.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-lg shadow ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-zinc-700 text-zinc-200 rounded-bl-none'
                } ${message.isError ? 'bg-red-800 border border-red-600' : ''}`} // Optional: Style error messages differently
              >
                {/* Use pre-wrap to respect newlines from API */}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {/* Loading indicator appears after the last message while waiting */}
          {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-700 text-zinc-400 p-3 rounded-lg shadow rounded-bl-none inline-flex items-center">
                    <LoadingSpinner /> Thinking...
                </div>
              </div>
          )}
        </div>

        {/* Input Area - fixed at the bottom */}
        <div className="p-4 sm:p-5 border-t border-zinc-700 flex-shrink-0">
          {/* Error Message Display */}
          {error && !isLoading && !fileDetails?.id && ( // Only show persistent load error here if needed
               <div role="alert" className="mb-3 py-2 px-3 bg-red-900/60 border border-red-700 text-red-300 text-sm rounded-md flex items-center">
                 <XCircleIcon />
                 <span className="ml-2">{error}</span>
               </div>
           )}
          {error && !isLoading && fileDetails?.id && ( // Show runtime errors here
               <div role="alert" className="mb-3 py-2 px-3 bg-red-900/60 border border-red-700 text-red-300 text-sm rounded-md flex items-center">
                 <XCircleIcon />
                 <span className="ml-2">{error}</span>
               </div>
           )}

          <div className="flex items-end space-x-2 sm:space-x-3">
            <textarea
              ref={textAreaRef} // Assign ref
              id="question"
              rows="1" // Start with 1 row
              className="flex-grow block w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md shadow-sm placeholder-zinc-400 text-white resize-none overflow-y-auto max-h-28 /* Limit max height */
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
                         disabled:opacity-70 custom-scrollbar"
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={handleKeyDown} // Added keydown handler
              placeholder={!fileDetails?.id ? "Upload a document first..." : "Ask something..."}
              disabled={isLoading || !fileDetails?.id} // Disable input while loading or if no file ID
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !fileDetails?.id || !currentQuestion.trim()}
              className={`
                flex-shrink-0 inline-flex justify-center items-center p-2.5 rounded-lg shadow-md
                bg-indigo-600 text-white font-semibold
                hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-indigo-500
                transition-all duration-200 ease-in-out transform active:scale-[0.95]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-indigo-600
              `}
              aria-label="Send message"
            >
              {isLoading ? (
                <LoadingSpinner /> // Show spinner inside button when loading
              ) : (
                <PaperAirplaneIcon /> // Use send icon
              )}
            </button>
          </div>
        </div>

      </div> {/* End Card */}
    </div> // End Main Container
  );
}