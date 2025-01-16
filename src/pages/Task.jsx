import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import TaskAPI from '../apis/task_api';
import ActivityAPI from '../apis/activity/activity_api';
import GroupAPI from '../apis/group_api';
import EventAPI from '../apis/event_api'; // Import EventAPI
import { useSelector } from 'react-redux';
import { Select, Spin, message } from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import TaskDetail from '../components/task/TaskDetail'; // Import TaskDetail component

const { Option } = Select;

export default function Task() {
  // ------STATES------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null); // Add state for selected event
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]); // Add state for events
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState({}); // Initialize as an empty object
  const [isGroupLeader, setIsGroupLeader] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ------SELECTORS------
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  const location = useLocation(); // Get the location object
  const navigate = useNavigate(); // Get the navigate function

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
  const fetchActivities = async (groupId, eventId) => {
    try {
      setLoading(true);
      const response = await ActivityAPI.getActivitiesByGroupAndEvent(
        groupId,
        eventId
      );
      setActivities(response.result || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // -----FETCH EVENTS FUNCTION-----
  const fetchEvents = async (groupId) => {
    try {
      setLoading(true);
      const response = await EventAPI.getEventsByGroupForTask(groupId);
      console.log('response:', response.data);

      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // -----FETCH TASKS FUNCTION-----
  const fetchTasks = useCallback(async () => {
    if (!selectedGroup || !selectedActivity) return;
    setLoading(true);
    try {
      const response = await TaskAPI.getTasksByGroup(
        selectedGroup,
        selectedActivity
      );
      console.log('response:', response);

      if (response && Array.isArray(response.result)) {
        // Initialize an empty object to hold tasks by status
        const columnsData = {};

        response.result.forEach((task) => {
          if (isGroupLeader || task.userId === currentUser.user.id) {
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
  }, [selectedGroup, selectedActivity, isGroupLeader, currentUser.user.id]);

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

    // Extract eventId and groupId from URL query parameters
    const params = new URLSearchParams(location.search);
    const activityId = params.get('activityId');
    const groupId = params.get('groupId');
    const eventId = params.get('eventId'); // Extract eventId

    if (groupId) {
      setSelectedGroup(groupId);
    }

    if (eventId) {
      setSelectedEvent(eventId); // Set selectedEvent
    }

    if (activityId) {
      setSelectedActivity(activityId);
    }
  }, [currentUser, rehydrated, location.search]);

  useEffect(() => {
    if (selectedGroup) {
      fetchUserRole(selectedGroup);
      fetchEvents(selectedGroup); // Fetch events when a group is selected
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup && selectedEvent) {
      fetchActivities(selectedGroup, selectedEvent); // Fetch activities when an event is selected
    }
  }, [selectedGroup, selectedEvent]);

  useEffect(() => {
    if (selectedGroup && selectedEvent && selectedActivity !== null) {
      fetchTasks();
    }
  }, [fetchTasks, selectedGroup, selectedEvent, selectedActivity]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
    setSelectedEvent(null); // Reset selected event
    setSelectedActivity(null); // Reset selected activity
    setColumns({}); // Reset columns when changing groups
    navigate(`/user/task?groupId=${value}`);
  };

  const handleEventChange = (value) => {
    setSelectedEvent(value);
    setSelectedActivity(null); // Reset selected activity
    setColumns({});
    navigate(`/user/task?groupId=${selectedGroup}&eventId=${value}`);
  };

  const handleActivityChange = (value) => {
    setSelectedActivity(value);
    setColumns({});
    navigate(
      `/user/task?groupId=${selectedGroup}&eventId=${selectedEvent}&activityId=${value}`
    );
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
        !allowedColumns.includes(destination.droppableId) ||
        (source.droppableId === 'Đã hoàn thành' &&
          (destination.droppableId === 'Đang chờ' ||
            destination.droppableId === 'Bản nháp'))
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

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTask(null);
  };

  return (
    <div className='mx-auto p-4'>
      <h1 className='text-xl mb-3 font-semibold'>Công Việc Trong Tháng Này</h1>
      {/* -----TOP SECTION----- */}
      <div className='flex justify-between items-center mb-4'>
        {isGroupLeader && (
          <div className='mr-4'>
            <TaskCreateButton
              selectedGroup={selectedGroup}
              selectedActivity={selectedActivity}
              activityName={
                activities.find((activity) => activity.id === selectedActivity)
                  ?.activityName || ''
              }
            />
          </div>
        )}
        <div className='flex items-center ml-auto space-x-4'>
          <div>
            <label className='mr-2 text-gray-700 font-semibold'>
              Chọn Nhóm:
            </label>
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
          <div>
            <label className='mr-2 text-gray-700 font-semibold'>
              Chọn Sự Kiện:
            </label>
            <Select
              value={selectedEvent}
              onChange={handleEventChange}
              className='h-12 w-64'
              placeholder='Chọn Sự Kiện'
            >
              {events.map((event) => (
                <Option
                  key={event.id}
                  value={event.id}
                >
                  {event.eventName}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className='mr-2 text-gray-700 font-semibold'>
              Chọn Hoạt Động:
            </label>
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
          {/* {selectedActivity && (
            <div className='ml-5'>
              <p className='text-gray-700 font-semibold'>
                Hoạt động này thuộc Sự Kiện:
              </p>
              <span className='text-gray-900 font-semibold'>
                {activities.find((activity) => activity.id === selectedActivity)
                  ?.event.eventName || 'Không có sự kiện'}
              </span>
            </div>
          )} */}
        </div>
      </div>

      {/* -----LOADING AND TASKS----- */}
      <Spin
        spinning={loading}
        tip='Loading...'
      >
        {!selectedGroup && (
          <div className='text-center text-gray-500'>
            Vui lòng chọn nhóm để xem công việc.
          </div>
        )}
        {selectedGroup && !selectedEvent && (
          <div className='text-center text-gray-500'>
            Vui lòng chọn sự kiện để xem công việc.
          </div>
        )}
        {selectedGroup && selectedEvent && !selectedActivity && (
          <div className='text-center text-gray-500'>
            Vui lòng chọn hoạt động để xem công việc.
          </div>
        )}
        {selectedGroup && selectedEvent && selectedActivity && (
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
                      {(
                        provided = { innerRef: () => {}, droppableProps: {} }
                      ) => (
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
            {Object.values(columns).every((tasks) => tasks.length === 0) && (
              <p className='text-center text-gray-500 mt-4'>
                Không có công việc
              </p>
            )}
          </DragDropContext>
        )}
      </Spin>

      {/* -----TASK DETAILS----- */}
      {selectedTask && (
        <TaskDetail
          selectedTask={selectedTask}
          isModalVisible={isModalVisible}
          setIsModalVisible={handleModalClose}
          isGroupLeader={isGroupLeader}
        />
      )}
    </div>
  );
}
