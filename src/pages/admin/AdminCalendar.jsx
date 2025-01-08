import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Typography, message, Spin } from 'antd';
import AdminCalendarAPI from '../../apis/admin/admin_calendar_api';
import EventAPI from '../../apis/event_api';
import CustomAdminHeaderBar from '../../components/calendar/CustomAdminHeaderBar';
import EditCeremonyPopUp from '../../components/admin/EditCeremonyPopUp';

const { Title } = Typography;

// Logger Utility
const Logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || ''),
};

moment.locale('vi');
const localizer = momentLocalizer(moment);

// Default event configuration
const DEFAULT_EVENT = {
  title: 'Không có tiêu đề',
  start: new Date(),
  end: new Date(),
  type: 'unknown',
};

// Event validation and transformation
const validateAndTransformEvent = (event) => {
  if (!event || typeof event !== 'object') {
    Logger.warn('Invalid event object:', event);
    return null;
  }

  try {
    return {
      id:
        event.id || event.ceremonyId || `event-${Date.now()}-${Math.random()}`,
      title: event.eventName || event.activityName || DEFAULT_EVENT.title,
      start: moment(event.fromDate || event.startTime || event.start).toDate(),
      end: moment(event.toDate || event.endTime || event.end).toDate(),
      description: event.description || '',
      type: event.type || DEFAULT_EVENT.type,
      status: event.status || 'pending',
      resourceId: event.resourceId || null,
      allDay: event.allDay || false,
    };
  } catch (error) {
    Logger.error('Error transforming event:', error, event);
    return null;
  }
};

// Helper function to generate weeks
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

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment().toDate());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);

  // Week management state
  const [weeks] = useState(() => generateWeeks());
  const [selectedWeek, setSelectedWeek] = useState({
    week: moment().week(),
    year: moment().year(),
  });

  // Fetch data and process events
  const fetchAndProcessEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch ceremonies
      const ceremoniesResponse = await AdminCalendarAPI.getAllCeremonies();
      Logger.info('Ceremonies raw data:', ceremoniesResponse?.data);

      // Fetch events
      const eventsResponse = await EventAPI.getEventsByGroup();
      Logger.info('Events raw data:', eventsResponse?.data);

      // Process ceremonies
      const ceremonies = (ceremoniesResponse?.data || [])
        .map((ceremony) => {
          const mainEvent = validateAndTransformEvent({
            ...ceremony,
            type: 'ceremony',
          });

          const activityEvents = (ceremony.activities || [])
            .map((activity) =>
              validateAndTransformEvent({
                ...activity,
                type: 'activity',
              })
            )
            .filter(Boolean);

          return [mainEvent, ...activityEvents];
        })
        .flat()
        .filter(Boolean);

      // Process regular events
      const regularEvents = (eventsResponse?.data || [])
        .map((event) =>
          validateAndTransformEvent({
            ...event,
            type: 'event',
          })
        )
        .filter(Boolean);

      // Combine all events and validate
      const allEvents = [...ceremonies, ...regularEvents].filter((event) => {
        const isValid =
          event &&
          event.title &&
          moment(event.start).isValid() &&
          moment(event.end).isValid();

        if (!isValid) {
          Logger.warn('Filtered out invalid event:', event);
        }
        return isValid;
      });

      Logger.info('Final processed events:', allEvents);
      setEvents(allEvents);
    } catch (error) {
      Logger.error('Error fetching events:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      message.error('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndProcessEvents();
  }, [fetchAndProcessEvents]);

  const handleWeekChange = useCallback(
    (weekNumber, year) => {
      const selectedWeekData = weeks.find(
        (week) => week.weekNumber === weekNumber && week.year === year
      );

      if (selectedWeekData) {
        setCurrentDate(selectedWeekData.startDate);
        setSelectedWeek({ week: weekNumber, year });
      }
    },
    [weeks]
  );

  const handleEventSelect = useCallback((event) => {
    Logger.info('Selected event:', event);
    setSelectedEvent(event);
    setIsModalVisible(true);
  }, []);

  const handleEditButtonClick = useCallback(() => {
    setIsEditPopupVisible(true);
  }, []);

  const eventPropGetter = useCallback((event) => {
    if (!event?.type) return {};

    const baseStyle = {
      className: '',
      style: {
        fontSize: '0.85rem',
        borderRadius: '3px',
        border: 'none',
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
      case 'activity':
        return {
          ...baseStyle,
          style: {
            ...baseStyle.style,
            backgroundColor: '#fff3e0',
            color: '#f57c00',
          },
        };
      default:
        return {
          ...baseStyle,
          style: {
            ...baseStyle.style,
            backgroundColor: '#B9FBC3',
            color: '#616161',
          },
        };
    }
  }, []);

  const calendarProps = useMemo(
    () => ({
      localizer,
      events: events || [],
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
        setCurrentDate(date);
        const newWeek = moment(date).week();
        const newYear = moment(date).year();
        setSelectedWeek({ week: newWeek, year: newYear });
      },
      components: {
        toolbar: (props) => (
          <CustomAdminHeaderBar
            {...props}
            currentWeek={selectedWeek.week}
            selectedWeek={selectedWeek}
            weeks={weeks}
            handleWeekChange={handleWeekChange}
            handleEditButtonClick={handleEditButtonClick}
            onNavigate={(action) => {
              let newDate;
              switch (action) {
                case 'PREV':
                  newDate = moment(currentDate).subtract(1, 'week');
                  break;
                case 'NEXT':
                  newDate = moment(currentDate).add(1, 'week');
                  break;
                case 'TODAY':
                  newDate = moment();
                  break;
                default:
                  return;
              }
              setCurrentDate(newDate.toDate());
              setSelectedWeek({
                week: newDate.week(),
                year: newDate.year(),
              });
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
      handleWeekChange,
      handleEditButtonClick,
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
        title={selectedEvent?.title || 'Chi tiết sự kiện'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedEvent && (
          <div>
            <p>
              <strong>Thời gian:</strong>{' '}
              {moment(selectedEvent.start).format('HH:mm DD/MM/YYYY')} -{' '}
              {moment(selectedEvent.end).format('HH:mm DD/MM/YYYY')}
            </p>
            <p>
              <strong>Loại:</strong> {selectedEvent.type}
            </p>
            <p>
              <strong>Mô tả:</strong>{' '}
              {selectedEvent.description || 'Không có mô tả'}
            </p>
          </div>
        )}
      </Modal>

      <EditCeremonyPopUp
        isOpen={isEditPopupVisible}
        onClose={() => setIsEditPopupVisible(false)}
        onSave={fetchAndProcessEvents}
      />
    </div>
  );
};

export default AdminCalendar;
