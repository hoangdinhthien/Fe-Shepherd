import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import UserAPI from '../../../apis/user_api';
import GroupAPI from '../../../apis/group_api';
import {
  message,
  Tag,
  Divider,
  Button,
  Checkbox,
  Modal,
  Select,
  Input,
  DatePicker,
} from 'antd';
import { IoArrowBack } from 'react-icons/io5'; // Import IoArrowBack
import moment from 'moment';
import request_api from '../../../apis/request_api';
import { validateActivityDates } from '../../../pages/CreateRequest';

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
  const [loading, setLoading] = useState(false); // Add loading state
  const [editingActivity, setEditingActivity] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // -----LOCATION-----
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const { requestId, requestingGroup, isAccepted } = location.state.request; // Destructure isAccepted
  const currentUser = location.state.currentUser; // Get the current user

  // -----USE EFFECT-----
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        // Fetch specific request details
        const response = await request_api.getRequestDetails(requestId);
        if (response.success) {
          const data = response.data;
          setRequestDetails({
            ...data,
            isAccepted: isAccepted, // Include the isAccepted value
          });

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
  }, [requestId, isAccepted]); // Include isAccepted in the dependency array

  useEffect(() => {
    if (currentUser) {
      setUserRole(currentUser.user.role);
    }
  }, [currentUser]);

  // -----FORMAT DATE TIME FUNCTION-----
  const formatDateTime = (date) => {
    return date ? moment(date).format('DD/MM/YYYY [lúc] HH:mm') : 'N/A';
  };

  // -----FORMAT COST FUNCTION-----
  const formatCost = (cost) => {
    return cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' VND';
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
  const handleCheckboxChange = (activityId) => {
    setActivityAcceptance((prev) => ({
      ...prev,
      [activityId]: !prev[activityId], // Toggle the checkbox state
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
          isAccepted: activityAcceptance[activity.id] === true,
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
    console.log('Data sent:', body); // Log the data sent
    try {
      const response = await request_api.updateRequestStatus(requestId, body);
      console.log('API Response:', response); // Log the API response
      if (response.success) {
        message.success('Request accepted successfully');
        navigate('/user/request');
      } else {
        message.error(response.message || 'Failed to update request status.');
      }
    } catch (error) {
      message.error('An error occurred while updating request status.');
      console.log('API Error:', error.response ? error.response.data : error); // Log detailed error
    }
  };

  const handleNavigateToTask = (groupID, eventID, activityID) => {
    setLoading(true); // Set loading state to true
    navigate(
      `/user/task?groupId=${groupID}&eventId=${eventID}&activityId=${activityID}`
    );
  };

  const openEditModal = (activity) => {
    setEditingActivity({ ...activity, selectedGroups: activity.groups });
    setShowEditModal(true);
  };

  const handleEditActivityChange = (field, value) => {
    setEditingActivity((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditActivityTimeChange = (dates) => {
    if (!dates) return;
    const [start, end] = dates;
    if (!requestDetails.fromDate || !requestDetails.toDate) {
      message.warning('Bạn phải chọn thời gian cho sự kiện trước.');
      return;
    }
    if (
      (start && start.isBefore(moment(requestDetails.fromDate))) ||
      (end && end.isAfter(moment(requestDetails.toDate)))
    ) {
      message.warning(
        'Thời gian hoạt động phải nằm trong phạm vi của sự kiện.'
      );
      setEditingActivity((prev) => ({
        ...prev,
        startTime: null,
        endTime: null,
      }));
      return;
    }
    if (!validateActivityDates(start, end)) {
      setEditingActivity((prev) => ({
        ...prev,
        startTime: null,
        endTime: null,
      }));
      return;
    }
    setEditingActivity((prev) => ({
      ...prev,
      startTime: start ? start.toISOString() : null,
      endTime: end ? end.toISOString() : null,
    }));
  };

  const handleEditActivityGroupChange = (groupID, cost) => {
    // Update selectedGroups array
    setEditingActivity((prev) => {
      const updated = prev.selectedGroups.map((g) =>
        g.groupID === groupID ? { ...g, cost: parseFloat(cost) || 0 } : g
      );
      return { ...prev, selectedGroups: updated };
    });
  };

  const handleSaveEditedActivity = async () => {
    try {
      // Build final event data from requestDetails
      const updatedEvent = {
        id: requestDetails.id,
        eventName: requestDetails.eventName,
        description: requestDetails.description,
        fromDate: requestDetails.fromDate,
        toDate: requestDetails.toDate,
        // ...other fields as needed...
        listActivities: requestDetails.activities.map((act) => {
          if (act.id === editingActivity.id) {
            return {
              ...act,
              activityName: editingActivity.activityName,
              description: editingActivity.description,
              location: editingActivity.location,
              startTime: editingActivity.startTime,
              endTime: editingActivity.endTime,
              groups: editingActivity.selectedGroups,
              // Remove totalCost from the activity
              totalCost: 0,
            };
          }

          return act;
        }),
      };
      // Identify which groupId belongs to "Trưởng nhóm" user for this activity
      const groupId = editingActivity.selectedGroups[0]?.groupID || '';
      const res = await request_api.modifyEventRequest(
        groupId,
        requestDetails.id,
        updatedEvent
      );
      if (res.success) {
        message.success('Activity modified successfully');
        setShowEditModal(false);
        setRequestDetails((prev) => ({ ...prev, ...updatedEvent }));
      } else {
        message.error(res.message || 'Failed to modify activity');
      }
    } catch (error) {
      message.error('Error modifying activity');
      console.log(error);
      console.log('Modified Activity:', editingActivity);
    }
  };

  // log the current user
  console.log('Current User:', currentUser);
  console.log(editingActivity);
  console.log('Request Details:', requestDetails);

  // -----RENDER-----
  return (
    <div className='p-6 bg-white rounded-md shadow-md'>
      <button
        className='flex items-center mb-4 text-black'
        onClick={() => navigate(-1)} // Navigate back
      >
        <IoArrowBack className='mr-2' /> Quay lại
      </button>
      {/* -----HEADER SECTION----- */}
      <div className='flex justify-between items-center mb-4'>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Yêu Cầu Được Tạo Bởi:</p>
          <p className='text-gray-600'>
            {createdByName || requestDetails.createdUser.name || 'Unknown'}
          </p>
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
          <p className='text-gray-600'>{formatCost(eventTotalCost)}</p>
        </div>
        {/* -----EVENT COMMENT----- */}
        <div>
          <p className='font-semibold text-gray-700'>Góp Ý:</p>
          <p className='text-gray-600'>
            {requestDetails.comment || 'Không có góp ý cho phần này'}
          </p>
        </div>
      </div>

      {/* -----EVENT COMMENT INPUT----- */}
      {userRole === 'Council' && (
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
            <h3
              className={`text-xl font-semibold mb-2 ${
                activity.isAccepted ? 'text-red-600' : 'text-gray-800'
              }`}
            >
              {activity.activityName}
              {/* {activity.isAccepted && (
                <span className='text-sm text-red-600 ml-2'>
                  (Nội dung cần phải sửa)
                </span>
              )} */}
              {/* -----CHECKBOX------ */}
              {userRole === 'Council' && (
                // ||
                //   currentUser.listGroupRole?.some(
                //     (userGroup) => userGroup.roleName === 'Trưởng nhóm'
                //   )
                <>
                  <Checkbox
                    className='ml-2'
                    onChange={() => handleCheckboxChange(activity.id)} // Handle checkbox state change
                    checked={activityAcceptance[activity.id] || false} // Use state to control checkbox
                  />
                  {/* {userRole === 'Council' && (
                    <p className='text-sm inline-block ml-2'>
                      Đánh dấu vào hoạt động cần phải chỉnh sửa
                    </p>
                  )} */}
                </>
              )}
            </h3>
            <li className='p-4 bg-gray-50 rounded-md shadow-sm'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                {/* -----ACTIVITY DESCRIPTION----- */}
                <div>
                  <p className='font-semibold text-gray-700'>
                    Mô tả hoạt động:
                  </p>
                  <p className='text-gray-600'>{activity.description}</p>
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
                    {formatDateTime(activity.startTime)} -{' '}
                    {formatDateTime(activity.endTime)}
                  </p>
                </div>
                <div>
                  {/* -----ACTIVITY TOTAL COST----- */}
                  <p className='font-semibold text-gray-700'>
                    Tổng Chi Phí Hoạt Động:
                  </p>
                  <p className='text-gray-600'>
                    {formatCost(activity.totalCost)}
                  </p>
                </div>
                {/* -----ACTIVITY COMMENT----- */}
                <div>
                  <p className='font-semibold text-gray-700'>
                    Địa điểm tổ chức hoạt động:
                  </p>
                  <p className='text-gray-600'>{activity.location}</p>
                </div>
                <div>
                  <p className='font-semibold text-gray-700'>Góp Ý:</p>
                  <p className='text-gray-600'>
                    {activity.comment || 'Không có góp ý cho phần này'}
                  </p>
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
                    - Chi Phí: {formatCost(group.cost)}
                    {/* -----NAVIGATE TO TASK BUTTON----- */}
                    {currentUser.listGroupRole?.some(
                      (userGroup) =>
                        userGroup.groupId === group.groupID &&
                        userGroup.roleName === 'Trưởng nhóm'
                    ) &&
                      isAccepted === true && ( // Check if the request is accepted
                        <div className='mb-3 ml-3'>
                          <button
                            onClick={() =>
                              handleNavigateToTask(
                                group.groupID,
                                requestDetails.id,
                                activity.id
                              )
                            }
                            className='text-blue-500 hover:underline'
                          >
                            Tạo công việc và bàn giao thành viên cho hoạt động
                            này
                          </button>
                        </div>
                      )}
                  </li>
                ))}
              </ul>
              {/* -----ACTIVITY COMMENT INPUT----- */}
              {userRole === 'Council' && (
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
                  />
                </div>
              )}
              {/* Button to open edit modal for "Trưởng nhóm" if isAccepted === true */}
              {/* {currentUser.listGroupRole?.some(
                (role) => role.roleName === 'Trưởng nhóm'
              ) &&
                activity.isAccepted === true && (
                  <Button
                    className='ml-3'
                    onClick={() => openEditModal(activity)}
                  >
                    Chỉnh sửa hoạt động
                  </Button>
                )} */}
              {currentUser.listGroupRole?.some(
                (role) => role.roleName === 'Trưởng nhóm'
              ) &&
                activity.isAccepted === true && (
                  <Button
                    className='ml-3'
                    onClick={() =>
                      navigate('/user/create-request', {
                        state: {
                          preselectedType: 'Tạo sự kiện',
                          eventDetails: {
                            eventName: requestDetails.eventName,
                            description: requestDetails.description,
                            fromDate: requestDetails.fromDate,
                            toDate: requestDetails.toDate,
                          },
                        },
                      })
                    }
                  >
                    Tạo lại yêu cầu
                  </Button>
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
      {userRole === 'Council' && (
        <div className='flex justify-center space-x-4 mt-8'>
          <Button
            type='primary'
            className='bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md'
            disabled={checkboxChecked} // Disable button if no checkbox is checked
            onClick={handleApprove}
          >
            Chấp Nhận Yêu Cầu
          </Button>
          {/* <Button
            type='primary'
            className='bg-orange-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-md'
            onClick={handleResubmit}
          >
            Gửi Lại Yêu Cầu
          </Button> */}
          <Button
            type='primary'
            className='bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md'
            onClick={handleReject}
          >
            Từ Chối Yêu Cầu
          </Button>
        </div>
      )}

      <Modal
        title='Chỉnh sửa hoạt động'
        visible={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onOk={handleSaveEditedActivity}
      >
        {editingActivity && (
          <>
            <Input
              placeholder='Tên hoạt động'
              value={editingActivity.activityName}
              onChange={(e) =>
                handleEditActivityChange('activityName', e.target.value)
              }
              className='mb-3'
            />
            <Input.TextArea
              rows={2}
              placeholder='Mô tả hoạt động'
              value={editingActivity.description}
              onChange={(e) =>
                handleEditActivityChange('description', e.target.value)
              }
              className='mb-3'
            />
            <DatePicker.RangePicker
              showTime
              format='DD/MM/YYYY - HH:mm'
              value={[
                editingActivity.startTime
                  ? moment(editingActivity.startTime)
                  : null,
                editingActivity.endTime
                  ? moment(editingActivity.endTime)
                  : null,
              ]}
              onChange={handleEditActivityTimeChange}
              className='mb-3 w-full'
            />
            <Input
              placeholder='Địa điểm hoạt động'
              value={editingActivity.location}
              onChange={(e) =>
                handleEditActivityChange('location', e.target.value)
              }
              className='mb-3'
            />
            {editingActivity.selectedGroups?.map((grp) => (
              <div
                key={grp.groupID}
                className='flex mb-2'
              >
                <span className='mr-2'>
                  {groupNames[grp.groupID] || 'Unknown'}
                </span>
                <Input
                  type='number'
                  placeholder='Chi phí'
                  value={grp.cost}
                  onChange={(e) =>
                    handleEditActivityGroupChange(grp.groupID, e.target.value)
                  }
                  className='w-32'
                />
              </div>
            ))}
          </>
        )}
      </Modal>
    </div>
  );
}
