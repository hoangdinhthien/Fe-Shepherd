import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AdminGroupAPI from '../../apis/admin/admin_group_api';

const GroupCreatePopUp = ({ isOpen, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Hàm kiểm tra các trường thông tin
  const validateFields = () => {
    const errors = {};
    if (!groupName.trim()) errors.groupName = 'Tên nhóm không được để trống';
    if (!description.trim()) errors.description = 'Mô tả không được để trống';
    return errors;
  };

  // Hàm tạo nhóm mới
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});
    setErrorMessage('');

    const groupNameExists = await AdminGroupAPI.checkGroupNameExist(groupName);
    if (groupNameExists) {
      setErrorMessage('Tên nhóm đã tồn tại, vui lòng chọn tên khác.');
      setIsLoading(false);
      return; // Dừng lại nếu tên nhóm đã tồn tại
    }

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsLoading(false);
      return;
    }

    const groupData = {
      groupName,
      description,
      priority,
    };

    try {
      // Gọi API để tạo nhóm mới
      const response = await AdminGroupAPI.createGroup(groupData);

      if (response.success) {
        if (typeof onGroupCreated === 'function') {
          onGroupCreated(); // Gọi hàm onGroupCreated nếu có
        }
        onClose(); // Đóng popup sau khi tạo nhóm thành công
      } else {
        setErrorMessage(response.message || 'Không thể tạo nhóm.');
      }
    } catch (error) {
      setErrorMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error('Lỗi khi tạo nhóm:', error);
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
              <h3 className='text-lg font-semibold mb-4'>Tạo Nhóm Mới</h3>
              <form onSubmit={handleCreateGroup}>
                <div className='mb-4'>
                  <label className='block'>Tên Nhóm</label>
                  <input
                    type='text'
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.groupName ? 'border-red-600' : ''
                    }`}
                    placeholder='Nhập tên nhóm'
                  />
                  {fieldErrors.groupName && (
                    <p className='text-red-600 text-sm'>
                      {fieldErrors.groupName}
                    </p>
                  )}
                </div>
                <div className='mb-4'>
                  <label className='block'>Mô Tả</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-2 border rounded ${
                      fieldErrors.description ? 'border-red-600' : ''
                    }`}
                    placeholder='Nhập mô tả nhóm'
                  />
                  {fieldErrors.description && (
                    <p className='text-red-600 text-sm'>
                      {fieldErrors.description}
                    </p>
                  )}
                </div>
                <div className='mb-4'>
                  <label className='block'>Ưu Tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value === 'true')}
                    className='w-full p-2 border rounded'
                  >
                    <option value={false}>Không</option>
                    <option value={true}>Có</option>
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
                  {isLoading ? 'Đang tạo...' : 'Tạo Nhóm'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GroupCreatePopUp;
