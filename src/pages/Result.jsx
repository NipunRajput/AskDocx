import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import fetchGrokResponse from '../api/api.js';

export default function Result() {
  const location = useLocation();
  const fileDetails = location.state?.fileDetails;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fileDetails && fileDetails.name) {
      console.log('File details received in Result:', fileDetails.name);
    } else {
      console.log('No file details received.');
    }
  }, [fileDetails]);

  const handleAskQuestion = async () => {
    if (!fileDetails?.name || !question.trim()) {
      setError('Please ensure a file was selected and you have asked a question.');
      return;
    }

    setLoadingAnswer(true);
    setError('');
    setAnswer('');

    try {
      const query = `Based on the content of the PDF file: "${fileDetails.name}", please answer the following question: "${question}"`;
      const response = await fetchGrokResponse(query);
      setAnswer(response);
    } catch (err) {
      setError(`Failed to get an answer: ${err.message}`);
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <>
      <div className="w-[100vw] h-[90vh] fixed bg-neutral-900 flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl font-bold mb-6">Ask Questions about the Document</h1>
        {fileDetails && fileDetails.name && (
          <p className="text-white mb-4">Document: <span className="font-semibold">{fileDetails.name}</span></p>
        )}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="mb-4 w-3/4 max-w-lg">
          <label htmlFor="question" className="block text-white text-sm font-bold mb-2">Your Question:</label>
          <input
            type="text"
            id="question"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question here"
          />
        </div>
        <button
          onClick={handleAskQuestion}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loadingAnswer}
        >
          {loadingAnswer ? 'Asking...' : 'Ask Question'}
        </button>
        {loadingAnswer && <p className="text-white mt-2">Loading answer...</p>}
        {answer && (
        //   <div className="mt-6 bg-black p-4 rounded shadow w-200 max-w-lg">
        //     <h3 className="font-semibold mb-2 text-white">Answer:</h3>
        //     <textarea className="text-xs h-40  text-white">{answer}</textarea>
        //   </div>
          <textarea className="text-xs h-40 text-white" rows="10" cols="200">{answer}</textarea>
        )}
      </div>
    </>
  );
}