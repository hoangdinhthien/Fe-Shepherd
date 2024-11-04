import { Select } from 'antd';
import moment from 'moment';

const { Option } = Select; // Ensure Option is imported correctly from Select

const CustomToolbar = ({
  onNavigate,
  currentWeek,
  handleWeekChange,
  selectedGroup,
  handleGroupChange,
  groups = [],
}) => {
  // Utility function to get the start and end dates of a specific week
  const getWeekRange = (weekNumber) => {
    const now = moment()
      .startOf('year')
      .add(weekNumber - 1, 'weeks');
    const startOfWeek = now.clone().startOf('week');
    const endOfWeek = now.clone().endOf('week');
    return `${startOfWeek.format('DD MMM YYYY')} - ${endOfWeek.format(
      'DD MMM YYYY'
    )}`;
  };

  return (
    <div className='rbc-toolbar'>
      {/* Navigation Buttons */}
      <div className='rbc-btn-group'>
        <button
          type='button'
          onClick={() => onNavigate('PREV')}
        >
          Previous Week
        </button>
        <button
          type='button'
          onClick={() => onNavigate('TODAY')}
        >
          Current Week
        </button>
        <button
          type='button'
          onClick={() => onNavigate('NEXT')}
        >
          Next Week
        </button>
      </div>

      {/* Week Selection Dropdown */}
      <Select
        value={currentWeek}
        onChange={handleWeekChange}
        style={{
          width: 200,
          marginLeft: '10px',
          marginRight: '10px',
        }}
      >
        {[...Array(52).keys()].map((week) => (
          <Option
            key={week + 1}
            value={week + 1}
          >
            {getWeekRange(week + 1)}
          </Option>
        ))}
      </Select>

      {/* Group Selection Dropdown using Ant Design Select */}
      <Select
        value={selectedGroup}
        onChange={handleGroupChange}
        placeholder='Select a group'
        style={{
          width: 200,
        }}
      >
        <Option value=''>All Groups</Option>
        {groups.map((group) => (
          <Option
            key={group.id}
            value={group.id}
          >
            {group.groupName}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default CustomToolbar;
