import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import TaskAPI from '../apis/task_api';
import GroupAPI from '../apis/group_api';
import { useSelector } from 'react-redux';
import {
  Select,
  Spin,
  Dropdown,
  Menu,
  Button,
  Modal,
  message,
  notification,
} from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';
import { DownOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Task() {
  // ------STATES------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState({}); // Initialize as an empty object
  const [isGroupLeader, setIsGroupLeader] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ------SELECTORS------
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  // -----FETCH USER ROLE FUNCTION-----
  const fetchUserRole = (groupId) => {
    if (!currentUser || !currentUser.user?.id || !groupId) return;
    const groupRole = currentUser.listGroupRole.find(
      (role) => role.groupId === groupId
    );
    setIsGroupLeader(groupRole?.roleName === 'Trưởng nhóm');
  };

  // -----FETCH GROUPS FUNCTION-----
  const fetchGroups = async () => {
    if (!currentUser || !currentUser.user?.id) return;
    try {
      setLoading(true);
      const response = await GroupAPI.getGroupsForUser(currentUser.user.id);
      setGroups(response.result);
      if (response.result.length > 0) {
        setSelectedGroup(response.result[0].id);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // -----FETCH TASK DETAILS FUNCTION-----
  const fetchTaskDetails = async (taskId) => {
    try {
      setLoading(true);
      const response = await TaskAPI.getTaskById(taskId);
      if (response.success) {
        setSelectedTask(response.data);
        setIsModalVisible(true);
      } else {
        console.error('Failed to fetch task details:', response.message);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
    } finally {
      setLoading(false);
    }
  };

  // ?????
  const tasks = [
    { id: 1, title: 'Công việc 1' },
    { id: 2, title: 'Công việc 2' },
    { id: 3, title: 'Công việc 3' },
  ];

  // Hàm để xử lý hành động "Chấp nhận" và "Từ chối"
  const handleAction = (taskId, action) => {
    console.log(`Task ID: ${taskId}, Action: ${action}`);
    // Ở đây bạn có thể thực hiện thêm các hành động khác như cập nhật trạng thái công việc trên server
  };

  useEffect(() => {
    if (rehydrated && currentUser) {
      fetchGroups();
    }
  }, [currentUser, rehydrated]);

  useEffect(() => {
    if (selectedGroup) {
      fetchUserRole(selectedGroup);
    }
  }, [selectedGroup]);

  // -----FETCH TASKS FUNCTION-----
  const fetchTasks = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      let response;
      if (isGroupLeader) {
        response = await TaskAPI.getTasksByGroup(selectedGroup);
      } else {
        response = await TaskAPI.getTasksByGroupAndUser(
          selectedGroup,
          currentUser.user.id
        );
      }

      if (response && Array.isArray(response.result)) {
        // Initialize an empty object to hold tasks by status
        const columnsData = {};

        response.result.forEach((task) => {
          const status = task.status || 'Uncategorized'; // Default to 'Uncategorized' if no status

          // Create an array for each unique status if it doesn't exist yet
          if (!columnsData[status]) {
            columnsData[status] = [];
          }

          // Push the task into the correct status array
          columnsData[status].push({
            ...task,
            title: task.title || 'Untitled Task',
            description: task.description || 'Untitled Task',
            assignedUser: task.userName || 'Unassigned',
            dueDate: task.dueDate || 'No due date',
          });
        });

        // Ensure all columns are present, even if empty
        const orderedColumns = {};
        columnOrder.forEach((status) => {
          orderedColumns[status] = columnsData[status] || [];
        });

        // Update columns state with the dynamically generated columns
        setColumns(orderedColumns);
      } else {
        console.error(
          'Unexpected response format or result is undefined:',
          response
        );
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGroup, isGroupLeader, currentUser.user.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, selectedGroup]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
    setColumns({}); // Reset columns when changing groups
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    // Restrict members to drag and drop tasks only between specific columns
    if (isGroupLeader) {
      const allowedColumns = [
        'Bản nháp',
        'Đang chờ',
        'Xem xét',
        'Đã hoàn thành',
      ];
      if (
        !allowedColumns.includes(source.droppableId) ||
        !allowedColumns.includes(destination.droppableId)
      ) {
        message.warning(
          'Bạn không được phép bỏ vào cột này trừ khi bạn là leader'
        );
        return;
      }
    } else {
      const allowedColumns = [
        'Đang chờ',
        'Việc cần làm',
        'Đang thực hiện',
        'Xem xét',
      ];
      if (
        !allowedColumns.includes(source.droppableId) ||
        !allowedColumns.includes(destination.droppableId)
      ) {
        message.warning(
          'Bạn không được phép bỏ vào cột này trừ khi bạn là leader'
        );
        return;
      }
    }

    if (source.droppableId !== destination.droppableId) {
      const sourceItems = [...columns[source.droppableId]];
      const destItems = [...columns[destination.droppableId]];
      const [removed] = sourceItems.splice(source.index, 1);
      removed.status = destination.droppableId;
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });

      // Update task status
      try {
        await TaskAPI.updateTaskStatus(removed.id, destination.droppableId);
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    } else {
      const column = [...columns[source.droppableId]];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: column,
      });
    }
  };

  // Define the order of columns
  const columnOrder = [
    'Bản nháp', // Draft
    'Đang chờ', // Pending
    'Việc cần làm', // To Do
    'Đang thực hiện', // In Progress
    'Xem xét', // Review
    'Đã hoàn thành', // Done
  ];

  // Define colors for columns
  const columnColors = [
    'bg-red-100',
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-purple-100',
    'bg-pink-100',
  ];

  const taskMenu = (
    <Menu>
      {tasks.map((task) => (
        <Menu.Item key={task.id}>
          <div>
            <span>{task.title}</span>
            <div>
              <Button
                type='link'
                onClick={() => handleAction(task.id, 'accept')}
                style={{ marginRight: 8 }}
              >
                Chấp nhận
              </Button>
              <Button
                type='link'
                danger
                onClick={() => handleAction(task.id, 'reject')}
              >
                Từ chối
              </Button>
            </div>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className='mx-auto p-4'>
      <h1 className='text-xl mb-3 font-semibold'>Công Việc</h1>
      <div className='flex justify-between items-center mb-4'>
        {isGroupLeader && <TaskCreateButton selectedGroup={selectedGroup} />}
        <div className='flex items-center'>
          <div className='mr-4'>
            {/* Dropdown cho các công việc được bàn giao */}
            <Dropdown
              menu={taskMenu}
              trigger={['click']}
            >
              <Button className='flex items-center bg-blue-500 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'>
                Công việc bàn giao <DownOutlined className='ml-2' />
              </Button>
            </Dropdown>
          </div>
          <div>
            <label className='mr-2'>Chọn Nhóm:</label>
            <Select
              value={selectedGroup}
              onChange={handleGroupChange}
              className='h-12 w-64'
              placeholder='Select a group'
            >
              {groups?.map((group) => (
                <Option
                  key={group.id}
                  value={group.id}
                >
                  {group.groupName}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <Spin
        spinning={loading}
        tip='Loading...'
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='flex flex-row overflow-x-auto gap-4 mt-4'>
            {columnOrder
              .filter((status) => isGroupLeader || status !== 'Bản nháp') // Filter out "Draft" for non-leaders
              .map((status, index) => (
                <div
                  key={status}
                  className='flex flex-col w-50'
                >
                  <h2
                    className={`text-lg font-semibold p-4 border rounded-lg ${
                      columnColors[index % columnColors.length]
                    }`}
                  >
                    {status}
                  </h2>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`p-4 border rounded-lg max-h-[calc(100vh-280px)] overflow-y-auto ${
                          columnColors[index % columnColors.length]
                        }`}
                      >
                        {columns[status]?.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className='p-2 mt-2 bg-white rounded shadow-md cursor-pointer'
                                onClick={() => fetchTaskDetails(task.id)}
                              >
                                <h3 className='font-medium'>{task.title}</h3>
                                <p className='text-sm text-gray-600'>
                                  <FaUser className='inline mr-1' />{' '}
                                  {task.assignedUser}
                                </p>
                                <p className='text-sm text-gray-600'>
                                  <FaCalendarAlt className='inline mr-1' />{' '}
                                  {task.dueDate}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
          </div>
        </DragDropContext>
      </Spin>
      {selectedTask && (
        <Modal
          title={selectedTask.title}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button
              key='close'
              onClick={() => setIsModalVisible(false)}
            >
              Close
            </Button>,
          ]}
        >
          <p>
            <strong>Description:</strong> {selectedTask.description}
          </p>
          <p>
            <strong>Cost:</strong> {selectedTask.cost}
          </p>
          <p>
            <strong>Status:</strong> {selectedTask.status}
          </p>
          <p>
            <strong>Assigned User:</strong> {selectedTask.userName}
          </p>
          <p>
            <strong>Event Name:</strong> {selectedTask.eventName}
          </p>
          <p>
            <strong>Event Description:</strong> {selectedTask.eventDescription}
          </p>
          <p>
            <strong>Activity Name:</strong> {selectedTask.activityName}
          </p>
          <p>
            <strong>Activity Description:</strong>{' '}
            {selectedTask.activityDescription}
          </p>
        </Modal>
      )}
    </div>
  );
}
