import { Divider, Pagination, Select, Tabs } from 'antd';
import PropTypes from 'prop-types';

const { Option } = Select;
const filters = ['Tháng trước', 'Tháng này', 'Tháng sau'];

const EventHeader = ({
  setActiveTab,
  filter,
  setFilter,
  currentPage,
  total,
  setCurrentPage,
  showEventDropdown = false,
  handleEventChange = () => {},
  events = [],
  activeTab, // Receive activeTab as a prop
  selectedItem, // Add selectedItem as a prop
}) => {
  const tabItems = [
    {
      key: 'events',
      label: <span className='font-bold'>Sự Kiện</span>,
    },
    {
      key: 'divider',
      label: (
        <span>
          <Divider
            type='vertical'
            className='bg-black h-[20px]'
          />
        </span>
      ),
      disabled: true,
    },
    {
      key: 'activities',
      label: <span className='font-bold'>Hoạt Động</span>,
    },
  ];
  console.log('event:', events);
  console.log('selectedItem:', selectedItem);

  return (
    <div className='relative flex justify-between w-full items-center mb-0 mx-4'>
      <Tabs
        activeKey={activeTab} // Ensure active tab is controlled by activeTab prop
        onChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1);
        }}
        items={tabItems}
        className='border-b-1 border-[#D9D9D9]'
      />

      <div className='absolute right-12 top-0 flex items-center gap-8'>
        {/* Show event dropdown only when in activities tab */}
        {activeTab === 'activities' && showEventDropdown && (
          <Select
            value={selectedItem?.eventName}
            onChange={handleEventChange}
            size='large'
            className='w-[fit] bg-transparent font-bold'
            placeholder='Chọn sự kiện'
            variant='filled'
          >
            {events.length > 0 ? (
              events.map((event) => (
                <Option
                  key={event.id}
                  value={event.id}
                >
                  {event.eventName} {/* Hiển thị tên sự kiện */}
                </Option>
              ))
            ) : (
              <Option disabled>Không có sự kiện</Option>
            )}
          </Select>
        )}

        {/* Sorting dropdown */}
        <Select
          value={`Sắp xếp theo: ${filters[filter]}`}
          onChange={(value) => {
            setFilter(filters.findIndex((item) => item === value));
            setCurrentPage(1);
          }}
          size='large'
          className='w-[fit] bg-transparent font-bold'
        >
          <Option value={filters[0]}>Tháng trước</Option>
          <Option value={filters[1]}>Tháng này</Option>
          <Option value={filters[2]}>Tháng sau</Option>
        </Select>

        <Pagination
          current={currentPage}
          total={total}
          onChange={(pageNumber) => setCurrentPage(pageNumber)}
        />
      </div>
    </div>
  );
};

EventHeader.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
  filter: PropTypes.number.isRequired,
  setFilter: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  showEventDropdown: PropTypes.bool,
  handleEventChange: PropTypes.func,
  events: PropTypes.array,
  activeTab: PropTypes.string.isRequired,
  selectedItem: PropTypes.object, // Add selectedItem to propTypes
};

export default EventHeader;
