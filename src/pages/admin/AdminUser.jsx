import React, { useEffect, useState } from 'react';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import UserCreatePopUp from '../../components/admin/UserCreatePopUp';
import { FaTimes } from 'react-icons/fa'; // Import icon 'X' từ react-icons

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách người dùng sau khi lọc
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState(''); // Quản lý từ khóa tìm kiếm
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Trạng thái để hiển thị popup

  const fetchUsers = async () => {
    try {
      const data = await AdminUserAPI.getAllUsers();
      console.log('Dữ liệu người dùng:', data);
      const userList = Array.isArray(data.result) ? data.result : [];
      setUsers(userList);
      setFilteredUsers(userList); // Khởi tạo danh sách hiển thị với dữ liệu đầy đủ
    } catch (error) {
      console.error('Không thể lấy danh sách người dùng:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        (user.email && user.email.toLowerCase().includes(keyword)) ||
        (user.phone && user.phone.includes(keyword))
    );
    setFilteredUsers(filtered);
  };

  const handleUserCreated = () => {
    fetchUsers(); // Gọi lại API để lấy danh sách người dùng mới nhất
    setShowSuccessPopup(true); // Hiển thị popup thông báo thành công
    setIsCreateModalOpen(false); // Đóng modal

    // Đặt timeout để tự động ẩn popup sau 6 giây
    setTimeout(() => {
      setShowSuccessPopup(false); // Ẩn popup sau 6 giây
    }, 6000);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div
      style={{
        width: '80%',
        margin: 'auto',
        paddingTop: '20px',
        position: 'relative',
      }}
    >
      {/* Popup thông báo thành công */}
      {showSuccessPopup && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgb(253, 186, 116)', // Màu cam nhạt
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
          Tạo tài khoản mới
        </button>
      </div>

      {/* Thanh tìm kiếm */}
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
          {filteredUsers.map((user) => (
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
                {user.role}
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
                  : 'No Date'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreateModalOpen && (
        <UserCreatePopUp
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onUserCreated={handleUserCreated} // Truyền hàm handleUserCreated
        />
      )}
    </div>
  );
};

export default AdminUser;
