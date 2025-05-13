// src/pages/Result.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../layout/ThemeContext';
import { useAuth } from '../auth/AuthContext';

// --- Reusable Icons (Keep these as they are) ---
const LoadingSpinner = ({ theme }) => (
  <svg
    className={`animate-spin -ml-1 mr-3 h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-indigo-700'}`}
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

const DocumentTextIcon = () => ( // Icon for chat history items
    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
    </svg>
);
// --- End Icons ---

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { token } = useAuth();

  // State for the active chat
  const [activeChatDetails, setActiveChatDetails] = useState(location.state?.fileDetails || null);
  const [conversation, setConversation] = useState([]);
  
  // State for the list of all chat sessions
  const [userChatSessions, setUserChatSessions] = useState([]);
  const [isLoadingChatList, setIsLoadingChatList] = useState(false);
  const [chatListError, setChatListError] = useState('');

  // State for user input and general loading/error
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false); // For sending message
  const [error, setError] = useState(''); // For errors during send message or initial load

  const chatHistoryRef = useRef(null);
  const textAreaRef = useRef(null);

  // --- EFFECTS ---

  // 1. Fetch the list of all user chat sessions on component mount
  useEffect(() => {
    const fetchUserChatSessions = async () => {
      if (!token) return;
      setIsLoadingChatList(true);
      setChatListError('');
      try {
        const response = await fetch(`${BACKEND_URL}/api/user-documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch chat sessions.');
        }
        setUserChatSessions(result.documents || []);
      } catch (err) {
        console.error('Error fetching user chat sessions:', err);
        setChatListError(err.message);
      } finally {
        setIsLoadingChatList(false);
      }
    };
    fetchUserChatSessions();
  }, [token]);

  // 2. Load conversation for the active chat session
  useEffect(() => {
    const loadChatConversation = async () => {
      if (!activeChatDetails?.id || !token) {
        if (!location.state?.fileDetails) { // Only show error if no initial chat was even intended
            setError('Document context missing. Please upload a document or select a chat.');
        }
        setConversation([]); // Clear conversation if no active chat
        return;
      }

      setIsLoading(true); // Use main isLoading for conversation loading
      setError('');
      try {
        const response = await fetch(`${BACKEND_URL}/api/user-documents/${activeChatDetails.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || `Failed to load chat session (ID: ${activeChatDetails.id}).`);
        }
        setConversation(result.document_session?.chat_history || []);
      } catch (err) {
        console.error('Error loading chat conversation:', err);
        setError(err.message);
        setConversation([]); // Clear conversation on error
      } finally {
        setIsLoading(false);
      }
    };

    if (activeChatDetails?.id) {
        loadChatConversation();
    } else if (!location.state?.fileDetails && userChatSessions.length > 0) {
        // If no specific chat is loaded and we have sessions, maybe load the latest one?
        // For now, let's require explicit selection or initial state.
        // setActiveChatDetails({ id: userChatSessions[0].id, name: userChatSessions[0].document_name });
    } else if (!location.state?.fileDetails) {
         setError('No document loaded. Upload a new document or select one from your history.');
    }

  }, [activeChatDetails, token]); // Re-run when activeChatDetails or token changes


  // 3. Scroll chat history to the bottom
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversation]);

  // 4. Auto-resize Textarea
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 112)}px`; // max-h-28
    }
  }, [currentQuestion]);


  // --- HANDLERS ---

  // Handle selecting a chat session from the list
  const handleSelectChatSession = (session) => {
    setActiveChatDetails({ id: session.id, name: session.document_name });
    // Optionally, update URL though not strictly necessary if state drives everything
    // navigate(`/result/${session.id}`, { state: { fileDetails: { id: session.id, name: session.document_name } } });
    // If navigating, the useEffect for activeChatDetails will trigger reload.
    // If not navigating, make sure loadChatConversation is called.
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    const questionText = currentQuestion.trim();

    if (!activeChatDetails?.id) {
      setError('Cannot ask question: No active document session. Please select one.');
      return;
    }
    if (!questionText) {
      setError('Please enter a question.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const userMessage = { sender: 'user', text: questionText }; // Backend assigns IDs/timestamps
    setConversation(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ask-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId: activeChatDetails.id, question: questionText }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Backend request failed: ${response.statusText} (Status: ${response.status})`);
      }

      if (result.success && result.answer) {
        const aiMessage = { sender: 'ai', text: result.answer };
        // The backend now stores the full history. For UI consistency after send,
        // we can either append locally (as done here) or re-fetch the whole conversation.
        // Appending locally is faster for UI, but re-fetching guarantees sync.
        setConversation(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || 'Backend did not provide a valid answer.');
      }
    } catch (err) {
      console.error("Error during question asking:", err);
      const errorMessage = `Sorry, I encountered an error: ${err.message || 'An unknown error occurred.'}`;
      setError(errorMessage);
      // Revert optimistic user message update or show error in chat
      setConversation(prev => prev.slice(0, -1)); // Remove optimistic user message
      const errorMsgToChat = { sender: 'ai', text: errorMessage, isError: true };
      setConversation(prev => [...prev, errorMsgToChat]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && currentQuestion.trim() && activeChatDetails?.id) {
        handleSendMessage();
      }
    }
  };

  // --- RENDER ---
  return (
    <div className={`pt-12 sm:pt-16 pb-6 px-4 flex flex-col md:flex-row h-screen
                     transition-colors duration-300 ease-in-out
                     ${theme === 'dark' ? 'bg-neutral-900 text-neutral-200' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* Chat History Sidebar/List */}
      <div className={`
        w-full md:w-1/4 lg:w-1/5 p-4 flex-shrink-0 md:mr-4 mb-4 md:mb-0 rounded-lg shadow-lg overflow-y-auto
        ${theme === 'dark' ? 'bg-zinc-800 custom-scrollbar-dark' : 'bg-white border border-gray-200 custom-scrollbar-light'}
        md:max-h-[calc(100vh-6rem)] /* Adjust based on your pt value */
      `}>
        <h2 className={`text-lg font-semibold mb-3 pb-2 border-b 
                       ${theme === 'dark' ? 'text-white border-zinc-700' : 'text-zinc-900 border-gray-300'}`}>
          My Chats
        </h2>
        {isLoadingChatList && <div className="p-2 text-sm">Loading chats... <LoadingSpinner theme={theme} /></div>}
        {chatListError && <div className={`p-2 text-sm rounded ${theme === 'dark' ? 'bg-red-800 text-red-300' : 'bg-red-100 text-red-700'}`}>{chatListError}</div>}
        {!isLoadingChatList && !chatListError && userChatSessions.length === 0 && (
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>No saved chats yet.</p>
        )}
        <ul className="space-y-2">
          {userChatSessions.map(session => (
            <li key={session.id}>
              <button
                onClick={() => handleSelectChatSession(session)}
                title={`Load chat for ${session.document_name}\nLast updated: ${new Date(session.updated_at).toLocaleString()}`}
                className={`
                  w-full text-left p-2.5 rounded-md text-sm flex items-center
                  transition-colors duration-150 ease-in-out
                  ${activeChatDetails?.id === session.id
                    ? (theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white')
                    : (theme === 'dark' ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-gray-200 text-gray-700')
                  }
                `}
              >
                <DocumentTextIcon />
                <span className="truncate flex-grow">{session.document_name}</span>
                 {activeChatDetails?.id === session.id && <span className="ml-2 text-xs opacity-80">(Active)</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div className={`
        rounded-xl shadow-xl w-full md:flex-1 flex flex-col flex-grow overflow-hidden
        transition-colors duration-300 ease-in-out
        ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white border border-gray-200'}
      `}>
        {/* Header */}
        <div className={`p-4 sm:p-5 flex-shrink-0 transition-colors duration-300 ease-in-out
                        ${theme === 'dark' ? 'border-b border-zinc-700' : 'border-b border-gray-200'}`}>
          <h1 className={`text-xl sm:text-2xl font-bold text-center mb-1
                          ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            Chat with Document
          </h1>
          {activeChatDetails?.name && (
            <p className={`text-xs sm:text-sm text-center break-all
                           ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`} title={activeChatDetails.name}>
              Context: <span className={theme === 'dark' ? 'font-medium text-zinc-300' : 'font-medium text-zinc-700'}>{activeChatDetails.name}</span>
            </p>
          )}
           {(!activeChatDetails?.id || error) && ( // Show general error if no active chat OR an error occurred
            <p className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          )}
        </div>

        {/* Chat History */}
        <div ref={chatHistoryRef} className={`flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto
                                             ${theme === 'dark' ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}>
          {conversation.map((message, index) => ( // Added index for key if message IDs aren't unique enough temporarily
            <div key={message.id || `${message.sender}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] p-3 rounded-lg shadow
                              ${message.sender === 'user'
                                ? (theme === 'dark' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-indigo-500 text-white rounded-br-none')
                                : (message.isError // Check if it's an error message from AI side
                                    ? (theme === 'dark' ? 'bg-red-800/80 text-red-200 rounded-bl-none' : 'bg-red-100 text-red-700 rounded-bl-none border border-red-300')
                                    : (theme === 'dark' ? 'bg-zinc-700 text-zinc-200 rounded-bl-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'))
                              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && conversation.length > 0 && conversation[conversation.length-1].sender === 'user' && ( // Show thinking only if user just sent message
            <div className="flex justify-start">
              <div className={`p-3 rounded-lg shadow rounded-bl-none inline-flex items-center
                              ${theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-600'}`}>
                <LoadingSpinner theme={theme} /> Thinking...
              </div>
            </div>
          )}
           {isLoading && conversation.length === 0 && activeChatDetails?.id && ( // Show thinking if loading initial conversation
             <div className="flex justify-center items-center h-full">
                <div className={`p-3 rounded-lg shadow inline-flex items-center
                                ${theme === 'dark' ? 'bg-zinc-700 text-zinc-400' : 'bg-gray-200 text-gray-600'}`}>
                    <LoadingSpinner theme={theme} /> Loading conversation...
                </div>
            </div>
           )}
        </div>

        {/* Input Area */}
        <div className={`p-4 sm:p-5 flex-shrink-0 transition-colors duration-300 ease-in-out
                        ${theme === 'dark' ? 'border-t border-zinc-700' : 'border-t border-gray-200'}`}>
          {error && activeChatDetails?.id && ( // Show specific API call errors here
            <div role="alert" className={`mb-3 py-2 px-3 text-sm rounded-md flex items-center
                                          ${theme === 'dark' ? 'bg-red-900/60 border border-red-700 text-red-300' : 'bg-red-100 border border-red-400 text-red-700'}`}>
              <XCircleIcon />
              <span className="ml-2">{error}</span>
            </div>
          )}
          <div className="flex items-end space-x-2 sm:space-x-3">
            <textarea
              ref={textAreaRef}
              id="question"
              rows="1"
              className={`flex-grow block w-full px-3 py-2.5 rounded-md shadow-sm resize-none overflow-y-auto max-h-28 sm:text-sm disabled:opacity-70 transition-colors duration-300 ease-in-out
                          ${theme === 'dark'
                            ? 'bg-zinc-700 border border-zinc-600 placeholder-zinc-400 text-white focus:ring-offset-zinc-800 focus:ring-indigo-500 focus:border-indigo-500 custom-scrollbar-dark'
                            : 'bg-gray-50 border border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-offset-gray-100 focus:ring-indigo-500 focus:border-indigo-500 custom-scrollbar-light'
                          } focus:outline-none focus:ring-2`}
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={!activeChatDetails?.id ? "Select a chat or upload a document..." : "Ask something..."}
              disabled={isLoading || !activeChatDetails?.id}
            />
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isLoading || !activeChatDetails?.id || !currentQuestion.trim()}
              className={`flex-shrink-0 inline-flex justify-center items-center p-2.5 rounded-lg shadow-md font-semibold transition-all duration-200 ease-in-out transform active:scale-[0.95] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                          ${theme === 'dark'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-offset-zinc-800 focus:ring-indigo-500 disabled:hover:bg-indigo-600'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-offset-gray-100 focus:ring-indigo-500 disabled:hover:bg-indigo-500'
                          } focus:outline-none focus:ring-2`}
              aria-label="Send message"
            >
              {isLoading && conversation[conversation.length-1]?.sender === 'user' ? <LoadingSpinner theme={theme} /> : <PaperAirplaneIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}