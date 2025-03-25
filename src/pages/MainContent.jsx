import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import fetchGrokResponse from '../api/api';

export default function MainContent() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
        setFileError('');
        setUploadSuccess(false);
        setErrorMessage('');
        setAnswer('');
      } else {
        setSelectedFile(null);
        setFileError('Please select a PDF, DOC, or DOCX file.');
      }
    } else {
      setSelectedFile(null);
      setFileError('');
      setUploadSuccess(false);
      setErrorMessage('');
      setAnswer('');
    }
  };

  const handleUploadAndTrain = async () => {
    if (!selectedFile) {
      alert('Please select a PDF, DOC, or DOCX file before submitting.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setUploadSuccess(false);
    setAnswer('');
    setTraining(true);

    const fileName = selectedFile.name;

    // In a real application, you would make an API call here
    // to upload and potentially train the file with the Groq API.
    // This is a placeholder for that logic.

    // Example of how you might pass file information to the next page:
    setUploading(false);
    setTraining(false);
    setUploadSuccess(true);
    navigate('/result', { state: { fileDetails: { name: fileName } } });
  };

  const handleAskQuestion = async () => {
    if (!selectedFile) {
      alert('Please select a PDF, DOC, or DOCX file first.');
      return;
    }
    if (!question.trim()) {
      alert('Please enter a question.');
      return;
    }

    setLoadingAnswer(true);
    setErrorMessage('');
    setAnswer('');

    try {
      const query = `Based on the content of the document "${selectedFile.name}", please answer the following question: "${question}"`;
      const response = await fetchGrokResponse(query);
      setAnswer(response);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to get an answer.');
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <>
      <div className="w-[100vw] h-[90vh] fixed bg-neutral-900 flex flex-col items-center justify-center">
        <h1 className="text-white text-2xl font-bold mb-6">Upload any Document and ask questions</h1>
        <label className="text-white mt-5 flex justify-center cursor-pointer" htmlFor="File">
          Select a File from the system
        </label>
        <input
          type="file"
          name="File"
          accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="bg-white mt-4 block mr-auto ml-auto cursor-pointer"
          onChange={handleFileChange}
        />
        {fileError && <p className="text-red-500 text-sm mt-1 text-center">{fileError}</p>}
        {uploading && <p className="text-white text-sm mt-2 text-center">Uploading file (simulated)...</p>}
        {training && <p className="text-white text-sm mt-1 text-center">Processing document...</p>}
        {uploadSuccess && (
          <p className="text-green-500 text-sm mt-2 text-center">
            File selected. You can now ask questions on the next page.
          </p>
        )}
        {errorMessage && <p className="text-red-500 text-sm mt-2 text-center">{errorMessage}</p>}
        <button
          onClick={handleUploadAndTrain}
          className="bg-white p-2 w-3xs cursor-pointer block ml-auto mt-15 rounded-lg mr-auto active:cursor-wait hover:bg-amber-50"
        >
          Submit
        </button>
      </div>
    </>
  );
}