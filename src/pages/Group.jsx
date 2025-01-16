import { useEffect, useState } from 'react';
import { Select, Table, Spin, Tabs, Input, Card, message } from 'antd';
import useFetchGroups from '../hooks/useFetchGroups';
import GroupUserAPI from '../apis/group_user_api';
import TransactionAPI from '../apis/transaction_api';
import BudgetAPI from '../apis/budget_api';
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
  const [surplusOrDeficit, setSurplusOrDeficit] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
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
      console.log(
        'Members data:',
        response.result.map((member) => ({
          name: member.name,
          groupRole: member.groupRole,
        }))
      );
      setMembers(response.result || []);
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
    // Đảm bảo Trưởng Nhóm xuất hiện đầu tiên, Thủ Quỹ đứng thứ hai
    if (a.groupRole === 'Trưởng nhóm') return -1;
    if (b.groupRole === 'Trưởng nhóm') return 1;
    if (a.groupRole === 'Thủ quỹ') return -1;
    if (b.groupRole === 'Thủ quỹ') return 1;
    return a.name.localeCompare(b.name); // Sắp xếp các thành viên khác theo tên
  });

  useEffect(() => {
    // Fetch current user data when component mounts
    const getCurrentUserEmail = () => {
      // Thay thế bằng cách lấy email từ localStorage hoặc state management của bạn
      return localStorage.getItem('userEmail');
    };
    setCurrentUserEmail(getCurrentUserEmail());
  }, []);

  const memberColumns = [
    {
      title: 'Tên Thành Viên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai Trò/Chức Vụ',
      dataIndex: 'groupRole',
      key: 'groupRole',
      render: (groupRole) => (
        <span
          className={
            groupRole === 'Trưởng nhóm'
              ? 'bg-yellow-200 border-2 border-yellow-400 px-2 py-1 rounded'
              : groupRole === 'Thủ quỹ'
              ? 'bg-blue-100 border-2 border-blue-300 px-2 py-1 rounded'
              : ''
          }
        >
          {groupRole}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const getRowClassName = (record) => {
    const isCurrentUser = record.email === currentUserEmail;

    if (isCurrentUser) {
      if (record.groupRole === 'Trưởng nhóm') {
        return 'bg-yellow-50';
      }
      if (record.groupRole === 'Thủ quỹ') {
        return 'bg-blue-50';
      }
      return 'bg-gray-200';
    }
    return ''; // Trả về chuỗi rỗng cho các hàng không phải người dùng hiện tại
  };

  const transactionColumns = [
    { title: 'Số Giao Dịch', dataIndex: 'id', key: 'id' },
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
              rowClassName={getRowClassName}
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
