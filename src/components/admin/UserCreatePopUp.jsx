import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import RequestAPI from '../../apis/admin/request_api';

const UserCreatePopUp = ({ isOpen, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Thành viên');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const location = useLocation();
  const { requestId } = location.state || {}; // Lấy requestId từ state (nếu có)

  useEffect(() => {
    // Kiểm tra nếu có requestId (được điều hướng từ trang yêu cầu)
    if (requestId) {
      const fetchRequestDetails = async () => {
        try {
          console.log('Request ID:', requestId);
          const response = await RequestAPI.getDetailRequests(requestId);
          if (response.success) {
            const { user } = response.data; // Lấy thông tin user từ response
            if (user) {
              setName(user.name || '');
              setPhone(user.phone || '');
              setEmail(user.email || '');
              setPassword(user.password || '');
              setRole(user.role || 'Thành viên');
            }
          } else {
            console.error('Không thể lấy thông tin yêu cầu.');
          }
        } catch (error) {
          console.error('Lỗi khi lấy chi tiết yêu cầu:', error);
        }
      };

      fetchRequestDetails();
    } else {
      // Nếu không có requestId, đảm bảo để trống tất cả các trường
      console.log('Không có requestId, để trống các trường');
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setRole('Thành viên');
    }
  }, [requestId]);

  const validateFields = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Họ và tên không được để trống';
    if (!phone.trim()) errors.phone = 'Số điện thoại không được để trống';
    if (!email.trim()) errors.email = 'Email không được để trống';
    if (!password.trim()) errors.password = 'Mật khẩu không được để trống';
    if (password.length < 6)
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    return errors;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});
    setErrorMessage('');

    // Kiểm tra lỗi form
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      // Nếu có requestId, cập nhật trạng thái yêu cầu
      if (requestId) {
        const updateResponse = await RequestAPI.updateAcceptRequest(requestId);
        if (!updateResponse.success) {
          setErrorMessage('Không thể cập nhật yêu cầu.');
          setIsLoading(false);
          return;
        }
      }

      // Tiến hành tạo tài khoản
      const userData = {
        name,
        phone,
        email,
        password,
        role,
        groupId: '3fa85f64-5717-4562-b3fc-2c963f66afa6', // Group ID hợp lệ
      };

      const response = await AdminUserAPI.createUser(userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        if (typeof onUserCreated === 'function') {
          onUserCreated(response.data.newUser);
        }
        onClose();
      } else {
        setErrorMessage(response.message || 'Không thể tạo tài khoản.');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API:', error);
      setErrorMessage(
        error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className='fixed inset-0 z-40 bg-black bg-opacity-50 w-full h-full flex justify-center items-center'
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='relative p-4 w-full max-w-md max-h-full'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='bg-white rounded-lg shadow p-6'>
              <h3 className='text-lg font-semibold mb-4'>Tạo Tài Khoản Mới</h3>
              <form onSubmit={handleCreateUser}>
                <div className='mb-4'>
                  <label>Họ và Tên</label>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.name ? 'border-red-600' : ''
                    }`}
                    placeholder='Nhập họ và tên'
                  />
                  {fieldErrors.name && (
                    <p className='text-red-600 text-sm'>{fieldErrors.name}</p>
                  )}
                </div>
                <div className='mb-4'>
                  <label>Số điện thoại</label>
                  <input
                    type='text'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.phone ? 'border-red-600' : ''
                    }`}
                    placeholder='Nhập số điện thoại'
                  />
                  {fieldErrors.phone && (
                    <p className='text-red-600 text-sm'>{fieldErrors.phone}</p>
                  )}
                </div>
                <div className='mb-4'>
                  <label>Email</label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.email ? 'border-red-600' : ''
                    }`}
                    placeholder='Nhập email'
                  />
                  {fieldErrors.email && (
                    <p className='text-red-600 text-sm'>{fieldErrors.email}</p>
                  )}
                </div>
                <div className='mb-4'>
                  <label>Mật Khẩu</label>
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.password ? 'border-red-600' : ''
                    }`}
                    placeholder='Nhập mật khẩu'
                  />
                  {fieldErrors.password && (
                    <p className='text-red-600 text-sm'>
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <div className='mb-4'>
                  <label>Vai Trò</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className='w-full p-2 border rounded'
                  >
                    <option value='Thành viên'>Thành viên</option>
                    <option value='Cha xứ'>Cha xứ</option>
                    <option value='Thủ quỹ'>Thủ quỹ</option>
                    <option value='Admin'>Admin</option>
                  </select>
                </div>

                {errorMessage && (
                  <p className='text-red-600 text-center mb-4'>
                    {errorMessage}
                  </p>
                )}

                <button
                  type='submit'
                  disabled={isLoading}
                  className={`${
                    isLoading ? 'bg-gray-400' : 'bg-blue-600'
                  } text-white p-2 rounded w-full`}
                >
                  {isLoading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserCreatePopUp;
