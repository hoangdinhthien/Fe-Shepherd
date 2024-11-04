import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  // Sample data for the charts
  const recurringEventsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Recurring Events',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const latestRequestData = {
    group: 'Group A',
    leaderName: 'John Doe',
    eventDate: '2023-05-01',
    subject: 'Annual Retreat',
    budget: '$5,000',
    description: 'This is the description of the latest request.',
  };

  const nonRecurringEventsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Non-Recurring Events',
        data: [8, 12, 6, 9, 4, 7],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const leaderActivitiesData = {
    labels: ['Leader A', 'Leader B', 'Leader C', 'Leader D', 'Leader E'],
    datasets: [
      {
        label: 'Leader Activities',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const transactionsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Transactions',
        data: [120, 190, 30, 50, 20, 30],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Add this chartOptions object at the component level
  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };
  return (
    <div className='p-6 max-w-[1600px] mx-auto'>
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white'>
          <h3 className='text-lg font-semibold'>Total Events</h3>
          <p className='text-3xl font-bold mt-2'>156</p>
          <p className='text-sm  mt-1'>+12% from last month</p>
        </div>
        <div className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white'>
          <h3 className='text-lg font-semibold'>Active Leaders</h3>
          <p className='text-3xl font-bold mt-2'>48</p>
          <p className='text-sm mt-1'>+5% from last month</p>
        </div>
        <div className='bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white'>
          <h3 className='text-lg font-semibold'>Total Budget</h3>
          <p className='text-3xl font-bold mt-2'>$45,250</p>
          <p className='text-sm mt-1'>+8% from last month</p>
        </div>
        <div className='bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white'>
          <h3 className='text-lg font-semibold'>Pending Requests</h3>
          <p className='text-3xl font-bold mt-2'>23</p>
          <p className='text-sm mt-1'>-2% from last month</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Chart */}
        <div className='lg:col-span-2 bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-xl font-bold mb-4'>Recurring Events Overview</h2>

          <div className='h-[300px]'>
            <Line
              data={recurringEventsData}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Latest Request Card */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-xl font-bold mb-4'>Latest Request</h2>
          <div className='space-y-3'>
            <div className='flex justify-between items-center pb-2 border-b'>
              <span className='font-semibold'>Group</span>
              <span className='text-gray-600'>{latestRequestData.group}</span>
            </div>
            <div className='flex justify-between items-center pb-2 border-b'>
              <span className='font-semibold'>Leader</span>
              <span className='text-gray-600'>
                {latestRequestData.leaderName}
              </span>
            </div>
            <div className='flex justify-between items-center pb-2 border-b'>
              <span className='font-semibold'>Event Date</span>
              <span className='text-gray-600'>
                {latestRequestData.eventDate}
              </span>
            </div>
            <div className='flex justify-between items-center pb-2 border-b'>
              <span className='font-semibold'>Budget</span>
              <span className='text-green-600 font-bold'>
                {latestRequestData.budget}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-xl font-bold mb-4'>Non-Recurring Events</h2>

          <div className='h-[300px]'>
            <Bar
              data={nonRecurringEventsData}
              options={chartOptions}
            />
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-xl font-bold mb-4'>Leader Activities</h2>

          <div className='h-[300px]'>
            <Pie
              data={leaderActivitiesData}
              options={chartOptions}
            />
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-xl font-bold mb-4'>Transactions Overview</h2>

          <div className='h-[300px]'>
            <Line
              data={transactionsData}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
