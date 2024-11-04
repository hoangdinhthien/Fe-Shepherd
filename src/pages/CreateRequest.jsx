import { Select, DatePicker, message } from 'antd';
import { useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import group_api from '../apis/group_api';
import EventAPI from '../apis/event_api';

const { Option } = Select;

export default function CreateRequest() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  // Select `currentUser` and rehydration state separately
  const currentUser = useSelector((state) => state.user.currentUser);
  const rehydrated = useSelector((state) => state._persist?.rehydrated);

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

    // Only run after rehydration and when currentUser is available
    if (rehydrated && currentUser) {
      fetchGroups();
    }
  }, [currentUser, rehydrated]);

  const handleGroupChange = (value) => {
    setSelectedGroup(value);
  };

  // Initialize formData with default values
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    fromDate: null,
    toDate: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const LEADER = import.meta.env.VITE_ROLE_GROUP_LEADER;
  const groupIds = currentUser.listGroupRole
    .filter(({ roleName }) => roleName === LEADER)
    .map(({ groupId }) => groupId) || [];

  const data = {
    eventName: formData.eventName,
    description: formData.description,
    fromDate: formData.fromDate ? formData.fromDate.toISOString() : null,
    toDate: formData.toDate ? formData.toDate.toISOString() : null,
    isPublic: true,
    totalCost: 0,
    groupIds: groupIds,
    ceremonyID: null
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Validate date range
    if (!formData.fromDate || !formData.toDate || !formData.eventName || !formData.description) {
      message.error('Please fill all the fields.'); // Show error message
      return;
    }

    const loadingKey = 'loading'; // Define a key for the loading message

    try {
      setLoading(true);
      message.loading({ content: 'Submitting request...', key: loadingKey, duration: 0 }); // Show loading message
      await EventAPI.createEvent(groupIds[0], data);
      message.success({ content: 'Request submitted successfully!', key: loadingKey }); // Show success message
      console.log('Request submitted:', data);
    } catch (error) {
      message.error({ content: `Error submitting request: ${error.message}`, key: loadingKey }); // Show error message
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setFormData({ eventName: '', description: '', fromDate: null, toDate: null });
  }


  return (
    <form className='p-6 max-w-6xl mx-auto '>
      {/* First section */}
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <Link to='/dashboard' className='mr-4'>
            <IoArrowBack className='text-2xl' />
          </Link>
          <h1 className='text-2xl font-bold'>Create Request</h1>
        </div>
        <select className='border p-2 rounded'>
          <option>Unannual Event</option>
        </select>
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Second section */}
      <div className='flex justify-between mb-6'>
        <select className='border p-2 rounded w-48'>
          <option>Urgency</option>
        </select>
        <select className='border p-2 rounded w-48'>
          <option>Type</option>
        </select>
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Third section */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-4'>Requester Details</h2>
        <input
          type='text'
          placeholder='Requester Name'
          className='border p-2 rounded w-full'
        />
      </div>

      <hr className='border-t border-gray-400 my-6' />

      {/* Fourth section */}
      <div className='mb-6'>
        <div className='mb-4'>
          <label className='mr-2'>Select Group:</label>
          <Select
            value={selectedGroup}
            onChange={handleGroupChange}
            className='w-[200px]'
            placeholder='Select a group'
          >
            {groups?.map((group) => (
              <Option key={group.id} value={group.id} className='text-black text-xl'>
                {group.groupName}
              </Option>
            ))}
          </Select>
        </div>
        <input
          id='eventName'
          type='text'
          name='eventName'
          value={formData.eventName}
          onChange={handleChange}
          placeholder='Event Name'
          className='border p-2 rounded w-full mb-4'
        />

        <DatePicker.RangePicker
          format="DD-MM-YYYY HH:mm"
          value={[formData.fromDate, formData.toDate]}
          onChange={(date) => setFormData((prev) => (
            { ...prev, fromDate: date ? date[0] : null, toDate: date ? date[1] : null }))}
          placeholder={['Event Start Time', 'Event End Time']}
          size='large'
          className="border border-[#EEE] p-2 rounded w-full mb-4 font-semibold"
        />

        <textarea
          name='description'
          value={formData.description}
          onChange={handleChange}
          placeholder='Event Description'
          className='border p-2 rounded w-full h-32 mb-4'
        ></textarea>
      </div>

      {/* Buttons */}
      {!loading &&
        (<div className='flex justify-center items-center space-x-4'>
          <button onClick={onSubmit} className='bg-blue-500 text-white px-4 py-2 rounded-full'>
            Add Request
          </button>
          <button onClick={onReset} type="button" className='bg-gray-300 px-4 py-2 rounded-full'>Reset</button>
          <button onClick={onReset} type="button" className='bg-red-500 text-white px-4 py-2 rounded-full'>
            Cancel
          </button>
        </div>)}
    </form>
  );
}
