import { useEffect, useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Select } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups'; // Import custom hook for fetching groups
import EventAPI from '../apis/event_api';
import TransactionAPI from '../apis/transaction_api';
import NotificationAPI from '../apis/notification_api';
import CeremoniesAPI from '../apis/ceremony_api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { useSelector } from 'react-redux';
import { color } from 'framer-motion';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const { Option } = Select;

export default function Dashboard() {
  const [selectedGroup, setSelectedGroup] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const { groups, loading: loadingGroups } = useFetchGroups(); // Fetch groups from custom hook
  const user = useSelector((state) => state.user.currentUser);
  const [transactionOverview, setTransactionOverview] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [ceremonies, setCeremonies] = useState([]);
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  // Sử dụng toLocaleDateString để có định dạng mm/dd/yyyy
  const formattedDate = firstDayOfMonth.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  // Dữ liệu Biểu đồ
  const pieChartData = {
    labels: ['Cuộc họp', 'Nhiệm vụ', 'Sự kiện', 'Cuộc gọi'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const messages = [
    {
      id: 1,
      text: 'Cuộc họp mới được lên lịch vào lúc 3 giờ chiều',
      unread: true,
    },
    {
      id: 2,
      text: 'Cuộc họp mới được lên lịch vào lúc 3 giờ chiều',
      unread: false,
    },
    {
      id: 3,
      text: 'Cuộc họp mới được lên lịch vào lúc 3 giờ chiều',
      unread: true,
    },
    {
      id: 4,
      text: 'Cuộc họp mới được lên lịch vào lúc 3 giờ chiều',
      unread: true,
    },
  ];

  // Chọn nhóm mặc định khi nhóm được tải về
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      const leaderGroups = groups.filter((group) =>
        user.listGroupRole.some(
          (role) => role.groupId === group.id && role.roleName === 'Trưởng nhóm'
        )
      );
      if (leaderGroups.length > 0) {
        setSelectedGroup(leaderGroups[0].id);
      }
    }
  }, [groups, selectedGroup]);

  useEffect(() => {
    const fetchCeremonies = async () => {
      if (!selectedGroup) return;

      try {
        console.log('formattedDate of ceremony:', formattedDate);
        const response = await CeremoniesAPI.getAllCeremonies(formattedDate);

        if (response && response.data && Array.isArray(response.data)) {
          setCeremonies(response.data);
        }
      } catch (error) {
        console.error('Error fetching ceremonies:', error);
        setCeremonies([]);
      }
    };

    fetchCeremonies();
  }, [selectedGroup, currentMonth]);

  // Lấy sự kiện cho nhóm đã chọn
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('formattedDate of Event:', formattedDate);
        const response = await EventAPI.getEventsByGroup({
          groupId: selectedGroup,
          chosenDate: formattedDate,
        });

        console.log('Full API Event Response:', response);

        const eventsArray = response.data ? Object.values(response.data) : [];
        console.log('Converted Events Array:', eventsArray);

        setEvents(eventsArray);
      } catch (error) {
        console.error('Error fetching events:', error.message);
      }
    };

    fetchEvents();
  }, [selectedGroup, currentMonth]);

  useEffect(() => {
    const fetchTransactionOverview = async () => {
      if (!selectedGroup) return;

      try {
        const response = await TransactionAPI.getTransactionGroupOverview(
          selectedGroup
        );
        console.log('Transaction Overview API Response:', response);

        const overviewData = response.data ? Object.values(response.data) : [];
        setTransactionOverview(overviewData);

        // Tạo labels và data cho Line Chart
        const labels = overviewData.map((item) => `Tháng ${item.month}`);
        const totalTransactions = overviewData.map(
          (item) => item.totalTransactions
        );

        setLineChartData({
          labels,
          datasets: [
            {
              label: 'Tổng Giao Dịch',
              data: totalTransactions,
              fill: false,
              borderColor: '#4BC0C0',
              tension: 0.1,
              pointRadius: 5,
              pointBackgroundColor: '#4BC0C0',
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching transaction overview:', error);
      }
    };

    fetchTransactionOverview();
  }, [selectedGroup]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!selectedGroup) return;

      try {
        const response = await NotificationAPI.getNotificationByGroupId(
          selectedGroup,
          {
            pageSize: 10,
          } // Ví dụ: Giới hạn 10 thông báo
        );

        console.log('Notification API Response:', response);

        const notificationData = response ? Object.values(response.result) : [];
        setNotifications(notificationData);
      } catch (error) {
        console.error('Error fetching notifications:', error.message);
      }
    };

    fetchNotifications();
  }, [selectedGroup]);

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  // Tạo danh sách các ngày có sự kiện
  const getEventDays = (events, ceremonies, year, month) => {
    const days = [];

    // Xử lý events thông thường
    events.forEach((event) => {
      const fromDate = new Date(event.fromDate);
      const toDate = new Date(event.toDate);

      if (
        (fromDate.getMonth() === month && fromDate.getFullYear() === year) ||
        (toDate.getMonth() === month && toDate.getFullYear() === year)
      ) {
        let currentDate = new Date(fromDate);
        while (currentDate <= toDate) {
          if (
            currentDate.getMonth() === month &&
            currentDate.getFullYear() === year
          ) {
            days.push({
              day: currentDate.getDate(),
              type: 'event',
              title: event.eventName,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    // Xử lý ceremonies
    ceremonies.forEach((ceremony) => {
      // Kiểm tra xem có fromDate không
      if (ceremony.fromDate) {
        // Đảm bảo fromDate được parse đúng cách
        let ceremonyDate;

        // Kiểm tra định dạng của fromDate
        if (typeof ceremony.fromDate === 'string') {
          // Nếu là ISO string (ví dụ: "2024-01-15T00:00:00.000Z")
          ceremonyDate = new Date(ceremony.fromDate);
        } else if (ceremony.fromDate instanceof Date) {
          // Nếu đã là đối tượng Date
          ceremonyDate = ceremony.fromDate;
        } else {
          console.error('Invalid date format:', ceremony.fromDate);
          return;
        }

        // Log để debug
        console.log(
          'Processing ceremony:',
          ceremony.eventName,
          'date:',
          ceremonyDate,
          'month:',
          ceremonyDate.getMonth(),
          'year:',
          ceremonyDate.getFullYear()
        );

        // Kiểm tra tháng và năm
        if (
          ceremonyDate.getMonth() === month &&
          ceremonyDate.getFullYear() === year
        ) {
          days.push({
            day: ceremonyDate.getDate(),
            type: 'ceremony',
            title: ceremony.eventName,
          });
        }
      }
      console.log('ceremony:', days);
    });

    console.log('Final processed days:', days);
    return days;
  };
  // Render ngày trong lịch với đánh dấu sự kiện
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const eventDays = getEventDays(events, ceremonies, year, month);
    console.log('Event days for rendering:', eventDays);

    const calendarDays = [];

    // Các ô trống đầu tháng
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div
          key={`empty-${i}`}
          className='text-center p-1'
        ></div>
      );
    }

    // Các ngày trong tháng
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = eventDays.filter((event) => event.day === day);
      const ceremonies = dayEvents.filter((event) => event.type === 'ceremony');
      const events = dayEvents.filter((event) => event.type === 'event');

      let backgroundColor = 'bg-gray-100'; // Mặc định màu xám nếu không có sự kiện

      // Đổi màu tùy theo có sự kiện hay lễ hội
      if (ceremonies.length > 0 && events.length > 0) {
        backgroundColor = 'bg-[#94d487] text-white font-bold';
      } else if (ceremonies.length > 0) {
        backgroundColor = 'bg-[#ebdb96] text-white font-bold';
      } else if (events.length > 0) {
        backgroundColor = 'bg-[#6c84a6] text-white font-bold';
      }

      calendarDays.push(
        <div
          key={day}
          className={`relative text-center p-1 rounded cursor-pointer ${backgroundColor} group`}
        >
          {day}
          {(ceremonies.length > 1 || events.length > 1) && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center'>
              {dayEvents.length}
            </span>
          )}
          {/* Popup hiển thị khi hover */}
          {(ceremonies.length > 0 || events.length > 0) && (
            <div
              className='absolute left-1/2 top-full mt-2 transform -translate-x-1/2 p-3 bg-white border border-gray-300 rounded shadow-lg text-left text-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'
              style={{ minWidth: '200px' }}
            >
              {ceremonies.length > 0 && (
                <>
                  <strong className='block text-[#ebdb96]'>Thánh Lễ:</strong>
                  <ul className='mb-2'>
                    {ceremonies.map((ceremony, index) => (
                      <li
                        key={`ceremony-${index}`}
                        className='text-gray-700'
                      >
                        - {ceremony.title}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {events.length > 0 && (
                <>
                  <strong className='block text-[#6c84a6]'>Sự Kiện:</strong>
                  <ul>
                    {events.map((event, index) => (
                      <li
                        key={`event-${index}`}
                        className='text-gray-700'
                      >
                        - {event.title}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    return calendarDays;
  };
  console.log(`user role:`, user.user.role);

  return (
    <div className='p-4 bg-transparent'>
      {/* CHỌN NHÓM */}
      <div className='mb-6'>
        <Select
          value={selectedGroup}
          className='w-full md:w-1/3'
          loading={loadingGroups}
          onChange={(value) => setSelectedGroup(value)}
          placeholder='---Chọn tổ chức---'
        >
          {groups
            .filter((group) => {
              if (user.user.role === 'Council') {
                return true;
              }
              return user.listGroupRole.some(
                (role) =>
                  role.groupId === group.id && role.roleName === 'Trưởng nhóm'
              );
            })
            .map((group) => (
              <Option
                key={group.id}
                value={group.id}
              >
                {group.groupName}
              </Option>
            ))}
        </Select>
      </div>

      {/* BẢNG LỊCH VÀ HOẠT ĐỘNG */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* BẢNG LỊCH */}
        <div className='bg-white p-4 rounded-lg shadow-md md:col-span-3'>
          <div className='flex justify-between items-center mb-4'>
            <button
              className='p-2 rounded-full hover:bg-gray-200 transition-colors'
              aria-label='Tháng trước'
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                )
              }
            >
              <FaChevronLeft />
            </button>
            <h2 className='text-xl font-semibold'>
              {currentMonth.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <button
              className='p-2 rounded-full hover:bg-gray-200 transition-colors'
              aria-label='Tháng sau'
              onClick={() =>
                setCurrentMonth(
                  new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                )
              }
            >
              <FaChevronRight />
            </button>
          </div>
          <div className='grid grid-cols-7 gap-2'>
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className='text-center font-semibold'
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>

        {/* SỰ KIỆN VÀ HOẠT ĐỘNG */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Sự kiện và Hoạt động</h2>
          <ul className='space-y-2'>
            {events.length > 0 ? (
              events.map((event) => (
                <li
                  key={event.id}
                  className='relative p-2 bg-blue-100 rounded-md group'
                >
                  {event.eventName} -{' '}
                  {new Date(event.fromDate).toLocaleTimeString()}
                  <div className='absolute left-0 top-full mt-2 hidden w-64 p-4 bg-white rounded-lg shadow-md border border-gray-200 group-hover:block z-10'>
                    <p className='text-sm font-semibold text-gray-800'>
                      Tên sự kiện: {event.eventName}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Thời gian diễn ra: ngày{' '}
                      {new Date(event.fromDate).toLocaleDateString('vi-VN')}{' '}
                      {'('}
                      {new Date(event.fromDate).toLocaleTimeString()} tới{' '}
                      {new Date(event.toDate).toLocaleTimeString()}
                      {')'}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className='text-gray-500'>
                Không có sự kiện nào cho nhóm này.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* BIỂU ĐỒ VÀ THÔNG BÁO */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
        {/* BIỂU ĐỒ LINE - Chiếm 2 phần */}
        <div className='bg-white p-4 rounded-lg shadow-md md:col-span-2'>
          <h2 className='text-xl font-semibold mb-4'>Tổng quan giao dịch</h2>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true, // Start Y-axis from 0
                  suggestedMax:
                    lineChartData?.datasets?.[0]?.data?.length > 0
                      ? Math.max(...lineChartData.datasets[0].data) + 5
                      : 10, // Default to 10 if data is unavailable
                  ticks: {
                    stepSize: 1, // Adjust spacing between values
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top', // Position legend at the top
                },
              },
            }}
          />
        </div>

        {/* THÔNG BÁO - Chiếm 1 phần */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Thông báo</h2>
          <ul
            className='space-y-2'
            style={{ maxHeight: '450px', overflowY: 'auto' }}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <li
                  key={notification.id}
                  className='p-2 rounded bg-gray-100 cursor-pointer hover:bg-blue-50 transition'
                  onDoubleClick={() => {
                    // navigate(`/notification-detail/${notification.id}`); // Điều hướng đến chi tiết thông báo
                  }}
                >
                  <span className='font-semibold'>
                    {notification.title || 'Thông báo'}
                  </span>
                  <p className='text-sm text-gray-600'>
                    {notification.content}
                  </p>
                </li>
              ))
            ) : (
              <li className='text-gray-500'>Không có thông báo nào.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
