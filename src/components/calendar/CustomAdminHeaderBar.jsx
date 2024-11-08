import { Select, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select; // Ensure Option is imported correctly from Select

const CustomAdminHeaderBar = ({
  onNavigate,
  currentWeek,
  handleWeekChange,
  handleEditButtonClick,
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
    <div
      className='rbc-toolbar'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        width: '97%',
      }}
    >
      {/* Navigation Buttons */}
      <div className='rbc-btn-group' style={{ display: 'flex' }}>
        <button type='button' onClick={() => onNavigate('PREV')}>
          Previous Week
        </button>
        <button type='button' onClick={() => onNavigate('TODAY')}>
          Current Week
        </button>
        <button type='button' onClick={() => onNavigate('NEXT')}>
          Next Week
        </button>
      </div>

      {/* Week Selection Dropdown */}
      <Select
        value={currentWeek}
        onChange={handleWeekChange}
        style={{
          width: 300,
          marginLeft: '10px',
          marginRight: '10px',
          textAlign: 'center',
        }}
      >
        {[...Array(52).keys()].map((week) => (
          <Option key={week + 1} value={week + 1}>
            {getWeekRange(week + 1)}
          </Option>
        ))}
      </Select>

      <Button
        type='primary'
        icon={<EditOutlined />}
        onClick={handleEditButtonClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 150,
          justifyItems: 'right',
        }}
      >
        Edit
      </Button>
    </div>
  );
};

export default CustomAdminHeaderBar;
