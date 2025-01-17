// src/components/CreateRequest.jsx
import { Select, message } from 'antd';
import { IoArrowBack } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import group_api from '../apis/group_api';
import RequestAPI from '../apis/request_api';
import moment from 'moment';
import RequestCreateEvent from '../components/request/request-create-event/RequestCreateEvent';
import RequestCreateAccount from '../components/request/request-create-account/RequestCreateAccount';
import EventAPI from '../apis/event_api';
import OtherRequest from '../components/request/other-request/OtherRequest';

const { Option } = Select;

export const validateActivityDates = (start, end) => {
  if (start && end && end.diff(start, 'hours') > 24) {
    message.warning('Hoạt Động chỉ được diễn ra trong ngày.');
    return false;
  }
  return true;
};

export default function CreateRequest() {
  // ------STATES------
  const [userGroups, setUserGroups] = useState([]);
  const [groupsOptions, setGroupsOptions] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedRequestType, setSelectedRequestType] = useState('');
  const [activities, setActivities] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [locations, setLocations] = useState([]);
  const [accountData, setAccountData] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    password: '',
  });
  const [otherRequestData, setOtherRequestData] = useState({
    title: '',
    content: '',
  });

  // Select `currentUser` and rehydration state separately
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    fromDate: null,
    toDate: null,
    isPublic: true,
    ceremonyID: null,
    listActivities: [],
  });

  const currentUserGroup = userGroups.length > 0 ? userGroups[0] : {};

  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        setLoading(true);
        const response = await group_api.getAllGroups();
        setGroupsOptions(
          response.result.map((group) => ({
            label: group.groupName,
            value: group.id,
          }))
        );
      } catch (error) {
        console.error('Error fetching all groups:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGroups = async () => {
      if (!currentUser || !currentUser.user?.id) {
        console.log('Current user id is not available');
        return;
      }

      try {
        setLoading(true);
        const response = await group_api.getGroupsForUser(currentUser.user.id);
        setUserGroups(response.result);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRequestTypes = async () => {
      try {
        const types = await RequestAPI.getRequestType();
        setRequestTypes(types);
      } catch (error) {
        console.error('Error fetching request types:', error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await EventAPI.getLocations();
        setLocations(response.data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    if (rehydrated && currentUser) {
      fetchAllGroups();
      fetchGroups();
      fetchRequestTypes();
      fetchLocations();
    }
  }, [currentUser, rehydrated]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  const handleRequestTypeChange = (value) => {
    setSelectedRequestType(value);
  };

  const onReset = () => {
    setFormData({
      eventName: '',
      description: '',
      fromDate: null,
      toDate: null,
      isPublic: true,
      ceremonyID: null,
      listActivities: [],
    });
    setActivities([]);
    setTotalCost(0);
  };

  const calculateTotalCost = () => {
    const total = activities.reduce((acc, activity) => {
      const activityCost = activity.selectedGroups.reduce(
        (sum, group) => sum + group.cost,
        0
      );
      return acc + activityCost;
    }, 0);
    setTotalCost(total);
  };

  const handleActivityTimeChange = (index, dates) => {
    const [start, end] = dates;

    if (
      (start && start.isBefore(formData.fromDate)) ||
      (end && end.isAfter(formData.toDate))
    ) {
      message.warning(
        'Thời gian hoạt động phải nằm trong phạm vi của sự kiện.'
      );
      setActivities((prevActivities) => {
        const updatedActivities = [...prevActivities];
        updatedActivities[index].startTime = null;
        updatedActivities[index].endTime = null;
        return updatedActivities;
      });
      return;
    }

    if (!validateActivityDates(start, end)) {
      setActivities((prevActivities) => {
        const updatedActivities = [...prevActivities];
        updatedActivities[index].startTime = null;
        updatedActivities[index].endTime = null;
        return updatedActivities;
      });
      return;
    }

    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].startTime = start ? start.toISOString() : null;
      updatedActivities[index].endTime = end ? end.toISOString() : null;
      return updatedActivities;
    });
    calculateTotalCost();
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRequestType) {
      message.error('Vui lòng chọn loại yêu cầu.');
      return;
    }

    if (selectedRequestType === 'Tạo sự kiện') {
      if (
        !formData.fromDate ||
        !formData.toDate ||
        !formData.eventName ||
        !formData.description
      ) {
        message.error('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      const loadingKey = 'loading';
      try {
        setLoading(true);
        message.loading({
          content: 'Submitting request...',
          key: loadingKey,
          duration: 0,
        });

        calculateTotalCost();

        const data = {
          eventName: formData.eventName,
          description: formData.description,
          fromDate: formData.fromDate.toISOString(),
          toDate: formData.toDate.toISOString(),
          isPublic: formData.isPublic,
          location: 'Trong Giáo Xứ',
          imageURL: '',
          ceremonyID: formData.ceremonyID,
          listActivities: activities.map((activity) => ({
            activityName: activity.title,
            description: activity.description,
            location: activity.location,
            imageURL: '',
            startTime: activity.startTime
              ? moment(activity.startTime).toISOString()
              : null,
            endTime: activity.endTime
              ? moment(activity.endTime).toISOString()
              : null,
            groups: activity.selectedGroups.map((group) => ({
              groupID: group.groupID,
              cost: group.cost,
            })),
          })),
        };

        console.log('Data being sent to API:', JSON.stringify(data));
        await RequestAPI.createRequest(selectedGroup, data);

        message.success({
          content: 'Request submitted successfully!',
          key: loadingKey,
        });
        console.log('Request submitted:', data);

        navigate('/user/request');
      } catch (error) {
        message.error({
          content: `Error submitting request: ${error.message}`,
          key: loadingKey,
        });
        console.error('Error details:', error.response?.data?.errors || error);
      } finally {
        setLoading(false);
      }
    } else if (selectedRequestType === 'Tạo tài khoản') {
      if (
        !accountData.name ||
        !accountData.phone ||
        !accountData.email ||
        !accountData.password
      ) {
        message.error('Vui lòng điền đầy đủ thông tin.');
        return;
      }

      const loadingKey = 'loading';
      try {
        setLoading(true);
        message.loading({
          content: 'Submitting request...',
          key: loadingKey,
          duration: 0,
        });

        const data = {
          name: accountData.name,
          phone: accountData.phone,
          email: accountData.email,
          role: 'Member', // Ensure role is set to 'Member'
          password: accountData.password,
          groupId: currentUserGroup.id,
        };

        console.log('Data being sent to API:', JSON.stringify(data));
        await RequestAPI.createAccount(data);

        message.success({
          content: 'Account creation request submitted successfully!',
          key: loadingKey,
        });
        console.log('Account creation request submitted:', data);

        navigate('/user/request');
      } catch (error) {
        message.error({
          content: `Error submitting request: ${error.message}`,
          key: loadingKey,
        });
        console.error('Error details:', error.response?.data?.errors || error);
      } finally {
        setLoading(false);
      }
    } else if (selectedRequestType === 'Khác') {
      if (
        !otherRequestData.title ||
        !otherRequestData.content ||
        !currentUserGroup.id
      ) {
        message.error('Vui lòng điền đầy đủ thông tin và chọn nhóm.');
        return;
      }

      const loadingKey = 'loading';
      try {
        setLoading(true);
        message.loading({
          content: 'Submitting request...',
          key: loadingKey,
          duration: 0,
        });

        const data = {
          title: otherRequestData.title,
          content: otherRequestData.content,
        };

        console.log('Data being sent to API:', JSON.stringify(data));
        await RequestAPI.createOtherRequest(currentUserGroup.id, data);

        message.success({
          content: 'Other request submitted successfully!',
          key: loadingKey,
        });
        console.log('Other request submitted:', data);

        navigate('/user/request');
      } catch (error) {
        message.error({
          content: `Error submitting request: ${error.message}`,
          key: loadingKey,
        });
        console.error('Error details:', error.response?.data?.errors || error);
      } finally {
        setLoading(false);
      }
    }
  };

  console.log(`currentUser`, currentUser.listGroupRole);

  return (
    <form
      className='p-6 max-w-6xl mx-auto '
      onSubmit={onSubmit}
    >
      {/* First section */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <Link
            to='/dashboard'
            className='mr-4'
          >
            <IoArrowBack className='text-2xl' />
          </Link>
          <h1 className='text-2xl font-bold'>Tạo Yêu Cầu</h1>
        </div>
      </div>
      <hr className='border-t border-gray-400 my-6' />

      {/* Second section */}
      <div className='flex justify-end mb-6 items-center'>
        <label className='mr-2 text-lg font-medium'>Chọn Yêu Cầu:</label>
        <Select
          className='rounded-lg w-48 h-[40px]'
          value={selectedRequestType || undefined}
          onChange={handleRequestTypeChange}
          placeholder='Chọn Yêu Cầu'
        >
          {requestTypes?.length > 0 ? (
            requestTypes.map((type, index) => (
              <Option
                key={index}
                value={type}
                className='text-black text-xl'
              >
                {type}
              </Option>
            ))
          ) : (
            <Option disabled>No request types available</Option>
          )}
        </Select>
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Third section */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Người yêu cầu</h2>
        <input
          value={currentUser?.user?.name || ''}
          type='text'
          placeholder='Tên người yêu cầu'
          className='border p-2 rounded w-full'
          disabled
        />
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Conditional Rendering based on Request Type */}
      {selectedRequestType === 'Tạo sự kiện' && (
        <RequestCreateEvent
          formData={formData}
          setFormData={setFormData}
          selectedGroup={selectedGroup}
          handleGroupChange={handleGroupChange}
          userGroups={userGroups}
          groupsOptions={groupsOptions}
          activities={activities}
          setActivities={setActivities}
          totalCost={totalCost}
          calculateTotalCost={calculateTotalCost}
          locations={locations}
        />
      )}

      {selectedRequestType === 'Tạo tài khoản' && (
        <RequestCreateAccount
          currentUserGroup={currentUserGroup}
          accountData={accountData}
          setAccountData={setAccountData}
          currentUser={currentUser} // Pass currentUser here
        />
      )}

      {selectedRequestType === 'Khác' && (
        <OtherRequest
          selectedGroup={selectedGroup}
          otherRequestData={otherRequestData}
          setOtherRequestData={setOtherRequestData}
        />
      )}

      {/* Buttons */}
      {!loading && (
        <div className='flex justify-center items-center space-x-4'>
          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded-full'
          >
            Gửi yêu cầu
          </button>
          <button
            onClick={onReset}
            type='button'
            className='bg-gray-300 px-4 py-2 rounded-full'
          >
            Đặt lại
          </button>
          <button
            onClick={onReset}
            type='button'
            className='bg-red-500 text-white px-4 py-2 rounded-full'
          >
            Hủy
          </button>
        </div>
      )}
    </form>
  );
}
