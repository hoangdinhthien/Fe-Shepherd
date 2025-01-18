import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import storageService from '../config/local_storage';
import { logOut, logIn } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import UserAPI from '../apis/user_api';
import ImageAPI from '../apis/image_api';

export default function Profile() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: currentUser?.user?.name || '',
    phone: currentUser?.user?.phone || '',
    email: currentUser?.user?.email || '',
    password: '',
    role: currentUser?.user?.role || 'Member',
  });
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.user.name || '',
        phone: currentUser.user.phone || '',
        email: currentUser.user.email || '',
        password: currentUser.user.password || '',
      });
    }
  }, [currentUser]);

  const logout = () => {
    storageService.removeAccessToken();
    dispatch(logOut());
    navigate('/');
  };

  const handleUpdateProfile = async () => {
    const updatedData = {
      id: currentUser.user.id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      imageURL: currentUser.user.imageURL,
      password: formData.password,
      role: currentUser.role || 'Member', // Default role
    };

    try {
      if (formData.imageFile) {
        const uploadResponse = await ImageAPI.uploadImageMultipart(
          formData.imageFile
        );
        updatedData.imageURL = uploadResponse.data;
      }
      // if (currentUser.isAcctive === 'Inactive') {
      //   await UserAPI.updateUserFirstTime(updatedData);
      // } else {
      await UserAPI.updateUser(updatedData);
      // }
      setIsEditing(false);

      // Update current user in local storage
      storageService.removeCurrentUser();
      const updatedUser = { ...currentUser, user: updatedData };
      storageService.setCurrentUser(updatedUser);
      console.log(`updatedUser`, updatedUser);

      // Update current user in Redux store
      dispatch(logIn(updatedUser));
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      imageFile: file,
    }));
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
                currentUser?.user?.imageURL ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
              }
              className='rounded-full h-24 w-24 object-cover shadow-lg'
            />
            <span className='text-gray-600 mt-2'>{formData.name}</span>
            {isEditing && (
              <input
                type='file'
                accept='image/*'
                onChange={handleImageChange}
                className='mt-2'
              />
            )}
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
              readOnly={!isEditing}
              className={`w-full border p-3 rounded-lg mt-1 text-gray-700 ${
                isEditing ? 'bg-white' : 'bg-gray-100'
              }`}
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
              readOnly={!isEditing}
              className={`w-full border p-3 rounded-lg mt-1 text-gray-700 ${
                isEditing ? 'bg-white' : 'bg-gray-100'
              }`}
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
              readOnly={!isEditing}
              className={`w-full border p-3 rounded-lg mt-1 text-gray-700 ${
                isEditing ? 'bg-white' : 'bg-gray-100'
              }`}
            />
          </div>

          {/* PASSWORD INPUT */}
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
              value={formData.password}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border p-3 rounded-lg mt-1 text-gray-700 ${
                isEditing ? 'bg-white' : 'bg-gray-100'
              }`}
            />
          </div>
        </form>

        {/* BUTTONS */}
        <div className='flex justify-center mt-8 gap-4'>
          {isEditing ? (
            <>
              <button
                onClick={handleUpdateProfile}
                className='bg-green-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-green-700 transition duration-200 ease-in-out'
              >
                Cập nhật
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className='bg-gray-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-gray-700 transition duration-200 ease-in-out'
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className='bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 ease-in-out'
            >
              Chỉnh sửa
            </button>
          )}
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
