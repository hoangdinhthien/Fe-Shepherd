import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import storageService from '../config/local_storage';
import { logOut } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import UserAPI from '../apis/user_api';
import ImageAPI from '../apis/image_api';

export default function UpdateProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: currentUser?.user?.name || '',
    phone: currentUser?.user?.phone || '',
    email: currentUser?.user?.email || '',
    image: currentUser.user.imageURL || '',
    password: currentUser.user.password || '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.user.name || '',
        phone: currentUser.user.phone || '',
        email: currentUser.user.email || '',
        image: currentUser.user.imageURL || '',
        password: currentUser.user.password || '',
      });
    }
  }, [currentUser]);

  const logout = () => {
    storageService.removeAccessToken();
    dispatch(logOut());
    navigate('/');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      ImageAPI.uploadImageMultipart(file)
        .then((res) => {
          // Assume the new image URL is in res.data
          setFormData({ ...formData, image: res.data });
        })
        .catch((err) => console.log(err));
    }
  };

  const handleUpdate = async () => {
    const userData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      imageURL: formData.image,
      password: formData.password,
    };

    console.log(userData);
    const result = await UserAPI.updateUserFirstTime(userData)
      .then((response) => {
        const { data } = response;
        if (data) {
          //   dispatch(logIn(data));
          navigate('/user/profile');
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
    console.log(result);
  };

  return (
    <div className='mt-5 flex items-center justify-center bg-gray-100'>
      <div className='p-6 max-w-lg w-full bg-white shadow-2xl rounded-lg border'>
        {/* PAGE TITLE */}
        <h1 className='text-3xl font-semibold text-center my-7 text-gray-800'>
          Trang Cá Nhân
        </h1>

        {/* USER INFORMATION FORM */}
        <form className='flex flex-col gap-6'>
          {/* PROFILE IMAGE */}
          <div className='flex flex-col items-center'>
            <img
              alt='profile-img'
              src={
                formData.image ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              }
              className='rounded-full h-24 w-24 object-cover shadow-lg'
            />
            <input
              type='file'
              onChange={handleFileChange}
            />
            <span className='text-gray-600 mt-2'>{formData.name}</span>
          </div>

          {/* NAME INPUT */}
          <div>
            <label
              htmlFor='name'
              className='text-gray-500 text-sm'
            >
              Tên
            </label>
            <input
              id='name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>

          {/* PHONE INPUT */}
          <div>
            <label
              htmlFor='phone'
              className='text-gray-500 text-sm'
            >
              Số điện thoại
            </label>
            <input
              id='phone'
              type='text'
              value={formData.phone}
              onChange={handleChange}
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
              onChange={handleChange}
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>

          {/* PASSWORD INPUT (Hidden) */}
          <div>
            <label
              htmlFor='password'
              className='text-gray-500 text-sm'
            >
              Mật khẩu
            </label>
            <input
              id='password'
              type='password'
              readOnly
              className='w-full border p-3 rounded-lg bg-gray-100 mt-1 text-gray-700'
            />
          </div>
        </form>

        {/* SAVE BUTTON */}
        <div className='flex justify-center mt-8'>
          <button
            onClick={handleUpdate}
            className='bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 ease-in-out'
          >
            Cập nhập
          </button>
        </div>

        {/* SIGN OUT BUTTON */}
        <div className='flex justify-center mt-8'>
          <button
            onClick={logout}
            className='bg-red-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-red-700 transition duration-200 ease-in-out'
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
