import React, { useState, useEffect } from 'react';
import AdminGroupAPI from '../../apis/admin/admin_group_api';
import GroupUserAPI from '../../apis/group_user_api';
import UpdateGroupPopUp from '../../components/admin/UpdateGroupPopUp';
import GroupCreatePopUp from '../../components/admin/GroupCreatePopUp';
import {
  Button,
  Table,
  Spin,
  Input,
  Modal,
  notification,
  Dropdown,
  Menu,
} from 'antd';
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
  const [expandedGroups, setExpandedGroups] = useState({});
  const navigate = useNavigate();

  const GroupMembers = ({ groupId }) => {
    const [members, setMembers] = useState([]);
    const [memberLoading, setMemberLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState({
      visible: false,
      x: 0,
      y: 0,
      member: null,
    });

    const handleSetRole = async (memberId, newRole) => {
      // try {
      //   console.log('memberId', memberId);
      //   console.log('groupId', groupId);
      //   const groupUserId = await GroupUserAPI.findGroupUserId(
      //     memberId,
      //     groupId
      //   );
      //   console.log('groupUserId', groupUserId);
      //   if (!groupUserId) {
      //     notification.error({
      //       message: 'Lỗi',
      //       description: 'Không thể tìm thấy ID thành viên trong nhóm.',
      //     });
      //     return;
      //   }
      try {
        // console.log('newRole', newRole);
        await GroupUserAPI.updateMemberRole(memberId, { role: newRole });
        notification.success({
          message: 'Thành công',
          description: 'Đã cập nhật vai trò thành viên',
        });
        fetchMembers();
      } catch (error) {
        console.error('Lỗi khi cập nhật vai trò:', error);
        notification.error({
          message: 'Lỗi',
          description: 'Không thể cập nhật vai trò thành viên',
        });
      }
    };

    const handleRemoveGroupUser = async (memberId) => {
      try {
        // const groupUserId = await GroupUserAPI.findGroupUserId(
        //   memberId,
        //   groupId
        // );
        // if (!groupUserId) {
        //   notification.error({
        //     message: 'Lỗi',
        //     description: 'Không thể tìm thấy ID thành viên trong nhóm.',
        //   });
        //   return;
        // }

        await GroupUserAPI.removeMember(memberId);
        notification.success({
          message: 'Thành công',
          description: 'Đã xóa thành viên khỏi đoàn thể',
        });
        fetchMembers();
      } catch (error) {
        console.error('Lỗi khi xóa thành viên:', error);
        notification.error({
          message: 'Lỗi',
          description: 'Không thể xóa thành viên khỏi đoàn thể',
        });
      }
    };

    const handleMemberDoubleClick = (record, event) => {
      event.preventDefault();
      setContextMenu({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        member: record,
      });
    };

    const handleContextMenuClose = () => {
      setContextMenu({ visible: false, x: 0, y: 0, member: null });
    };

    const sortMembersByRole = (members) => {
      const roleOrder = {
        'Trưởng nhóm': 1,
        'Thủ quỹ': 2,
        'Thành viên': 3,
      };
      return members.sort(
        (a, b) =>
          (roleOrder[a.groupRole] || 999) - (roleOrder[b.groupRole] || 999)
      );
    };

    const fetchMembers = async () => {
      try {
        setMemberLoading(true);
        const response = await GroupUserAPI.getGroupMembers(groupId);
        const sortedMembers = sortMembersByRole(response.result || []);
        setMembers(sortedMembers);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thành viên:', error);
        notification.error({
          message: 'Lỗi',
          description:
            'Không thể lấy danh sách thành viên. Vui lòng thử lại sau.',
        });
      } finally {
        setMemberLoading(false);
      }
    };

    useEffect(() => {
      fetchMembers();
    }, [groupId]);

    const memberColumns = [
      {
        title: 'Tên thành viên',
        dataIndex: 'name',
        key: 'name',
        render: (text) => (
          <span className='font-medium text-gray-800'>{text}</span>
        ),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text) => <span className='text-gray-600'>{text}</span>,
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (text) => <span className='text-gray-600'>{text}</span>,
      },
      {
        title: 'Vai trò',
        dataIndex: 'groupRole',
        key: 'groupRole',
        render: (role) => {
          const roleStyles = {
            'Trưởng nhóm': 'text-red-600 font-bold',
            'Thủ quỹ': 'text-blue-600 font-bold',
            'Thành viên': 'text-gray-600',
          };
          return <span className={roleStyles[role]}>{role}</span>;
        },
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              status === 'Được thông qua'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status}
          </span>
        ),
      },
    ];

    const getContextMenuItems = (member) => [
      {
        key: 'role',
        label: 'Cập nhật vai trò',
        children: [
          {
            key: 'Trưởng nhóm',
            label: 'Trưởng nhóm',
            onClick: () => handleSetRole(member.id, 'Trưởng nhóm'),
          },
          {
            key: 'Thủ quỹ',
            label: 'Thủ quỹ',
            onClick: () => handleSetRole(member.id, 'Thủ quỹ'),
          },
          {
            key: 'Thành viên',
            label: 'Thành viên',
            onClick: () => handleSetRole(member.id, 'Thành viên'),
          },
        ],
      },
      {
        key: 'remove',
        label: 'Mời ra khỏi đoàn thể',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Xác nhận xóa thành viên',
            content: `Bạn có chắc chắn muốn mời ${member.name} ra khỏi đoàn thể?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: () => handleRemoveGroupUser(member.id),
          });
        },
      },
    ];

    return (
      <div className='px-8 py-4 bg-gray-50 relative'>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-800'>
            Danh sách thành viên
          </h3>
        </div>
        <Spin spinning={memberLoading}>
          <Table
            columns={memberColumns}
            dataSource={members}
            pagination={false}
            rowKey='id'
            size='small'
            bordered
            className='nested-members-table'
            onRow={(record) => ({
              onDoubleClick: (event) => handleMemberDoubleClick(record, event),
            })}
          />
        </Spin>

        {contextMenu.visible && (
          <>
            <div
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 1000,
              }}
            >
              <Menu
                items={getContextMenuItems(contextMenu.member)}
                onClick={handleContextMenuClose}
                className='shadow-lg rounded-md'
              />
            </div>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
              }}
              onClick={handleContextMenuClose}
            />
          </>
        )}
      </div>
    );
  };

  // Expandable configuration
  const expandableConfig = {
    expandedRowRender: (record) => <GroupMembers groupId={record.id} />,
    expandedRowKeys: Object.keys(expandedGroups),
    onExpand: (expanded, record) => {
      setExpandedGroups((prev) => ({
        ...prev,
        [record.id]: expanded,
      }));
    },
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await AdminGroupAPI.getAllGroups();
      const groupList = Array.isArray(data.result) ? data.result : [];
      setGroups(groupList);
      setFilteredGroups(groupList);
    } catch (error) {
      console.error('Không thể lấy danh sách Đoàn Thể:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Không thể lấy danh sách Đoàn Thể. Vui lòng thử lại sau.',
      });
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

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
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
          notification.success({
            message: 'Thành công',
            description: `Đã xóa Đoàn Thể: ${groupToDelete.groupName}`,
          });
          fetchGroups();
        } else {
          notification.error({
            message: 'Lỗi',
            description: 'Không thể xóa Đoàn Thể. Vui lòng thử lại.',
          });
        }
      } catch (error) {
        console.error('Lỗi khi xóa Đoàn Thể:', error);
        notification.error({
          message: 'Lỗi',
          description: 'Có lỗi xảy ra khi xóa Đoàn Thể.',
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

  const handleGroupUpdated = (groupName) => {
    notification.success({
      message: 'Thành công',
      description: `Cập nhật Đoàn Thể thành công: ${groupName}`,
    });
    fetchGroups();
    setIsEditModalOpen(false);
    setEditingGroup(null);
  };

  const handleCreateGroup = async (newGroup) => {
    try {
      const response = await AdminGroupAPI.createGroup(newGroup);
      if (response.success) {
        notification.success({
          message: 'Thành công',
          description: 'Tạo Đoàn Thể mới thành công',
        });
        fetchGroups();
        setIsCreateModalOpen(false);
      } else {
        notification.error({
          message: 'Lỗi',
          description: response.message || 'Không thể tạo Đoàn Thể.',
        });
      }
    } catch (error) {
      console.error('Lỗi khi tạo Đoàn Thể:', error);
      notification.error({
        message: 'Lỗi',
        description: 'Có lỗi xảy ra khi tạo Đoàn Thể.',
      });
    }
  };

  const groupColumns = [
    {
      title: 'Mã Đoàn Thể',
      dataIndex: 'id',
      key: 'id',
      render: (text) => (
        <span className='text-gray-600 font-medium'>{text}</span>
      ),
    },
    {
      title: 'Tên Đoàn Thể',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (text) => (
        <span className='text-gray-800 font-medium'>{text}</span>
      ),
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span className='text-gray-600'>{text}</span>,
    },
    {
      title: 'Số Lượng Thành Viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count) => (
        <span className='font-medium text-blue-600'>{count}</span>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, group) => (
        <div className='space-x-2'>
          <Button
            type='link'
            onClick={() => handleOpenEditModal(group)}
            className='text-blue-600 hover:text-blue-800'
          >
            Chỉnh sửa
          </Button>
          <Button
            type='link'
            danger
            onClick={() => handleOpenDeleteModal(group)}
            className='hover:text-red-800'
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6'>
            Quản lý Đoàn Thể
          </h2>

          <Spin spinning={loading} tip='Đang tải dữ liệu...'>
            <div className='flex justify-between items-center mb-6 gap-4'>
              <Input
                placeholder='Tìm kiếm Đoàn Thể...'
                value={searchKeyword}
                onChange={handleSearchChange}
                className='max-w-md'
              />
              <Button
                type='primary'
                onClick={handleOpenCreateModal}
                className='bg-blue-600 hover:bg-blue-700'
              >
                Tạo Đoàn Thể
              </Button>
            </div>

            <Table
              columns={groupColumns}
              dataSource={filteredGroups}
              rowKey='id'
              pagination={{ pageSize: 5 }}
              bordered
              expandable={expandableConfig}
              className='admin-groups-table'
              rowClassName={(record) =>
                `transition-colors ${record.priority ? 'bg-green-50' : ''} ${
                  expandedGroups[record.id] ? 'bg-gray-50' : ''
                }`
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

          {isCreateModalOpen && (
            <GroupCreatePopUp
              isOpen={isCreateModalOpen}
              onClose={handleCloseCreateModal}
              onGroupCreated={handleCreateGroup}
            />
          )}

          <Modal
            title={
              <span className='text-lg font-semibold text-red-600'>
                Xác nhận xóa
              </span>
            }
            visible={isDeleteModalOpen}
            onOk={handleDeleteGroup}
            onCancel={handleCancelDelete}
            okText='Xóa'
            cancelText='Hủy'
            okButtonProps={{
              className: 'bg-red-600 hover:bg-red-700',
            }}
          >
            <p className='text-gray-600'>
              Bạn có chắc chắn muốn xóa Đoàn Thể {groupToDelete?.groupName}{' '}
              không?
            </p>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminGroup;
