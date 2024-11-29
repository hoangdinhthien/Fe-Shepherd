import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Spin, message } from 'antd';
import TaskAPI from '../../apis/task_api';
import GroupUserAPI from '../../apis/group_user_api';
import useFetchGroups from '../../hooks/useFetchGroups';
import CurrencyInput from 'react-currency-input-field';

const { Option } = Select;
const { TextArea } = Input;

export default function TaskCreatePopUp({
  isOpen,
  onClose,
  groupId,
  activityId,
  activityName,
}) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [userID, setUserId] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  console.log('selectedgroupId:', selectedgroupId);

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

  // Fetch users when modal is open
  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedgroupId) {
        console.error('GroupID is undefined or invalid:', selectedgroupId);
        setErrorMessage('GroupID không hợp lệ. Vui lòng kiểm tra.');
        return;
      }

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
    setErrorMessage('');

    if (!title || !price || !activityId || !userId) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin.');
      setIsLoading(false);
      return;
    }

    const taskData = {
      title,
      description,
      cost: parseFloat(price),
      activityID: activityId,
      groupID: selectedGroupId,
      userID: userID,
    };
    console.log(JSON.stringify(taskData));

    try {
      const response = await TaskAPI.createTask(taskData);

      if (response.success) {
        // Reset form fields on success
        setTitle('');
        setPrice('');
        setUserId('');
        setDescription('');
        onClose();
        message.success('Công việc đã được tạo thành công');
      } else {
        setErrorMessage(
          response.message || 'Không thể tạo công việc. Vui lòng thử lại.'
        );
      }
    } catch (error) {
      setErrorMessage('Có lỗi xảy ra khi tạo công việc. Vui lòng thử lại.');
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (value) => {
    const numericValue = parseFloat(value);
    if (numericValue % 2 !== 0) {
      setPrice(numericValue);
    } else {
      setPrice(value);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className='w-full max-w-xl'
    >
      <div className='flex items-center justify-between p-4 border-b'>
        <p className='text-lg'>
          Tạo Một Công Việc Mới Cho Hoạt Động{' '}
          <strong>{activityName || 'Hoạt động chưa xác định'}</strong>
        </p>
      </div>

      <form
        className='p-4'
        onSubmit={handleSubmit}
      >
        <div className='grid gap-4'>
          <div>
            <label className='block mb-1'>Chọn Người Phụ Trách</label>
            <Select
              value={userID}
              onChange={(value) => setUserId(value)}
              required
              placeholder='Chọn Người Phụ Trách'
              className='w-full'
            >
              {users.map((user) => (
                <Option
                  key={user.id}
                  value={user.userID}
                >
                  {user.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className='block mb-1'>Nhập Tiêu Đề Công Việc</label>
            <Input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='Tiêu đề của công việc'
              className='w-full'
            />
          </div>
          <div>
            <label className='block mb-1'>Nhập Chi Phí</label>
            <CurrencyInput
              value={price}
              onValueChange={(value) => setPrice(value)}
              placeholder='VND'
              className='w-full border p-3 rounded-lg border-gray-300'
              decimalsLimit={2}
              prefix='VND '
            />
          </div>
          <div>
            <label className='block mb-1'>Nhập Mô Tả Công Việc</label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder='Viết mô tả công việc'
              className='w-full'
            />
          </div>
        </div>
        {errorMessage && (
          <p className='text-red-600 text-center mt-2'>{errorMessage}</p>
        )}
        <Button
          type='primary'
          htmlType='submit'
          disabled={isLoading}
          className='w-full mt-4'
        >
          {isLoading ? <Spin /> : 'Thêm Công Việc'}
        </Button>
      </form>
    </Modal>
  );
}
