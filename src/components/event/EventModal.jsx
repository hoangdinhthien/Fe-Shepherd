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

const EventModal = ({
  isUpdate,
  setIsUpdate,
  image,
  loading,
  isModalVisible,
  handleModalClose,
  selectedItem, // Add selectedItem as a prop
  showCreateActivity,
  setShowCreateActivity,
  formData,
  setFormData,
  handleChange,
  onSubmit,
}) => {
  const onUpdateClicked = () => {
    setIsUpdate(true);
    setShowCreateActivity(true);
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
            alt={selectedItem.eventName}
            src={image}
            className='w-full h-48 object-fill rounded-xl mb-4'
          />
          <Title level={3}>
            {!isUpdate ? (
              selectedItem.eventName
            ) : (
              <input
                required
                value={selectedItem.eventName}
                type='text'
                placeholder='Tên sự kiện'
                className='border p-2 rounded-lg mb-4'
              />
            )}
            {isUpdate && (
              <CloseOutlined
                onClick={() => {
                  setIsUpdate(false);
                  setShowCreateActivity(false);
                }}
                className='text-white ml-4 cursor-pointer p-2 rounded-xl bg-red-500 hover:bg-red-600 hover:text-white transition-colors duration-300 ease-in-out'
              />
            )}
            {isUpdate && (
              <CheckOutlined
                onClick={() => {
                  setIsUpdate(false);
                  setShowCreateActivity(false);
                }}
                className='text-white ml-4 cursor-pointer p-2 rounded-xl bg-green-500 hover:bg-green-600 hover:text-white transition-colors duration-300 ease-in-out'
              />
            )}
          </Title>

          {!isUpdate && (
            <div className='flex items-center text-gray-500 mb-2'>
              <CalendarOutlined className='mr-2' />
              <span>{moment(selectedItem.fromDate).format('DD/MM/YYYY')}</span>
              <span className='mx-5'>đến</span>
              <span>{moment(selectedItem.toDate).format('DD/MM/YYYY')}</span>
            </div>
          )}
          {isUpdate && (
            <DatePicker.RangePicker
              showTime
              format='DD/MM/YYYY'
              value={[
                moment(selectedItem.fromDate),
                moment(selectedItem.toDate),
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

EventModal.propTypes = {
  isUpdate: PropTypes.bool.isRequired,
  setIsUpdate: PropTypes.func.isRequired,
  image: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  isModalVisible: PropTypes.bool.isRequired,
  handleModalClose: PropTypes.func.isRequired,
  selectedItem: PropTypes.object, // Make selectedItem optional
  showCreateActivity: PropTypes.bool.isRequired,
  setShowCreateActivity: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default EventModal;
