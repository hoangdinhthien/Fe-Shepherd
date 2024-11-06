import { message, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import RequestAPI from '../apis/request_api';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment'; // Ensure moment is imported

const cols = [
  {
    title: 'Subject',
    dataIndex: 'title',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'From',
    dataIndex: 'from',
  },
  {
    title: 'To',
    dataIndex: 'to',
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
  },
  {
    title: 'Status',
    dataIndex: 'status',
  },
];

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

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const res = await RequestAPI.getRequests({
        PageNumber: currentPage,
        PageSize: pageSize,
      });
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
        }))
      );
      setTotal(res.pagination.totalCount);
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

  return (
    <div className='flex flex-col'>
      <h1 className='text-xl font-semibold mt-3 mb-6 ml-4'>List Requests</h1>
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
