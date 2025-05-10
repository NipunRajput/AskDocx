// src/pages/Result.jsx (or your path to Result.jsx)
// Purpose: Displays the chat interface for a processed document, allowing users to ask questions.
// Adapts to light and dark modes using ThemeContext.

import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../layout/ThemeContext'; // Adjust path if ThemeContext.js is elsewhere

// --- Reusable Icons (Keep these as they are) ---
const LoadingSpinner = ({ theme }) => ( // Accept theme prop for potential color adjustments
  <svg
    className={`animate-spin -ml-1 mr-3 h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-indigo-700'}`} // Example: Adjust color based on theme
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5 mr-2 inline-block flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
);

const PaperAirplaneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 sm:w-6 sm:h-6 transform rotate-45"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 19l9 2-9-18-9 18 9-2v-8"
    />
  </svg>
);

// --- End Icons ---

// Define your Flask backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Get theme from context
  const fileDetails = location.state?.fileDetails;

  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const chatHistoryRef = useRef(null);
  const textAreaRef = useRef(null);

  // Effect to check for file details on load
  useEffect(() => {
    if (!fileDetails?.name || !fileDetails?.id) {
      console.error('Result page loaded without file details or ID.');
      setError('Document context missing or invalid. Please go back and upload a document first.');
      // Optional: Redirect back after a delay
      // const timer = setTimeout(() => navigate('/'), 3000);
      // return () => clearTimeout(timer);
    } else {
      console.log('File details received in Result:', fileDetails);
      setConversation([
        { id: Date.now(), sender: 'ai', text: `File "${fileDetails.name}" processed! Ask me anything about its content.` }
      ]);
    }
  }, [fileDetails, navigate]);

  // Effect to scroll chat history to the bottom
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversation]);

  // Handle sending a message
  const handleSendMessage = async () => {
    const questionText = currentQuestion.trim();

    if (!fileDetails?.id) {
      setError('Cannot ask question: Document context ID is missing.');
      return;
    }
    if (!questionText) {
      setError('Please enter a question.');
      setTimeout(() => setError(''), 3000); // Clear error after 3s
      return;
    }

    const userMessage = { id: Date.now(), sender: 'user', text: questionText };
    setConversation(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ask-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: fileDetails.id, question: questionText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Backend request failed: ${response.statusText} (Status: ${response.status})`);
      }

      if (result.success && result.answer) {
        const aiMessage = { id: Date.now() + 1, sender: 'ai', text: result.answer };
        setConversation(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || 'Backend did not provide a valid answer.');
      }
    } catch (err) {
      console.error("Error during question asking:", err);
      const errorMessage = `Sorry, I encountered an error: ${err.message || 'An unknown error occurred.'}`;
      setError(errorMessage);
      // Optionally add an error message to the chat flow too:
      // const errorMsgToChat = { id: Date.now() + 1, sender: 'ai', text: errorMessage, isError: true };
      // setConversation(prev => [...prev, errorMsgToChat]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press in textarea
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && currentQuestion.trim()) {
        handleSendMessage();
      }
    }
  };

  // Auto-resize Textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 112)}px`; // 112px is max-h-28
    }
  }, [currentQuestion]);

  return (
    <div className={`
        pt-12 sm:pt-16 pb-6 px-4 flex flex-col h-screen
        transition-colors duration-300 ease-in-out
        ${theme === 'dark' ? 'bg-neutral-900 text-neutral-200' : 'bg-gray-100 text-gray-800'}
    `}>
      <div className={`
          rounded-xl shadow-xl max-w-4xl mx-auto w-full flex flex-col flex-grow overflow-hidden
          transition-colors duration-300 ease-in-out
          ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'}
      `}>
        {/* Header */}
        <div className={`
            p-4 sm:p-5 flex-shrink-0
            transition-colors duration-300 ease-in-out
            ${theme === 'dark' ? 'border-b border-zinc-700' : 'border-b border-gray-200'}
        `}>
          <h1 className={`
              text-xl sm:text-2xl font-bold text-center mb-1
              ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}
          `}>Chat with Document</h1>
          {fileDetails?.name && (
            <p className={`
                text-xs sm:text-sm text-center break-all
                ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}
            `} title={fileDetails.name}>
              Context: <span className={theme === 'dark' ? 'font-medium text-zinc-300' : 'font-medium text-zinc-700'}>{fileDetails.name}</span>
            </p>
          )}
          {!fileDetails?.id && error && (
            <p className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          )}
        </div>

        {/* Chat History Area */}
        <div
          ref={chatHistoryRef}
          className={`
            flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto
            ${theme === 'dark' ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}
          `}
          // A fixed maxHeight might be needed if the outer container doesn't constrain height properly.
          // style={{ maxHeight: 'calc(100vh - 220px)' }} // Adjust this value based on your header/footer/input heights
        >
          {conversation.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`
                  max-w-[85%] sm:max-w-[75%] p-3 rounded-lg shadow
                  ${message.sender === 'user'
                    ? (theme === 'dark' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-indigo-500 text-white rounded-br-none')
                    : (theme === 'dark' ? 'bg-zinc-700 text-zinc-200 rounded-bl-none' : 'bg-gray-200 text-gray-800 rounded-bl-none')
                  }
                  ${message.isError ? (theme === 'dark' ? 'bg-red-800 border border-red-600' : 'bg-red-200 border border-red-400 text-red-700') : ''}
                `}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`
                  p-3 rounded-lg shadow rounded-bl-none inline-flex items-center
                  ${theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-600'}
              `}>
                <LoadingSpinner theme={theme} /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`
            p-4 sm:p-5 flex-shrink-0
            transition-colors duration-300 ease-in-out
            ${theme === 'dark' ? 'border-t border-zinc-700' : 'border-t border-gray-200'}
        `}>
          {/* Error Message Display for runtime errors */}
          {error && fileDetails?.id && (
            <div role="alert" className={`
                mb-3 py-2 px-3 text-sm rounded-md flex items-center
                ${theme === 'dark' ? 'bg-red-900/60 border border-red-700 text-red-300' : 'bg-red-100 border border-red-400 text-red-700'}
            `}>
              <XCircleIcon />
              <span className="ml-2">{error}</span>
            </div>
          )}

          <div className="flex items-end space-x-2 sm:space-x-3">
            <textarea
              ref={textAreaRef}
              id="question"
              rows="1"
              className={`
                flex-grow block w-full px-3 py-2.5 rounded-md shadow-sm resize-none overflow-y-auto max-h-28
                sm:text-sm disabled:opacity-70
                transition-colors duration-300 ease-in-out
                ${theme === 'dark'
                  ? 'bg-zinc-700 border border-zinc-600 placeholder-zinc-400 text-white focus:ring-offset-zinc-800 focus:ring-indigo-500 focus:border-indigo-500 custom-scrollbar-dark'
                  : 'bg-gray-50 border border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-offset-gray-100 focus:ring-indigo-500 focus:border-indigo-500 custom-scrollbar-light'
                }
                focus:outline-none focus:ring-2 
              `}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!fileDetails?.id ? "Upload a document first..." : "Ask something..."}
              disabled={isLoading || !fileDetails?.id}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !fileDetails?.id || !currentQuestion.trim()}
              className={`
                flex-shrink-0 inline-flex justify-center items-center p-2.5 rounded-lg shadow-md
                font-semibold
                transition-all duration-200 ease-in-out transform active:scale-[0.95]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                ${theme === 'dark'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-offset-zinc-800 focus:ring-indigo-500 disabled:hover:bg-indigo-600'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-offset-gray-100 focus:ring-indigo-500 disabled:hover:bg-indigo-500'
                }
                focus:outline-none focus:ring-2
              `}
              aria-label="Send message"
            >
              {isLoading ? (
                <LoadingSpinner theme={theme} />
              ) : (
                <PaperAirplaneIcon />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
