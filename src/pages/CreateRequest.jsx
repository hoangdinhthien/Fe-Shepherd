import { Select, DatePicker, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import group_api from '../apis/group_api';
import RequestAPI from '../apis/request_api';
import event_api from '../apis/event_api';
import activity_api from '../apis/activity/activity_api';

const { Option } = Select;

export default function CreateRequest() {
  // ------STATES------
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedRequestType, setSelectedRequestType] = useState('');
  const [activities, setActivities] = useState([]);

  // Select `currentUser` and rehydration state separately
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

  // ---------------

  useEffect(() => {
    const fetchGroups = async () => {
      if (!currentUser || !currentUser.user?.id) {
        console.log('Current user id is not available');
        return;
      }

      try {
        setLoading(true);
        const response = await group_api.getGroupsForUser(currentUser.user.id);
        setGroups(response.result);
        if (response.result.length > 0) {
          setSelectedGroup(response.result[0].id); // Set initial group selection
        }
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
    eventCost: '',
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

  const groupIds =
    currentUser.listGroupRole
      .filter(
        ({ roleName, groupName }) =>
          roleName === LEADER || groupName?.includes(COUNCIL)
      )
      .map(({ groupId }) => groupId) || [];

  const data = {
    eventName: formData.eventName,
    description: formData.description,
    fromDate: formData.fromDate ? formData.fromDate.toISOString() : null,
    toDate: formData.toDate ? formData.toDate.toISOString() : null,
    isPublic: true,
    totalCost: 0,
    // groupIds: groupIds,
    ceremonyID: null,
  };

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

      // Construct the data object as per API requirements
      const data = {
        eventName: formData.eventName,
        description: formData.description,
        fromDate: formData.fromDate.toISOString(),
        toDate: formData.toDate.toISOString(),
        isPublic: true,
        ceremonyID: null,
        listActivities: activities.map((activity) => ({
          activityName: activity.title,
          description: activity.description,
          startTime: activity.startTime
            ? activity.startTime.toISOString()
            : undefined,
          endTime: activity.endTime
            ? activity.endTime.toISOString()
            : undefined,
          groups: [
            {
              groupID: selectedGroup,
              cost: activity.budget,
            },
          ],
        })),
      };

      console.log('Data being sent to API:', data);
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
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

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
        date: null,
        budget: '',
        manpower: '',
        description: '',
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
        <select
          className='border p-2 rounded-lg w-48'
          value={selectedRequestType}
          onChange={(e) => handleRequestTypeChange(e.target.value)}
        >
          {/* <option>Type</option> */}
          {requestTypes.map((type, index) => (
            <option
              key={index}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>
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
      {selectedRequestType === 'Create Event' && (
        <>
          {/* Fourth section */}
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Chi Tiết Sự Kiện</h2>

            <div className='flex justify-between mb-4'>
              {/* Group selection dropdown  */}
              <div className='flex items-center space-x-2 w-[45%]'>
                <label className='text-base'>Chọn đoàn thể:</label>
                <Select
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  className='w-full h-[40px]'
                  placeholder='Select a group'
                >
                  {groups?.map((group) => (
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

              {/* Event Cost input  */}
              <div className='flex items-center space-x-2 w-[45%]'>
                <label className='text-base'>Chi Phí Sự Kiện:</label>
                <input
                  id='eventCost'
                  type='number'
                  name='eventCost'
                  value={formData.eventCost}
                  onChange={handleChange}
                  placeholder='Nhập chi phí'
                  className='border p-2 rounded w-full h-[40px]'
                />
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
                    'Thời gian bắt đầu hoạt động',
                    'Thời gian kết thúc hoạt động',
                  ]}
                  size='large'
                  className='border border-[#EEE] p-2 rounded w-full mb-4 font-semibold'
                />
                <input
                  type='number'
                  name='budget'
                  placeholder='Chi Phí Dự Kiến'
                  value={activity.budget}
                  onChange={(e) => handleActivityChange(index, e)}
                  className='border p-2 rounded w-full mb-2'
                />
                <input
                  type='number'
                  name='manpower'
                  placeholder='Số Lượng Nhân Lực Dự Kiến'
                  value={activity.manpower}
                  onChange={(e) => handleActivityChange(index, e)}
                  className='border p-2 rounded w-full mb-2'
                />
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
        </>
      )}

      {/* Display Generate Account Section if "Generate Account" is selected */}
      {selectedRequestType === 'Generate Account' && (
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
