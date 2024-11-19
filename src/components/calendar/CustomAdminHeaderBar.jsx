import PropTypes from 'prop-types';
import { Select, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

const { Option } = Select;

const CustomAdminHeaderBar = ({
  onNavigate,
  currentWeek,
  selectedWeek,
  handleWeekChange,
  handleEditButtonClick,
}) => {
  const startDate = moment().subtract(6, 'months').startOf('week');
  const endDate = moment().add(6, 'months').endOf('week');

  const weeksInRange = [];
  let week = startDate.clone();

  while (week.isSameOrBefore(endDate)) {
    weeksInRange.push({
      weekNumber: week.week(),
      year: week.year(),
      range: `${week.startOf('week').format('DD/MM/YYYY')} - ${week
        .endOf('week')
        .format('DD/MM/YYYY')}`,
    });
    week.add(1, 'weeks');
  }

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
      <div className='rbc-btn-group' style={{ display: 'flex' }}>
        <button type='button' onClick={() => onNavigate('PREV')}>
          Tuần Trước
        </button>
        <button type='button' onClick={() => onNavigate('TODAY')}>
          Tuần Này
        </button>
        <button type='button' onClick={() => onNavigate('NEXT')}>
          Tuần Sau
        </button>
      </div>

      <Select
        value={`${currentWeek}-${selectedWeek.year}`}
        onChange={(value) => {
          const [weekNumber, year] = value.split('-').map(Number);
          handleWeekChange(weekNumber, year);
        }}
        popupMatchSelectWidth={false}
        style={{
          width: 'auto',
          minWidth: 350,
          marginLeft: '10px',
          marginRight: '10px',
          textAlign: 'center',
        }}
      >
        {weeksInRange.map(({ weekNumber, year, range }) => (
          <Option key={`${year}-${weekNumber}`} value={`${weekNumber}-${year}`}>
            {range}
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
        Chỉnh Sửa
      </Button>
    </div>
  );
};

// Định nghĩa PropTypes
CustomAdminHeaderBar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  currentWeek: PropTypes.number.isRequired,
  selectedWeek: PropTypes.shape({
    week: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired,
  }).isRequired,
  handleWeekChange: PropTypes.func.isRequired,
  handleEditButtonClick: PropTypes.func.isRequired,
};

// Export component
export default CustomAdminHeaderBar;
