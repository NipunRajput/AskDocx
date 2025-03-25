import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
export default function MainContent(){
        const navigate = useNavigate();
        const [selectedFile, setSelectedFile] = useState(null);
        const [fileError, setFileError] = useState('');
    
        const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf'];
            if (allowedTypes.includes(file.type)) {
            setSelectedFile(file);
            setFileError('');
            } else {
            setSelectedFile(null);
            setFileError('Please select a PDF file.');
            }
        } else {
            setSelectedFile(null);
            setFileError(''); 
        }
        };
    
        const handleClick = () => {
        if (!selectedFile) {
            alert('Please select a PDF file before submitting.');
            return;
        }
        navigate('/result');
        };
    return(
        <>
        <div className="w-[100vw] h-[90vh] fixed bg-neutral-900">
            <h1 className="text-white font-bold font-serif text-center mt-65 text-3xl cursor-pointer">Upload any Document and ask questions</h1>
            <label className='text-white mt-5 flex justify-center cursor-pointer' htmlFor="File">Select a File from the system</label>
            <input type="file" name="File" accept='application/pdf' className="bg-white mt-4 block mr-auto ml-auto cursor-pointer" onChange={handleFileChange}/>
            {fileError && <p className="text-red-500 text-sm mt-1 text-center">{fileError}</p>}
            <button onClick={handleClick} className='bg-white p-2 w-3xs cursor-pointer block ml-auto mt-15 rounded-lg mr-auto active:cursor-wait hover:bg-amber-50'>Submit</button>
        </div>
        </>
    );
}