import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Typography, message, Spin } from 'antd';
import MyCalendarAPI from '../../apis/admin/admin_calendar_api';
import EventAPI from '../../apis/event_api';
import CalendarHeaderBar from '../../components/calendar/CalendarHeaderBar';

const { Title, Text } = Typography;

moment.locale('vi');
const localizer = momentLocalizer(moment);

const MyCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };

  // Generate weeks for navigation
  const generateWeeks = (startDate = moment(), numWeeks = 52) => {
    const weeks = [];
    const startOfYear = moment(startDate).startOf('year');
    for (let i = 1; i <= numWeeks; i++) {
      const weekStart = moment(startOfYear)
        .add(i - 1, 'weeks')
        .startOf('week');
      const weekEnd = moment(weekStart).endOf('week');
      weeks.push({
        weekNumber: i,
        year: weekStart.year(),
        range: `${weekStart.format('DD/MM/YYYY')} - ${weekEnd.format(
          'DD/MM/YYYY'
        )}`,
        startDate: weekStart.toDate(),
        endDate: weekEnd.toDate(),
      });
    }
    return weeks;
  };

  const weeks = useMemo(() => generateWeeks(), []); // useMemo to avoid re-creating the weeks array
  const [selectedWeek, setSelectedWeek] = useState({
    week: moment().week(),
    year: moment().year(),
  });

  // Fetch ceremonies and events
  const fetchAndProcessEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Tính toán `fromDate` (ngày đầu tuần hiện tại)
      const fromDate = moment(currentDate).startOf('week').toISOString();

      // Fetch ceremonies với `fromDate`
      const ceremoniesResponse = await MyCalendarAPI.getAllCeremonies(
        fromDate
      );
      const eventsResponse = await EventAPI.getEventsByGroup({
        UserOnly: true
      });

      // Xử lý dữ liệu ceremonies
      const ceremonies = (ceremoniesResponse?.data || [])
        .map((ceremony) => ({
          ...ceremony,
          activities: ceremony.activities || [],
          type: 'ceremony',
        }))
        .map(validateAndTransformEvent)
        .filter(Boolean);

      // Xử lý dữ liệu events
      const regularEvents = (eventsResponse?.data || [])
        .map((event) => ({
          ...event,
          activities: event.activities || [],
          type: 'event',
        }))
        .map(validateAndTransformEvent)
        .filter(Boolean);

      // Kết hợp tất cả events
      const allEvents = [...ceremonies, ...regularEvents];
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      message.error('Đã xảy ra lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchAndProcessEvents();
  }, [fetchAndProcessEvents]);

  const validateAndTransformEvent = (event) => {
    if (!event || typeof event !== 'object') {
      console.warn('Invalid event object:', event);
      return null;
    }
    try {
      return {
        id:
          event.id ||
          event.ceremonyId ||
          `event-${Date.now()}-${Math.random()}`,
        title: event.eventName || event.activityName || 'Không có tiêu đề',
        start: moment(
          event.fromDate || event.startTime || event.start
        ).toDate(),
        end: moment(event.toDate || event.endTime || event.end).toDate(),
        description: event.description || '',
        type: event.type || 'unknown',
        status: event.status || 'pending',
        activities: event.activities || [],
      };
    } catch (error) {
      console.error('Error transforming event:', error, event);
      return null;
    }
  };

  const handleEventSelect = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  }, []);

  const eventPropGetter = useCallback((event) => {
    const baseStyle = {
      style: {
        fontSize: '0.85rem',
        borderRadius: '3px',
        border: 'none',
        display: 'block',
        width: '100%',
      },
    };

    switch (event.type) {
      case 'ceremony':
        return {
          ...baseStyle,
          style: {
            ...baseStyle.style,
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
          },
        };
      case 'event':
        return {
          ...baseStyle,
          style: {
            ...baseStyle.style,
            backgroundColor: '#B9FBC3',
            color: '#616161',
          },
        };
      default:
        return baseStyle;
    }
  }, []);

  const calendarProps = useMemo(
    () => ({
      localizer,
      events,
      startAccessor: 'start',
      endAccessor: 'end',
      style: { height: 'calc(100vh - 100px)' },
      defaultView: 'week',
      views: ['week'],
      step: 60,
      date: currentDate,
      onSelectEvent: handleEventSelect,
      eventPropGetter,
      onNavigate: (date) => {
        setCurrentDate(date); // Cập nhật currentDate khi thay đổi chế độ xem
        const newWeek = moment(date).week();
        const newYear = moment(date).year();
        setSelectedWeek({ week: newWeek, year: newYear });
      },
      components: {
        toolbar: (props) => (
          <CalendarHeaderBar
            {...props}
            currentWeek={selectedWeek.week}
            selectedWeek={selectedWeek}
            weeks={weeks}
            handleWeekChange={(weekNumber, year) => {
              const selectedWeekData = weeks.find(
                (week) => week.weekNumber === weekNumber && week.year === year
              );
              if (selectedWeekData) {
                setCurrentDate(selectedWeekData.startDate);
                setSelectedWeek({ week: weekNumber, year });
              }
            }}
          />
        ),
      },
    }),
    [
      events,
      currentDate,
      handleEventSelect,
      eventPropGetter,
      selectedWeek,
      weeks,
    ]
  );

  if (error) {
    return <div className='p-4 text-red-600'>{error}</div>;
  }

  return (
    <div className='h-screen p-5'>
      <Spin spinning={loading} tip='Đang tải dữ liệu...'>
        <BigCalendar {...calendarProps} />
      </Spin>

      <Modal
        title={
          <Title level={3} className='text-center text-blue-600'>
            {selectedEvent?.title || 'Chi tiết sự kiện'}
          </Title>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
        className='bg-gray-100 rounded-lg shadow-lg'
      >
        {selectedEvent && (
          <div className='px-6 py-8 bg-white rounded-lg shadow-md'>
            <Text className='block text-lg font-semibold mb-4 text-gray-800'>
              {selectedEvent.description || 'Không có mô tả'}
            </Text>
            <Text className='block mb-4 text-gray-600'>
              <strong>Thời gian:</strong>{' '}
              {moment(selectedEvent.start).format('HH:mm DD/MM/YYYY')} -{' '}
              {moment(selectedEvent.end).format('HH:mm DD/MM/YYYY')}
            </Text>
            <Text className='block mb-4 text-gray-600'>
              <strong>Trạng thái:</strong>{' '}
              {selectedEvent.status || 'Đang xử lý'}
            </Text>
            {selectedEvent.activities && selectedEvent.activities.length > 0 ? (
              <div className='mt-4'>
                <Title
                  level={4}
                  className='text-lg font-semibold text-blue-500 mb-2'
                >
                  Danh sách hoạt động
                </Title>
                <ul className='space-y-3'>
                  {selectedEvent.activities.map((activity) => (
                    <li
                      key={activity.id}
                      className='p-3 bg-gray-50 border-l-4 border-blue-500 rounded-lg shadow-sm'
                    >
                      <Text className='font-semibold text-blue-700'>
                        {activity.activityName ||
                          'Tên hoạt động không xác định'}
                      </Text>
                      <div className='text-gray-600'>
                        <p>
                          <strong>Mô tả:</strong>{' '}
                          {activity.description || 'Không có mô tả'}
                        </p>
                        <p>
                          <strong>Thời gian:</strong>{' '}
                          {moment(activity.startTime).format('HH:mm')} -{' '}
                          {moment(activity.endTime).format('HH:mm')}
                        </p>
                        <p>
                          <strong>Trạng thái:</strong>{' '}
                          {activity.status || 'Đang xử lý'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Text className='block text-gray-600 mt-4'>
                Không có hoạt động nào được liên kết với sự kiện này.
              </Text>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCalendar;
