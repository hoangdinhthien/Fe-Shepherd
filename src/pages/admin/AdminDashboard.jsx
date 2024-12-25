import { Line, Bar, Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import AdminDashboardAPI from '../../apis/admin/admin_dashboard';
import AdminGroupAPI from '../../apis/admin/admin_group_api';
import TransactionAPI from '../../apis/transaction_api';

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
  const navigate = useNavigate();
  const [eventCount, setEventCount] = useState({ thisMonth: 0, lastMonth: 0 });
  const [userCount, setUserCount] = useState({ thisMonth: 0, lastMonth: 0 });
  const [requestCount, setRequestCount] = useState({
    thisMonth: 0,
    lastMonth: 0,
  });
  const [monthlyEventCounts, setMonthlyEventCounts] = useState([]);
  const [requestFirst, setRequestFirst] = useState(null);
  const [budget, setBudget] = useState(0);
  const [contextMenu, setContextMenu] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [transactionsData, setTransactionsData] = useState({
    labels: [],
    datasets: [],
  });

  const eventChange = AdminDashboardAPI.calculatePercentageChange(
    eventCount.thisMonth,
    eventCount.lastMonth
  );
  const userChange = AdminDashboardAPI.calculatePercentageChange(
    userCount.thisMonth,
    userCount.lastMonth
  );
  const requestChange = AdminDashboardAPI.calculatePercentageChange(
    requestCount.thisMonth,
    requestCount.lastMonth
  );

  const [dashboardData, setDashboardData] = useState({
    eventCount: { thisMonth: 0, lastMonth: 0 },
    userCount: { thisMonth: 0, lastMonth: 0 },
    requestCount: { thisMonth: 0, lastMonth: 0 },
    monthlyEventCounts: [],
    budget: 0,
    requestFirst: null,
    groupActivities: {
      labels: [], // Ensure this is an empty array by default
      data: [], // Ensure this is an empty array by default
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');

        const [
          eventCount,
          userCount,
          requestCount,
          budget,
          allEvents,
          requestFirst,
          groupActivities,
          transactionsResponse,
        ] = await Promise.all([
          AdminDashboardAPI.getEventCount().catch((err) => {
            console.error('Error fetching event count:', err);
            return 0;
          }),
          AdminDashboardAPI.getUserCount().catch((err) => {
            console.error('Error fetching user count:', err);
            return 0;
          }),
          AdminDashboardAPI.getRequestCount().catch((err) => {
            console.error('Error fetching request count:', err);
            return 0;
          }),
          AdminDashboardAPI.getSurplusOrDeficit().catch((err) => {
            console.error('Error fetching budget:', err);
            return 0;
          }),
          AdminDashboardAPI.getAllEvents().catch((err) => {
            console.error('Error fetching all events:', err);
            return [];
          }),
          AdminDashboardAPI.getRequestFirst().catch((err) => {
            console.error('Error fetching latest request:', err);
            return null;
          }),
          AdminGroupAPI.getEventActivitiesByGroup(),
          TransactionAPI.getTransactionOverview().catch((err) => {
            console.error('Error fetching transactions:', err);
            return [];
          }),
        ]);

        console.log('Raw fetched data:');
        console.log('Event Count:', eventCount);
        console.log('User Count:', userCount);
        console.log('Request Count:', requestCount);
        console.log('Budget:', budget);
        console.log('All Events:', allEvents);
        console.log('Request First:', requestFirst);
        console.log('Group Activities:', groupActivities);

        const transactionsArray = Array.isArray(transactionsResponse)
          ? transactionsResponse
          : Object.values(transactionsResponse);

        console.log('Transactions Array:', transactionsArray);

        const flatTransactionsArray = transactionsArray
          .flat() // Làm phẳng nếu có mảng lồng
          .filter(
            (item) =>
              item && // Bỏ qua null hoặc undefined
              typeof item === 'object' && // Chỉ giữ các object
              'year' in item && // Đảm bảo có thuộc tính 'year'
              'month' in item // Đảm bảo có thuộc tính 'month'
          );

        console.log('Flat Transactions Array:', flatTransactionsArray);

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const monthlyEventCounts = Array(currentMonth + 1).fill(0);

        allEvents.forEach((event) => {
          const eventDate = new Date(event.fromDate);
          if (eventDate.getFullYear() === currentYear) {
            const month = eventDate.getMonth();
            if (month <= currentMonth) {
              monthlyEventCounts[month] += 1;
            }
          }
        });

        // Format group activities data
        const formattedGroupActivities = {
          labels: groupActivities[1].map(
            (group) => group.groupName || 'Chưa xác định'
          ),
          data: groupActivities[1].map((group) => group.activityCount || 0),
        };
        const filteredTransactions = flatTransactionsArray.filter(
          (item) =>
            item && item.year === currentYear && item.month <= currentMonth
        );
        console.log('Filtered Transactions:', filteredTransactions);
        const labels = filteredTransactions.map(
          (item) => `Tháng ${item.month}`
        );
        const transactionCounts = filteredTransactions.map(
          (item) => item.totalTransactions
        );

        setTransactionsData({
          labels,
          datasets: [
            {
              label: 'Số Giao Dịch',
              data: transactionCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        });

        const monthlyEventCountsData = Array(currentMonth + 1).fill(0);
        allEvents.forEach((event) => {
          const eventDate = new Date(event.fromDate);
          if (eventDate.getFullYear() === currentYear) {
            const month = eventDate.getMonth();
            if (month <= currentMonth) {
              monthlyEventCountsData[month] += 1;
            }
          }
        });

        setDashboardData((prev) => ({
          ...prev,
          groupActivities: formattedGroupActivities,
        }));

        console.log('Formatted Group Activities:', formattedGroupActivities);

        setDashboardData((prev) => ({
          ...prev,
          eventCount: {
            thisMonth: eventCount,
            lastMonth: prev.eventCount?.lastMonth || 0,
          },
          userCount: {
            thisMonth: userCount,
            lastMonth: prev.userCount?.lastMonth || 0,
          },
          requestCount: {
            thisMonth: requestCount,
            lastMonth: prev.requestCount?.lastMonth || 0,
          },
          monthlyEventCounts,
          budget,
          requestFirst,
          groupActivities: formattedGroupActivities,
        }));

        console.log('Dashboard data updated successfully.');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Lấy tổng số sự kiện
    AdminDashboardAPI.getEventCount().then((count) =>
      setEventCount((prev) => ({ ...prev, thisMonth: count }))
    );

    // Lấy tổng số người dùng
    AdminDashboardAPI.getUserCount().then((count) =>
      setUserCount((prev) => ({ ...prev, thisMonth: count }))
    );

    // Lấy tổng số yêu cầu
    AdminDashboardAPI.getRequestCount().then((count) =>
      setRequestCount((prev) => ({ ...prev, thisMonth: count }))
    );

    //Lấy tổng số tiền thừa hoặc thiếu
    AdminDashboardAPI.getSurplusOrDeficit().then((amount) => setBudget(amount));

    // Lấy tổng số event của từng tháng
    AdminDashboardAPI.getAllEvents().then((events) => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // Tháng hiện tại (0 = Jan, 1 = Feb, ...)
      const eventCountsByMonth = Array(currentMonth + 1).fill(0); // Tạo mảng chỉ cho các tháng đã qua

      events.forEach((event) => {
        const eventDate = new Date(event.fromDate);
        if (eventDate.getFullYear() === currentYear) {
          const month = eventDate.getMonth();
          if (month <= currentMonth) {
            eventCountsByMonth[month] += 1; // Đếm sự kiện cho tháng tương ứng nếu là tháng đã qua
          }
        }
      });

      // Cập nhật state với dữ liệu đã đếm chỉ cho các tháng đã qua
      setMonthlyEventCounts(eventCountsByMonth);
      AdminDashboardAPI.getRequestFirst().then((request) =>
        setRequestFirst(request)
      );
    });
  }, []);

  const chartData = {
    labels: [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ].slice(0, monthlyEventCounts.length),
    datasets: [
      {
        label: 'Các sự kiện không định kỳ',
        data: monthlyEventCounts,
        fill: false,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3, // Làm đường biểu đồ mượt hơn
      },
    ],
  };

  const chartRecuringEventOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
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
    scales: {
      y: {
        beginAtZero: true, // Bắt đầu từ 0
        suggestedMax:
          transactionsData.datasets?.[0]?.data?.length > 0
            ? Math.max(...transactionsData.datasets[0].data) + 5
            : 10, // Nếu không có dữ liệu, giá trị mặc định là 10
      },
    },
  };

  return (
    <div className='p-6 max-w-[1600px] mx-auto'>
      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div
          onDoubleClick={() => navigate('/admin/event')}
          className='bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white'
        >
          <h3 className='text-lg font-semibold'>Tổng Số Sự Kiện</h3>
          <p className='text-3xl font-bold mt-2'>{eventCount.thisMonth}</p>
          {eventChange !== null && eventChange !== 0 && (
            <p className='text-sm mt-1'>
              {eventChange > 0 ? `+${eventChange}%` : `${eventChange}%`} So với
              tháng trước
            </p>
          )}
        </div>
        <div
          onDoubleClick={() => navigate('/admin/user')}
          className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white'
        >
          <h3 className='text-lg font-semibold'>Số Người Dùng</h3>
          <p className='text-3xl font-bold mt-2'>{userCount.thisMonth}</p>
          {userChange !== null && userChange !== 0 && (
            <p className='text-sm mt-1'>
              {userChange > 0 ? `+${userChange}%` : `${userChange}%`} So với
              tháng trước
            </p>
          )}
        </div>
        <div
          onDoubleClick={() => navigate('/admin/budget')}
          className='bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white'
        >
          <h3 className='text-lg font-semibold'>Ngân Sách</h3>
          <p className='text-3xl font-bold mt-2'>
            {budget.toLocaleString()} VND
          </p>
          <p className='text-sm mt-1'></p>
        </div>
        <div
          onDoubleClick={() => navigate('/admin/request')}
          className='bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white'
        >
          <h3 className='text-lg font-semibold'>Số Yêu Cầu</h3>
          <p className='text-3xl font-bold mt-2'>{requestCount.thisMonth}</p>
          {requestChange !== null && requestChange !== 0 && (
            <p className='text-sm mt-1'>
              {requestChange > 0 ? `+${requestChange}%` : `${requestChange}%`}{' '}
              So với tháng trước
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        {/* Charts Section */}
        <div
          onDoubleClick={() => navigate('/admin/event')}
          className='bg-white rounded-xl shadow-lg p-6 md:col-span-3'
        >
          <h2 className='text-xl font-bold mb-4'>
            Tổng Quan Về Sự Kiện Không Định Kỳ
          </h2>
          <div className='bg-white rounded-lg p-4 width-full height-full'>
            <Line data={chartData} options={chartRecuringEventOptions} />
          </div>
        </div>

        {/* Latest Request Card */}
        <div
          onDoubleClick={() => navigate('/admin/request')}
          className='bg-white rounded-xl shadow-lg p-6'
        >
          <h2 className='text-xl font-bold mb-4'>Yêu Cầu Mới Nhất</h2>
          {requestFirst ? (
            <div className='space-y-3'>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='font-semibold'>Nhóm</span>
                <span className='text-gray-600'>
                  {requestFirst.group?.groupName}
                </span>
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='font-semibold'>Nhóm Trưởng</span>
                <span className='text-gray-600'>
                  {requestFirst.createdUser.name}
                </span>
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='font-semibold'>Ngày Tạo</span>
                <span className='text-gray-600'>
                  {new Date(requestFirst.createDate).toLocaleDateString(
                    'vi-VN',
                    {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    }
                  )}
                </span>
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='font-semibold'>Gửi Đến</span>
                <span className='text-gray-600'>{requestFirst.to}</span>
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='font-semibold'>Ngân Sách Dự Kiến</span>
                {requestFirst?.event?.totalCost ? (
                  <span className='text-green-600 font-bold'>
                    {requestFirst.event.totalCost} VND
                  </span>
                ) : (
                  <span className='text-gray-500 font-semibold'>
                    Không có ngân sách
                  </span>
                )}
              </div>
              <div className='flex justify-between items-center pb-2 border-b'>
                <span className='font-semibold'>Trạng Thái</span>
                <span
                  className={
                    requestFirst.isAccepted === null
                      ? 'text-yellow-600 font-bold'
                      : requestFirst.isAccepted
                      ? 'text-green-600 font-bold'
                      : 'text-red-600 font-bold'
                  }
                >
                  {requestFirst.isAccepted === null
                    ? 'Đang xử lý'
                    : requestFirst.isAccepted
                    ? 'Chấp nhận'
                    : 'Từ chối'}
                </span>
              </div>
            </div>
          ) : (
            <p className='text-gray-500'>Không có yêu cầu nào.</p>
          )}
        </div>

        {/* Bottom Charts */}
        <div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-xl font-bold mb-4'>Hoạt Động Trưởng Nhóm</h2>
          <div className='h-[300px]'>
            <Pie
              data={{
                labels: dashboardData.groupActivities?.labels || [],
                datasets: [
                  {
                    label: 'Hoạt động',
                    data: dashboardData.groupActivities?.data || [],
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-lg p-6 md:col-span-3'>
          <h2 className='text-xl font-bold mb-4'>Tổng Quan Giao Dịch</h2>
          <div className='h-[300px]'>
            {transactionsData.labels.length > 0 ? (
              <Line data={transactionsData} options={chartOptions} />
            ) : (
              <p>Không có dữ liệu giao dịch để hiển thị.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
