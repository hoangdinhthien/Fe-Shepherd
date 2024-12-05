import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Typography, Button } from 'antd';
import AdminCalendarAPI from '../../apis/admin/admin_calendar_api';
import EventAPI from '../../apis/event_api'; // Import EventAPI
import CustomAdminHeaderBar from '../../components/calendar/CustomAdminHeaderBar';
import EditCeremonyPopUp from '../../components/admin/EditCeremonyPopUp';

const { Title, Text } = Typography;
const localizer = momentLocalizer(moment);

moment.locale('vi');

const getWeekRange = (weekNumber) => {
  const now = moment()
    .startOf('year')
    .add(weekNumber - 1, 'weeks');
  const startOfWeek = now.clone().startOf('week');
  const endOfWeek = now.clone().endOf('week');
  return {
    start: startOfWeek,
    end: endOfWeek,
    range: `${startOfWeek.format('DD MMMM YYYY')} - ${endOfWeek.format(
      'DD MMMM YYYY'
    )}`,
  };
};

const AdminCalendar = () => {
  const [ceremonies, setCeremonies] = useState([]);
  const [selectedCeremony, setSelectedCeremony] = useState(null); // Ceremony hoặc Event được chọn
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái modal
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false); // Trạng thái edit popup
  const [selectedWeek, setSelectedWeek] = useState({
    week: moment().week(),
    year: moment().year(),
  }); // Lưu tuần và năm
  const [currentDate, setCurrentDate] = useState(
    moment().startOf('week').toDate()
  );

  // Hàm fetch sự kiện từ AdminCalendarAPI
  const fetchCeremonies = async () => {
    try {
      const ceremonies = await AdminCalendarAPI.getAllCeremonies();
      const ceremonyData = Array.isArray(ceremonies)
        ? ceremonies.map((ceremony) => ({
            id: ceremony.id,
            title: ceremony.eventName, // Sử dụng eventName làm tiêu đề
            start: new Date(ceremony.fromDate), // Ngày bắt đầu
            end: new Date(ceremony.toDate), // Ngày kết thúc
            description: ceremony.description, // Mô tả
            status: ceremony.status, // Trạng thái sự kiện
            activities: ceremony.activities || [], // Hoạt động liên quan
          }))
        : [];
      return ceremonyData;
    } catch (error) {
      console.error('Failed to fetch ceremonies:', error);
      return [];
    }
  };

  // Hàm fetch sự kiện từ EventAPI
  const fetchEvents = async () => {
    try {
      const events = await EventAPI.getEventsByGroup(); // Lấy tất cả sự kiện từ EventAPI
      const eventData = Array.isArray(events)
        ? events.map((event) => ({
            id: event.id,
            title: event.name, // Sử dụng name làm tiêu đề
            start: new Date(event.startDate), // Ngày bắt đầu
            end: new Date(event.endDate), // Ngày kết thúc
            description: event.description, // Mô tả
            status: event.status, // Trạng thái sự kiện
          }))
        : [];
      console.log(eventData);
      return eventData;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      return [];
    }
  };

  // Hàm lấy cả sự kiện từ AdminCalendarAPI và EventAPI
  const fetchAllEvents = async () => {
    const ceremonyData = await fetchCeremonies();
    const eventData = await fetchEvents();
    setCeremonies([...ceremonyData, ...eventData]); // Kết hợp dữ liệu từ hai API
  };

  useEffect(() => {
    fetchAllEvents(); // Lấy dữ liệu khi component mount hoặc currentDate thay đổi
  }, [currentDate]);

  const handleWeekChange = (weekNumber, year) => {
    const newStartOfWeek = moment().year(year).week(weekNumber).startOf('week');
    setSelectedWeek({ week: weekNumber, year }); // Cập nhật tuần và năm
    setCurrentDate(newStartOfWeek.toDate()); // Đồng bộ lịch hiển thị
  };

  const handleNavigate = (action) => {
    let { week, year } = selectedWeek;

    if (action === 'PREV') {
      week -= 1;
      if (week < 1) {
        year -= 1; // Năm trước
        week = moment().year(year).weeksInYear(); // Tuần cuối cùng
      }
    } else if (action === 'NEXT') {
      week += 1;
      if (week > moment().year(year).weeksInYear()) {
        year += 1; // Năm tiếp theo
        week = 1; // Tuần đầu tiên
      }
    } else if (action === 'TODAY') {
      week = moment().week();
      year = moment().year();
    }

    handleWeekChange(week, year);
  };

  const handleEventSelect = (event) => {
    setSelectedCeremony(event); // Lưu thông tin ceremony hoặc event được chọn
    setIsModalVisible(true); // Hiển thị modal chi tiết
  };

  return (
    <div style={{ height: '100vh' }}>
      <BigCalendar
        localizer={localizer}
        events={ceremonies} // Danh sách sự kiện với title là eventName
        startAccessor='start'
        endAccessor='end'
        defaultView='week'
        step={60}
        showMultiDayTimes
        date={currentDate}
        onSelectEvent={handleEventSelect} // Xử lý khi bấm vào sự kiện
        components={{
          toolbar: (props) => (
            <CustomAdminHeaderBar
              {...props}
              currentWeek={selectedWeek.week}
              selectedWeek={selectedWeek}
              handleWeekChange={(weekNumber, year) =>
                handleWeekChange(weekNumber, year)
              }
              onNavigate={handleNavigate}
              handleEditButtonClick={() => setIsEditPopupVisible(true)}
            />
          ),
        }}
        style={{ height: '100vh' }}
      />

      {/* Modal hiển thị chi tiết */}
      <Modal
        title={<Title level={3}>{selectedCeremony?.title}</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        centered
      >
        {selectedCeremony && (
          <div>
            <Text>{selectedCeremony.description}</Text>
            <Title level={4}>Activities</Title>
            <ul>
              {selectedCeremony.activities?.map((activity) => (
                <li key={activity.id}>
                  <Text strong>{activity.activityName}</Text>:{' '}
                  {activity.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      {/* Popup chỉnh sửa ceremony */}
      <EditCeremonyPopUp
        isOpen={isEditPopupVisible}
        onClose={() => setIsEditPopupVisible(false)}
        onSave={(updatedCeremony) => {
          console.log('Updated Ceremony:', updatedCeremony);
          fetchAllEvents(); // Cập nhật lại sự kiện khi sửa thành công
        }}
        ceremonies={ceremonies}
      />
    </div>
  );
};

export default AdminCalendar;
