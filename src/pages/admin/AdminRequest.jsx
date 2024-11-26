import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestAPI from '../../apis/admin/request_api';
import { Pie } from 'react-chartjs-2';
import { FaSearch } from 'react-icons/fa';

const AdminRequest = () => {
  const navigate = useNavigate(); // Điều hướng
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOption, setSortOption] = useState('Tất cả');

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await RequestAPI.getAllRequests();
        const result = Array.isArray(data['result']) ? data['result'] : [];
        setRequests(result);
        setFilteredRequests(result); // Hiển thị toàn bộ ban đầu
      } catch (error) {
        console.error('Không thể lấy dữ liệu:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Tìm kiếm
  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    const filtered = requests.filter((request) =>
      request.title.toLowerCase().includes(keyword)
    );
    setFilteredRequests(filtered);
  };

  // Sắp xếp
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    let sortedRequests = [...requests];
    if (option === 'Chấp nhận') {
      sortedRequests = sortedRequests.filter((req) => req.isAccepted === true);
    } else if (option === 'Từ chối') {
      sortedRequests = sortedRequests.filter((req) => req.isAccepted === false);
    } else if (option === 'Đang xử lý') {
      sortedRequests = sortedRequests.filter((req) => req.isAccepted === null);
    }

    setFilteredRequests(sortedRequests);
  };

  // Điều hướng tạo tài khoản
  const handleCreateAccount = () => {
    navigate('/admin/user', { state: { popup: 'UserCreatePopUp' } });
  };

  if (loading) return <p>Đang tải...</p>;

  // Thống kê trạng thái
  const statusCounts = requests.reduce(
    (acc, request) => {
      if (request.isAccepted === true) acc.approved += 1;
      else if (request.isAccepted === false) acc.rejected += 1;
      else acc.pending += 1;
      return acc;
    },
    { approved: 0, rejected: 0, pending: 0 }
  );

  const pieData = {
    labels: ['Chấp nhận', 'Đang xử lý', 'Từ chối'],
    datasets: [
      {
        data: [
          statusCounts.approved,
          statusCounts.pending,
          statusCounts.rejected,
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
    },
    responsive: true,
  };

  return (
    <div style={{ width: '80%', margin: 'auto', paddingTop: '20px' }}>
      {/* Biểu đồ Pie */}
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
          <Pie
            data={pieData}
            options={pieOptions}
          />
        </div>
      </div>

      {/* Thanh công cụ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span className='text-2xl '>Danh Sách Yêu Cầu</span>
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
            marginRight: '20px',
          }}
        >
          <FaSearch style={{ marginRight: '10px', color: '#888' }} />
          <input
            type='text'
            placeholder='Tìm kiếm theo tiêu đề...'
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e)}
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
            value={sortOption}
            onChange={handleSortChange}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
            <option value='Tất cả'>Tất cả</option>
            <option value='Chấp nhận'>Chấp nhận</option>
            <option value='Đang xử lý'>Đang xử lý</option>
            <option value='Từ chối'>Từ chối</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Tiêu đề
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Nội dung
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Trạng thái
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Người nhận
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Ngày tạo
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((request) => (
            <tr key={request.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.title}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.content}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  color:
                    request.isAccepted === true
                      ? 'green'
                      : request.isAccepted === false
                      ? 'red'
                      : 'orange',
                  fontWeight: 'bold',
                }}
              >
                {request.isAccepted === true
                  ? 'Chấp nhận'
                  : request.isAccepted === false
                  ? 'Từ chối'
                  : 'Đang xử lý'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.to}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(request.createDate).toLocaleDateString('vi-VN')}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.isAccepted === null &&
                  request.type === 'Tạo tài khoản' && ( // Chỉ hiển thị nếu trạng thái là Pending và loại là "Tạo tài khoản"
                    <button
                      style={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        padding: '5px 10px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                      onClick={() => handleCreateAccount(request)}
                    >
                      Tạo tài khoản
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRequest;
