import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import GroupUserAPI from '../../apis/group_user_api';
import UserCreatePopUp from '../../components/admin/UserCreatePopUp';
import { FaTimes } from 'react-icons/fa';
import { Dropdown, Menu } from 'antd';
import { FaEllipsisV } from 'react-icons/fa';
import EditUserPopup from '../../components/admin/EditUserPopUp';
import AssignUserToGroupPopUp from '../../components/admin/AssignUserToGroupPopUp';

const AdminUser = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [deleteSuccessPopup, setDeleteSuccessPopup] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 15;

  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleAssignToGroup = (user) => {
    console.log('Selected user ID:', user?.id); // Sử dụng user trực tiếp thay vì selectedUser
    setSelectedUser(user); // Cập nhật selectedUser thay vì selectedUsers
    setIsAssignModalOpen(true);
  };

  const handleAssignUser = async (user, groupId) => {
    try {
      // Kiểm tra nếu người dùng chưa được chọn hoặc groupId không hợp lệ
      if (!user || !groupId) {
        console.error('Thông tin người dùng hoặc nhóm không hợp lệ.');
        return;
      }

      // Gọi API để phân công người dùng vào nhóm
      const response = await GroupUserAPI.assignUserToGroup([user.id], groupId);

      // Kiểm tra nếu API phản hồi thành công
      if (response && response.success) {
        console.log('Người dùng đã được phân công vào nhóm thành công.');

        // Cập nhật danh sách người dùng hoặc giao diện sau khi phân công
        setIsAssignModalOpen(false); // Đóng modal
        fetchUsers(); // Tải lại danh sách người dùng
      } else {
        console.error('Không thể phân công người dùng vào nhóm.');
      }
    } catch (error) {
      console.error(
        'Lỗi khi phân công người dùng vào nhóm:',
        error.message || error
      );
    }
  };

  const handleEditUser = async (user) => {
    try {
      const response = await AdminUserAPI.getUserById(user.id);
      console.log('API Response:', response);

      if (response && response.data) {
        const userData = response.data;
        setSelectedUser({
          id: userData.id,
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          role: userData.role || 'Member',
        });
        setIsEditModalOpen(true);
      } else {
        console.error('Không tìm thấy thông tin người dùng.');
      }
    } catch (error) {
      console.error(
        'Không thể lấy thông tin người dùng:',
        error.message || error
      );
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      // Chỉ lấy các trường được phép sửa và tự động điền các trường không cho phép sửa
      const updatedUserData = {
        id: userData.id, // id không được sửa, tự động điền
        name: userData.name?.trim() || '', // Trường name có thể chỉnh sửa
        phone: userData.phone?.trim() || '', // Trường phone có thể chỉnh sửa
        email: userData.email?.trim() || '', // Trường email có thể chỉnh sửa
        role: userData.role || 'Member', // Trường role có thể chỉnh sửa, nếu không có, mặc định là 'Member'
        // imageURL và password không được phép sửa, vì vậy bỏ qua
      };

      console.log('Dữ liệu gửi lên API:', updatedUserData);

      // Gửi dữ liệu đã cập nhật lên API
      await AdminUserAPI.updateUserById(updatedUserData);
      console.log(updatedUserData);

      // Refresh lại danh sách người dùng
      fetchUsers();
    } catch (error) {
      console.error('Update failed in parent:', error);
      throw error; // Đẩy lỗi ra để EditUserPopup xử lý
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await AdminUserAPI.deleteUserById(userToDelete.id);

      if (response && response.success) {
        await fetchUsers(currentPage);
        setDeleteSuccessPopup(true);
        setTimeout(() => {
          setDeleteSuccessPopup(false);
        }, 3000);
      } else {
        alert('Không thể xóa người dùng. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Đã xảy ra lỗi khi xóa người dùng. Vui lòng thử lại sau.');
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const roleMapping = {
    Admin: 'Quản trị viên',
    Member: 'Thành viên',
    ParishPriest: 'Cha xứ',
    Accountant: 'Thủ quỹ',
    Council: 'Hội đồng mục vụ',
  };

  useEffect(() => {
    if (location.state?.popup === 'UserCreatePopUp') {
      setIsCreateModalOpen(true);
    }
  }, [location.state]);

  const fetchUsers = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await AdminUserAPI.getAllUsers({
        pageNumber,
        pageSize: itemsPerPage,
      });
      if (response && Array.isArray(response.result)) {
        const { result: userList, pagination } = response;
        setUsers(userList);
        setTotalPages(Math.ceil((pagination?.totalCount || 0) / itemsPerPage));
      } else {
        console.error('API response format is invalid or no data returned.');
        setUsers([]);
      }
    } catch (error) {
      console.error(
        'Không thể lấy danh sách người dùng:',
        error.message || error
      );
      setUsers([]);
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
  };

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.phone]
      .map((value) => (value || '').toLowerCase())
      .some((value) => value.includes(searchKeyword))
  );

  const handleUserCreated = () => {
    fetchUsers();
    setShowSuccessPopup(true);
    setIsCreateModalOpen(false);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 4000);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const menu = (user) => (
    <Menu>
      <Menu.Item key='1' onClick={() => handleEditUser(user)}>
        Chỉnh sửa thông tin
      </Menu.Item>
      <Menu.Item
        key='2'
        onClick={() => handleDeleteClick(user)}
        style={{ color: 'red' }}
      >
        Xóa người dùng
      </Menu.Item>
      <Menu.Item key='3' onClick={() => handleAssignToGroup(user)}>
        Phân công vào nhóm khác
      </Menu.Item>
    </Menu>
  );

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

      {deleteSuccessPopup && (
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
          <span>Đã xóa người dùng thành công!</span>
          <button
            onClick={() => setDeleteSuccessPopup(false)}
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

      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              width: '400px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>
                Xóa Tài Khoản
              </h2>
            </div>

            <div style={{ padding: '16px' }}>
              <p style={{ margin: 0 }}>
                Bạn có chắc chắn muốn xóa tài khoản này?
              </p>
            </div>

            <div
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Xóa
              </button>
            </div>
          </div>
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
          onClick={() => setIsCreateModalOpen(true)}
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
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Hành động
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
                {user.name || 'Không có tên'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {user.phone || 'Không có số điện thoại'}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                {user.email || 'Không có email'}
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
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  textAlign: 'center',
                }}
              >
                <Dropdown
                  overlay={menu(user)}
                  trigger={['click']}
                  placement='bottomRight'
                >
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                    }}
                  >
                    <FaEllipsisV />
                  </button>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserPopup
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={selectedUser}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* Hiển thị popup phân công người dùng vào đoàn thể */}
      {isAssignModalOpen && (
        <AssignUserToGroupPopUp
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          user={selectedUser} // Truyền userId nếu selectedUser tồn tại
        />
      )}
    </div>
  );
};

export default AdminUser;
