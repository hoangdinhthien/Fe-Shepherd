import React, { useEffect, useState } from 'react';
import AdminBudgetAPI from '../../apis/admin/admin_budget_api';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaSearch } from 'react-icons/fa';

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const AdminBudget = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortValue, setSortValue] = useState('all'); // State để lưu giá trị sort
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 10; // Số lượng mục trên mỗi trang

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await AdminBudgetAPI.getAllTransactions();
        console.log('Fetched data:', data);
        setTransactions(Array.isArray(data['result']) ? data['result'] : []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Lọc dữ liệu dựa trên tìm kiếm và sắp xếp
  const filteredTransactions = transactions
    .filter((transaction) =>
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((transaction) => {
      if (sortValue === 'all') return true;
      if (sortValue === 'Đã duyệt')
        return transaction.approvalStatus.toLowerCase() === 'đã duyệt';
      if (sortValue === 'Chờ duyệt')
        return transaction.approvalStatus.toLowerCase() === 'chờ duyệt';
      return true;
    });

  const statusCounts = {
    approved: filteredTransactions.filter(
      (t) => t.approvalStatus === 'Đã duyệt'
    ).length,
    pending: filteredTransactions.filter(
      (t) => t.approvalStatus === 'Chờ duyệt'
    ).length,
  };

  const pieData = {
    labels: ['Đã xong', 'Đang xử lý'],
    datasets: [
      {
        data: [statusCounts.approved, statusCounts.pending],
        backgroundColor: ['#4caf50', '#ff9800'],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
        },
      },
    },
    responsive: true,
  };

  // Xác định giao dịch cho trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Tổng số trang
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ width: '80%', margin: 'auto', paddingTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '600px',
            height: '320px',
            backgroundColor: '#F5F5F5',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Pie data={pieData} options={pieOptions} className='width-full' />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span className='text-2xl '>Danh Sách Giao Dịch</span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '400px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px 10px',
            backgroundColor: '#fff',
          }}
        >
          <FaSearch style={{ marginRight: '10px', color: '#888' }} />
          <input
            type='text'
            placeholder='Tìm kiếm...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
            }}
          />
        </div>
        <div>
          <span style={{ marginRight: '10px' }}>Sắp xếp theo:</span>
          <select
            value={sortValue} // Gắn state giá trị sort
            onChange={(e) => setSortValue(e.target.value)} // Thay đổi giá trị sort
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value='all'>Tất cả</option>
            <option value='approved'>Đã xong</option>
            <option value='pending'>Đang xử lý</option>
          </select>
        </div>
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Mã Giao Dịch
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ngày</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Loại</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Số Lượng
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Tình Trạng
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Nơi Nhận
            </th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map((transaction) => (
            <tr key={transaction.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {transaction.id}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {transaction.type}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {transaction.amount} VND
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  color:
                    transaction.approvalStatus === 'Đã duyệt'
                      ? '#4caf50'
                      : transaction.approvalStatus === 'Chờ duyệt'
                      ? '#ffcc00'
                      : '#f44336',
                  fontWeight: 'bold',
                }}
              >
                {transaction.approvalStatus === 'Đã duyệt'
                  ? 'Đã xong'
                  : transaction.approvalStatus === 'Chờ duyệt'
                  ? 'Đang xử lý'
                  : 'Đã từ chối'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {transaction.group && transaction.group.groupName
                  ? transaction.group.groupName
                  : 'Không có nhóm'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                padding: '10px 15px',
                margin: '0 5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: currentPage === page ? '#4caf50' : '#fff',
                color: currentPage === page ? '#fff' : '#000',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default AdminBudget;
