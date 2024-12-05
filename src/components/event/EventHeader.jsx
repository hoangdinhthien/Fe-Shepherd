import { Divider, Pagination, Select, Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';

const { Option } = Select;
const filters = ['Tất Cả', 'Tháng này', 'Tháng sau'];

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
}) => {
  return (
    <div className='relative flex justify-between w-full items-center mb-0 mx-4'>
      <Tabs
        activeKey={activeTab} // Ensure active tab is controlled by activeTab prop
        onChange={(key) => {
          setActiveTab(key);
          setCurrentPage(1);
        }}
        className='border-b-1 border-[#D9D9D9]'
      >
        <TabPane
          tab={<span className='font-bold'>Sự Kiện</span>}
          key='events'
        />
        <TabPane
          disabled
          tab={
            <span>
              <Divider type='vertical' className='bg-black h-[20px]' />
            </span>
          }
        />
        <TabPane
          tab={<span className='font-bold'>Hoạt Động</span>}
          key='activities'
        />
      </Tabs>

      <div className='absolute right-12 top-0 flex items-center gap-8'>
        {/* Show event dropdown only when in activities tab */}
        {activeTab === 'activities' && showEventDropdown && (
          <Select
            onChange={handleEventChange}
            size='large'
            className='w-[fit] bg-transparent font-bold'
            placeholder='Chọn sự kiện'
            variant='filled'
          >
            {events.length > 0 ? (
              events.map((event) => (
                <Option key={event.id} value={event.id}>
                  {console.log(event.name)}
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
          <Option value={filters[0]}>Tất cả</Option>
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

export default EventHeader;
