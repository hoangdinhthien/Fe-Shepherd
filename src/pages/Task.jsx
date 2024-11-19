import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import GroupAPI from '../apis/group_api';
import TaskAPI from '../apis/task_api';
import { useSelector } from 'react-redux';
import { Select, Spin, Dropdown, Menu, Button } from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';
import { DownOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Task() {
  // ------STATES------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState({}); // Initialize as an empty object

  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

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

  const fetchTasks = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const response = await TaskAPI.getTasksByGroup(selectedGroup);

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
            title: task.description || 'Untitled Task',
            assignedUser: task.userName || 'Unassigned',
            dueDate: task.dueDate || 'No due date',
          });
        });

        // Update columns state with the dynamically generated columns
        setColumns(columnsData);
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
  }, [selectedGroup]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, selectedGroup]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
    setColumns({}); // Reset columns when changing groups
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

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
  const columnOrder = ['To Do', 'In-Progress', 'Review', 'Done'];

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
      <h1 className='text-xl'>Công Việc</h1>
      <div className='flex justify-between'>
        <TaskCreateButton selectedGroup={selectedGroup} />
        <div className='flex justify-between'>
          <div className='flex pr-4'>
            <div className='mb-4'>
              {/* Dropdown cho các công việc được bàn giao */}
              <Dropdown
                className='mr-4' // Tạo khoảng cách bên phải cho dropdown
                overlay={taskMenu}
                trigger={['click']}
              >
                <Button>
                  Công việc bàn giao <DownOutlined />
                </Button>
              </Dropdown>
            </div>
            <div className='mb-4'>
              <label className='mr-2'>Chọn Nhóm:</label>
              <Select
                value={selectedGroup}
                onChange={handleGroupChange}
                style={{ width: 200 }}
                placeholder='Select a group'
              >
                {groups?.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.groupName}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
      <Spin spinning={loading} tip='Loading...'>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='grid grid-cols-4 gap-4'>
            {Object.keys(columns)
              .sort((a, b) => columnOrder.indexOf(a) - columnOrder.indexOf(b))
              .map((status) => (
                <Droppable key={status} droppableId={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className='p-4 border rounded bg-gray-100'
                    >
                      <h2 className='text-lg font-semibold'>{status}</h2>
                      {columns[status].map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className='p-2 mt-2 bg-white rounded shadow-md'
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
              ))}
          </div>
        </DragDropContext>
      </Spin>
    </div>
  );
}
