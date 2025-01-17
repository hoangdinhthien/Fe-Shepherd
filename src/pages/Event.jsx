import { Spinner } from '@material-tailwind/react';
import { message, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ActivityAPI from '../apis/activity/activity_api';
import EventAPI from '../apis/event_api';
import ALT from '../assets/welcome-img.png';
import EventHeader from '../components/event/EventHeader';
import EventCards from '../components/event/EventCards';
import ActivityCards from '../components/event/ActivityCards';
import EventModal from '../components/event/EventModal';
import ActivityModal from '../components/event/ActivityModal';

const { Title, Paragraph } = Typography;

export default function EventActivityPage() {
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState(1);
  const [activeTab, setActiveTab] = useState('events');
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isUpdate, setIsUpdate] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const groupIds =
    currentUser.listGroupRole.map(({ groupId }) => groupId) || [];
  const groups =
    groupIds.map((groupId) => ({ groupID: groupId, cost: 0 })) || [];

  const [formData, setFormData] = useState({});
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;

  const filters = ['Tháng trước', 'Tháng này', 'Tháng sau']; // Update filter options

  const handleEventChange = (eventId) => {
    setSelectedEventId(eventId);
    fetchActivities(eventId);
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

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'activities' && !isModalVisible) {
      if (selectedEventId) {
        fetchActivities(selectedEventId);
      } else {
        fetchActivities();
      }
    }
  }, [activeTab, currentPage, filter, selectedEventId, isModalVisible]);

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
      setActivitiesLoading(true);
      setLoading(true);
      const params = {
        PageNumber: currentPage,
        PageSize: 8,
        FilterBy: filter,
      };

      if (eventId) {
        params.eventId = eventId;
      }

      const response = await ActivityAPI.getAll(params);
      setActivities(response.result);
      setFilteredActivities(response.result);
      setTotal(response.pagination.totalCount);

      if (response.result.length === 0) {
        setFilteredActivities([
          {
            id: 'no-activities',
            eventName: `Không có Hoạt Động`,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
      setActivitiesLoading(false);
    }
  };

  const showModal = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    if (activeTab === 'events') {
      setSelectedItem(null);
    } else if (activeTab === 'activities') {
      if (selectedEventId) {
        fetchActivities(selectedEventId);
      } else {
        fetchActivities();
      }
    }
  };

  const handleGoToActivities = (eventId) => {
    setActiveTab('activities');
    setSelectedEventId(eventId);
    fetchActivities(eventId);
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
          showEventDropdown={activeTab === 'activities'}
          handleEventChange={handleEventChange}
          events={events}
          activeTab={activeTab}
          selectedEventId={selectedEventId}
        />

        {(loading || activitiesLoading) && (
          <div className='h-full w-full flex justify-center items-center'>
            <Spinner
              className='h-[40px] w-[40px]'
              spinning='true'
            />
          </div>
        )}

        {!loading && !activitiesLoading && (
          <div
            className={`grid w-full h-full grid-cols-4 grid-rows-2 px-4 gap-4`}
          >
            {activeTab === 'events' ? (
              <EventCards
                events={filteredEvents}
                showModal={showModal}
                handleGoToActivities={handleGoToActivities}
              />
            ) : (
              <ActivityCards
                activities={filteredActivities}
                showModal={showModal}
                setSelectedItem={setSelectedItem}
              />
            )}
          </div>
        )}

        {activeTab === 'events' ? (
          <EventModal
            isUpdate={isUpdate}
            setIsUpdate={setIsUpdate}
            image={ALT}
            loading={loading}
            isModalVisible={isModalVisible}
            handleModalClose={handleModalClose}
            selectedItem={selectedItem}
            showCreateActivity={showCreateActivity}
            setShowCreateActivity={setShowCreateActivity}
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            onSubmit={onSubmit}
          />
        ) : (
          <ActivityModal
            isUpdate={isUpdate}
            setIsUpdate={setIsUpdate}
            image={ALT}
            loading={loading}
            isModalVisible={isModalVisible}
            handleModalClose={handleModalClose}
            selectedItem={selectedItem}
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
}
