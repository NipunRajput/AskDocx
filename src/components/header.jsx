import '../assets/1.png';
export default function Header(){
    return(
        <>
        <div className='bg-zinc-800 box-border top-0 fixed w-full z-1'>
            <img className='w-3xs pl-10 mt-10 pb-10 cursor-pointer' src="src/assets/1.png" alt="Logo" />
        </div>
        </>
    );
}