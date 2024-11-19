import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import TaskAPI from '../../apis/task_api';

export default function TaskCreatePopUp({ isOpen, onClose, selectedgroupId }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [activityId, setActivityId] = useState('');
  const [userId, setUserId] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await TaskAPI.getActivitiesByGroup(selectedgroupId);
        console.log('activity', response);
        setActivities(response.result || []); // Lưu danh sách hoạt động vào state
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    if (isOpen) {
      fetchActivities();
    }
  }, [isOpen, selectedgroupId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await TaskAPI.getUsersByGroup(selectedgroupId);
        console.log('User', response);
        setUsers(response.result || []); // Lưu danh sách hoạt động vào state
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, selectedgroupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const taskData = {
      title,
      price,
      activityId,
      userId,
      description,
    };

    try {
      const response = await TaskAPI.createTask(taskData);

      if (response.success) {
        setTitle('');
        setPrice('');
        setActivityId('');
        setUserId('');
        setDescription('');
        setGroupId(selectedgroupId);
        onClose();
      } else {
        setErrorMessage('Không thể tạo công việc. Vui lòng thử lại.');
        console.error('Failed to create task:', response.message);
      }
    } catch (error) {
      setErrorMessage('Không thể tạo công việc. Vui lòng thử lại.');
      console.error('Error creating task:', error);
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
            <div className='relative bg-white rounded-lg shadow'>
              <div className='flex items-center justify-between p-4 border-b rounded-t'>
                <h3 className='text-lg font-semibold'>Tạo Một Công Việc Mới</h3>
                <button
                  onClick={onClose}
                  type='button'
                  className='text-gray-400 hover:bg-gray-200 rounded-lg text-sm w-8 h-8 flex justify-center items-center'
                >
                  <FaTimes />
                </button>
              </div>

              <form className='p-4' onSubmit={handleSubmit}>
                <div className='grid gap-4'>
                  <div>
                    <label>Tiêu Đề</label>
                    <input
                      type='text'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className='w-full p-2 border rounded'
                      placeholder='Tiêu đề của công việc'
                    />
                  </div>
                  <div>
                    <label>Chi Phí</label>
                    <input
                      type='number'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      className='w-full p-2 border rounded'
                      placeholder='VND'
                    />
                  </div>
                  <div>
                    <label>Hoạt Động</label>
                    <select
                      value={activityId}
                      onChange={(e) => setActivityId(e.target.value)}
                      required
                      className='w-full p-2 border rounded'
                    >
                      <option value=''>Chọn Hoạt Động</option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.activityId}>
                          {activity.activityName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Người Phụ Trách</label>
                    <select
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      required
                      className='w-full p-2 border rounded'
                    >
                      <option value=''>Chọn Người Phụ Trách</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.userId}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Mô Tả Công Việc</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows='4'
                      className='w-full p-2 border rounded'
                      placeholder='Viết mô tả công việc'
                    />
                  </div>
                </div>
                {/* Hiển thị thông báo lỗi nếu có */}
                {errorMessage && (
                  <p className='text-red-600 text-center mt-2'>
                    {errorMessage}
                  </p>
                )}
                <button
                  type='submit'
                  disabled={isLoading}
                  className='w-full bg-blue-600 text-white p-2 rounded mt-4'
                >
                  {isLoading ? 'Đang tạo...' : 'Thêm Công Việc'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
