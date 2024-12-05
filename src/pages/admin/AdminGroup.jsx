import React, { useState, useEffect } from 'react';
import AdminGroupAPI from '../../apis/admin/admin_group_api';
import UpdateGroupPopUp from '../../components/admin/UpdateGroupPopUp';
import GroupCreatePopUp from '../../components/admin/GroupCreatePopUp'; // Import GroupCreatePopUp
import { Button, Table, Spin, Input, Modal } from 'antd'; // Thêm Modal từ antd
import { useNavigate } from 'react-router-dom';

const AdminGroup = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Trạng thái popup tạo nhóm
  const [groupToDelete, setGroupToDelete] = useState(null); // Trạng thái nhóm cần xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Trạng thái modal xóa nhóm
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await AdminGroupAPI.getAllGroups();
      const groupList = Array.isArray(data.result) ? data.result : [];
      setGroups(groupList);
      setFilteredGroups(groupList);
    } catch (error) {
      console.error('Không thể lấy danh sách nhóm:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    const filtered = groups.filter(
      (group) =>
        group.groupName.toLowerCase().includes(keyword) ||
        (group.description && group.description.toLowerCase().includes(keyword))
    );
    setFilteredGroups(filtered);
  };

  const handleOpenEditModal = (group) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  const handleGroupUpdated = (groupName) => {
    Modal.success({
      content: `Cập nhật nhóm thành công: ${groupName}`,
    });
    fetchGroups(); // Cập nhật lại danh sách nhóm
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true); // Mở popup tạo nhóm
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false); // Đóng popup tạo nhóm
  };

  const handleCreateGroup = async (newGroup) => {
    try {
      // Gọi API tạo nhóm mới
      const response = await AdminGroupAPI.createGroup(newGroup);
      if (response.success) {
        fetchGroups(); // Cập nhật lại danh sách nhóm
        setIsCreateModalOpen(false); // Đóng popup
      } else {
        console.error(response.message || 'Không thể tạo nhóm.');
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error.message);
    }
  };

  const handleOpenDeleteModal = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true); // Mở modal xác nhận xóa
  };

  const handleDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        const response = await AdminGroupAPI.deleteGroup(groupToDelete.id); // Gọi API xóa nhóm
        if (response.success) {
          fetchGroups(); // Cập nhật lại danh sách nhóm
          Modal.success({
            content: `Đã xóa nhóm: ${groupToDelete.groupName}`,
          });
        } else {
          Modal.error({
            content: 'Không thể xóa nhóm. Vui lòng thử lại.',
          });
        }
      } catch (error) {
        console.error('Lỗi khi xóa nhóm:', error.message);
        Modal.error({
          content: 'Có lỗi xảy ra khi xóa nhóm.',
        });
      }
    }
    setIsDeleteModalOpen(false); // Đóng modal xác nhận xóa
    setGroupToDelete(null); // Xóa nhóm cần xóa
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false); // Đóng modal xác nhận xóa
    setGroupToDelete(null); // Xóa nhóm cần xóa
  };

  const groupColumns = [
    {
      title: 'Mã Nhóm',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên Nhóm',
      dataIndex: 'groupName',
      key: 'groupName',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số Lượng Thành Viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
    },
    {
      title: 'Ưu Tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (priority ? 'Có' : 'Không'),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (text, group) => (
        <span>
          <Button type='link' onClick={() => handleOpenEditModal(group)}>
            Chỉnh sửa
          </Button>
          <Button
            type='link'
            danger
            onClick={() => handleOpenDeleteModal(group)}
          >
            Xóa
          </Button>
        </span>
      ),
    },
  ];

  if (loading) return <Spin spinning={loading} tip='Đang tải dữ liệu...' />;

  return (
    <div className='admin-group-page' style={{ padding: '20px' }}>
      <h2 className='text-2xl font-bold mb-6'>Quản lý Nhóm</h2>

      <Spin spinning={loading} tip='Đang tải dữ liệu...'>
        <div className='flex justify-center items-center mb-6 space-x-6 w-full'>
          <div style={{ flex: 1 }}>
            <Input
              placeholder='Tìm kiếm nhóm...'
              value={searchKeyword}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                maxWidth: '400px',
                borderRadius: '5px',
                paddingLeft: '10px',
              }}
            />
          </div>

          <div>
            <Button type='primary' onClick={handleOpenCreateModal}>
              Tạo nhóm
            </Button>
          </div>
        </div>

        <Table
          columns={groupColumns}
          dataSource={filteredGroups}
          rowKey='id'
          pagination={{ pageSize: 5 }}
          bordered
          className='rounded-lg shadow-lg'
        />
      </Spin>

      {isEditModalOpen && editingGroup && (
        <UpdateGroupPopUp
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          group={editingGroup}
          onGroupUpdated={handleGroupUpdated}
        />
      )}

      {/* Popup Tạo Nhóm */}
      {isCreateModalOpen && (
        <GroupCreatePopUp
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onGroupCreated={handleCreateGroup}
        />
      )}

      {/* Modal Xác Nhận Xóa */}
      <Modal
        title='Xác nhận xóa'
        visible={isDeleteModalOpen}
        onOk={handleDeleteGroup}
        onCancel={handleCancelDelete}
        okText='Xóa'
        cancelText='Hủy'
        danger
      >
        <p>Bạn có chắc chắn muốn xóa nhóm {groupToDelete?.groupName} không?</p>
      </Modal>
    </div>
  );
};

export default AdminGroup;
