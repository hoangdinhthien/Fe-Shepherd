import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Spin, message } from 'antd';
import TaskAPI from '../../apis/task_api';
import GroupUserAPI from '../../apis/group_user_api';
import useFetchGroups from '../../hooks/useFetchGroups';
import CurrencyInput from 'react-currency-input-field';
import ActivityAPI from '../../apis/activity/activity_api';

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
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { groups, loading: groupsLoading } = useFetchGroups();
  const selectedGroupId = groups.length > 0 ? groups[0].id : null;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await GroupUserAPI.getGroupMembers(selectedGroupId);
        console.log('group user:', response);
        setUsers(response.result || []);
      } catch (error) {
        console.error('Error fetching group user:', error);
      }
    };

    if (isOpen && selectedGroupId) {
      fetchUsers();
    }
  }, [isOpen, selectedGroupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
        setTitle('');
        setPrice('');
        setUserId('');
        setDescription('');
        onClose();
        message.success('Công việc đã đư��c tạo thành công');
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
      width={750}
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
