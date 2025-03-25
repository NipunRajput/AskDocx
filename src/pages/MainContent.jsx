import { useNavigate } from 'react-router-dom';
export default function MainContent(){
        const navigate=useNavigate();
        const handleClick=()=>{
            navigate('/Result');
        }
    return(
        <>
        <div className="w-[100vw] h-[90vh] fixed bg-neutral-900">
            <h1 className="text-white font-bold font-serif text-center mt-65 text-3xl cursor-pointer">Upload any Document and ask questions</h1>
            <label className='text-white mt-5 flex justify-center cursor-pointer' htmlFor="File">Select a File from the system</label>
            <input type="file" name="File" accept='file/pdf' className="bg-white mt-4 block mr-auto ml-auto cursor-pointer" />
            <button onClick={handleClick} className='bg-white p-2 w-3xs cursor-pointer block ml-auto mt-15 rounded-lg mr-auto active:cursor-wait hover:bg-amber-50'>Submit</button>
        </div>
        </>
    );
}