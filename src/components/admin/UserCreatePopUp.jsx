import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import RequestAPI from '../../apis/admin/request_api';
import AdminGroupAPI from '../../apis/admin/admin_group_api';

const UserCreatePopUp = ({ isOpen, onClose, onUserCreated }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Thành viên');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [groups, setGroups] = useState([]); // Danh sách đoàn thể
  const [selectedGroupId, setSelectedGroupId] = useState(''); // Đoàn thể được chọn

  const location = useLocation();
  const { requestId } = location.state || {}; // Lấy requestId từ state (nếu có)

  // Lấy danh sách đoàn thể và thông tin yêu cầu (nếu có)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await AdminGroupAPI.getAllGroups();
        const groupList = Array.isArray(response.result) ? response.result : [];
        setGroups(groupList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đoàn thể:', error);
        setGroups([]); // Đặt giá trị mặc định là mảng rỗng khi có lỗi
      }
    };

    const fetchRequestDetails = async () => {
      try {
        const response = await RequestAPI.getDetailRequests(requestId);
        if (response.success) {
          const { user } = response.data;
          if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            setPassword(user.password || '');
            setRole(user.role || 'Thành viên');
            setSelectedGroupId(user.groupId || ''); // Đặt giá trị mặc định của đoàn thể
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết yêu cầu:', error);
      }
    };

    fetchGroups();

    if (requestId) {
      fetchRequestDetails();
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setRole('Thành viên');
      setSelectedGroupId('');
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

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      if (requestId) {
        const updateResponse = await RequestAPI.updateAcceptRequest(requestId);
        if (!updateResponse.success) {
          setErrorMessage('Không thể cập nhật yêu cầu.');
          setIsLoading(false);
          return;
        }
      }

      const userData = {
        name,
        phone,
        email,
        password,
        role,
        groupIds: [selectedGroupId], // Đúng định dạng groupIds là một mảng
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

      const apiErrorMessage =
        error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setErrorMessage(apiErrorMessage);
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
                <div className='mb-4'>
                  <label>Đoàn thể</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className='w-full p-2 border rounded'
                  >
                    <option value=''>Chọn đoàn thể</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.groupName}
                      </option>
                    ))}
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
