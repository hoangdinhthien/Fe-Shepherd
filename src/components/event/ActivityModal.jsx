import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { DatePicker, Modal, Typography } from 'antd';
import moment from 'moment';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
const { Title, Paragraph } = Typography;

const ActivityModal = ({
  isUpdate,
  setIsUpdate,
  image,
  loading,
  isModalVisible,
  handleModalClose,
  selectedItem,
}) => {
  const onUpdateClicked = () => {
    setIsUpdate(true);
  };

  const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;
  const PRIEST = import.meta.env.VITE_ROLE_PARISH_PRIEST;
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser.user;

  return (
    <Modal
      loading={loading}
      open={isModalVisible}
      onCancel={handleModalClose}
      footer={null}
      width={800}
      centered
    >
      {selectedItem && (
        <div className='p-4'>
          <img
            alt={selectedItem.activityName}
            src={image}
            className='w-full h-48 object-fill rounded-xl mb-4'
          />
          <Title level={3}>
            {!isUpdate ? (
              selectedItem.activityName
            ) : (
              <input
                required
                value={selectedItem.activityName}
                type='text'
                placeholder='Tên hoạt động'
                className='border p-2 rounded-lg mb-4'
              />
            )}
            {isUpdate && (
              <CloseOutlined
                onClick={() => {
                  setIsUpdate(false);
                }}
                className='text-white ml-4 cursor-pointer p-2 rounded-xl bg-red-500 hover:bg-red-600 hover:text-white transition-colors duration-300 ease-in-out'
              />
            )}
            {isUpdate && (
              <CheckOutlined
                onClick={() => {
                  setIsUpdate(false);
                }}
                className='text-white ml-4 cursor-pointer p-2 rounded-xl bg-green-500 hover:bg-green-600 hover:text-white transition-colors duration-300 ease-in-out'
              />
            )}
          </Title>

          {!isUpdate && (
            <div className='flex items-center text-gray-500 mb-2'>
              <CalendarOutlined className='mr-2' />
              <span>
                {moment(selectedItem.startDate).format('DD MMM YYYY')}
              </span>
              <span className='mx-5'>to</span>
              <span>{moment(selectedItem.endDate).format('DD MMM YYYY')}</span>
            </div>
          )}
          {isUpdate && (
            <DatePicker.RangePicker
              showTime
              format='DD/MM/YYYY'
              value={[
                moment(selectedItem.startDate),
                moment(selectedItem.endDate),
              ]}
              onChange={(date) => console.log(date)}
              placeholder={['Thời gian bắt đầu', 'Kết thúc']}
              size='large'
              className='border border-[#EEE] p-2 rounded-lg w-full mb-4 font-semibold'
            />
          )}
          {!isUpdate ? (
            <Paragraph>{selectedItem.description}</Paragraph>
          ) : (
            <textarea
              required
              value={selectedItem.description}
              placeholder='Mô tả'
              className='border p-2 rounded-lg mb-4 w-full'
            />
          )}
        </div>
      )}
    </Modal>
  );
};

ActivityModal.propTypes = {
  isUpdate: PropTypes.bool.isRequired,
  setIsUpdate: PropTypes.func.isRequired,
  image: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  isModalVisible: PropTypes.bool.isRequired,
  handleModalClose: PropTypes.func.isRequired,
  selectedItem: PropTypes.object, // Make selectedItem optional
};

export default ActivityModal;
