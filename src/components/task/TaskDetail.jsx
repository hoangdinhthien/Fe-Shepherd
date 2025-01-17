import { Modal, Button, Card, Divider, Input, Select, message } from 'antd';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import GroupUserAPI from '../../apis/group_user_api';
import CurrencyInput from 'react-currency-input-field';
import TaskAPI from '../../apis/task_api';
import { useSelector } from 'react-redux';

const { Option } = Select;

const TaskDetail = ({
  selectedTask,
  isModalVisible,
  setIsModalVisible,
  isGroupLeader,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskDetails, setTaskDetails] = useState(selectedTask);
  const [users, setUsers] = useState([]);
  const currentUser = useSelector((state) => state.user.currentUser); // Get current user

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await GroupUserAPI.getGroupMembers(
          selectedTask.groupId
        );

        setUsers(response.result || []);
      } catch (error) {
        console.error('Error fetching group user:', error);
      }
    };

    if (isEditing) {
      fetchUsers();
    }
  }, [isEditing, selectedTask.groupID]);

  useEffect(() => {
    setTaskDetails(selectedTask);
  }, [selectedTask]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails({ ...taskDetails, [name]: value });
  };

  const handleSelectChange = (value, option) => {
    setTaskDetails({ ...taskDetails, userName: option.children });
  };

  const handleCancelEdit = () => {
    setTaskDetails(selectedTask);
    setIsEditing(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleEditTask = async () => {
    try {
      const updatedTaskDetails = {
        ...taskDetails,
        userId: users.find((user) => user.name === taskDetails.userName)
          ?.userID,
      };
      await TaskAPI.updateTask(taskDetails.id, updatedTaskDetails);
      console.log(updatedTaskDetails);

      message.success('Task updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      message.error('Failed to update task');
    }
  };

  const canEditTask =
    isGroupLeader && ['Bản nháp', 'Đang chờ'].includes(taskDetails.status);

  return (
    <Modal
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={[
        isEditing && (
          <Button
            key='cancel'
            onClick={handleCancelEdit}
            className='bg-red-500 text-white hover:bg-red-700'
          >
            Huỷ
          </Button>
        ),
        canEditTask && (
          <Button
            key='edit'
            onClick={() => {
              if (isEditing) {
                handleEditTask();
              } else {
                setIsEditing(true);
              }
            }}
            className={
              isEditing
                ? 'bg-green-500 text-white hover:bg-green-700'
                : 'bg-blue-500 text-white hover:bg-blue-700'
            }
          >
            {isEditing ? 'Lưu' : 'Chỉnh Sửa Công Việc'}
          </Button>
        ),
        <Button
          key='close'
          onClick={() => setIsModalVisible(false)}
          className='bg-gray-500 text-white hover:bg-gray-700'
        >
          Đóng
        </Button>,
      ]}
      width={750}
    >
      <Card bordered={false}>
        <div className='space-y-6'>
          <div className='grid grid-cols-2 gap-5'>
            <div>
              <strong className='text-gray-700 text-lg'>
                Tiêu đề công việc:
              </strong>
              {isEditing ? (
                <Input
                  name='title'
                  value={taskDetails.title}
                  onChange={handleInputChange}
                  className='mt-2'
                />
              ) : (
                <p className='text-gray-900 mt-2'>{taskDetails.title}</p>
              )}
            </div>
            <div>
              <strong className='text-gray-700 text-lg'>
                Mô tả công việc:
              </strong>
              {isEditing ? (
                <Input.TextArea
                  name='description'
                  value={taskDetails.description}
                  onChange={handleInputChange}
                  className='mt-2'
                />
              ) : (
                <p className='text-gray-900 mt-2'>{taskDetails.description}</p>
              )}
            </div>
            <div>
              <strong className='text-gray-700 text-lg'>
                Chi phí công việc:
              </strong>
              {isEditing ? (
                <CurrencyInput
                  name='cost'
                  value={taskDetails.cost}
                  onValueChange={(value) =>
                    setTaskDetails({ ...taskDetails, cost: value })
                  }
                  className='w-full p-2 border border-gray-300 rounded-lg text-right mt-2'
                  decimalsLimit={0}
                  suffix=' VND'
                  intlConfig={{ locale: 'vi-VN', currency: 'VND' }}
                />
              ) : (
                <p className='text-gray-900 mt-2'>
                  {formatCurrency(taskDetails.cost)}
                </p>
              )}
            </div>
            <div>
              <strong className='text-gray-700 text-lg'>
                Người phụ trách công việc:
              </strong>
              {isEditing ? (
                <Select
                  value={taskDetails.userName}
                  onChange={handleSelectChange}
                  className='w-full h-10 rounded-lg mt-2'
                >
                  {users
                    .filter((user) => user.name !== currentUser.user.name) // Filter out the leader's name
                    .map((user) => (
                      <Option
                        key={user.id}
                        value={user.userID}
                      >
                        {user.name}
                      </Option>
                    ))}
                </Select>
              ) : (
                <p className='text-gray-900 mt-2'>
                  {taskDetails.userName ||
                    'Chưa có người phụ trách công việc này'}
                </p>
              )}
            </div>
            <div className='col-span-2'>
              <strong className='text-gray-700 text-lg'>Trạng thái:</strong>
              <p className='text-gray-900 mt-2'>{taskDetails.status}</p>
            </div>
          </div>
          <Divider
            orientation='center'
            style={{ borderColor: '#9a9a9a' }}
          >
            <strong>Công Việc Thuộc Hoạt Động</strong>
          </Divider>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <strong className='text-gray-700'>Tên hoạt động:</strong>
              <p className='text-gray-900 mt-2'>{selectedTask.activityName}</p>
            </div>
            <div>
              <strong className='text-gray-700'>Mô tả hoạt động:</strong>
              <p className='text-gray-900 mt-2'>
                {selectedTask.activityDescription}
              </p>
            </div>
          </div>
          <Divider
            orientation='center'
            style={{ borderColor: '#9a9a9a', marginTop: '2rem' }}
          >
            <strong>Hoạt Động Thuộc Sự Kiện</strong>
          </Divider>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <strong className='text-gray-700'>Tên sự kiện:</strong>
              <p className='text-gray-900 mt-2'>{selectedTask.eventName}</p>
            </div>
            <div>
              <strong className='text-gray-700'>Mô tả sự kiện:</strong>
              <p className='text-gray-900 mt-2'>
                {selectedTask.eventDescription}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Modal>
  );
};

TaskDetail.propTypes = {
  selectedTask: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    cost: PropTypes.number.isRequired,
    userName: PropTypes.string,
    status: PropTypes.string.isRequired,
    groupId: PropTypes.number.isRequired,
    activityName: PropTypes.string,
    activityDescription: PropTypes.string,
    eventName: PropTypes.string,
    eventDescription: PropTypes.string,
  }).isRequired,
  isModalVisible: PropTypes.bool.isRequired,
  setIsModalVisible: PropTypes.func.isRequired,
  isGroupLeader: PropTypes.bool.isRequired,
};

export default TaskDetail;
