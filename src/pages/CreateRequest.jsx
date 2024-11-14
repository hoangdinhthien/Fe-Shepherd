import { Select, DatePicker, message, Input } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import group_api from '../apis/group_api';
import RequestAPI from '../apis/request_api';
import moment from 'moment';

const { Option } = Select;

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

  // ---------------

  // Select `currentUser` and rehydration state separately
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  // ---------------

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

        // if (response.result.length > 0) {
        //   setSelectedGroup(response.result[0].id); // Set initial group selection
        // }
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

    // Only run after rehydration and when currentUser is available
    if (rehydrated && currentUser) {
      fetchAllGroups();
      fetchGroups();
      fetchRequestTypes();
    }
  }, [currentUser, rehydrated]);

  // ---------------
  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  // ---------------

  const handleRequestTypeChange = (value) => {
    setSelectedRequestType(value);
  };

  // Initialize formData with default values
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    fromDate: null,
    toDate: null,
    isPublic: true,
    ceremonyID: null,
    listActivities: [],
  });

  // ---------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // ---------------

  const LEADER = import.meta.env.VITE_ROLE_GROUP_LEADER;
  const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;

  // ---------------

  // const groupIds =
  //   currentUser.listGroupRole
  //     .filter(
  //       ({ roleName, groupName }) =>
  //         roleName === LEADER || groupName?.includes(COUNCIL)
  //     )
  //     .map(({ groupId }) => groupId) || [];

  // const data = {
  //   eventName: formData.eventName,
  //   description: formData.description,
  //   fromDate: formData.fromDate ? formData.fromDate.toISOString() : null,
  //   toDate: formData.toDate ? formData.toDate.toISOString() : null,
  //   isPublic: true,
  //   totalCost: 0,
  //   // groupIds: groupIds,
  //   ceremonyID: null,
  // };

  // ---------------

  const onReset = () => {
    setFormData({
      eventName: '',
      description: '',
      fromDate: null,
      toDate: null,
      eventCost: '',
    });
    setActivities([]); //reset activities
  };

  // ---------------

  const addActivity = () => {
    setActivities((prevActivities) => [
      ...prevActivities,
      {
        title: '',
        description: '',
        startTime: null,
        endTime: null,
        selectedGroups: [],
      },
    ]);
  };

  // ---------------

  const removeActivity = (index) => {
    setActivities((prevActivities) =>
      prevActivities.filter((_, i) => i !== index)
    );
  };

  // ---------------

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index][name] = value;
      return updatedActivities;
    });
  };

  // ---------------

  const handleActivityStartTimeChange = (index, date) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].startTime = date ? date.toISOString() : null;
      return updatedActivities;
    });
  };

  const handleActivityEndTimeChange = (index, date) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].endTime = date ? date.toISOString() : null;
      return updatedActivities;
    });
  };

  // ---------------

  const handleActivityGroupChange = (index, selectedGroups) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].selectedGroups = selectedGroups.map(
        (groupId) => ({
          groupID: groupId,
          cost: 0, //default cost
        })
      );
      return updatedActivities;
    });
    calculateTotalCost();
  };

  const handleactivityGroupCostChange = (activityIndex, groupIndex, cost) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[activityIndex].selectedGroups[groupIndex].cost =
        parseFloat(cost) || 0;
      return updatedActivities;
    });
    calculateTotalCost();
  };

  // ---------------

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

  // ---------------

  const onSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fromDate ||
      !formData.toDate ||
      !formData.eventName ||
      !formData.description
    ) {
      message.error('Please fill all the fields.');
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
        // groupId: selectedGroup,
        eventName: formData.eventName,
        description: formData.description,
        fromDate: formData.fromDate.toISOString(),
        toDate: formData.toDate.toISOString(),
        isPublic: formData.isPublic,
        ceremonyID: formData.ceremonyID,
        listActivities: activities.map((activity) => ({
          activityName: activity.title,
          description: activity.description,
          startTime: activity.startTime
            ? moment(activity.startTime).format('HH:mm:ss')
            : null,
          endTime: activity.endTime
            ? moment(activity.endTime).format('HH:mm:ss')
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
    } catch (error) {
      message.error({
        content: `Error submitting request: ${error.message}`,
        key: loadingKey,
      });
      console.error('Error details:', error.response?.data?.errors || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className='p-6 max-w-6xl mx-auto '>
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

      {/* Show request types dropdown */}
      <div className='flex justify-end mb-6 items-center'>
        <label className='mr-2 text-lg font-medium'>Chọn Yêu Cầu:</label>
        <Select
          className='rounded-lg w-48 h-[40px]'
          value={selectedRequestType}
          onChange={handleRequestTypeChange}
          placeholder='Chọn yêu cầu'
        >
          {requestTypes.map((type, index) => (
            <Option
              key={index}
              value={type}
              className='text-black text-xl'
            >
              {type}
            </Option>
          ))}
        </Select>
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Third section */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Người yêu cầu</h2>
        <input
          type='text'
          placeholder='Tên người yêu cầu'
          className='border p-2 rounded w-full'
        />
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Display Activities Section if "Create Event" is selected */}
      {selectedRequestType === 'Tạo sự kiện' && (
        <>
          {/* Fourth section */}
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Chi Tiết Sự Kiện</h2>

            <div className='flex justify-between mb-4'>
              <div className='flex items-center space-x-2 w-[45%]'>
                <label className='text-base'>Chọn đoàn thể:</label>
                <Select
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className='w-full h-[40px]'
                  placeholder='Select a group'
                >
                  {userGroups?.map((group) => (
                    <Option
                      key={group.id}
                      value={group.id}
                      className='text-black text-xl'
                    >
                      {group.groupName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <input
              id='eventName'
              type='text'
              name='eventName'
              value={formData.eventName}
              onChange={handleChange}
              placeholder='Tên sự kiện'
              className='border p-2 rounded w-full mb-4'
            />

            <DatePicker.RangePicker
              showTime
              format='DD/MM/YYYY - HH:mm'
              value={[formData.fromDate, formData.toDate]}
              onChange={(date) =>
                setFormData((prev) => ({
                  ...prev,
                  fromDate: date ? date[0] : null,
                  toDate: date ? date[1] : null,
                }))
              }
              placeholder={[
                'Thời gian bắt đầu sự kiện',
                'Thời gian kết thúc sự kiện',
              ]}
              size='large'
              className='border border-[#EEE] p-2 rounded w-full mb-4 font-semibold'
            />

            <textarea
              name='description'
              value={formData.description}
              onChange={handleChange}
              placeholder='Mô tả sự kiện'
              className='border p-2 rounded w-full h-32 mb-4'
            ></textarea>
          </div>

          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>
              Lịch trình dự kiến của sự kiện
            </h2>
            {activities.map((activity, index) => (
              <div
                key={index}
                className='mb-4 border p-4 rounded-lg relative'
              >
                <h3 className='text-lg font-medium mb-2'>
                  Hoạt Động-{index + 1}:
                </h3>
                <button
                  type='button'
                  onClick={() => removeActivity(index)}
                  className='absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl'
                >
                  <DeleteOutlined /> <span className='text-lg'>Xóa</span>
                </button>

                <input
                  type='text'
                  name='title'
                  placeholder='Tên Hoạt Động'
                  value={activity.title}
                  onChange={(e) => handleActivityChange(index, e)}
                  className='border p-2 rounded w-full mb-2'
                />
                <DatePicker
                  showTime
                  format='DD/MM/YYYY - HH:mm'
                  value={activity.startTime ? moment(activity.startTime) : null}
                  onChange={(date) =>
                    handleActivityStartTimeChange(index, date)
                  }
                  placeholder='Thời gian bắt đầu hoạt động'
                  size='large'
                  className='border border-[#EEE] p-2 rounded w-full mb-4 font-semibold'
                />

                <DatePicker
                  showTime
                  format='DD/MM/YYYY - HH:mm'
                  value={activity.endTime ? moment(activity.endTime) : null}
                  onChange={(date) => handleActivityEndTimeChange(index, date)}
                  placeholder='Thời gian kết thúc hoạt động'
                  size='large'
                  className='border border-[#EEE] p-2 rounded w-full mb-4 font-semibold'
                />

                <label className='text-base'>Chọn Nhóm và Chi Phí:</label>
                <Select
                  mode='multiple'
                  allowClear
                  placeholder='Chọn Nhóm'
                  style={{
                    width: '100%',
                    height: '40px',
                    marginBottom: '10px',
                  }}
                  value={activity.selectedGroups.map((group) => group.groupID)}
                  options={groupsOptions}
                  onChange={(value) => handleActivityGroupChange(index, value)}
                />

                {activity.selectedGroups.map((group, groupIndex) => (
                  <div
                    key={group.groupID}
                    className='flex items-center space-x-2'
                  >
                    <span>
                      Nhập Chi Phí Cho{' '}
                      {
                        groupsOptions.find((g) => g.value === group.groupID)
                          ?.label
                      }
                    </span>
                    <Input
                      type='number'
                      placeholder='Nhập Chi Phí'
                      value={group.cost}
                      onChange={(e) =>
                        handleactivityGroupCostChange(
                          index,
                          groupIndex,
                          e.target.value
                        )
                      }
                      style={{ width: '100px' }}
                    />
                  </div>
                ))}

                <textarea
                  name='description'
                  placeholder='Mô tả hoạt động'
                  value={activity.description}
                  onChange={(e) => handleActivityChange(index, e)}
                  className='border p-2 rounded w-full mb-2'
                ></textarea>
              </div>
            ))}
            <button
              type='button'
              onClick={addActivity}
              className='flex items-center justify-center text-xl text-blue-500 hover:text-blue-700'
            >
              <PlusOutlined /> Thêm hoạt động
            </button>
          </div>

          <p className='text-lg font-semibold text-right'>
            Tổng Chi Phí Sự Kiện: {totalCost} VND
          </p>
        </>
      )}

      {/* Display Generate Account Section if "Generate Account" is selected */}
      {selectedRequestType === 'Tạo tài khoản' && (
        <>
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Chi Tiết Tài Khoản</h2>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <input
                type='text'
                placeholder='Tên'
                className='border p-2 rounded'
              />
              <input
                type='text'
                placeholder='Số Điện Thoại'
                className='border p-2 rounded'
              />
              <input
                type='text'
                placeholder='Email'
                className='border p-2 rounded'
              />
              <input
                type='text'
                placeholder='Đoàn Thể tham gia'
                className='border p-2 rounded'
              />
            </div>
            <textarea
              placeholder='Mô tả yêu cầu tạo tài khoản'
              className='border p-2 rounded w-full h-32 mb-4'
            ></textarea>
          </div>
        </>
      )}

      {/* Buttons */}
      {!loading && (
        <div className='flex justify-center items-center space-x-4'>
          <button
            onClick={onSubmit}
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
