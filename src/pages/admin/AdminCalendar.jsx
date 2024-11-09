import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Typography } from 'antd';
import AdminCalendarAPI from '../../apis/admin/admin_calendar_api';
import CustomAdminHeaderBar from '../../components/calendar/CustomAdminHeaderBar';

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

const AdminCalendar = () => {
  const [ceremonies, setCeremonies] = useState([]);
  const [selectedCeremony, setSelectedCeremony] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(moment().week());
  const [currentDate, setCurrentDate] = useState(
    moment().startOf('week').toDate()
  );

  const fetchCeremonies = async () => {
    try {
      const ceremonies = await AdminCalendarAPI.getAllCeremonies();
      console.log('Fetched data:', ceremonies);

      // Kiểm tra xem ceremonies có chứa dữ liệu không và là một mảng
      const ceremonyData = Array.isArray(ceremonies)
        ? ceremonies.map((ceremony) => ({
            id: ceremony.id,
            title: ceremony.name,
            start: new Date(ceremony.fromDate),
            end: new Date(ceremony.toDate),
            description: ceremony.description,
            activities: ceremony.activityPresets || [], // Sử dụng activityPresets nếu có
          }))
        : [];
      setCeremonies(ceremonyData); // Cập nhật trực tiếp danh sách ceremonies
    } catch (error) {
      console.error('Failed to fetch ceremonies:', error);
    }
  };

  // Gọi fetchCeremonies mỗi khi currentDate thay đổi
  useEffect(() => {
    fetchCeremonies(currentDate);
  }, [currentDate]);

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

  const handleWeekChange = (value) => {
    const newWeek = parseInt(value);
    setSelectedWeek(newWeek);
    const { start: newStart } = getWeekRange(newWeek);
    setCurrentDate(newStart.toDate());
  };

  const handleCeremonySelect = (ceremony) => {
    setSelectedCeremony(ceremony);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedCeremony(null);
  };

  return (
    <div style={{ height: '100vh' }}>
      <BigCalendar
        localizer={localizer}
        events={ceremonies}
        startAccessor='start'
        endAccessor='end'
        defaultView='week'
        step={60}
        showMultiDayTimes
        date={currentDate}
        onNavigate={handleNavigate}
        onSelectEvent={handleCeremonySelect}
        components={{
          toolbar: (props) => (
            <CustomAdminHeaderBar
              {...props}
              currentWeek={selectedWeek}
              handleWeekChange={handleWeekChange}
              onNavigate={handleNavigate}
            />
          ),
        }}
        style={{ height: '100vh' }}
      />

      <Modal
        title={<Title level={3}>{selectedCeremony?.title}</Title>}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
      >
        {selectedCeremony && (
          <div>
            <Text className='block text-lg font-semibold mb-4 text-gray-800'>
              {selectedCeremony.description}
            </Text>
            <Title
              level={4}
              className='text-lg font-semibold text-blue-500 mb-2'
            >
              Activities
            </Title>
            {Array.isArray(selectedCeremony.activities) &&
            selectedCeremony.activities.length > 0 ? (
              <ul className='space-y-3'>
                {selectedCeremony.activities.map((activity) => (
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
                        - {moment(activity.endTime, 'HH:mm:ss').format('HH:mm')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Text>No activities available</Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCalendar;
