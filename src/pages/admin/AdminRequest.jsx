import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestAPI from '../../apis/admin/request_api';
import { Pie } from 'react-chartjs-2';
import { FaSearch } from 'react-icons/fa';
import { message } from 'antd';

const AdminRequest = () => {
  const navigate = useNavigate(); // Điều hướng
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOption, setSortOption] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 10; // Số lượng mục trên mỗi trang

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
    setCurrentPage(1); // Đặt lại trang hiện tại khi tìm kiếm
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
    setCurrentPage(1); // Đặt lại trang hiện tại khi sắp xếp
  };

  // Điều hướng tạo tài khoản
  const handleCreateAccount = (request) => {
    navigate('/admin/user', {
      state: { popup: 'UserCreatePopUp', requestId: request.id },
    });
  };

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

  // Xác định dữ liệu hiển thị trên trang hiện tại
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Tổng số trang
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleForwardToCouncil = async (requestId) => {
    try {
      console.log('Request ID:', requestId);

      // Gọi API để cập nhật trạng thái request
      const response = await RequestAPI.updateForwardToCouncil(requestId);

      if (response.success) {
        // Kiểm tra và cập nhật state cục bộ
        const updatedRequests = requests.filter(
          (request) => request.id !== requestId
        );
        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests);

        // Hiển thị thông báo thành công
        message.success(
          `Yêu cầu ${requestId} đã được chuyển tiếp thành công tới Hội đồng.`
        );
        console.log(
          `Request ${requestId} has been successfully forwarded to the Council.`
        );
      } else {
        // Xử lý trường hợp API không thành công
        message.error(
          `Không thể chuyển tiếp yêu cầu ${requestId} tới Hội đồng: ${
            response.message || 'Lỗi không xác định'
          }`
        );
        console.error(
          `Failed to forward request ${requestId} to the Council: ${
            response.message || 'Unknown error'
          }`
        );
      }
    } catch (error) {
      // Xử lý lỗi nếu có sự cố trong quá trình gọi API
      message.error(
        `Không thể chuyển tiếp yêu cầu ${requestId} tới Hội đồng: ${
          error.message || 'Lỗi không xác định'
        }`
      );
      console.error(
        `Could not forward request ${requestId} to the Council: ${
          error.message || error
        }`
      );
    }
  };

  const handleMarkAsDone = async (requestId) => {
    try {
      // Gọi API để cập nhật trạng thái request
      const response = await RequestAPI.updateAcceptRequest(requestId);

      // Kiểm tra phản hồi từ API để xác nhận việc cập nhật thành công
      if (response.success) {
        // Cập nhật state cục bộ
        const updatedRequests = requests.map((request) =>
          request.id === requestId ? { ...request, isAccepted: true } : request
        );
        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests);
        console.log(
          `Request ${requestId} has been marked as done successfully.`
        );
      } else {
        // Xử lý trường hợp API không thành công
        console.error(
          `Failed to update status for request ${requestId}: ${
            response.message || 'Unknown error'
          }`
        );
      }
    } catch (error) {
      // Xử lý lỗi nếu có sự cố trong quá trình gọi API
      console.error(
        `Không thể cập nhật trạng thái cho request ${requestId}:`,
        error.message || error
      );
    }
  };

  if (loading) return <p>Đang tải...</p>;

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
          <Pie data={pieData} options={pieOptions} />
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
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Loại</th>
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
          {currentRequests.map((request) => (
            <tr key={request.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.title}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.content}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.type}
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
                {request.isAccepted === null && (
                  <>
                    {request.type === 'Tạo tài khoản' ? (
                      <button
                        className='px-4 py-1 bg-green-600 text-white rounded-full text-xs font-bold leading-4'
                        onClick={() => handleCreateAccount(request)}
                      >
                        Tạo tài khoản
                      </button>
                    ) : (
                      request.type === 'Khác' && (
                        <div className='flex justify-center space-x-5'>
                          {/* Nút "Go Back" với viền */}
                          <button
                            className='px-4 py-1 text-green-600 border-2 border-green-600 rounded-full text-xs font-bold leading-4'
                            onClick={() => handleForwardToCouncil(request.id)}
                          >
                            Chuyển tiếp
                          </button>

                          {/* Nút "Accept" không viền */}
                          <button
                            className='px-4 py-1 bg-green-600 text-white rounded-full text-xs font-bold leading-4'
                            onClick={() => handleMarkAsDone(request.id)}
                          >
                            Đã xong
                          </button>
                        </div>
                      )
                    )}
                  </>
                )}
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

export default AdminRequest;
