import React, { useState, useEffect } from 'react';
import AdminGroupAPI from '../../apis/admin/admin_group_api';
import UpdateGroupPopUp from '../../components/admin/UpdateGroupPopUp';
import GroupCreatePopUp from '../../components/admin/GroupCreatePopUp'; // Import GroupCreatePopUp
import { Button, Table, Spin, Input, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';

const AdminGroup = () => {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await AdminGroupAPI.getAllGroups();
      const groupList = Array.isArray(data.result) ? data.result : [];
      setGroups(groupList);
      setFilteredGroups(groupList);
    } catch (error) {
      console.error('Không thể lấy danh sách Đoàn Thể:', error.message);
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
      content: `Cập nhật Đoàn Thể thành công: ${groupName}`,
    });
    fetchGroups();
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateGroup = async (newGroup) => {
    try {
      const response = await AdminGroupAPI.createGroup(newGroup);
      if (response.success) {
        fetchGroups();
        setIsCreateModalOpen(false);
      } else {
        console.error(response.message || 'Không thể tạo Đoàn Thể.');
      }
    } catch (error) {
      console.error('Lỗi khi tạo Đoàn Thể:', error.message);
    }
  };

  const handleOpenDeleteModal = (group) => {
    setGroupToDelete(group);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (groupToDelete) {
      try {
        const response = await AdminGroupAPI.deleteGroup(groupToDelete.id);
        if (response.success) {
          fetchGroups();
          Modal.success({
            content: `Đã xóa Đoàn Thể: ${groupToDelete.groupName}`,
          });
        } else {
          Modal.error({
            content: 'Không thể xóa Đoàn Thể. Vui lòng thử lại.',
          });
        }
      } catch (error) {
        console.error('Lỗi khi xóa Đoàn Thể:', error.message);
        Modal.error({
          content: 'Có lỗi xảy ra khi xóa Đoàn Thể.',
        });
      }
    }
    setIsDeleteModalOpen(false);
    setGroupToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setGroupToDelete(null);
  };

  const groupColumns = [
    {
      title: 'Mã Đoàn Thể',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên Đoàn Thể',
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

  return (
    <div className='admin-group-page' style={{ padding: '20px' }}>
      <h2 className='text-2xl font-bold mb-6'>Quản lý Đoàn Thể</h2>

      <Spin spinning={loading} tip='Đang tải dữ liệu...'>
        <div className='flex justify-center items-center mb-6 space-x-6 w-full'>
          <div style={{ flex: 1 }}>
            <Input
              placeholder='Tìm kiếm Đoàn Thể...'
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
              Tạo Đoàn Thể
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
          rowClassName={
            (record) => (record.priority ? 'bg-green-100' : '') // Bôi màu xanh lá cây nếu Đoàn Thể ưu tiên
          }
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

      {/* Popup Tạo Đoàn Thể */}
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
        <p>
          Bạn có chắc chắn muốn xóa Đoàn Thể {groupToDelete?.groupName} không?
        </p>
      </Modal>
    </div>
  );
};

export default AdminGroup;
