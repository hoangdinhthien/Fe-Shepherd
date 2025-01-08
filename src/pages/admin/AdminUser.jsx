import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import UserCreatePopUp from '../../components/admin/UserCreatePopUp';
import { FaTimes } from 'react-icons/fa';

const AdminUser = () => {
  const location = useLocation(); // Lấy trạng thái từ điều hướng
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [searchKeyword, setSearchKeyword] = useState(''); // Từ khóa tìm kiếm
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Quản lý trạng thái mở popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Hiển thị popup thành công

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang
  const itemsPerPage = 15; // Số lượng mục trên mỗi trang

  // Bản đồ vai trò (Tiếng Anh → Tiếng Việt)
  const roleMapping = {
    Admin: 'Quản trị viên',
    Member: 'Thành viên',
    ParishPriest: 'Cha xứ',
    Accountant: 'Thủ quỹ',
    Council: 'Hội đồng mục vụ',
  };

  // Mở popup nếu được điều hướng từ AdminRequest
  useEffect(() => {
    if (location.state?.popup === 'UserCreatePopUp') {
      setIsCreateModalOpen(true); // Mở popup
    }
  }, [location.state]);

  // Lấy danh sách người dùng từ API
  const fetchUsers = async (pageNumber = 1) => {
    try {
      setLoading(true); // Hiển thị trạng thái đang tải
      const params = { pageNumber, pageSize: itemsPerPage }; // Truyền tham số pageNumber và pageSize vào API
      const data = await AdminUserAPI.getAllUsers(params);

      const userList = Array.isArray(data.result) ? data.result : [];
      setUsers(userList);

      const totalCount = data.pagination?.totalCount || 0; // Tổng số người dùng
      setTotalPages(Math.ceil(totalCount / itemsPerPage)); // Tính tổng số trang
    } catch (error) {
      console.error('Không thể lấy danh sách người dùng:', error.message);
    } finally {
      setLoading(false); // Kết thúc trạng thái tải
    }
  };

  // Gọi API khi component được tải hoặc khi `currentPage` thay đổi
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        (user.email && user.email.toLowerCase().includes(keyword)) ||
        (user.phone && user.phone.includes(keyword))
    );
    setUsers(filtered); // Cập nhật danh sách người dùng sau khi tìm kiếm
  };

  const handleUserCreated = () => {
    fetchUsers(currentPage); // Lấy lại dữ liệu trang hiện tại
    setShowSuccessPopup(true);
    setIsCreateModalOpen(false);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 4000);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page); // Cập nhật trang hiện tại
  };

  if (loading) return <p>Đang tải danh sách người dùng...</p>;

  return (
    <div
      style={{
        width: '80%',
        margin: 'auto',
        paddingTop: '20px',
        position: 'relative',
      }}
    >
      {showSuccessPopup && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#4caf50',
            color: '#fff',
            padding: '10px 15px',
            borderRadius: '5px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          <span>Tài khoản đã được tạo thành công!</span>
          <button
            onClick={() => setShowSuccessPopup(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span className='text-2xl'>Danh sách tài khoản người dùng</span>
        <button
          onClick={handleOpenCreateModal}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Tạo tài khoản
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '10px',
        }}
      >
        <input
          type='text'
          placeholder='Tìm kiếm tài khoản...'
          value={searchKeyword}
          onChange={handleSearchChange}
          style={{
            width: '300px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tên</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Số điện thoại
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Vai trò
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Ngày tạo
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {user.name}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {user.phone}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {user.email}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {roleMapping[user.role] || 'Không xác định'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {user.createDate
                  ? new Date(user.createDate).toLocaleDateString('vi-VN')
                  : 'Không có'}
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

      {isCreateModalOpen && (
        <UserCreatePopUp
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
};

export default AdminUser;
