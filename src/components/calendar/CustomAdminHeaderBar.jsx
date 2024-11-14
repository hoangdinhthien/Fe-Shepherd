import { Select, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi'; // Import ngôn ngữ tiếng Việt cho moment

moment.locale('vi'); // Thiết lập ngôn ngữ tiếng Việt cho moment

const { Option } = Select;

const CustomAdminHeaderBar = ({
  onNavigate,
  currentWeek,
  handleWeekChange,
  handleEditButtonClick,
}) => {
  // Xác định tuần hiện tại
  const currentWeekNumber = moment().week();
  const currentYear = moment().year();

  // Tính toán tuần bắt đầu và tuần kết thúc trong khoảng thời gian 12 tháng
  const startDate = moment().subtract(6, 'months').startOf('week');
  const endDate = moment().add(6, 'months').endOf('week');

  // Tạo danh sách tuần từ tuần bắt đầu đến tuần kết thúc
  const weeksInRange = [];
  let week = startDate.clone();

  while (week.isSameOrBefore(endDate)) {
    weeksInRange.push({
      weekNumber: week.week(),
      year: week.year(),
      range: `${week
        .startOf('week')
        .format('DD [tháng] MM [năm] YYYY')} - ${week
        .endOf('week')
        .format('DD [tháng] MM [năm] YYYY')}`,
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
      {/* Nút điều hướng */}
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

      {/* Dropdown chọn tuần */}
      <Select
        value={currentWeek}
        onChange={handleWeekChange}
        dropdownMatchSelectWidth={false} // Đảm bảo dropdown có chiều rộng động
        style={{
          width: 'auto', // Chiều rộng tự động
          minWidth: 350, // Đảm bảo đủ rộng để hiển thị toàn bộ
          marginLeft: '10px',
          marginRight: '10px',
          textAlign: 'center',
        }}
      >
        {weeksInRange.map(({ weekNumber, year, range }) => {
          const isCurrentWeek =
            weekNumber === currentWeekNumber && year === currentYear;
          const isSelectedWeek = weekNumber === currentWeek;

          return (
            <Option
              key={`${year}-${weekNumber}`}
              value={weekNumber}
              // Thêm inline style để đánh dấu tuần hiện tại và tuần đang chọn
              style={{
                backgroundColor: isSelectedWeek
                  ? '#e0f7fa' // Màu xanh nhạt cho tuần được chọn
                  : isCurrentWeek
                  ? '#f0f0f0' // Màu xám nhẹ cho tuần hiện tại
                  : 'transparent',
                fontWeight: isSelectedWeek || isCurrentWeek ? 'bold' : 'normal',
                color: isSelectedWeek ? '#00796b' : 'inherit', // Màu chữ xanh đậm cho tuần đang chọn
                minWidth: '350px', // Đảm bảo mỗi Option đủ rộng
                whiteSpace: 'nowrap', // Ngăn chặn xuống dòng
              }}
            >
              {range}
            </Option>
          );
        })}
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

export default CustomAdminHeaderBar;
