import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthAPI from '../apis/auth_api';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import storageService from '../config/local_storage';
import { useDispatch } from 'react-redux';
import { logIn } from '../redux/user/userSlice';
import { jwtDecode } from 'jwt-decode';
import HeaderLogo from '../assets/header-logo-img.png';
import welcomeImg from '../assets/welcome-img.png';

export default function SignIn() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Toggle the visibility state
  };

  const login = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await AuthAPI.login({
        username: formData.username.trim(),
        password: formData.password.trim(),
      });

      const token = res.data.token;
      storageService.setAccessToken(token);

      const decodedUser = jwtDecode(token);
      console.log('Decoded User:', decodedUser);

      dispatch(logIn(res.data));

      const isGroupLeader = res.data.listGroupRole.some(
        (role) => role.roleName === 'Trưởng nhóm'
      );

      console.log(`res.data`, res.data);
      console.log(`isGroupLeader`, isGroupLeader);

      if (isGroupLeader) {
        navigate('/user/dashboard');
      } else {
        navigate('/user/home', { state: { welcomeImg } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full h-screen bg-gray-300'>
      {/* HEADER */}
      <header
        className={` bg-amber-400 shadow-md shadow-slate-300 pr-4 pl-24 py-2 border-b border-blue-gray-700`}
      >
        <div className={`flex gap-x-4 items-center justify-start`}>
          <img
            src={HeaderLogo}
            alt=''
            className={`cursor-pointer duration-300 h-14 w-14`}
          />
          <h1
            className={`flex justify-center font-extrabold uppercase text-3xl`}
          >
            Shepherd
          </h1>
        </div>
      </header>
      <div className='p-2 pt-20 max-w-2xl mx-auto'>
        {/* SIGN IN TITLE */}
        <h1 className='text-3xl text-center font-semibold my-8'>Đăng Nhập</h1>

        {/* SIGN IN FORM */}
        <form
          className='flex flex-col gap-6'
          onSubmit={login}
        >
          {/* USERNAME INPUT */}
          <input
            id='username'
            name='username' // Set name attribute for the input
            type='text'
            placeholder='Email hoặc Tên đăng nhập'
            value={formData.username}
            onChange={handleChange} // Use a single handler for input changes
            required
            className='border border-gray-500 p-3 rounded-lg'
          />

          {/* PASSWORD INPUT */}
          <div className='relative'>
            <input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Mật khẩu '
              value={formData.password}
              onChange={handleChange}
              required
              className='border border-gray-500 p-3 rounded-lg w-full'
            />
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute top-0 bottom-0 right-3'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <div className='rounded-full hover:bg-gray-300 p-2'>
                {showPassword ? (
                  <HiEyeOff className='w-5 h-5 text-slate-600' />
                ) : (
                  <HiEye className='w-5 h-5 text-slate-600' />
                )}
              </div>
            </button>
          </div>

          {/* SIGN IN BUTTON */}
          <button
            type='submit'
            className='justify-center inline-flex items-center bg-blue-gray-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
            disabled={isLoading}
          >
            {isLoading ? 'Loading' : 'Đăng Nhập'}
            {isLoading && (
              <>
                <div className='h-2 w-2 ml-2 mr-1 bg-gray-300 rounded-full animate-scale [animation-delay:-0.3s]'></div>
                <div className='h-2 w-2 mr-1 bg-gray-300 rounded-full animate-scale [animation-delay:-0.15s]'></div>
                <div className='h-2 w-2 bg-gray-300 rounded-full animate-scale'></div>
              </>
            )}
          </button>

          {/* SIGN IN WITH GOOGLE BUTTON */}
          {/* <OAuth /> */}

          {/* SHOW ERROR MESSAGE */}
          {error && <p className='text-red-500 text-center'>{error}</p>}
        </form>
      </div>
    </div>
  );
}
