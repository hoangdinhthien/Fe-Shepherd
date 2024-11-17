import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UserAPI from '../apis/user_api';
import GroupAPI from '../apis/group_api';
import { message, Tag, Divider, Button } from 'antd';
import moment from 'moment';
import request_api from '../apis/request_api';

export default function RequestDetail() {
  const [requestDetails, setRequestDetails] = useState(null);
  const [createdByName, setCreatedByName] = useState('');
  const [groupNames, setGroupNames] = useState({});
  const location = useLocation();
  const { requestId } = location.state.request;

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        // Fetch specific request details
        const response = await request_api.getRequestDetails(requestId);
        if (response.success) {
          const data = response.data;
          setRequestDetails(data);

          // Fetch user name for createdBy
          if (data.createdBy) {
            const userResponse = await UserAPI.getUser({
              userId: data.createdBy,
            });
            if (userResponse.success) {
              setCreatedByName(userResponse.data.name || 'Unknown');
            }
          }

          // Fetch all group names
          const groupResponse = await GroupAPI.getAllGroups();
          if (groupResponse.result) {
            const namesMap = {};
            groupResponse.result.forEach((group) => {
              namesMap[group.id] = group.groupName;
            });
            setGroupNames(namesMap);
          }

          // Fetch all requests to get the type
          const allRequestsResponse = await request_api.getRequests();
          if (allRequestsResponse.result) {
            const matchedRequest = allRequestsResponse.result.find(
              (req) => req.id === requestId
            );
            if (matchedRequest) {
              setRequestDetails((prev) => ({
                ...prev,
                type: matchedRequest.type || 'Unknown',
              }));
            }
          } else {
            message.warning('Unable to fetch all requests to retrieve type.');
          }
        } else {
          message.error(response.message || 'Failed to fetch details.');
        }
      } catch (error) {
        message.error('An error occurred while fetching request details.');
        console.log(error);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const formatDateTime = (date) => {
    return date ? moment(date).format('DD/MM/YYYY - HH:mm') : 'N/A';
  };

  if (!requestDetails)
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );

  const calculateTotalActivityCost = () => {
    return requestDetails.activities.reduce(
      (sum, activity) => sum + (activity.totalCost || 0),
      0
    );
  };

  const eventTotalCost =
    requestDetails.totalCost ?? calculateTotalActivityCost();

  return (
    <div className='p-6 bg-white rounded-md shadow-md'>
      {/* Header Section */}
      <div className='flex justify-between items-center mb-4'>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Yêu Cầu Được Tạo Bởi:</p>
          <p className='text-gray-600'>{createdByName}</p>
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Loại Yêu Cầu:</p>
          <p className='text-gray-600'>{requestDetails?.type || 'N/A'}</p>
        </div>
      </div>

      <Divider
        orientation='left'
        className='text-xl text-gray-700'
      >
        SỰ KIỆN
      </Divider>
      <h1 className='text-xl font-bold mb-4 text-gray-800'>
        {requestDetails.eventName}
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md'>
        <div>
          <p className='font-semibold text-gray-700'>Mô tả sự kiện:</p>
          <p className='text-gray-600'>{requestDetails.description}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Trạng thái:</p>
          <Tag
            color='processing'
            className='text-base'
          >
            {requestDetails.status}
          </Tag>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Thời gian bắt đầu:</p>
          <p className='text-gray-600'>
            {formatDateTime(requestDetails.fromDate)}
          </p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Thời gian kết thúc:</p>
          <p className='text-gray-600'>
            {formatDateTime(requestDetails.toDate)}
          </p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Tổng Chi Phí Sự Kiện:</p>
          <p className='text-gray-600'>{eventTotalCost} VND</p>
        </div>
      </div>

      <Divider
        orientation='left'
        className='text-lg text-gray-700'
      >
        HOẠT ĐỘNG
      </Divider>

      <ul className='space-y-4'>
        {requestDetails.activities.map((activity) => (
          <div key={activity.id}>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>
              {activity.activityName}
            </h3>
            <li className='p-4 bg-gray-50 rounded-md shadow-sm'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='font-semibold text-gray-700'>
                    Mô tả hoạt động:
                  </p>
                  <p className='text-gray-600'>{activity.description}</p>
                </div>
                <div>
                  <p className='font-semibold text-gray-700'>Trạng thái:</p>
                  <Tag color='processing'>{activity.status}</Tag>
                </div>
                <div>
                  <p className='font-semibold text-gray-700'>Thời gian:</p>
                  <p className='text-gray-600'>
                    {activity.startTime} - {activity.endTime}
                  </p>
                </div>
                <div>
                  <p className='font-semibold text-gray-700'>
                    Tổng Chi Phí Hoạt Động:
                  </p>
                  <p className='text-gray-600'>{activity.totalCost} VND</p>
                </div>
              </div>

              <Divider
                orientation='left'
                className='text-base text-gray-600'
              >
                Đoàn Thể Tham Gia
              </Divider>
              <ul className='ml-4 list-disc space-y-1'>
                {activity.groups.map((group) => (
                  <li
                    key={group.groupID}
                    className='text-gray-600'
                  >
                    Tên Đoàn Thể:{' '}
                    <span className='font-semibold'>
                      {groupNames[group.groupID] || 'Unknown'}
                    </span>{' '}
                    - Chi Phí: {group.cost} VND
                  </li>
                ))}
              </ul>
            </li>
          </div>
        ))}
      </ul>

      <div className='flex justify-center space-x-4 mt-8'>
        <Button
          type='primary'
          className='bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md'
        >
          Chấp Nhận Yêu Cầu
        </Button>
        <Button
          type='primary'
          className='bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md'
        >
          Từ Chối Yêu Cầu
        </Button>
      </div>
    </div>
  );
}
