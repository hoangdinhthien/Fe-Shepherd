import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Spin } from 'antd';
import { FaTimes } from 'react-icons/fa';
import TaskAPI from '../../apis/task_api';
import GroupUserAPI from '../../apis/group_user_api';
import ActivityAPI from '../../apis/activity/activity_api';
import useFetchGroups from '../../hooks/useFetchGroups';

const { Option } = Select;
const { TextArea } = Input;

export default function TaskCreatePopUp({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [activityId, setActivityId] = useState('');
  const [userID, setUserId] = useState('');
  const [description, setDescription] = useState('');
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { groups, loading: groupsLoading } = useFetchGroups();
  const selectedGroupId = groups.length > 0 ? groups[0].id : null;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await ActivityAPI.getActivitiesByGroup(
          selectedGroupId
        );
        console.log('activity', response);
        setActivities(response.result || []); // Lưu danh sách hoạt động vào state
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    if (isOpen && selectedGroupId) {
      fetchActivities();
    }
  }, [isOpen, selectedGroupId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await GroupUserAPI.getGroupMembers(selectedGroupId);
        console.log('group user:', response);
        setUsers(response.result || []); // Lưu danh sách hoạt động vào state
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
      // isConfirmed: true,
    };
    console.log(JSON.stringify(taskData));

    try {
      const response = await TaskAPI.createTask(taskData);

      if (response.success) {
        setTitle('');
        setPrice('');
        setActivityId('');
        setUserId('');
        setDescription('');
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
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className='max-w-lg w-full max-h-['
    >
      <form
        className='p-3'
        onSubmit={handleSubmit}
      >
        <div className='grid gap-4'>
          <div>
            <label>Tiêu Đề</label>
            <Input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='Tiêu đề của công việc'
            />
          </div>
          <div>
            <label>Nhập Chi Phí</label>
            <Input
              type='number'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              // required
              placeholder='VND'
            />
          </div>
          <div>
            <label>Chọn Hoạt Động</label>
            <Select
              value={activityId}
              onChange={(value) => setActivityId(value)}
              required
              placeholder='Chọn Hoạt Động'
              className='w-full'
            >
              {activities.map((activity) => (
                <Option
                  key={activity.id}
                  value={activity.activityId}
                >
                  {activity.activityName}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label>Chọn Người Phụ Trách</label>
            <Select
              value={userID}
              onChange={(value) => setUserId(value)}
              required
              placeholder='Chọn Người Phụ Trách'
              className='w-full'
            >
              {users.map((user) => (
                <Option key={user.id}>{user.name}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label>Mô Tả Công Việc</label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder='Viết mô tả công việc'
            />
          </div>
        </div>
        {/* Hiển thị thông báo lỗi nếu có */}
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
