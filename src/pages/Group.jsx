import { useEffect, useState } from 'react';
import { Select, Table, Spin, Tabs, Input, Card } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups';
import GroupUserAPI from '../apis/group_user_api';
import TransactionAPI from '../apis/transaction_api';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { TabPane } = Tabs;

export default function Group() {
  const { groups, loading: loadingGroups } = useFetchGroups();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [userRole, setUserRole] = useState(null); // Trạng thái role người dùng (ví dụ: "Thủ quỹ")
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/user/budget-history'); // Make sure this is relative to `/user`
  };

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id); // Default to the first group
    }
  }, [groups]);

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, [selectedGroup]);

  const fetchMembers = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response = await GroupUserAPI.getGroupMembers(selectedGroup);
      setMembers(response.result || []);

      // Tìm vai trò của người dùng (Giả sử role là một thuộc tính trong thành viên)
      const user = response.result?.find((member) => member.role === 'Thủ quỹ');
      if (user) {
        setUserRole('Thủ quỹ');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response = await TransactionAPI.getTransactionByGroup(
        selectedGroup
      );
      const transactionArray = response.result
        ? Object.keys(response.result).map((key) => ({
            ...response.result[key],
            id: key,
          }))
        : [];
      setTransactions(transactionArray);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortOrder === 'ascend') {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  const memberColumns = [
    { title: 'Tên Thành Viên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số Điện Thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Vai Trò/Chức Vụ', dataIndex: 'groupRole', key: 'groupRole' },
    { title: 'Trạng Thái', dataIndex: 'status', key: 'status' },
  ];

  const transactionColumns = [
    { title: 'Mã Giao Dịch', dataIndex: 'id', key: 'id' },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    { title: 'Loại', dataIndex: 'type', key: 'type' },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString()} VND`,
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
    { title: 'Tên Nhóm', dataIndex: ['group', 'groupName'], key: 'groupName' },
  ];

  const isHdmvgx =
    selectedGroup &&
    groups.find((group) => group.id === selectedGroup)?.groupName ===
      'Hội Đồng Mục Vụ Giáo Xứ';

  // Kiểm tra điều kiện hiển thị 2 box: chỉ khi đoàn thể là "Hội Đồng Mục Vụ Giáo Xứ" và vai trò là "Thủ quỹ"
  const showBoxes = isHdmvgx;
  // && userRole === 'Thủ quỹ'
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>Quản Lý Đoàn Thể</h1>

      <div className='mb-4 flex items-center justify-between'>
        <div>
          <label className='mr-2'>Chọn Đoàn Thể của bạn:</label>
          <Select
            value={selectedGroup}
            onChange={handleGroupChange}
            style={{ width: 200 }}
            placeholder='Chọn đoàn thể'
            loading={loadingGroups}
          >
            {groups.map((group) => (
              <Option key={group.id} value={group.id}>
                {group.groupName}
              </Option>
            ))}
          </Select>
        </div>

        <div className='flex items-center ml-auto'>
          <Input
            style={{ width: 300 }}
            placeholder='Tìm kiếm'
            value={searchTerm}
            onChange={handleSearch}
          />

          <Select
            style={{ width: 120, marginLeft: '20px' }}
            value={sortOrder}
            onChange={handleSortChange}
          >
            <Option value='ascend'>Tăng dần</Option>
            <Option value='descend'>Giảm dần</Option>
          </Select>
        </div>
      </div>

      <Spin spinning={loading || loadingGroups} tip='Đang tải...'>
        <Tabs defaultActiveKey='1'>
          <TabPane tab='Danh Sách Thành Viên' key='1'>
            <Table
              columns={memberColumns}
              dataSource={sortedMembers}
              rowKey='id'
              pagination={false}
            />
          </TabPane>

          <TabPane tab='Danh Sách Giao Dịch' key='2'>
            {/* Hiển thị 2 box chỉ khi người dùng là Thủ quỹ và đoàn thể là "Hội Đồng Mục Vụ Giáo Xứ" */}
            {showBoxes && (
              <div className='mt-4 mb-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Card
                    title='Quản lý tài chính'
                    style={{ backgroundColor: '#E4D9ED' }}
                  >
                    <p>Thông tin chi tiết về tài chính</p>
                    <div className='flex space-x-4 mt-4'>
                      <button
                        onClick={handleViewHistory} // Sử dụng handleViewHistory để điều hướng
                        className='bg-blue-500 text-white py-2 px-4 rounded'
                      >
                        Xem Lịch Sử
                      </button>
                      <button className='bg-green-500 text-white py-2 px-4 rounded'>
                        Thêm Ngân Sách
                      </button>
                    </div>
                  </Card>
                  <Card
                    title='Ngân sách nhà thờ'
                    style={{ backgroundColor: '#5CD1BA' }}
                  >
                    <p>Thông tin chi tiết về ngân sách nhà thờ</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Hiển thị bảng giao dịch cho tất cả các vai trò */}
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
