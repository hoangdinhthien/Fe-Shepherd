import { message, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import RequestAPI from '../apis/request_api';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment'; // Ensure moment is imported
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoArrowBack } from 'react-icons/io5';

// Row selection object for checkboxes (optional)
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      'selectedRows: ',
      selectedRows
    );
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === 'Disabled User',
    name: record.name,
  }),
};

const Request = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [groupFilters, setGroupFilters] = useState([]);

  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);

  // -----ROLES-----
  const roles = [
    // import.meta.env.VITE_ROLE_ADMIN,
    // import.meta.env.VITE_ROLE_MEMBER,
    // import.meta.env.VITE_ROLE_PARISH_PRIEST,
    // import.meta.env.VITE_ROLE_COUNCIL,
    // import.meta.env.VITE_ROLE_ACCOUNTANT,
    'Admin',
    'Thành viên',
    'Cha xứ',
    'Hội đồng mục vụ',
    'Thủ quỹ',
  ];

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const res = await RequestAPI.getRequests({
        PageNumber: currentPage,
        PageSize: pageSize,
        // To: 'Council',
      });
      const groups = res.result
        .map((item) => item.group?.groupName)
        .filter(Boolean);
      const uniqueGroups = [...new Set(groups)];
      setGroupFilters(
        uniqueGroups.map((group) => ({ text: group, value: group }))
      );

      setRows(
        res.result.map((item) => ({
          key: item.id,
          title: item.title,
          // from: item.group.groupName,
          from: item.group ? item.group.groupName : null, // Check if group exists
          to: item.to,
          content: item.content,
          createdAt: getTime(item.createDate),
          status: getStatusTag(item.isAccepted),
          event: item.event,
          group: item.group,
          createdUser: item.createdUser,
        }))
      );

      setTotal(res.pagination.totalCount);
      console.log('Request data:', res);
    } catch (error) {
      message.error(error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [currentPage, pageSize]);

  const handleRowClick = (record) => {
    console.log('Row clicked:', record); // Log the whole record to inspect its structure

    // If status is a React element, you should check the actual value of status
    const status = record.status?.props?.children; // Access the string value of the status

    const isAccepted =
      status === 'Accepted' ? true : status === 'Rejected' ? false : null;

    console.log('Navigating with isAccepted:', isAccepted);

    if (record.event === null) {
      navigate(`/user/requestCreateAccountDetails`, {
        state: {
          request: {
            requestId: record.key,
            isAccepted: isAccepted,
            requestingGroup: record.from,
            title: record.title,
            content: record.content,
            createdDate: record.createdDate,
            to: record.to,
            user: record.createdUser,
          },
          currentUser: user, // Pass the current user
        },
      });
      console.log('Record:', record);
    } else {
      navigate(`/user/requestDetails`, {
        state: {
          request: {
            requestId: record.key,
            isAccepted: isAccepted,
            requestingGroup: record.from,
          },
          currentUser: user, // Pass the current user
        },
      });
    }
  };

  const getTime = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD/MM/YYYY - HH:mm');
  };

  const getStatusTag = (status) => {
    if (status === null || status === undefined)
      return <Tag color='warning'>Pending</Tag>;
    if (status)
      return (
        <Tag
          icon={<CheckCircleOutlined />}
          color='success'
        >
          Accepted
        </Tag>
      );
    if (!status)
      return (
        <Tag
          icon={<CloseCircleOutlined />}
          color='error'
        >
          Rejected
        </Tag>
      );
  };

  const cols = [
    {
      title: 'Tiêu Đề',
      dataIndex: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <a onClick={() => handleRowClick(record)}>{text}</a>
      ),
    },
    {
      title: 'Đoàn Thể Yêu Cầu',
      dataIndex: 'from',
      sorter: (a, b) => a.from.localeCompare(b.from),
      filters: groupFilters,
      onFilter: (value, record) => record.from.includes(value),
    },
    {
      title: 'Tới Đoàn Thể',
      dataIndex: 'to',
      sorter: (a, b) => a.to.localeCompare(b.to),
      filters: [
        { text: 'Council', value: 'Council' },
        { text: 'Admin', value: 'Admin' },
        // Add more filters as needed
      ],
      onFilter: (value, record) => record.to.includes(value),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      sorter: (a, b) =>
        moment(a.createdAt, 'DD/MM/YYYY - HH:mm').unix() -
        moment(b.createdAt, 'DD/MM/YYYY - HH:mm').unix(),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      filters: [
        { text: 'Accepted', value: 'Accepted' },
        { text: 'Rejected', value: 'Rejected' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.status.props.children === value,
    },
  ];

  return (
    <div className='flex flex-col'>
      <div className='flex items-center mt-3 mb-6 ml-4'>
        <IoArrowBack
          className='cursor-pointer text-xl mr-2'
          onClick={() => navigate(-1)}
        />
        <h1 className='text-xl font-semibold'>Danh Sách Các Yêu Cầu</h1>
      </div>
      <Table
        loading={isLoading}
        columns={cols}
        dataSource={rows}
        pagination={{
          pageSize: pageSize,
          current: currentPage,
          total: total,
          // position: ['topCenter'],
          showSizeChanger: true,
          // showTotal: (total, range) => `Total: ${total} items`,
          onShowSizeChange: (size) => {
            setCurrentPage(1);
            setPageSize(size);
          },
          showQuickJumper: true,
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              <p className='italic inline-flex font-bold'>
                <span className='text-gray-600 font-semibold mr-1'>
                  Content:
                </span>
                {record.content}
              </p>
              {record.group && (
                <ul className='list-disc ml-7 my-2'>
                  <li>
                    <ul>
                      <p className='font-semibold'>Requested From:</p>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>Group:</span>
                          {record.group.groupName}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>
                            Description:
                          </span>
                          {record.group.description}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>Members:</span>
                          {record.group.memberCount}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>Priority:</span>
                          <Tag color='processing'>
                            {record.group.priority ? 'true' : 'false'}
                          </Tag>
                        </p>
                      </li>
                    </ul>
                  </li>
                </ul>
              )}
              {record.event && (
                <ul className='list-disc ml-7'>
                  <li>
                    <ul>
                      <p className='font-semibold'>Event:</p>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>Name:</span>
                          {record.event.eventName ?? 'N/A'}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>
                            Description:
                          </span>
                          {record.event.description ?? 'N/A'}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>From:</span>
                          {getTime(record.event.fromDate)}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>To:</span>
                          {getTime(record.event.toDate)}
                        </p>
                      </li>
                      <li>
                        &ndash;{' '}
                        <p className='inline-flex'>
                          <span className='text-gray-600 mx-1'>Status:</span>
                          <Tag color='processing'>
                            {record.event.status ?? 'N/A'}
                          </Tag>
                        </p>
                      </li>
                    </ul>
                  </li>
                </ul>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default Request;
