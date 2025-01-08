import React from 'react';
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
  weeks = [],
}) => {
  const currentMoment = moment();
  const currentWeekNumber = currentMoment.week();
  const currentYear = currentMoment.year();

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
        value={
          weeks.find(
            (w) =>
              w.weekNumber === selectedWeek.week && w.year === selectedWeek.year
          )?.range || 'Không tìm thấy tuần'
        }
        onChange={(value) => {
          const selectedWeekData = weeks.find((week) => week.range === value);
          if (selectedWeekData) {
            handleWeekChange(
              selectedWeekData.weekNumber,
              selectedWeekData.year
            );
          }
        }}
        style={{
          width: 'auto',
          minWidth: 350,
          marginLeft: '10px',
          marginRight: '10px',
          textAlign: 'center',
        }}
      >
        {weeks.map((week) => (
          <Option
            key={`${week.year}-${week.weekNumber}`}
            value={week.range}
            style={{
              backgroundColor:
                week.weekNumber === selectedWeek.week &&
                week.year === selectedWeek.year
                  ? '#e3f2fd' // Light blue for selected week
                  : week.weekNumber === currentWeekNumber &&
                    week.year === currentYear
                  ? '#f5f5f5' // Light gray for current week
                  : 'transparent',
              fontWeight:
                (week.weekNumber === currentWeekNumber &&
                  week.year === currentYear) ||
                (week.weekNumber === selectedWeek.week &&
                  week.year === selectedWeek.year)
                  ? 'bold'
                  : 'normal',
            }}
          >
            {week.range}
            {week.weekNumber === currentWeekNumber && week.year === currentYear
              ? ''
              : ''}
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

CustomAdminHeaderBar.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  currentWeek: PropTypes.number,
  selectedWeek: PropTypes.shape({
    week: PropTypes.number,
    year: PropTypes.number,
  }),
  handleWeekChange: PropTypes.func.isRequired,
  handleEditButtonClick: PropTypes.func.isRequired,
  weeks: PropTypes.arrayOf(
    PropTypes.shape({
      weekNumber: PropTypes.number.isRequired,
      year: PropTypes.number.isRequired,
      range: PropTypes.string.isRequired,
    })
  ),
};

export default CustomAdminHeaderBar;
