// src/components/RequestCreateEvent.jsx
import { Select, DatePicker, message, Input, Tooltip, Button } from 'antd';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import PropTypes from 'prop-types';
import CurrencyInput from 'react-currency-input-field';
import { useEffect } from 'react';
import { validateActivityDates } from '../../pages/CreateRequest';

RequestCreateEvent.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  selectedGroup: PropTypes.any,
  handleGroupChange: PropTypes.func.isRequired,
  userGroups: PropTypes.array.isRequired,
  groupsOptions: PropTypes.array.isRequired,
  activities: PropTypes.array.isRequired,
  setActivities: PropTypes.func.isRequired,
  totalCost: PropTypes.number.isRequired,
  calculateTotalCost: PropTypes.func.isRequired,
  locations: PropTypes.array.isRequired,
  fromDate: PropTypes.object,
  toDate: PropTypes.object,
};

const { Option } = Select;

export default function RequestCreateEvent({
  formData,
  setFormData,
  selectedGroup,
  handleGroupChange,
  userGroups,
  groupsOptions,
  activities,
  setActivities,
  totalCost,
  calculateTotalCost,
  locations,
}) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addActivity = () => {
    setActivities((prevActivities) => [
      ...prevActivities,
      {
        title: '',
        description: '',
        startTime: null,
        endTime: null,
        selectedGroups: [],
        locationId: null,
      },
    ]);
  };

  const removeActivity = (index) => {
    setActivities((prevActivities) =>
      prevActivities.filter((_, i) => i !== index)
    );
    calculateTotalCost();
  };

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index][name] = value;
      return updatedActivities;
    });
  };

  const handleActivityTimeChange = (index, dates) => {
    const [start, end] = dates;

    if (
      (start && start.isBefore(formData.fromDate)) ||
      (end && end.isAfter(formData.toDate))
    ) {
      message.warning(
        'Thời gian hoạt động phải nằm trong phạm vi của sự kiện.'
      );
      setActivities((prevActivities) => {
        const updatedActivities = [...prevActivities];
        updatedActivities[index].startTime = null;
        updatedActivities[index].endTime = null;
        return updatedActivities;
      });
      return;
    }

    if (!validateActivityDates(start, end)) {
      setActivities((prevActivities) => {
        const updatedActivities = [...prevActivities];
        updatedActivities[index].startTime = null;
        updatedActivities[index].endTime = null;
        return updatedActivities;
      });
      return;
    }

    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].startTime = start ? start.toISOString() : null;
      updatedActivities[index].endTime = end ? end.toISOString() : null;
      return updatedActivities;
    });
    calculateTotalCost();
  };

  const handleActivityGroupChange = (index, selectedGroups) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].selectedGroups = selectedGroups.map(
        (groupId) => ({
          groupID: groupId,
          cost: 0,
        })
      );
      return updatedActivities;
    });
    calculateTotalCost();
  };

  const handleActivityGroupCostChange = (activityIndex, groupIndex, cost) => {
    if (cost.length > 9) {
      message.warning('Chi phí không được vượt quá 9 chữ số.');
      return;
    }

    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[activityIndex].selectedGroups[groupIndex].cost =
        parseFloat(cost) || 0;
      return updatedActivities;
    });
    calculateTotalCost();
  };

  useEffect(() => {
    if (totalCost > 1000000000) {
      message.warning(
        'Tổng chi phí sự kiện không được vượt quá 1.000.000.000 VND.'
      );
    }
  }, [totalCost]);

  const handleActivityLocationChange = (index, value) => {
    setActivities((prevActivities) => {
      const updatedActivities = [...prevActivities];
      updatedActivities[index].location = value;
      return updatedActivities;
    });
  };

  const disabledDate = (current) => {
    // Can not select days before today and after 31 days from today
    return current && current < moment().add(31, 'days').startOf('day');
  };

  return (
    <>
      {/* Event Details Section */}
      <div className='mb-6 p-6 bg-white shadow-lg rounded-lg'>
        <h2 className='text-2xl font-semibold mb-4 flex items-center'>
          Chi Tiết Sự Kiện
          <Tooltip title='Thông tin chi tiết về sự kiện bạn muốn tạo'>
            <InfoCircleOutlined className='ml-2 text-gray-500' />
          </Tooltip>
        </h2>

        <div className='flex flex-col md:flex-row md:space-x-4 mb-4'>
          <div className='flex-1 mb-4 md:mb-0'>
            <label className='block text-base font-medium mb-2'>
              Chọn đoàn thể yêu cầu:
            </label>
            <Select
              value={selectedGroup}
              onChange={handleGroupChange}
              className='w-full'
              placeholder='Chọn Đoàn Thể Bạn Tham Gia'
            >
              {userGroups?.map((group) => (
                <Option
                  key={group.id}
                  value={group.id}
                >
                  {group.groupName}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div className='flex flex-col md:flex-row md:space-x-4 mb-4'>
          <div className='flex-1 mb-4 md:mb-0'>
            <Input
              id='eventName'
              type='text'
              name='eventName'
              value={formData.eventName}
              onChange={handleInputChange}
              placeholder='Tên sự kiện'
              className='w-full'
            />
          </div>
        </div>

        <div className='flex flex-col md:flex-row md:space-x-4 mb-4'>
          <DatePicker.RangePicker
            showTime
            format='DD/MM/YYYY - HH:mm'
            value={[formData.fromDate, formData.toDate]}
            onChange={(dates) => {
              console.log('Selected Dates:', dates);
              setFormData((prev) => ({
                ...prev,
                fromDate: dates ? dates[0] : null,
                toDate: dates ? dates[1] : null,
              }));
            }}
            placeholder={[
              'Thời gian bắt đầu sự kiện',
              'Thời gian kết thúc sự kiện',
            ]}
            size='large'
            className='w-full'
            disabledDate={disabledDate}
          />
        </div>

        {/* Event Date Disclaimer */}
        <p className='text-red-500 text-sm italic mb-4'>
          Lưu Ý: Bạn chỉ được phép Yêu Cầu Tạo Sự Kiện cho tháng sau.
        </p>

        <textarea
          name='description'
          value={formData.description}
          onChange={handleInputChange}
          placeholder='Mô tả sự kiện'
          className='w-full p-3 border border-gray-300 rounded-lg resize-none h-32'
        ></textarea>
      </div>

      {/* Activities Section */}
      <div className='mb-6 p-6 bg-white shadow-lg rounded-lg'>
        <h2 className='text-2xl font-semibold mb-4 flex items-center'>
          Lịch trình dự kiến của sự kiện
          <Tooltip title='Thêm hoặc sửa các hoạt động trong sự kiện'>
            <InfoCircleOutlined className='ml-2 text-gray-500' />
          </Tooltip>
        </h2>

        {activities.map((activity, index) => (
          <div
            key={index}
            className='mb-6 p-4 border border-gray-200 rounded-lg relative'
          >
            <h3 className='text-xl font-medium mb-2 flex items-center'>
              Hoạt Động-{index + 1}
              <Tooltip title='Xóa hoạt động này'>
                <DeleteOutlined
                  onClick={() => removeActivity(index)}
                  className='ml-2 text-red-500 cursor-pointer'
                />
              </Tooltip>
            </h3>

            <Input
              type='text'
              name='title'
              placeholder='Tên Hoạt Động'
              value={activity.title}
              onChange={(e) => handleActivityChange(index, e)}
              className='w-full mb-4'
            />

            <DatePicker.RangePicker
              showTime
              format='DD/MM/YYYY - HH:mm'
              value={[
                activity.startTime ? moment(activity.startTime) : null,
                activity.endTime ? moment(activity.endTime) : null,
              ]}
              onChange={(dates) => handleActivityTimeChange(index, dates)}
              placeholder={[
                'Thời gian bắt đầu hoạt động',
                'Thời gian kết thúc hoạt động',
              ]}
              size='large'
              className='w-full mb-4'
              disabledDate={disabledDate}
            />

            {/* Activity Date Disclaimer */}
            <p className='text-red-500 text-sm italic mb-4'>
              Lưu Ý: Thời gian hoạt động phải nằm trong phạm vi thời gian của sự
              kiện.
            </p>

            <label className='block text-base font-medium mb-2'>
              Chọn địa điểm cho Hoạt Động:
            </label>
            <Select
              value={activity.location}
              onChange={(value) => handleActivityLocationChange(index, value)}
              className='w-full mb-4'
              placeholder='Chọn địa điểm'
            >
              {locations.map((location, idx) => (
                <Option
                  key={idx}
                  value={location}
                >
                  {location}
                </Option>
              ))}
            </Select>

            <label className='block text-base font-medium mb-2'>
              Chọn Nhóm và Chi Phí:
            </label>
            <Select
              mode='multiple'
              allowClear
              placeholder='Chọn Nhóm'
              className='w-full mb-4'
              value={activity.selectedGroups.map((group) => group.groupID)}
              options={groupsOptions}
              onChange={(value) => handleActivityGroupChange(index, value)}
            />

            {activity.selectedGroups.map((group, groupIndex) => (
              <div
                key={group.groupID}
                className='flex items-center space-x-2 mb-2'
              >
                <span className='w-1/2'>
                  Nhập Chi Phí Cho{' '}
                  {groupsOptions.find((g) => g.value === group.groupID)?.label}
                </span>
                <CurrencyInput
                  id={`cost-input-${index}-${groupIndex}`}
                  name='cost'
                  placeholder='Nhập Chi Phí'
                  value={group.cost}
                  onValueChange={(value) =>
                    handleActivityGroupCostChange(index, groupIndex, value)
                  }
                  className='w-80 p-2 border border-gray-300 rounded-lg text-right'
                  decimalsLimit={0}
                  suffix=' VND'
                  intlConfig={{ locale: 'vi-VN', currency: 'VND' }}
                />
              </div>
            ))}

            <textarea
              name='description'
              placeholder='Mô tả hoạt động'
              value={activity.description}
              onChange={(e) => handleActivityChange(index, e)}
              className='w-full p-3 border border-gray-300 rounded-lg resize-none h-24'
            ></textarea>
          </div>
        ))}

        <p className='text-red-500 text-sm italic mb-4'>
          Lưu Ý: Bạn không được nhập chi phí vượt quá 100,000,000 VND cho mỗi
          đoàn thể và tổng chi phí không được vượt quá 1,000,000,000 VND.
        </p>
        <Button
          type='dashed'
          onClick={addActivity}
          block
          icon={<PlusOutlined />}
          className='text-blue-500 hover:text-blue-700'
        >
          Thêm hoạt động
        </Button>

        <div className='mt-6 text-right'>
          <p className='text-lg font-semibold'>
            Tổng Chi Phí Sự Kiện:{' '}
            <span className='text-blue-600'>
              {totalCost.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
