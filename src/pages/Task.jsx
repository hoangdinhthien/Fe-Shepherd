import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import TaskAPI from '../apis/task_api';
import ActivityAPI from '../apis/activity/activity_api';
import GroupAPI from '../apis/group_api';
import { useSelector } from 'react-redux';
import { Select, Spin, Button, Modal, message, Card, Divider } from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';

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

  // -----FETCH TASK DETAILS FUNCTION-----
  const fetchTaskDetails = async (taskId) => {
    try {
      setLoading(true);
      const response = await TaskAPI.getById(taskId);
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
        message.warning('Bạn không được phép bỏ vào cột này.');
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

  // Define colors for columns
  const columnColors = [
    'bg-red-100',
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-purple-100',
    'bg-pink-100',
  ];

  return (
    <div className='mx-auto p-4'>
      <h1 className='text-xl mb-3 font-semibold'>Công Việc</h1>
      <div className='flex justify-between items-center mb-4'>
        {isGroupLeader && activities.length > 0 && (
          <>
            <TaskCreateButton
              selectedGroup={selectedGroup}
              selectedActivity={selectedActivity}
              activityName={
                activities.find((activity) => activity.id === selectedActivity)
                  ?.activityName || ''
              }
            />
          </>
        )}
        <div className='flex items-center ml-auto'>
          <div>
            <label className='mr-4'>Chọn Nhóm:</label>
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
          <div className='ml-4'>
            <label className='mr-2'>Chọn Hoạt Động:</label>
            <Select
              value={selectedActivity}
              onChange={handleActivityChange}
              className='h-12 w-64'
              placeholder='Chọn Hoạt Động'
            >
              {activities.map((activity) => (
                <Option
                  key={activity.id}
                  value={activity.id}
                >
                  {activity.activityName}
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
        {!selectedGroup && (
          <div className='text-center text-gray-500'>
            Vui lòng chọn nhóm để xem công việc.
          </div>
        )}
        {selectedGroup && !selectedActivity && (
          <div className='text-center text-gray-500'>
            Vui lòng chọn hoạt động để xem công việc.
          </div>
        )}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='flex flex-row overflow-x-auto gap-4 mt-4'>
            {columnOrder
              .filter((status) => isGroupLeader || status !== 'Bản nháp') // Filter out "Draft" for non-leaders
              .map((status, index) => (
                <div
                  key={status}
                  className='flex flex-col flex-1 max-h-[calc(100vh-200px)]'
                >
                  <h2
                    className={`text-lg font-semibold p-4 border rounded-t ${
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
                        className={`p-4 border rounded-b max-h-[calc(100vh-350px)] overflow-y-auto ${
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
          width={750}
        >
          <Card bordered={false}>
            <div className='space-y-4'>
              <div className='flex justify-between'>
                <strong className='text-gray-700'>Tên hoạt động:</strong>
                <p className='text-gray-900'>{selectedTask.activityName}</p>
              </div>
              <div className='flex justify-between'>
                <strong className='text-gray-700'>Mô tả hoạt động:</strong>
                <p className='text-gray-900'>
                  {selectedTask.activityDescription}
                </p>
              </div>
              <div className='flex justify-between'>
                <strong className='text-gray-700'>Mô tả:</strong>
                <p className='text-gray-900'>{selectedTask.description}</p>
              </div>
              <div className='flex justify-between'>
                <strong className='text-gray-700'>Chi phí:</strong>
                <p className='text-gray-900'>{selectedTask.cost} VND</p>
              </div>
              <div className='flex justify-between'>
                <strong className='text-gray-700'>Trạng thái:</strong>
                <p className='text-gray-900'>{selectedTask.status}</p>
              </div>
              <div className='flex justify-between'>
                <strong className='text-gray-700'>Người phụ trách:</strong>
                <p className='text-gray-900'>{selectedTask.userName}</p>
              </div>
              <Divider
                orientation='center'
                style={{ borderColor: '#9a9a9a', marginTop: '2rem' }}
              >
                <strong>Hoạt Động Thuộc Sự Kiện</strong>
              </Divider>
              <div className='flex flex-col'>
                <strong className='text-gray-700 text-center text-lg'>
                  Tên sự kiện:
                </strong>
                <p className='text-gray-900 text-center'>
                  {selectedTask.eventName}
                </p>
              </div>
              <div className='flex flex-col'>
                <strong className='text-gray-700 text-center text-lg'>
                  Mô tả sự kiện:
                </strong>
                <p className='text-gray-900 text-center'>
                  {selectedTask.eventDescription}
                </p>
              </div>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  );
}
