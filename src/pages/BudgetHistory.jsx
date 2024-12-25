import React, { useState, useEffect, useMemo } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import TransactionAPI from '../apis/transaction_api';
import BudgetAPI from '../apis/budget_api';

const { Title } = Typography;

function BudgetHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [surplus, setSurplus] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [isApproveModalVisible, setIsApproveModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const handleApproveClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsApproveModalVisible(true);
  };

  const handleApproveConfirm = async () => {
    if (selectedTransaction) {
      try {
        await TransactionAPI.updateStatusTransaction(selectedTransaction.id);
        message.success(
          `Bạn đã chuyển thành công số tiền ${formatNumber(
            selectedTransaction.amount
          )} VND cho nhóm ${selectedTransaction.group}.`
        );
        setIsApproveModalVisible(false);
        fetchTransactions(); // Tải lại danh sách
      } catch (error) {
        message.error('Có lỗi xảy ra khi cập nhật trạng thái giao dịch!');
      }
    }
  };

  const handleApproveCancel = () => {
    setIsApproveModalVisible(false);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(Number(value));
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await TransactionAPI.getChurchBudgetHistory();
      const dataArray = Array.isArray(response.result)
        ? response.result
        : Object.values(response.result || {});

      console.log('Data Array:', dataArray);

      const formattedData = dataArray.map((item) => ({
        id: item.id || 'N/A',
        type: item.type || 'Không xác định',
        amount: item.amount || 0,
        date: item.date
          ? moment(item.date).format('YYYY-MM-DD')
          : 'Không có ngày',
        approvalStatus: item.approvalStatus || 'Không xác định',
        group: item.group?.groupName || '',
      }));

      setTransactions(formattedData);
      setFilteredTransactions(formattedData);

      const surplusResponse = await BudgetAPI.getBudgets();
      setSurplus(surplusResponse?.data?.surplusOrDeficit || 0);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải dữ liệu ngân sách!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    if (location.state?.openAddBudgetModal) {
      setIsModalVisible(true);
    }
  }, [location.state]);

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
      setSaving(true);
      const values = await form.validateFields();
      const rawAmount = form.getFieldValue('amount').replace(/[^\d]/g, '');
      const finalAmount = parseInt(rawAmount, 10);

      Modal.confirm({
        title: 'Xác nhận',
        content: `Bạn có chắc chắn muốn cập nhật ngân sách với số tiền ${finalAmount.toLocaleString()} VND?`,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
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
          }
        },
      });
    } catch (error) {
      console.error('Validation error:', error);
      message.error('Vui lòng nhập đầy đủ thông tin!');
    } finally {
      setSaving(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    form.setFieldsValue({
      amount: formatNumber(value),
    });
  };

  const handleFocus = () => {
    const value = form.getFieldValue('amount');
    form.setFieldsValue({
      amount: value.replace(/[^\d]/g, ''),
    });
  };

  const handleBlur = () => {
    const value = form.getFieldValue('amount');
    if (value) {
      form.setFieldsValue({
        amount: `${formatNumber(value)} VND`,
      });
    }
  };

  const transactionColumns = useMemo(
    () => [
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
        render: (type) => {
          const colorClass =
            type === 'Từ thiện'
              ? 'text-green-500 font-medium'
              : type === 'Chi phí'
              ? 'text-red-500 font-medium'
              : 'font-medium'; // Mặc định in đậm vừa phải
          return <span className={colorClass}>{type}</span>;
        },
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
        defaultSortOrder: null, // Không sắp xếp mặc định
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'approvalStatus',
        key: 'approvalStatus',
        render: (status) => {
          const colorClass =
            status === 'Đã duyệt'
              ? 'text-green-500 font-medium'
              : status === 'Chờ duyệt'
              ? 'text-red-500 font-medium'
              : 'font-medium'; // Mặc định in đậm vừa phải
          return <span className={colorClass}>{status}</span>;
        },
      },
      {
        title: 'Nhóm',
        dataIndex: 'group',
        key: 'group',
        render: (group) => <span>{group}</span>,
      },
      {
        title: 'Hành động',
        key: 'action',
        render: (record) => {
          if (record.approvalStatus === 'Chờ duyệt') {
            return (
              <Button type='primary' onClick={() => handleApproveClick(record)}>
                Cấp Ngân Sách
              </Button>
            );
          }
          return null; // Không hiển thị nội dung gì
        },
      },
    ],
    []
  );

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
              <Select.Option value='Từ thiện'>Từ thiện</Select.Option>
              <Select.Option value='Chi phí'>Chi phí</Select.Option>
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
          pagination={{ pageSize: 10 }}
          rowClassName={(record) =>
            record.approvalStatus === 'Chờ duyệt'
              ? 'bg-yellow-200 border border-yellow-300 hover:bg-yellow-300'
              : ''
          }
        />
      </Spin>

      <Modal
        title='Thêm Ngân Sách'
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSaveBudget}
          initialValues={{ amount: '', description: '' }}
        >
          <Form.Item
            label='Số Tiền'
            name='amount'
            rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
          >
            <Input
              type='text'
              placeholder='Nhập số tiền'
              onChange={handleAmountChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              value={form.getFieldValue('amount')}
            />
          </Form.Item>

          <Form.Item
            label='Mô Tả'
            name='description'
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea rows={4} placeholder='Nhập mô tả' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' block loading={saving}>
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title='Xác nhận Cấp Ngân Sách'
        open={isApproveModalVisible}
        onCancel={handleApproveCancel}
        footer={[
          <Button key='cancel' onClick={handleApproveCancel}>
            Hủy bỏ
          </Button>,
          <Button key='confirm' type='primary' onClick={handleApproveConfirm}>
            Đồng ý
          </Button>,
        ]}
      >
        {selectedTransaction && (
          <p>
            Bạn có đồng ý cấp số tiền{' '}
            <b>{formatNumber(selectedTransaction.amount)} VND</b> cho nhóm{' '}
            <b>{selectedTransaction.group}</b> không?
          </p>
        )}
      </Modal>
    </div>
  );
}

export default BudgetHistory;
