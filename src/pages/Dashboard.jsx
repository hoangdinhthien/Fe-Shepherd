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
    labels: ['Meetings', 'Tasks', 'Events', 'Calls'],
    datasets: [
      {
        data: [30, 25, 20, 25],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Transactions',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const messages = [
    { id: 1, text: 'New meeting scheduled at 3 PM', unread: true },
    { id: 2, text: 'New meeting scheduled at 3 PM', unread: false },
    { id: 3, text: 'New meeting scheduled at 3 PM', unread: true },
    { id: 4, text: 'New meeting scheduled at 3 PM', unread: true },
  ];

  // Fetch events for the selected group(s)
  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedGroup) return;

      try {
        const response = await EventAPI.getEventsByGroup(selectedGroup);
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [selectedGroup]);

  const daysOfWeek = ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

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
        <Select
          value={selectedGroup}
          className='w-full md:w-1/3'
          loading={loadingGroups}
          onChange={(value) => setSelectedGroup(value)}
          placeholder='---Select Organization---'
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

      {/* CALENDAR AND ACTIVITY WRAPPER */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* CALENDAR WRAPPER */}
        <div className='bg-white p-4 rounded-lg shadow-md md:col-span-3'>
          <div className='flex justify-between items-center mb-4'>
            <button
              className='p-2 rounded-full hover:bg-gray-200 transition-colors'
              aria-label='Previous month'
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
              aria-label='Next month'
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
          <h2 className='text-xl font-semibold mb-4'>Events and Activities</h2>
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
              <li className='text-gray-500'>No events found for this group.</li>
            )}
          </ul>
        </div>
      </div>

      {/* CHARTS AND MESSAGES WRAPPER */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
        {/* PIE CHART */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>
            Your Activities of the Week
          </h2>
          <Pie
            data={pieChartData}
            options={{ responsive: true }}
          />
        </div>

        {/* LINE CHART */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Transactions</h2>
          <Line
            data={lineChartData}
            options={{ responsive: true }}
          />
        </div>

        {/* MESSAGES */}
        <div className='bg-white p-4 rounded-lg shadow-md'>
          <h2 className='text-xl font-semibold mb-4'>Messages</h2>
          <ul className='space-y-2'>
            {messages.map((message) => (
              <li
                key={message.id}
                className={`p-2 rounded ${
                  message.unread ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <span className='font-semibold'>
                  {message.unread ? 'New: ' : ''}
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
