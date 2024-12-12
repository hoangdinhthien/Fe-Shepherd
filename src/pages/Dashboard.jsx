import { useEffect, useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Select } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups'; // Import custom hook for fetching groups
import EventAPI from '../apis/event_api';
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

  // Chart Data
  const pieChartData = {
    labels: ['Cuộc họp', 'Nhiệm vụ', 'Sự kiện', 'Cuộc gọi'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };
  const lineChartData = {
    labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
    datasets: [
      {
        label: 'Giao dịch',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
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

  // set the first group as the default group selected when groups are fetched
  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0].id);
    }
  }, [groups, selectedGroup]),
    // Fetch events for the selected group(s)
    useEffect(() => {
      const fetchEvents = async () => {
        if (!selectedGroup) return;

        try {
          const response = await EventAPI.getEventsByGroup({
            groupId: selectedGroup, // => pass directly id
          });
          setEvents(response.data || []);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      };

      fetchEvents();
    }, [selectedGroup]);

  const daysOfWeek = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'CN',
  ];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(
        <div
          key={`empty-${i}`}
          className='text-center p-1'
        ></div>
      );
    }
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(
        <div
          key={day}
          className='text-center p-1'
          aria-label={`Calendar day ${day}`}
        >
          {day}
        </div>
      );
    }

    return calendarDays;
  };

  return (
    <div className='p-4 bg-transparent'>
      {/* GROUP DROPDOWN FILTER */}
      <div className='mb-6'>
        <div className='flex items-center'>
          <span className='mr-2 font-semibold'>Chọn Đoàn Thể</span>
          <Select
            value={selectedGroup}
            className='w-full md:w-1/3'
            loading={loadingGroups}
            onChange={(value) => setSelectedGroup(value)}
            placeholder='---Chọn Đoàn Thể---'
          >
            {groups.map((group) => (
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

      {/* CALENDAR AND ACTIVITY WRAPPER */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* CALENDAR WRAPPER */}
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

        {/* EVENTS AND ACTIVITIES */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Sự Kiện và Hoạt Động</h2>
          <ul className='space-y-2'>
            {events.length > 0 ? (
              events.map((event) => (
                <li
                  key={event.id}
                  className='p-2 bg-blue-100 rounded-md'
                >
                  {event.eventName} -{' '}
                  {new Date(event.fromDate).toLocaleTimeString()}
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

      {/* CHARTS AND MESSAGES WRAPPER */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
        {/* PIE CHART */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>
            Hoạt Động Của Bạn Trong Tuần
          </h2>
          <Pie
            data={pieChartData}
            options={{ responsive: true }}
          />
        </div>

        {/* LINE CHART */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Giao Dịch</h2>
          <Line
            data={lineChartData}
            options={{ responsive: true }}
          />
        </div>

        {/* MESSAGES */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Tin Nhắn</h2>
          <ul className='space-y-2'>
            {messages.map((message) => (
              <li
                key={message.id}
                className={`p-2 rounded ${
                  message.unread ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <span className='font-semibold'>
                  {message.unread ? 'Mới: ' : ''}
                </span>
                {message.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
