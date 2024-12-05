import { CalendarFilled, FileTextFilled } from '@ant-design/icons';
import { Spinner } from '@material-tailwind/react';
import { Card, message, Select, Tabs, Typography, Button } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ActivityAPI from '../apis/activity/activity_api';
import EventAPI from '../apis/event_api';
import ALT from '../assets/welcome-img.png';
import CreateActivityModal from '../components/event/CreateActivityModal';
import EventHeader from '../components/event/EventHeader';

const { Title, Paragraph } = Typography;

export default function EventActivityPage() {
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState(0);
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;
  const { currentUser } = useSelector((state) => state.user);
  const groupIds =
    currentUser.listGroupRole.map(({ groupId }) => groupId) || [];
  const groups =
    groupIds.map((groupId) => ({ groupID: groupId, cost: 0 })) || [];

  const [formData, setFormData] = useState({});

  // New function to handle event selection
  const handleEventChange = (eventId) => {
    setSelectedItem(null); // Reset the selected item
    fetchActivities(eventId); // Fetch activities for the selected event
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.activityName ||
      !formData.description ||
      !formData.startTime ||
      !formData.endTime
    ) {
      message.error('Please fill all the fields.');
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
      });
      await ActivityAPI.create(formData);
      message.success({
        content: 'Activity created successfully!',
        key: loadingKey,
      });
      setFormData({});
      setShowCreateActivity(false);
      console.log('Activity created:', formData);
    } catch (error) {
      message.error({
        content: `Error creating Activity: ${error.message}`,
        key: loadingKey,
      });
      console.error('Error creating Activity:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      if (activeTab === 'events') {
        fetchEvents();
      } else if (activeTab === 'activities') {
        // Gọi fetchActivities có truyền eventId vào nếu có
        fetchActivities(selectedItem?.id); // Chỉ truyền eventId nếu đã chọn sự kiện
      }
    },
    [activeTab, currentPage, filter, selectedItem?.id] // Theo dõi khi selectedItem thay đổi
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await EventAPI.getAll({
        PageNumber: currentPage,
        PageSize: 8,
        FilterBy: filter,
      });
      setEvents(response.result);
      setFilteredEvents(response.result);
      setTotal(response.pagination.totalCount);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (eventId) => {
    try {
      setLoading(true);
      const params = {
        PageNumber: currentPage,
        PageSize: 8,
        FilterBy: filter,
      };

      if (eventId) {
        params.eventId = eventId; // Lọc các hoạt động theo eventId
      }

      const response = await ActivityAPI.getAll(params);
      setActivities(response.result);
      setFilteredActivities(response.result);
      setTotal(response.pagination.totalCount);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (item) => {
    if (activeTab === 'events') {
      setIsUpdate(false);
      setFormData({
        activityName: '',
        description: '',
        startTime: null,
        endTime: null,
        groups: groups,
        eventID: item.id,
      });
    }
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleGoToActivities = (eventId) => {
    setActiveTab('activities');
    fetchActivities(eventId); // Lọc các hoạt động theo eventId
    console.log('Event ID:', eventId);
  };

  return (
    <div className='h-full w-full p-4'>
      <div className='w-full h-full p-4 flex flex-col shadow-inner shadow-gray-600 bg-[#e3e3e3] rounded-3xl'>
        <EventHeader
          setActiveTab={setActiveTab}
          filter={filter}
          setFilter={setFilter}
          currentPage={currentPage}
          total={total}
          setCurrentPage={setCurrentPage}
          showEventDropdown={activeTab === 'activities'} // Only show dropdown in 'activities' tab
          handleEventChange={handleEventChange} // Pass handleEventChange function
          events={events} // Pass events list to dropdown
          activeTab={activeTab} // Pass activeTab as prop to EventHeader
        />

        {loading && (
          <div className='h-full w-full flex justify-center items-center'>
            <Spinner className='h-[40px] w-[40px]' spinning='true' />
          </div>
        )}

        {!loading && (
          <div
            className={`grid w-full h-full grid-cols-4 grid-rows-2 px-4 gap-4`}
          >
            {(activeTab === 'events'
              ? filteredEvents
              : filteredActivities
            )?.map((item) => (
              <Card
                key={item.id}
                hoverable
                className='rounded-2xl overflow-hidden shadow-md'
                onClick={() => {
                  showModal(item);
                  setShowCreateActivity(false);
                }}
                cover={
                  <div
                    className={`${activeTab === 'activities' && 'relative'}`}
                  >
                    <img alt={item.eventName || item.activityName} src={ALT} />
                    {activeTab === 'activities' && (
                      <div className='absolute bottom-2 left-2 rounded-xl bg-[#71BE63] max-w-[300px] shadow-lg overflow-ellipsis text-white font-bold p-2 px-3 text-sm'>
                        {item.event.eventName}
                      </div>
                    )}
                  </div>
                }
              >
                <Title ellipsis={{ rows: 1 }} level={4}>
                  {item.eventName || item.activityName}
                </Title>
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
                  <Paragraph ellipsis={{ rows: 1 }}>
                    {item.description ?? 'N/A'}
                  </Paragraph>
                </div>
                {activeTab === 'events' && (
                  <Button
                    type='link'
                    onClick={() => handleGoToActivities(item.id)}
                    className='text-blue-500 mt-2'
                  >
                    Đi đến những hoạt động của sự kiện này
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        <CreateActivityModal
          isUpdate={isUpdate}
          setIsUpdate={setIsUpdate}
          image={ALT}
          loading={loading}
          isModalVisible={isModalVisible}
          handleModalClose={handleModalClose}
          selectedItem={selectedItem}
          showCreateActivity={showCreateActivity}
          setShowCreateActivity={setShowCreateActivity}
          activeTab={activeTab}
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
