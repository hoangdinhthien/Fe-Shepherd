import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import UserCreatePopUp from '../../components/admin/UserCreatePopUp';
import { FaTimes } from 'react-icons/fa';

const AdminUser = () => {
  const location = useLocation(); // Lấy trạng thái từ điều hướng
  const [users, setUsers] = useState([]); // Danh sách người dùng
  const [filteredUsers, setFilteredUsers] = useState([]); // Người dùng đã lọc
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [searchKeyword, setSearchKeyword] = useState(''); // Từ khóa tìm kiếm
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Quản lý trạng thái mở popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Hiển thị popup thành công

  // Mở popup nếu được điều hướng từ AdminRequest
  useEffect(() => {
    if (location.state?.popup === 'UserCreatePopUp') {
      setIsCreateModalOpen(true); // Mở popup
    }
  }, [location.state]);

  // Lấy danh sách người dùng
  const fetchUsers = async () => {
    try {
      const data = await AdminUserAPI.getAllUsers();
      const userList = Array.isArray(data.result) ? data.result : [];
      setUsers(userList);
      setFilteredUsers(userList);
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

    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        (user.email && user.email.toLowerCase().includes(keyword)) ||
        (user.phone && user.phone.includes(keyword))
    );
    setFilteredUsers(filtered);
  };

  const handleUserCreated = () => {
    fetchUsers(); // Lấy lại danh sách người dùng
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
                  : 'Không có'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
