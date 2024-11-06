// MyCalendar.jsx
import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Typography } from 'antd';
import '../../pages/calendar/calendar.css';
import useFetchGroups from '../../hooks/useFetchGroups';
import EventAPI from '../../apis/event_api';
import CustomToolbar from '../../components/calendar/CustomToolBar';

const { Title, Text } = Typography;
const localizer = momentLocalizer(moment);

const getWeekRange = (weekNumber) => {
  const now = moment()
    .startOf('year')
    .add(weekNumber - 1, 'weeks');
  const startOfWeek = now.clone().startOf('week');
  const endOfWeek = now.clone().endOf('week');
  return { start: startOfWeek, end: endOfWeek };
};

const MyCalendar = () => {
  const { groups, loading: loadingGroups } = useFetchGroups();
  const [myEvents, setMyEvents] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(moment().week());
  const [currentDate, setCurrentDate] = useState(
    moment().startOf('week').toDate()
  );
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchEvents = async (date, groupId) => {
    try {
      const chosenDate = moment(date).toISOString();
      const events = await EventAPI.getEventsByGroupAndDate(
        chosenDate,
        groupId || '',
        1,
        false,
        true
      );
      setMyEvents(
        events.data.map((event) => ({
          ...event,
          title: event.eventName,
          start: new Date(event.fromDate),
          end: new Date(event.toDate),
        }))
      );
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    fetchEvents(currentDate, selectedGroup);
  }, [currentDate, selectedGroup]);

  const handleWeekChange = (value) => {
    const newWeek = parseInt(value);
    setSelectedWeek(newWeek);
    const { start: newStart } = getWeekRange(newWeek);
    setCurrentDate(newStart.toDate());
  };

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const handleNavigate = (action) => {
    if (action === 'PREV') {
      const newWeek = selectedWeek - 1;
      if (newWeek >= 1) {
        setSelectedWeek(newWeek);
        const { start: newStart } = getWeekRange(newWeek);
        setCurrentDate(newStart.toDate());
      }
    } else if (action === 'NEXT') {
      const newWeek = selectedWeek + 1;
      if (newWeek <= 52) {
        setSelectedWeek(newWeek);
        const { start: newStart } = getWeekRange(newWeek);
        setCurrentDate(newStart.toDate());
      }
    } else if (action === 'TODAY') {
      const currentWeekNumber = moment().week();
      setSelectedWeek(currentWeekNumber);
      const { start: newStart } = getWeekRange(currentWeekNumber);
      setCurrentDate(newStart.toDate());
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  return (
    <div style={{ height: '100vh' }}>
      <BigCalendar
        localizer={localizer}
        events={myEvents}
        startAccessor='start'
        endAccessor='end'
        defaultView='week'
        step={60}
        showMultiDayTimes
        date={currentDate}
        onSelectEvent={handleEventSelect}
        components={{
          toolbar: (props) => (
            <CustomToolbar
              {...props}
              currentWeek={selectedWeek}
              handleWeekChange={handleWeekChange}
              selectedGroup={selectedGroup}
              handleGroupChange={handleGroupChange}
              groups={groups}
              onNavigate={handleNavigate}
            />
          ),
        }}
        style={{ height: '100vh' }}
      />

      {/* Event Details Modal */}
      <Modal
        title={
          <Title level={3} className='text-center text-blue-600'>
            {selectedEvent?.eventName}
          </Title>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800} // Make the modal wider
        centered // Center the modal on the screen
        className=' bg-gray-100 rounded-lg shadow-lg'
      >
        {selectedEvent && (
          <div className='px-6 py-8 mb-8  bg-white rounded-lg shadow-md'>
            <Text className='block text-lg font-semibold mb-4 text-gray-800'>
              {selectedEvent.description}
            </Text>
            <Text className='block mb-4 text-gray-600'>
              <strong>Date:</strong> {selectedEvent.status}
            </Text>
            <div className='mt-4'>
              <Title
                level={4}
                className='text-lg font-semibold text-blue-500 mb-2'
              >
                Activities
              </Title>
              <ul className='space-y-3'>
                {selectedEvent.activities.map((activity) => (
                  <li
                    key={activity.id}
                    className='p-3 bg-gray-50 border-l-4 border-blue-500 rounded-lg shadow-sm'
                  >
                    <Text className='font-semibold text-blue-700'>
                      {activity.activityName}
                    </Text>
                    <div className='text-gray-600'>
                      <span className='block'>{activity.description}</span>
                      <span>
                        {moment(activity.startTime, 'HH:mm:ss').format('HH:mm')}{' '}
                        -{moment(activity.endTime, 'HH:mm:ss').format('HH:mm')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCalendar;
