import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import GroupAPI from '../apis/group_api';
import TaskAPI from '../apis/task_api';
import { useSelector } from 'react-redux';
import { Select, Spin } from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';

const { Option } = Select;

export default function Activity() {
  // ------STATE------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState({
    Todo: [],
    'In Progress': [],
    Pending: [],
    Completed: [],
  });

  // Select `currentUser` and rehydration state separately
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  const fetchGroups = async () => {
    if (!currentUser || !currentUser.user?.id) return;

    console.log('hi');

    try {
      setLoading(true);
      const response = await GroupAPI.getGroupsForUser(currentUser.user.id);
      setGroups(response.result);
      if (response.result.length > 0) {
        setSelectedGroup(response.result[0].id); // Set initial group selection
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rehydrated && currentUser) {
      fetchGroups();
    }
  }, [currentUser, rehydrated]);

  // Fetch tasks based on selected group
  // Fetch tasks based on selected group
  const fetchTasks = async () => {
    if (!selectedGroup) return;

    try {
      setLoading(true);
      const response = await TaskAPI.getTasksByGroup(selectedGroup);

      // Dynamically initialize columns based on task statuses
      const newColumns = {
        Todo: [],
        'In Progress': [],
        Pending: [],
        Completed: [],
      };

      if (response.result?.length > 0) {
        response.result.forEach((task) => {
          const status = task.status || 'Todo'; // Ensure consistent casing with the column names
          if (!newColumns[status]) {
            newColumns[status] = []; // Initialize array if status doesn't exist
          }
          newColumns[status].push({
            ...task,
            title: task.description, // Assuming `description` is the task title
            assignedUser: task.groupUser?.name || 'Unassigned',
            dueDate: task.dueDate || '2023-06-10', // Placeholder date or task.dueDate
          });
        });
      }

      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedGroup]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn];
      const destItems = [...destColumn];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, {
        ...removed,
        status: destination.droppableId,
      });
      setColumns({
        ...columns,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: copiedItems,
      });
    }
  };

  return (
    <div className='mx-auto p-4'>
      <h1 className='text-xl'>Task</h1>
      <div className='flex justify-between'>
        <TaskCreateButton />

        <div className='mb-4'>
          <label className='mr-2'>Select Group:</label>
          <Select
            value={selectedGroup}
            onChange={handleGroupChange}
            style={{ width: 200 }}
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
      <Spin
        spinning={loading}
        tip='Loading...'
      >
        <DragDropContext
          onDragEnd={onDragEnd}
          className='flex flex-col h-screen'
        >
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {Object.entries(columns)?.map(([columnId, tasks]) => (
              <div
                key={columnId}
                className='bg-gray-300 p-4 rounded-lg mt-2'
              >
                <h2 className='text-xl font-semibold mb-4'>{columnId}</h2>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className='min-h-[300px]'
                    >
                      {tasks?.length > 0 ? (
                        tasks?.map((task, index) => (
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
                                className='bg-white p-4 rounded-lg shadow-sm mb-4 hover:shadow-lg transition-shadow duration-300'
                              >
                                <h3 className='text-lg font-semibold mb-2'>
                                  {task.title}
                                </h3>
                                <p className='text-gray-600 mb-2'>
                                  {task.description}
                                </p>
                                <div className='flex items-center text-sm text-gray-500 mb-2'>
                                  <FaUser className='mr-2' />
                                  <span>{task.assignedUser}</span>
                                </div>
                                <div className='flex items-center text-sm text-gray-500 mb-2'>
                                  <FaCalendarAlt className='mr-2' />
                                  <span>{task.dueDate}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <div className='text-gray-500 text-center mt-4'>
                          No tasks available
                        </div>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </Spin>
    </div>
  );
}
