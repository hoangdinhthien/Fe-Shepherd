import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserAPI from '../apis/user_api';
import GroupAPI from '../apis/group_api';
import { message, Tag, Divider, Button, Checkbox, Input } from 'antd';
import moment from 'moment';
import request_api from '../apis/request_api';
import { useSelector } from 'react-redux';

export default function RequestDetail() {
  // -----STATE-----
  const [requestDetails, setRequestDetails] = useState(null);
  const [createdByName, setCreatedByName] = useState('');
  const [groupNames, setGroupNames] = useState({});
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [activityComments, setActivityComments] = useState({});
  const [activityAcceptance, setActivityAcceptance] = useState({});
  const [eventComment, setEventComment] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isCreator, setIsCreator] = useState(false);

  const currentUser = useSelector((state) => state.user.currentUser);

  // -----LOCATION-----
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId, isAccepted, requestingGroup } = location.state.request;
  console.log(`isAccepted:`, isAccepted);

  // -----USE EFFECT-----
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
              setIsCreator(userResponse.data.id === currentUser.user.id);
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

          // Fetch user role
          const roleResponse = await UserAPI.getUserRole(currentUser.user.id);
          if (roleResponse.success) {
            const roles = roleResponse.data;
            const isCouncil = currentUser.role === 'council';
            const isLeader = roles.some(
              (role) => role.roleName === 'Trưởng nhóm'
            );
            setUserRole(isCouncil ? 'council' : isLeader ? 'leader' : 'member');
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
  }, [requestId, currentUser.user.id]);

  // -----FORMAT DATE TIME FUNCTION-----
  const formatDateTime = (date) => {
    return date ? moment(date).format('DD/MM/YYYY - HH:mm') : 'N/A';
  };

  // -----DISPLAY LOADING MESSAGE IF REQUEST DETAILS ARE NOT LOADED-----
  if (!requestDetails)
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );

  // -----CALCULATE TOTAL ACTIVITY COST FUNCTION------
  const calculateTotalActivityCost = () => {
    return requestDetails.activities.reduce(
      (sum, activity) => sum + (activity.totalCost || 0),
      0
    );
  };

  const eventTotalCost =
    requestDetails.totalCost ?? calculateTotalActivityCost();

  // -----HANDLE CHECKBOX CHANGE FUNCTION-----
  const handleCheckboxChange = (activityId, checked) => {
    setActivityAcceptance((prev) => ({
      ...prev,
      [activityId]: !checked,
    }));

    // Check if any checkbox is selected
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const anyChecked = Array.from(allCheckboxes).some(
      (checkbox) => checkbox.checked
    );

    setCheckboxChecked(anyChecked); // Update state based on whether any checkbox is checked
  };

  // -----HANDLE COMMENT CHANGE FUNCTION-----
  const handleCommentChange = (activityId, comment) => {
    setActivityComments((prev) => ({
      ...prev,
      [activityId]: comment,
    }));
  };

  // -----REJECT REQUEST FUNCTION-----
  const handleReject = async () => {
    const body = {
      id: requestId,
      isAccepted: false,
      eventModel: {
        comment: eventComment,
        listActivities: requestDetails.activities.map((activity) => ({
          id: activity.id,
          comment: activityComments[activity.id] || '',
          isAccepted: activityAcceptance[activity.id] === false,
        })),
      },
    };

    try {
      const response = await request_api.updateRequestStatus(requestId, body);
      if (response.success) {
        message.success('Request rejected successfully');
        navigate('/user/request');
      } else {
        message.error(response.message || 'Failed to update request status.');
      }
    } catch (error) {
      message.error('An error occurred while updating request status.');
      console.log(error);
    }
  };

  // -----RESUBMIT REQUEST FUNCTION-----
  const handleResubmit = async () => {
    const body = {
      id: requestId,
      isAccepted: null, // Set to null for pending status
      eventModel: {
        comment: eventComment,
        listActivities: requestDetails.activities.map((activity) => ({
          id: activity.id,
          comment: activityComments[activity.id] || '',
          isAccepted: activityAcceptance[activity.id] === false,
        })),
      },
    };

    console.log(JSON.stringify(body));

    try {
      const response = await request_api.updateRequestStatus(requestId, body);
      if (response.success) {
        message.success('Request resubmitted successfully');
        navigate('/user/request');
      } else {
        message.error(response.message || 'Failed to update request status.');
      }
    } catch (error) {
      message.error('An error occurred while updating request status.');
      console.log(error);
    }
  };

  // ------ACCEPT REQUEST FUNCTION-----
  const handleApprove = async () => {
    const body = {
      id: requestId,
      isAccepted: true,
      eventModel: {
        comment: eventComment,
        listActivities: requestDetails.activities.map((activity) => ({
          id: activity.id,
          comment: activityComments[activity.id] || '',
          isAccepted: activityAcceptance[activity.id] === true,
        })),
      },
    };
    try {
      const response = await request_api.updateRequestStatus(requestId, body);
      if (response.success) {
        message.success('Request accepted successfully');
        navigate('/user/request');
      } else {
        message.error(response.message || 'Failed to update request status.');
      }
    } catch (error) {
      message.error('An error occurred while updating request status.');
      console.log(error);
    }
  };

  // -----RENDER-----
  return (
    <div className='p-6 bg-white rounded-md shadow-md'>
      {/* -----HEADER SECTION----- */}
      <div className='flex justify-between items-center mb-4'>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Yêu Cầu Được Tạo Bởi:</p>
          <p className='text-gray-600'>{createdByName}</p>
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Đoàn Thể Yêu Cầu:</p>
          <p className='text-gray-600'>{requestingGroup}</p>
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Loại Yêu Cầu:</p>
          <p className='text-gray-600'>{requestDetails?.type || 'N/A'}</p>
        </div>
      </div>
      {/* -----EVENT DIVIDER----- */}
      <Divider
        orientation='center'
        style={{ borderColor: '#9a9a9a' }}
      >
        <strong className='text-2xl'>SỰ KIỆN</strong>
      </Divider>
      {/* -----REQUEST EVENT NAME----- */}
      <h1 className='text-xl font-bold mb-4 text-gray-800'>
        {requestDetails.eventName}
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md'>
        <div>
          {/* -----REQUEST EVENT DESCRIPTION----- */}
          <p className='font-semibold text-gray-700'>Mô tả sự kiện:</p>
          <p className='text-gray-600'>{requestDetails.description}</p>
        </div>
        {/* -----REQUEST STATUS----- */}
        <div>
          <p className='font-semibold text-gray-700'>Trạng thái:</p>
          <Tag
            color='processing'
            className='text-base'
          >
            {requestDetails.status}
          </Tag>
        </div>
        {/* -----EVENT TIME----- */}
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
        {/* -----EVENT COST----- */}
        <div>
          <p className='font-semibold text-gray-700'>Tổng Chi Phí Sự Kiện:</p>
          <p className='text-gray-600'>{eventTotalCost} VND</p>
        </div>
      </div>

      {/* -----EVENT COMMENT----- */}
      {isAccepted === null && (
        <div className='p-3 bg-gray-50'>
          <h3
            htmlFor='eventComment'
            className='block text-sm font-medium text-gray-700'
          >
            Góp Ý Cho Sự Kiện <strong>{requestDetails.eventName}</strong>:
          </h3>
          <textarea
            id='eventComment'
            rows='3'
            className='p-2 mt-3 block w-full rounded-md border-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            placeholder='Nhập góp ý của bạn...'
            onChange={(e) => setEventComment(e.target.value)}
            disabled={userRole !== 'council'}
          />
        </div>
      )}

      {/* -----DIVIDER----- */}
      <Divider
        orientation='center'
        style={{ borderColor: '#9a9a9a' }}
      >
        <strong className='text-xl'>HOẠT ĐỘNG</strong>
      </Divider>

      {/* -----LIST ACTIVITIES----- */}
      <ul className='space-y-4'>
        {requestDetails.activities.map((activity) => (
          <div key={activity.id}>
            {/* -----ACTIVITY NAME----- */}
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>
              {activity.activityName}
              {isAccepted === null && userRole === 'council' && (
                <Checkbox
                  className='ml-2'
                  onChange={() => handleCheckboxChange(activity.id)} // Handle checkbox state change
                />
              )}
            </h3>
            <li className='p-4 bg-gray-50 rounded-md shadow-sm'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                {/* -----ACTIVITY DESCRIPTION----- */}
                <div>
                  <p className='font-semibold text-gray-700'>
                    Mô tả hoạt động:
                  </p>
                  <p className='text-gray-600'>
                    {activity.description}
                    {isAccepted === null && userRole === 'council' && (
                      <Checkbox
                        className='ml-2'
                        onChange={() => handleCheckboxChange(activity.id)} // Handle checkbox state change
                      />
                    )}
                  </p>
                </div>
                {/* -----ACTIVITY STATUS----- */}
                <div>
                  <p className='font-semibold text-gray-700'>Trạng thái:</p>
                  <Tag color='processing'>{activity.status}</Tag>
                </div>
                {/* -----ACTIVITY TIME----- */}
                <div>
                  <p className='font-semibold text-gray-700'>Thời gian:</p>
                  <p className='text-gray-600'>
                    {activity.startTime} - {activity.endTime}
                    {isAccepted === null && userRole === 'council' && (
                      <Checkbox
                        className='ml-2'
                        onChange={() => handleCheckboxChange(activity.id)} // Handle checkbox state change
                      />
                    )}
                  </p>
                </div>
                <div>
                  {/* -----ACTIVITY TOTAL COST----- */}
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
                    {isAccepted === null && userRole === 'council' && (
                      <Checkbox
                        className='ml-2'
                        onChange={() => handleCheckboxChange(activity.id)} // Handle checkbox state change
                      />
                    )}
                  </li>
                ))}
              </ul>
              {/* -----ACTIVITY COMMENT----- */}
              {isAccepted === null && (
                <div className='mt-4'>
                  <p
                    htmlFor='rejectionComment'
                    className='block text-sm font-medium text-gray-700'
                  >
                    Góp Ý Cho Hoạt Động <strong>{activity.activityName}</strong>
                    :
                  </p>
                  <textarea
                    id='rejectionComment'
                    rows='3'
                    className='p-2 mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                    placeholder='Nhập góp ý của bạn...'
                    onChange={(e) =>
                      handleCommentChange(activity.id, e.target.value)
                    }
                    disabled={userRole !== 'council'}
                  />
                </div>
              )}
            </li>
          </div>
        ))}
      </ul>

      {/* -----DISCLAIMER (only shows when any checkbox is checked)----- */}
      {checkboxChecked && (
        <p className='text-red-500 text-center mt-4'>
          Lưu ý: Khi bạn chọn vào góp ý cho các sự kiện, bạn sẽ không thể chấp
          nhận yêu cầu.
        </p>
      )}

      {/* -----BUTTONS----- */}
      {isAccepted === null && userRole === 'council' && (
        <div className='flex justify-center space-x-4 mt-8'>
          <Button
            type='primary'
            className='bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md'
            disabled={checkboxChecked} // Disable button if no checkbox is checked
            onClick={handleApprove}
          >
            Chấp Nhận Yêu Cầu
          </Button>
          <Button
            type='primary'
            className='bg-orange-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md'
            onClick={handleResubmit}
          >
            Gửi Lại Yêu Cầu
          </Button>
          <Button
            type='primary'
            className='bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md'
            onClick={handleReject}
          >
            Từ Chối Yêu Cầu
          </Button>
        </div>
      )}
    </div>
  );
}
