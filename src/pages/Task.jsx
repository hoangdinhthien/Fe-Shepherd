import { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import GroupAPI from '../apis/group_api';
import TaskAPI from '../apis/task_api';
import { useSelector } from 'react-redux';
import { Select, Spin } from 'antd';
import TaskCreateButton from '../components/task/TaskCreateButton';

const { Option } = Select;

export default function Task() {
  // ------STATES------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState({
    Todo: [],
    'In Progress': [],
    Pending: [],
    Completed: [],
  });

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

  useEffect(() => {
    if (rehydrated && currentUser) {
      fetchGroups();
    }
  }, [currentUser, rehydrated]);

  const fetchTasks = useCallback(async () => {
    if (!selectedGroup) return;
    const initialColumns = {
      Todo: [],
      'In Progress': [],
      Pending: [],
      Completed: [],
    };

    try {
      setLoading(true);
      const response = await TaskAPI.getTasksByGroup(selectedGroup);
      response.result.forEach((task) => {
        const status = task.status || 'Todo';
        initialColumns[status].push({
          ...task,
          title: task.description,
          assignedUser: task.userName || 'Unassigned',
          dueDate: task.dueDate || 'No due date',
        });
      });
      setColumns(initialColumns);
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
    setColumns({
      Todo: [],
      'In Progress': [],
      Pending: [],
      Completed: [],
    });
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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className='grid grid-cols-4 gap-4'>
            {Object.keys(columns).map((status) => (
              <Droppable
                key={status}
                droppableId={status}
              >
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
