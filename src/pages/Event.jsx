import { useEffect, useState } from 'react';
import { Modal, Select, Tabs, Card, Typography } from 'antd';
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import EventAPI from '../apis/event_api';
import ActivityAPI from '../apis/activity/activity_api';
import moment from 'moment';

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
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    fetchEvents();
    fetchActivities();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await EventAPI.getEvents();
      setEvents(response.result);
      setFilteredEvents(response.result);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await ActivityAPI.getActivities();
      setActivities(response.data);
      setFilteredActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
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
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-4'>
        <Tabs
          defaultActiveKey='events'
          onChange={(key) => setActiveTab(key)}
        >
          <TabPane
            tab='List Events'
            key='events'
          />
          <TabPane
            tab='List Activities'
            key='activities'
          />
        </Tabs>

        <Select
          value={filter}
          onChange={handleFilterChange}
          className='w-40'
          placeholder='Sort by: All'
        >
          <Option value='all'>All</Option>
          <Option value='this month'>This Month</Option>
          <Option value='next month'>Next Month</Option>
        </Select>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {(activeTab === 'events' ? filteredEvents : filteredActivities).map(
          (item) => (
            <Card
              key={item.id}
              hoverable
              className='rounded-lg overflow-hidden shadow-md'
              onClick={() => showModal(item)}
              cover={
                <img
                  alt={item.eventName || item.activityName}
                  src='/path/to/placeholder/image.jpg'
                />
              }
            >
              <Title level={4}>{item.eventName || item.activityName}</Title>
              <div className='flex items-center text-gray-500 mb-1'>
                <CalendarOutlined className='mr-1' />
                <span>
                  {moment(item.fromDate || item.startDate).format(
                    'DD MMM YYYY'
                  )}
                </span>
                <span className='mx-1'>to</span>
                <span>
                  {moment(item.toDate || item.endDate).format('DD MMM YYYY')}
                </span>
              </div>
              <div className='flex items-center text-gray-500'>
                <FileTextOutlined className='mr-1' />
                <Paragraph ellipsis={{ rows: 3 }}>{item.description}</Paragraph>
              </div>
            </Card>
          )
        )}
      </div>

      <Modal
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
              src='/path/to/placeholder/image.jpg'
              className='w-full h-48 object-cover rounded-md mb-4'
            />
            <Title level={3}>
              {selectedItem.eventName || selectedItem.activityName}
            </Title>
            <div className='flex items-center text-gray-500 mb-2'>
              <CalendarOutlined className='mr-1' />
              <span>
                {moment(selectedItem.fromDate || selectedItem.startDate).format(
                  'DD MMM YYYY'
                )}
              </span>
              <span className='mx-1'>to</span>
              <span>
                {moment(selectedItem.toDate || selectedItem.endDate).format(
                  'DD MMM YYYY'
                )}
              </span>
            </div>
            <Paragraph>{selectedItem.description}</Paragraph>
            <a
              href='#'
              className='text-blue-500'
            >
              Go to the{' '}
              {activeTab === 'events'
                ? 'Activities of this Event'
                : 'Tasks of this Activity'}
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
