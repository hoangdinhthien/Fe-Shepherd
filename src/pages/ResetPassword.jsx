import { useState } from 'react';
import HeaderLogo from '../assets/header-logo-img.png';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // ...API call to reset password...
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-screen bg-gray-300'>
      {/* HEADER */}
      <header className='bg-amber-400 shadow-md pr-4 pl-24 py-2 border-b border-blue-gray-700'>
        <div className='flex gap-x-4 items-center justify-start'>
          <img
            src={HeaderLogo}
            alt=''
            className='cursor-pointer duration-300 h-14 w-14'
          />
          <h1 className='font-extrabold uppercase text-3xl'>Shepherd</h1>
        </div>
      </header>
      {/* MAIN CONTENT */}
      <div className='p-2 pt-20 max-w-2xl mx-auto'>
        <h1 className='text-3xl text-center font-semibold my-8'>
          Đặt Lại Mật Khẩu
        </h1>
        <form
          className='flex flex-col gap-6'
          onSubmit={handleReset}
        >
          <input
            type='email'
            placeholder='Nhập email của bạn'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='border border-gray-500 p-3 rounded-lg'
          />
          <button
            type='submit'
            className='bg-blue-gray-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Gửi Email Khôi Phục'}
          </button>
          {error && <p className='text-red-500 text-center'>{error}</p>}
        </form>
      </div>
    </div>
  );
}
