import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Spin, notification } from 'antd';
import AdminUserAPI from '../../apis/admin/admin_user_api';
import AdminGroupAPI from '../../apis/admin/admin_group_api';
import GroupUserAPI from '../../apis/group_user_api';

const AssignUserToGroupPopUp = ({ isOpen, onClose, user }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      const userId = user.id; // Lấy id từ user
      setLoading(true);

      const fetchData = async () => {
        try {
          // Gọi API để lấy thông tin người dùng
          const userResponse = await AdminUserAPI.getUserById(userId);
          setCurrentUser(userResponse?.data || {});

          // Gọi API để lấy danh sách nhóm chưa chứa người dùng
          const groupResponse = await AdminGroupAPI.getAllGroupsNotIncludeUser(
            userId
          );
          if (groupResponse?.result) {
            setGroups(groupResponse.result);
          } else {
            notification.error({ message: 'Không thể tải danh sách nhóm!' });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          notification.error({ message: 'Lỗi khi tải dữ liệu!' });
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, user]);

  const handleAssign = async () => {
    if (!selectedGroup) {
      notification.warning({ message: 'Vui lòng chọn nhóm!' });
      return;
    }

    try {
      setLoading(true);
      const userId = user.id;

      // Modified payload structure
      const payload = {
        userIds: [userId], // Send as array
        groupId: selectedGroup, // Send directly without nesting
      };

      // Gọi API để phân công người dùng vào nhóm
      const response = await GroupUserAPI.assignUserToGroup(payload);

      if (response && response.success) {
        notification.success({
          message: 'Người dùng đã được phân công thành công!',
        });
        onClose();
      } else {
        notification.error({
          message: 'Không thể phân công người dùng vào nhóm!',
        });
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      notification.error({
        message: 'Đã xảy ra lỗi khi phân công người dùng.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Phân công người dùng vào nhóm'
      visible={isOpen}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose} disabled={loading}>
          Hủy
        </Button>,
        <Button
          key='assign'
          type='primary'
          onClick={handleAssign}
          loading={loading}
          disabled={loading}
        >
          Phân công
        </Button>,
      ]}
    >
      {loading ? (
        <Spin size='large' />
      ) : (
        <>
          <p>
            Chọn nhóm để phân công người dùng{' '}
            {currentUser?.name || 'người dùng'}
          </p>
          <Select
            placeholder='Chọn nhóm'
            value={selectedGroup}
            onChange={setSelectedGroup}
            style={{ width: '100%' }}
          >
            {groups.map((group) => (
              <Select.Option key={group.id} value={group.id}>
                {group.groupName}
              </Select.Option>
            ))}
          </Select>
        </>
      )}
    </Modal>
  );
};

export default AssignUserToGroupPopUp;
