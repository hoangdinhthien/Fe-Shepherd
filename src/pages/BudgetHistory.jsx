import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Spin,
  Divider,
  Input,
  Select,
} from 'antd';
import moment from 'moment'; // Để format ngày
import { useNavigate } from 'react-router-dom';

// Dữ liệu giả định
const initialTransactions = [
  { id: 1, type: 'Donation', amount: 100, date: '2024-12-01' },
  { id: 2, type: 'Expense', amount: 50, date: '2024-12-02' },
  { id: 3, type: 'Donation', amount: 200, date: '2024-12-03' },
  { id: 4, type: 'Expense', amount: 30, date: '2024-12-04' },
];

const { Title } = Typography;

function BudgetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState(''); // Lọc theo loại giao dịch
  const [selectedId, setSelectedId] = useState(''); // Lọc theo mã giao dịch
  const navigate = useNavigate();

  // Fetch dữ liệu từ API giả định
  useEffect(() => {
    const fetchTransactions = () => {
      setLoading(true);
      setTimeout(() => {
        setTransactions(initialTransactions);
        setFilteredTransactions(initialTransactions); // Cập nhật dữ liệu lọc ban đầu
        setLoading(false);
      }, 1000); // Giả lập thời gian tải dữ liệu
    };

    fetchTransactions();
  }, []);

  // Xử lý thay đổi trong ô tìm kiếm
  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    filterTransactions(keyword, selectedType, selectedId);
  };

  // Xử lý thay đổi trong filter loại giao dịch
  const handleTypeFilterChange = (value) => {
    setSelectedType(value);
    filterTransactions(searchKeyword, value, selectedId);
  };

  // Xử lý thay đổi trong filter mã giao dịch
  const handleIdFilterChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    filterTransactions(searchKeyword, selectedType, id);
  };

  // Hàm lọc dữ liệu giao dịch
  const filterTransactions = (keyword, type, id) => {
    const filtered = transactions.filter((transaction) => {
      const matchesKeyword =
        transaction.type.toLowerCase().includes(keyword) ||
        transaction.id.toString().includes(keyword); // Tìm kiếm theo mã giao dịch và loại

      const matchesType = type ? transaction.type === type : true;
      const matchesId = id ? transaction.id.toString().includes(id) : true;

      return matchesKeyword && matchesType && matchesId;
    });

    setFilteredTransactions(filtered);
  };

  // Cấu hình cột cho bảng với tính năng sắp xếp
  const transactionColumns = [
    {
      title: 'Mã Giao Dịch',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span>{id}</span>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <span>{type}</span>,
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <span>{amount.toLocaleString()} VND</span>,
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => <span>{moment(date).format('DD/MM/YYYY')}</span>,
      sorter: (a, b) => (moment(a.date).isBefore(b.date) ? -1 : 1), // Sort theo ngày
      defaultSortOrder: 'descend', // Sort mặc định là giảm dần
    },
  ];

  return (
    <div className='budget-history-page' style={{ padding: '20px' }}>
      {/* Nút Back */}
      <Button
        type='default'
        style={{ marginBottom: '20px' }}
        onClick={() => navigate('/user/group')} // Quay lại trang user/group
      >
        Quay lại
      </Button>

      <Spin spinning={loading} tip='Đang tải dữ liệu...'>
        <Card
          title={<Title level={2}>Lịch Sử Ngân Sách</Title>}
          bordered={false}
          style={{ marginBottom: '20px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div style={{ flex: 1 }}>
              <Input
                placeholder='Tìm kiếm theo mã giao dịch hoặc loại'
                value={searchKeyword}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  borderRadius: '5px',
                  paddingLeft: '10px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <Select
                placeholder='Lọc theo loại'
                value={selectedType}
                onChange={handleTypeFilterChange}
                style={{ width: 150 }}
              >
                <Select.Option value=''>Tất cả</Select.Option>
                <Select.Option value='Donation'>Quyên Góp</Select.Option>
                <Select.Option value='Expense'>Chi Tiêu</Select.Option>
              </Select>
            </div>
          </div>

          <Button
            type='primary'
            style={{ marginRight: '10px' }}
            onClick={() => navigate('/user/create-request')} // Chuyển hướng thêm ngân sách
          >
            Thêm Ngân Sách
          </Button>
        </Card>

        <Divider />

        <Table
          columns={transactionColumns}
          dataSource={filteredTransactions}
          rowKey='id'
          pagination={{ pageSize: 5 }}
          bordered
          style={{
            marginTop: '20px',
            borderRadius: '10px', // Viền tròn cho toàn bộ bảng
            overflow: 'hidden', // Đảm bảo các góc không bị cắt
          }}
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    ...props.style,
                    backgroundColor: '#808080', // Màu xám cho thanh tiêu đề
                    color: '#000', // Màu chữ tối
                    fontWeight: 'bold', // Đậm cho tiêu đề
                  }}
                />
              ),
            },
          }}
        />
      </Spin>
    </div>
  );
}

export default BudgetHistory;
