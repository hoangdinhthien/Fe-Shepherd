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
  Modal,
  Form,
  message,
} from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import TransactionAPI from '../apis/transaction_api';
import BudgetAPI from '../apis/budget_api';

const { Title } = Typography;

function BudgetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surplus, setSurplus] = useState(0); // For displaying church surplus
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch transactions and surplus
  // Fetch dữ liệu từ API
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Lấy danh sách giao dịch
      const response = await TransactionAPI.getChurchBudgetHistory();
      const dataArray = Array.isArray(response.result)
        ? response.result
        : Object.values(response.result || {});

      // Định dạng dữ liệu giao dịch
      const formattedData = dataArray.map((item) => ({
        id: item.id || 'N/A',
        type: item.type || 'Không xác định',
        amount: item.amount || 0,
        date: item.date
          ? moment(item.date).format('YYYY-MM-DD')
          : 'Không có ngày',
        approvalStatus: item.approvalStatus || 'Không xác định',
        group: item.group?.groupName || 'Không có nhóm',
      }));

      setTransactions(formattedData);
      setFilteredTransactions(formattedData);

      // Lấy số dư ngân sách
      const surplusResponse = await BudgetAPI.getBudgets(); // Gọi API lấy ngân sách
      console.log('Surplus Response:', surplusResponse);

      const surplusAmount = surplusResponse?.data?.surplusOrDeficit || 0; // Lấy giá trị từ `data`
      setSurplus(surplusAmount); // Cập nhật số dư ngân sách
      console.log('Surplus Amount:', surplusAmount);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu ngân sách!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSearchChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);
    filterTransactions(keyword, selectedType);
  };

  const handleTypeFilterChange = (value) => {
    setSelectedType(value);
    filterTransactions(searchKeyword, value);
  };

  const filterTransactions = (keyword, type) => {
    const filtered = transactions.filter((transaction) => {
      const matchesKeyword =
        transaction.type.toLowerCase().includes(keyword) ||
        transaction.id.toString().includes(keyword);
      const matchesType = type ? transaction.type === type : true;
      return matchesKeyword && matchesType;
    });
    setFilteredTransactions(filtered);
  };

  const handleAddBudgetClick = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSaveBudget = async () => {
    try {
      const values = await form.validateFields();
      const rawAmount = form.getFieldValue('amount').replace(/[^\d]/g, '');
      const finalAmount = parseInt(rawAmount, 10) * 1000;

      Modal.confirm({
        title: 'Xác nhận',
        content: `Bạn có chắc chắn muốn cập nhật ngân sách với số tiền ${finalAmount.toLocaleString()} VND?`,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
          setLoading(true);
          try {
            await BudgetAPI.updateBudget({
              amount: finalAmount,
              description: values.description,
            });
            message.success('Cập nhật ngân sách thành công!');
            setIsModalVisible(false);
            fetchTransactions();
          } catch (error) {
            console.error('Error updating budget:', error);
            message.error('Có lỗi xảy ra khi cập nhật ngân sách!');
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

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
      sorter: (a, b) => (moment(a.date).isBefore(b.date) ? -1 : 1),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status) => <span>{status}</span>,
    },
    {
      title: 'Nhóm',
      dataIndex: 'group',
      key: 'group',
      render: (group) => <span>{group}</span>,
    },
  ];

  return (
    <div className='budget-history-page' style={{ padding: '20px' }}>
      <Button
        type='default'
        style={{ marginBottom: '20px' }}
        onClick={() => navigate('/user/group')}
      >
        Quay lại
      </Button>

      <Spin spinning={loading} tip='Đang tải dữ liệu...'>
        <Card
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Title level={2}>Lịch Sử Giao Dịch</Title>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1890ff',
                }}
              >
                Ngân Sách Nhà Thờ: {surplus.toLocaleString()} VND
              </span>
            </div>
          }
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

          <Button
            type='primary'
            style={{ marginRight: '10px' }}
            onClick={handleAddBudgetClick}
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
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        />
      </Spin>

      <Modal
        title='Thêm Ngân Sách'
        visible={isModalVisible}
        onOk={handleSaveBudget}
        onCancel={() => setIsModalVisible(false)}
        okText='Lưu'
        cancelText='Hủy'
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            label='Số Tiền'
            name='amount'
            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
          >
            <Input placeholder='Nhập số tiền' />
          </Form.Item>
          <Form.Item
            label='Mô Tả'
            name='description'
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={4} placeholder='Nhập mô tả' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default BudgetHistory;
