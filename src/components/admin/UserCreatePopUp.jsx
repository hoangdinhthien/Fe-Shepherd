import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AdminUserAPI from '../../apis/admin/admin_user_api';

const UserCreatePopUp = ({ isOpen, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Thành viên');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // Chỉ hiển thị lỗi chung

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(''); // Xóa thông báo lỗi cũ trước khi gửi yêu cầu mới

    const userData = { name, phone, email, password, role };

    try {
      const response = await AdminUserAPI.createUser(userData);

      if (response.success) {
        // Nếu tạo tài khoản thành công, gọi callback để cập nhật danh sách người dùng và đóng modal
        if (typeof onUserCreated === 'function') {
          onUserCreated(response.data.newUser); // Truyền người dùng mới trở lại AdminUser
        }
        onClose(); // Đóng popup sau khi tạo thành công
      } else {
        // Hiển thị lỗi chung nếu không thành công
        setErrorMessage('Không thể tạo tài khoản. Vui lòng thử lại.');
        console.error(
          'Lỗi tạo tài khoản:',
          response.message || 'Lỗi không xác định'
        );
      }
    } catch (error) {
      // Hiển thị lỗi chung cho người dùng và in chi tiết lỗi ra console
      setErrorMessage('Không thể tạo tài khoản. Vui lòng thử lại.');
      console.error('Lỗi khi tạo tài khoản:', error);
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
                    required
                    className='w-full p-2 border rounded'
                    placeholder='Nhập họ và tên'
                  />
                </div>
                <div className='mb-4'>
                  <label>Số điện thoại</label>
                  <input
                    type='text'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className='w-full p-2 border rounded'
                    placeholder='Nhập số điện thoại'
                  />
                </div>
                <div className='mb-4'>
                  <label>Email</label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full p-2 border rounded'
                    placeholder='Nhập email'
                  />
                </div>
                <div className='mb-4'>
                  <label>Mật Khẩu</label>
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='w-full p-2 border rounded'
                    placeholder='Nhập mật khẩu'
                  />
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

                {/* Thông báo lỗi chung */}
                {errorMessage && (
                  <p className='text-red-600 text-center mb-4'>
                    {errorMessage}
                  </p>
                )}

                <button
                  type='submit'
                  disabled={isLoading}
                  className='bg-blue-600 text-white p-2 rounded w-full'
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
