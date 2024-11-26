import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import TaskAPI from '../apis/task_api';
import ActivityAPI from '../apis/activity/activity_api';
import GroupAPI from '../apis/group_api';
import { useSelector } from 'react-redux';
import { Select, Spin, Dropdown, Menu, Button } from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';
import { DownOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Task() {
  // ------STATES------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState({}); // Initialize as an empty object
  const [isGroupLeader, setIsGroupLeader] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ------SELECTORS------
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);
  console.log('currentUser:', currentUser);

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

  // -----FETCH ACTIVITIES FUNCTION-----
  const fetchActivities = async (groupId) => {
    try {
      setLoading(true);
      const response = await ActivityAPI.getActivitiesByGroup(groupId);
      setActivities(response.result || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
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

  useEffect(() => {
    if (rehydrated && currentUser) {
      fetchGroups();
    }
  }, [currentUser, rehydrated]);

  useEffect(() => {
    if (selectedGroup) {
      fetchUserRole(selectedGroup);
      fetchActivities(selectedGroup);
    }
  }, [selectedGroup]);

  // -----FETCH TASKS FUNCTION-----
  const fetchTasks = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      let response;
      if (isGroupLeader) {
        response = await TaskAPI.getTasksByGroup(
          selectedGroup,
          selectedActivity
        );
      } else {
        response = await TaskAPI.getTasksByGroupAndUser(
          selectedGroup,
          currentUser.user.id,
          selectedActivity
        );
      }

      if (response && Array.isArray(response.result)) {
        // Initialize an empty object to hold tasks by status
        const columnsData = {};

        response.result.forEach((task) => {
          console.log('Task:', task);

          if (!selectedActivity || task.activityId === selectedActivity) {
            const status = task.status || 'Uncategorized';

            if (!columnsData[status]) {
              columnsData[status] = [];
            }

            columnsData[status].push({
              ...task,
              title: task.title || 'Untitled Task',
              description: task.description || 'Untitled Task',
              assignedUser: task.userName || 'Unassigned',
              dueDate: task.dueDate || 'No due date',
            });
          }
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
  }, [selectedGroup, isGroupLeader, currentUser.user.id, selectedActivity]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, selectedGroup, selectedActivity]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
    setColumns({}); // Reset columns when changing groups
  };

  const handleActivityChange = (value) => {
    setSelectedActivity(value);
    setColumns({});
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
        message.warning('Bạn không được phép bỏ vào cột này.');
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
      {selectedTask && (
        <Modal
          title={selectedTask.title}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key='close' onClick={() => setIsModalVisible(false)}>
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
