import { useEffect, useState } from 'react';
import { Modal, Select, Tabs, Card, Typography, Divider, DatePicker, message, Spin } from 'antd';
import { CalendarFilled, CalendarOutlined, FileTextFilled, FileTextOutlined } from '@ant-design/icons';
import EventAPI from '../apis/event_api';
import ActivityAPI from '../apis/activity/activity_api';
import moment from 'moment';
import ALT from '../assets/welcome-img.png';
import { useSelector } from 'react-redux';
import { Spinner } from '@material-tailwind/react';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Paragraph } = Typography;

export default function EventActivityPage() {
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [loading, setLoading] = useState(false);

  const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;
  const { currentUser } = useSelector((state) => state.user);

  const groupIds =
    currentUser.listGroupRole
      .filter(
        ({ groupName }) => groupName?.includes(COUNCIL)
      )
      .map(({ groupId }) => groupId) || [];
  const groups = groupIds.map((groupId) => ({ groupID: groupId, cost: 0 })) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [formData, setFormData] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    // Validate date range
    if (
      !formData.activityName ||
      !formData.description ||
      !formData.startTime ||
      !formData.endTime
    ) {
      message.error('Please fill all the fields.'); // Show error message
      return;
    }

    console.log('Form Data:', formData);


    const loadingKey = 'loading';

    try {
      setLoading(true);
      message.loading({
        content: 'Submitting request...',
        key: loadingKey,
        duration: 0,
      }); // Show loading message
      await ActivityAPI.create(formData)
      message.success({
        content: 'Activity created successfully!',
        key: loadingKey,
      }); // Show success message
      setFormData({}); // Clear form data
      setShowCreateActivity(false); // Hide the form
      console.log('Activity created:', formData);
    } catch (error) {
      message.error({
        content: `Error creating Activity: ${error.message}`,
        key: loadingKey,
      }); // Show error message
      console.error('Error creating Activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await EventAPI.getEvents();
      setEvents(response.result);
      setFilteredEvents(response.result);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await ActivityAPI.getAll();
      setActivities(response.result);
      setFilteredActivities(response.result);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === 'all') {
      setFilteredEvents(events);
      setFilteredActivities(activities);
    } else if (value === 'this month') {
      const currentMonth = moment().month();
      setFilteredEvents(
        events.filter(
          (event) => moment(event.fromDate).month() === currentMonth
        )
      );
      setFilteredActivities(
        activities.filter(
          (activity) => moment(activity.startDate).month() === currentMonth
        )
      );
    } else if (value === 'next month') {
      const nextMonth = moment().add(1, 'month').month();
      setFilteredEvents(
        events.filter((event) => moment(event.fromDate).month() === nextMonth)
      );
      setFilteredActivities(
        activities.filter(
          (activity) => moment(activity.startDate).month() === nextMonth
        )
      );
    }
  };

  const showModal = (item) => {
    if (activeTab === 'events') {
      setFormData({
        activityName: "",
        description: "",
        startTime: null,
        endTime: null,
        groups: groups,
        eventID: item.id,
      });
    };
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <div className='p-6 shadow-lg bg-[#d2d2d2] rounded-3xl'>
      <div className='relative flex justify-between items-center mb-4 mx-4'>
        <Tabs
          defaultActiveKey="events"
          onChange={(key) => setActiveTab(key)}
          className="w-full border-b-1 border-[#D9D9D9]"
        >
          <TabPane tab="List Events" key="events" />
          <TabPane disabled tab={
            <span>
              <Divider type="vertical" className="bg-black h-[20px]" />
            </span>
          } />
          <TabPane tab="List Activities" key="activities" />
        </Tabs>

        <Select
          value={`Sort by: ${filter}`}
          onChange={handleFilterChange}
          size="large"
          className="absolute right-0 top-0 w-[fit] bg-transparent font-bold"
          placeholder="Sort by: All"
          variant='borderless'
        >
          <Option value="All">All</Option>
          <Option value="This month">This Month</Option>
          <Option value="Next month">Next Month</Option>
        </Select>
      </div>

      {loading && <div className='h-[75vh] flex justify-center items-center w-full'><Spinner className='w-full h-[40px]' spinning={loading} /></div>}
      {!loading && (
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {(activeTab === 'events' ? filteredEvents : filteredActivities)?.map(
            (item) => (
              <Card
                key={item.id}
                hoverable
                className='rounded-2xl overflow-hidden shadow-md'
                onClick={() => { showModal(item); setShowCreateActivity(false) }}
                cover={
                  <div className={`${activeTab === 'activities' && 'relative'}`} >
                    <img
                      alt={item.eventName || item.activityName}
                      src={ALT}
                    />
                    {activeTab === 'activities' && <div className='absolute bottom-2 left-2 rounded-xl bg-[#71BE63] mx-w-[300px] shadow-lg overflow-ellipsis text-white font-bold p-2 px-3 text-sm'>{item.event.eventName}</div>}
                  </div>
                }
              >
                <Title level={4}>{item.eventName || item.activityName}</Title>
                <div className='flex items-center w-full text-gray-500 mb-1'>
                  <CalendarFilled className='mr-2' />
                  <span>
                    {moment(item.fromDate || item.startDate).format(
                      'DD/MM/YYYY'
                    )}
                  </span>
                  <span className='mx-5'>to</span>
                  <span>
                    {moment(item.toDate || item.endDate).format('DD/MM/YYYY')}
                  </span>
                </div>
                <div className='flex items-start justify-start w-full text-gray-500'>
                  <FileTextFilled className='mr-2 mt-1' />
                  <Paragraph ellipsis={{ rows: 3 }}>{item.description ?? 'N/A'}</Paragraph>
                </div>
              </Card>
            )
          )}
        </div>
      )}

      <Modal
        loading={loading}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
      >
        {selectedItem && (
          <div className='p-4'>
            <img
              alt={selectedItem.eventName || selectedItem.activityName}
              src={ALT}
              className='w-full h-48 object-fill rounded-xl mb-4'
            />
            <Title level={3}>
              {selectedItem.eventName || selectedItem.activityName}
            </Title>
            <div className='flex items-center text-gray-500 mb-2'>
              <CalendarOutlined className='mr-2' />
              <span>
                {moment(selectedItem.fromDate || selectedItem.startDate).format(
                  'DD MMM YYYY'
                )}
              </span>
              <span className='mx-5'>to</span>
              <span>
                {moment(selectedItem.toDate || selectedItem.endDate).format(
                  'DD MMM YYYY'
                )}
              </span>
            </div>
            <Paragraph>{selectedItem.description}</Paragraph>
            <div className='flex w-full justify-between items-center'>
              <a
                href='#'
                className='text-blue-500'
              >
                Go to the{' '}
                {activeTab === 'events'
                  ? 'Activities of this Event'
                  : 'Tasks of this Activity'}
              </a>
              {activeTab === 'events' && !showCreateActivity && groupIds.length > 0 && (
                <button
                  onClick={() => setShowCreateActivity(true)}
                  className='bg-black hover:opacity-65 text-white px-4 py-2 rounded-xl'
                >
                  Create Activities
                </button>)}
            </div>


            {showCreateActivity && (
              <div className='flex flex-col gap-2 w-full mt-4'>
                <p className='font-semibold text-lg text-[#D9D9D9] text-center border-t-2 pt-2 mx-20 border-dashed uppercase'>Create Activities</p>
                <form className='flex flex-col w-full'>
                  <p className='font-semibold m-2'>Activity Name</p>
                  <input
                    required
                    name='activityName'
                    value={formData.activityName}
                    onChange={handleChange}
                    type='text'
                    placeholder='Activity Name'
                    className='border p-2 rounded-lg mb-4'
                  />
                  <p className='font-semibold m-2'>Description</p>
                  <textarea
                    required
                    name='description'
                    value={formData.description}
                    onChange={handleChange}
                    placeholder='Description'
                    className='border p-2 rounded-lg mb-4'
                  />
                  <p className='font-semibold m-2'>Time</p>
                  <DatePicker.RangePicker
                    required
                    picker="time"
                    format="HH:mm:ss"
                    value={[
                      formData.startTime ? moment(formData.startTime, 'HH:mm:ss') : null,
                      formData.endTime ? moment(formData.endTime, 'HH:mm:ss') : null
                    ]}
                    onChange={(date) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: date && date[0] ? date[0].format('HH:mm:ss') : null,
                        endTime: date && date[1] ? date[1].format('HH:mm:ss') : null,
                      }))
                    }
                    placeholder={['Start Time', 'End Time']}
                    className="border border-[#EEE] p-2 rounded-lg w-full text-sm font-semibold"
                  />
                  <div className='flex flex-row justify-end items-end w-full gap-4 mt-4'>
                    <button
                      onClick={() => setShowCreateActivity(false)}
                      className='bg-red-500 hover:opacity-65 text-white px-4 py-2 rounded-xl'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onSubmit}
                      className='bg-black hover:opacity-65 text-white px-4 py-2 rounded-xl'
                    >
                      Create Activities
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
