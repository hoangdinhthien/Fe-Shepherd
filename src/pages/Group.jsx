// Group.jsx
import { useEffect, useState } from 'react';
import { Select, Table, Spin } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups';
import GroupUserAPI from '../apis/group_user_api';

const { Option } = Select;

export default function Group() {
  const { groups, loading: loadingGroups } = useFetchGroups(); // Use custom hook
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);

  // Set initial group selection when groups are fetched
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id); // Set initial group selection
    }
  }, [groups]);

  // Fetch members when selectedGroup changes
  const fetchMembers = async () => {
    console.log('Fetching members for group:', selectedGroup);

    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response = await GroupUserAPI.getGroupMembers(selectedGroup);
      setMembers(response.result || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedGroup]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const columns = [
    { title: 'Tên Thành Viên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số Điện Thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Vai Trò/Chức Vụ', dataIndex: 'groupRole', key: 'groupRole' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Danh Sách Các Thành Viên</h1>

      <div className='mb-4'>
        <label className='mr-2'>Chọn Đoàn Thể của bạn:</label>
        <Select
          value={selectedGroup}
          onChange={handleGroupChange}
          style={{ width: 200 }}
          placeholder='Select a group'
          loading={loadingGroups}
        >
          {groups.map((group) => (
            <Option
              key={group.id}
              value={group.id}
            >
              {group.groupName}
            </Option>
          ))}
        </Select>
      </div>

      <Spin
        spinning={loading || loadingGroups}
        tip='Loading...'
      >
        <Table
          columns={columns}
          dataSource={members}
          rowKey='id'
          pagination={false}
        />
      </Spin>
    </div>
  );
}
