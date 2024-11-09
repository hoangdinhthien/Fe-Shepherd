import { Divider, Pagination, Select, Tabs } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';

const filters = ['Tất Cả', 'Tháng này', 'Tháng sau'];

const EventHeader = ({
  setActiveTab,
  filter,
  setFilter,
  currentPage,
  total,
  setCurrentPage,
}) => {
  return (
    <div className='relative flex justify-between w-full items-center mb-0 mx-4'>
      <Tabs
        defaultActiveKey='events'
        onChange={(key) => setActiveTab(key)}
        className='w-full border-b-1 border-[#D9D9D9]'
      >
        <TabPane
          tab='Danh sách các Sự Kiện'
          key='events'
        />
        <TabPane
          disabled
          tab={
            <span>
              <Divider
                type='vertical'
                className='bg-black h-[20px]'
              />
            </span>
          }
        />
        <TabPane
          tab='Danh sách các Hoạt Động'
          key='activities'
        />
      </Tabs>

      <div className='absolute right-12 top-0 flex items-center gap-8'>
        <Select
          value={`Sắp xếp theo: ${filters[filter]}`}
          onChange={(value) => {
            setFilter(filters.findIndex((item) => item === value));
            setCurrentPage(1);
          }}
          size='large'
          className='w-[fit] bg-transparent font-bold'
          placeholder='Sắp xếp theo: Tất Cả'
          variant='filled'
        >
          <Option value={filters[0]}>Tất Cả</Option>
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
