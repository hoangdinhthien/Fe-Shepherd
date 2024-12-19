import { useEffect, useState } from 'react';
import { Select, Table, Spin, Tabs, Input, Card, message } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups';
import GroupUserAPI from '../apis/group_user_api';
import TransactionAPI from '../apis/transaction_api';
import BudgetAPI from '../apis/budget_api'; // Import API để lấy surplusOrDeficit
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
  const [surplusOrDeficit, setSurplusOrDeficit] = useState(0); // State để lưu surplusOrDeficit
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  const handleViewHistory = () => {
    navigate('/user/budget-history');
  };
  const handleAddBudget = () => {
    // Chuyển sang trang BudgetHistory và truyền trạng thái mở popup
    navigate('/user/budget-history', { state: { openAddBudgetModal: true } });
  };

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id); // Default to the first group
    }
  }, [groups]);

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
    fetchSurplus(); // Gọi fetchSurplus để lấy surplusOrDeficit
  }, [selectedGroup]);

  const fetchMembers = async () => {
    if (!selectedGroup) return;
    try {
      setLoading(true);
      const response = await GroupUserAPI.getGroupMembers(selectedGroup);
      setMembers(response.result || []);
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

  const fetchSurplus = async () => {
    if (!selectedGroup) return;
    try {
      const surplusResponse = await BudgetAPI.getBudgets();
      const surplusAmount = surplusResponse?.data?.surplusOrDeficit || 0;
      setSurplusOrDeficit(surplusAmount);
    } catch (error) {
      console.error('Error fetching surplus:', error);
      message.error('Không thể tải thông tin ngân sách nhà thờ!');
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

  const showBoxes = isHdmvgx;
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
            {showBoxes && (
              <div className='mt-4 mb-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Quản lý tài chính */}
                  <Card style={{ backgroundColor: '#BFA8C3' }}>
                    <h2 className='text-lg font-bold text-white mb-4'>
                      Quản lý tài chính
                    </h2>{' '}
                    {/* Màu trắng và xuống hàng */}
                    <div className='flex space-x-4'>
                      <button
                        onClick={handleViewHistory}
                        className='bg-blue-500 text-white py-2 px-4 rounded'
                      >
                        Xem Lịch Sử
                      </button>
                      <button
                        onClick={handleAddBudget}
                        className='bg-green-500 text-white py-2 px-4 rounded'
                      >
                        Thêm Ngân Sách
                      </button>
                    </div>
                  </Card>

                  {/* Ngân sách nhà thờ */}
                  <Card style={{ backgroundColor: '#5CD1BA' }}>
                    <h2 className='text-lg font-bold text-white mb-2'>
                      Ngân sách nhà thờ:
                    </h2>{' '}
                    {/* Màu trắng */}
                    <p className='text-white text-xl font-bold'>
                      {surplusOrDeficit.toLocaleString()} VND
                    </p>
                  </Card>
                </div>
              </div>
            )}

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
