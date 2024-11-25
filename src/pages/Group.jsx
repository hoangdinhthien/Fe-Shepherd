import { useEffect, useState } from 'react';
import { Select, Table, Spin, Tabs } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups';
import GroupUserAPI from '../apis/group_user_api';
import TransactionAPI from '../apis/transaction_api';
import moment from 'moment';

const { Option } = Select;
const { TabPane } = Tabs;

export default function Group() {
  const { groups, loading: loadingGroups } = useFetchGroups(); // Sử dụng hook custom
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Chọn đoàn thể đầu tiên mặc định khi danh sách đoàn thể được tải
  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id); // Chọn đoàn thể đầu tiên
    }
  }, [groups]);

  // Lấy danh sách thành viên khi đoàn thể được chọn
  const fetchMembers = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response = await GroupUserAPI.getGroupMembers(selectedGroup);
      setMembers(response.result || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thành viên:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách giao dịch khi đoàn thể được chọn
  const fetchTransactions = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response = await TransactionAPI.getTransactionByGroup(
        selectedGroup
      );

      // Chuyển đổi object transactions thành array
      const transactionArray = response.result
        ? Object.keys(response.result).map((key) => ({
            ...response.result[key],
            id: key, // Thêm ID từ key (nếu cần)
          }))
        : [];
      console.log('transactionArray:', transactionArray);
      setTransactions(transactionArray);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giao dịch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, [selectedGroup]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const memberColumns = [
    { title: 'Tên Thành Viên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số Điện Thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Vai Trò/Chức Vụ', dataIndex: 'groupRole', key: 'groupRole' },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
  ];

  const transactionColumns = [
    { title: 'Mã Giao Dịch', dataIndex: 'id', key: 'id' }, // Hiển thị ID giao dịch
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'), // Định dạng ngày
    },
    { title: 'Loại', dataIndex: 'type', key: 'type' }, // Hiển thị loại giao dịch
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString()} VND`, // Định dạng số tiền
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status) => {
        if (status === 'Pending') return 'Chờ duyệt';
        if (status === 'Approved') return 'Đã duyệt';
        return 'Từ chối';
      },
    },
    { title: 'Tên Nhóm', dataIndex: ['group', 'groupName'], key: 'groupName' }, // Hiển thị tên nhóm
  ];

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Quản Lý Đoàn Thể</h1>

      <div className='mb-4'>
        <label className='mr-2'>Chọn Đoàn Thể của bạn:</label>
        <Select
          value={selectedGroup}
          onChange={handleGroupChange}
          style={{ width: 200 }}
          placeholder='Chọn đoàn thể'
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
        tip='Đang tải...'
      >
        <Tabs defaultActiveKey='1'>
          <TabPane
            tab='Danh Sách Thành Viên'
            key='1'
          >
            <Table
              columns={memberColumns}
              dataSource={members}
              rowKey='id'
              pagination={false}
            />
          </TabPane>
          <TabPane
            tab='Danh Sách Giao Dịch'
            key='2'
          >
            <Table
              columns={transactionColumns}
              dataSource={transactions}
              rowKey='id'
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
}
