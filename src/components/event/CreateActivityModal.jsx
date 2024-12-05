import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { DatePicker, Modal, Typography } from 'antd';
import moment from 'moment';
import { useSelector } from 'react-redux';
const { Title, Paragraph } = Typography;

const CreateActivityModal = ({
  isUpdate,
  setIsUpdate,
  image,
  loading,
  isModalVisible,
  handleModalClose,
  selectedItem,
  showCreateActivity,
  setShowCreateActivity,
  activeTab,
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
            alt={selectedItem.eventName || selectedItem.activityName}
            src={image}
            className='w-full h-48 object-fill rounded-xl mb-4'
          />
          <Title level={3}>
            {!isUpdate ? (
              selectedItem.eventName || selectedItem.activityName
            ) : (
              <input
                required
                value={selectedItem.eventName || selectedItem.activityName}
                type='text'
                placeholder='Tên sự kiện'
                className='border p-2 rounded-lg mb-4'
              />
            )}
            {!isUpdate && (user.role === COUNCIL || user.role === PRIEST) && (
              <EditOutlined
                onClick={onUpdateClicked}
                className='text-white ml-4 cursor-pointer p-2 rounded-xl bg-blue-500 hover:bg-blue-600 hover:text-white transition-colors duration-300 ease-in-out'
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
              <span>
                {moment(selectedItem.fromDate || selectedItem.startDate).format(
                  'DD MMM YYYY'
                )}
              </span>
              <span className='mx-5'>to</span>
              <span>
                {moment(selectedItem.toDate || selectedItem.endDate).format(
                  'DD MMM YYYY'
                )}
              </span>
            </div>
          )}
          {isUpdate && (
            <DatePicker.RangePicker
              showTime
              format='DD/MM/YYYY'
              value={[
                moment(selectedItem.fromDate || selectedItem.startDate),
                moment(selectedItem.toDate || selectedItem.endDate),
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
          <div className='flex w-full justify-between items-center'>
            {!isUpdate && (
              <a href='#' className='text-blue-500'>
                Đi đến{' '}
                {activeTab === 'events'
                  ? 'những hoạt động của sự kiện này'
                  : 'những nhiệm vụ của hoạt động này'}
              </a>
            )}
            {activeTab === 'events' &&
              !showCreateActivity &&
              (user.role === COUNCIL || user.role === PRIEST) && (
                <button
                  onClick={() => setShowCreateActivity(true)}
                  className='bg-black hover:opacity-65 text-white px-4 py-2 rounded-xl'
                >
                  Tạo hoạt động
                </button>
              )}
          </div>

          {showCreateActivity && !isUpdate && (
            <div className='flex flex-col gap-2 w-full mt-4'>
              <p className='font-semibold text-lg text-[#D9D9D9] text-center border-t-2 pt-2 mx-20 border-dashed uppercase'>
                Form tạo hoạt động
              </p>
              <form className='flex flex-col w-full'>
                <p className='font-semibold m-2'>Tên hoạt động</p>
                <input
                  required
                  name='activityName'
                  value={formData.activityName}
                  onChange={handleChange}
                  type='text'
                  placeholder='Tên hoạt động'
                  className='border p-2 rounded-lg mb-4'
                />
                <p className='font-semibold m-2'>Mô tả</p>
                <textarea
                  required
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  placeholder='Mô tả'
                  className='border p-2 rounded-lg mb-4'
                />
                <p className='font-semibold m-2'>Thời gian</p>
                <DatePicker.RangePicker
                  required
                  picker='time'
                  format='HH:mm:ss'
                  value={[
                    formData.startTime
                      ? moment(formData.startTime, 'HH:mm:ss')
                      : null,
                    formData.endTime
                      ? moment(formData.endTime, 'HH:mm:ss')
                      : null,
                  ]}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTime:
                        date && date[0] ? date[0].format('HH:mm:ss') : null,
                      endTime:
                        date && date[1] ? date[1].format('HH:mm:ss') : null,
                    }))
                  }
                  placeholder={['Thời gian bắt đầu', 'Kết thúc']}
                  className='border border-[#EEE] p-2 rounded-lg w-full text-sm font-semibold'
                />
                <div className='flex flex-row justify-end items-end w-full gap-4 mt-4'>
                  <button
                    onClick={() => setShowCreateActivity(false)}
                    className='bg-red-500 hover:opacity-65 text-white px-4 py-2 rounded-xl'
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={onSubmit}
                    className='bg-black hover:opacity-65 text-white px-4 py-2 rounded-xl'
                  >
                    Tạo hoạt động
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CreateActivityModal;
