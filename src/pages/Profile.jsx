import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import storageService from '../config/local_storage';
import { logOut } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: currentUser?.user?.name || '',
    phone: currentUser?.user?.phone || '',
    email: currentUser?.user?.email || '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.user.name || '',
        phone: currentUser.user.phone || '',
        email: currentUser.user.email || '',
      });
    }
  }, [currentUser]);

  const logout = () => {
    storageService.removeAccessToken();
    dispatch(logOut());
    navigate('/');
  };

  return (
    <div className='mt-5 flex items-center justify-center bg-gray-100'>
      <div className='p-6 max-w-lg w-full bg-white shadow-2xl rounded-lg border'>
        {/* PAGE TITLE */}
        <h1 className='text-3xl font-semibold text-center my-7 text-gray-800'>
          Profile
        </h1>

        {/* USER INFORMATION FORM */}
        <form className='flex flex-col gap-6'>
          {/* PROFILE IMAGE */}
          <div className='flex flex-col items-center'>
            <img
              alt='profile-img'
              src={
                currentUser?.user?.profileImage ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              }
              className='rounded-full h-24 w-24 object-cover shadow-lg'
            />
            <span className='text-gray-600 mt-2'>{formData.name}</span>
          </div>

          {/* NAME INPUT */}
          <div>
            <label
              htmlFor='name'
              className='text-gray-500 text-sm'
            >
              Name
            </label>
            <input
              id='name'
              type='text'
              value={formData.name}
              readOnly
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>

          {/* PHONE INPUT */}
          <div>
            <label
              htmlFor='phone'
              className='text-gray-500 text-sm'
            >
              Phone
            </label>
            <input
              id='phone'
              type='text'
              value={formData.phone}
              readOnly
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>

          {/* EMAIL INPUT */}
          <div>
            <label
              htmlFor='email'
              className='text-gray-500 text-sm'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              value={formData.email}
              readOnly
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>

          {/* PASSWORD INPUT (Hidden) */}
          <div>
            <label
              htmlFor='password'
              className='text-gray-500 text-sm'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              value='********'
              readOnly
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>
        </form>

        {/* SIGN OUT BUTTON */}
        <div className='flex justify-center mt-8'>
          <button
            onClick={logout}
            className='bg-red-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-red-700 transition duration-200 ease-in-out'
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
