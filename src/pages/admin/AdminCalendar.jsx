import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/vi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Typography, Button } from 'antd';
import AdminCalendarAPI from '../../apis/admin/admin_calendar_api';
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
  const [selectedCeremony, setSelectedCeremony] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState({
    week: moment().week(),
    year: moment().year(),
  }); // Lưu cả tuần và năm
  const [currentDate, setCurrentDate] = useState(
    moment().startOf('week').toDate()
  );

  const fetchCeremonies = async () => {
    try {
      const ceremonies = await AdminCalendarAPI.getAllCeremonies();
      const ceremonyData = Array.isArray(ceremonies)
        ? ceremonies.map((ceremony) => ({
            id: ceremony.id,
            title: ceremony.name,
            start: new Date(ceremony.fromDate),
            end: new Date(ceremony.toDate),
            description: ceremony.description,
            activities: ceremony.activityPresets || [],
          }))
        : [];
      setCeremonies(ceremonyData);
    } catch (error) {
      console.error('Failed to fetch ceremonies:', error);
    }
  };

  useEffect(() => {
    fetchCeremonies();
  }, [currentDate]);

  const handleWeekChange = (weekNumber, year) => {
    const newStartOfWeek = moment().year(year).week(weekNumber).startOf('week'); // Tính ngày đầu tuần
    setSelectedWeek({ week: weekNumber, year }); // Cập nhật tuần và năm đã chọn
    setCurrentDate(newStartOfWeek.toDate()); // Đồng bộ lịch hiển thị
  };

  const handleNavigate = (action) => {
    let { week, year } = selectedWeek;

    if (action === 'PREV') {
      week -= 1;
      if (week < 1) {
        year -= 1; // Chuyển sang năm trước
        week = moment().year(year).weeksInYear(); // Số tuần cuối cùng của năm trước
      }
    } else if (action === 'NEXT') {
      week += 1;
      if (week > moment().year(year).weeksInYear()) {
        year += 1; // Chuyển sang năm sau
        week = 1; // Tuần đầu tiên của năm mới
      }
    } else if (action === 'TODAY') {
      week = moment().week(); // Tuần hiện tại
      year = moment().year(); // Năm hiện tại
    }

    handleWeekChange(week, year); // Cập nhật tuần và năm
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
        onNavigate={(date) => setCurrentDate(date)}
        onSelectEvent={setSelectedCeremony}
        components={{
          toolbar: (props) => (
            <CustomAdminHeaderBar
              {...props}
              currentWeek={selectedWeek.week} // Tuần hiện tại
              selectedWeek={selectedWeek} // Truyền toàn bộ đối tượng selectedWeek
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

      {/* Các Modal */}
      <Modal
        title={<Title level={3}>{selectedCeremony?.title}</Title>}
        isOpen={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={
          <Button type='primary' onClick={() => setIsEditPopupVisible(true)}>
            Edit
          </Button>
        }
        width={800}
        centered
      >
        {selectedCeremony && (
          <div>
            <Text className='block text-lg font-semibold mb-4 text-gray-800'>
              {selectedCeremony.description}
            </Text>
          </div>
        )}
      </Modal>

      <EditCeremonyPopUp
        isOpen={isEditPopupVisible}
        onClose={() => setIsEditPopupVisible(false)}
        onSave={(updatedCeremony) => {
          // Cập nhật hoặc lưu lại ceremony tại đây
          console.log('Updated Ceremony:', updatedCeremony);
          fetchCeremonies(); // Tải lại danh sách ceremonies
        }}
        ceremonies={ceremonies} // Truyền danh sách ceremonies vào
      />
    </div>
  );
};

export default AdminCalendar;
