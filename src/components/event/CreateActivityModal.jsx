import { CalendarOutlined, CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { DatePicker, Modal, Typography } from "antd";
import moment from "moment";
const { Title, Paragraph } = Typography;

const CreateActivityModal = ({
  isUpdate,
  setIsUpdate,
  groupIds,
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
            {selectedItem.eventName || selectedItem.activityName}
            {!isUpdate && (
              <EditOutlined
                onClick={onUpdateClicked}
                className="text-white ml-4 cursor-pointer p-2 rounded-xl bg-blue-500 hover:bg-blue-600 hover:text-white transition-colors duration-300 ease-in-out"
              />
            )}
            {isUpdate && (
              <CloseOutlined
                onClick={() => { setIsUpdate(false); setShowCreateActivity(false) }}
                className="text-white ml-4 cursor-pointer p-2 rounded-xl bg-red-500 hover:bg-red-600 hover:text-white transition-colors duration-300 ease-in-out"
              />
            )}
            {isUpdate && (
              <CheckOutlined
                onClick={() => { setIsUpdate(false); setShowCreateActivity(false) }}
                className="text-white ml-4 cursor-pointer p-2 rounded-xl bg-green-500 hover:bg-green-600 hover:text-white transition-colors duration-300 ease-in-out"
              />
            )}
          </Title>

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
          <Paragraph>{selectedItem.description}</Paragraph>
          <div className='flex w-full justify-between items-center'>
            <a
              href='#'
              className='text-blue-500'
            >
              Go to the{' '}
              {activeTab === 'events'
                ? 'Activities of this Event'
                : 'Tasks of this Activity'}
            </a>
            {activeTab === 'events' && !showCreateActivity && groupIds.length > 0 && (
              <button
                onClick={() => setShowCreateActivity(true)}
                className='bg-black hover:opacity-65 text-white px-4 py-2 rounded-xl'
              >
                Create Activities
              </button>)}
          </div>


          {showCreateActivity && !isUpdate && (
            <div className='flex flex-col gap-2 w-full mt-4'>
              <p className='font-semibold text-lg text-[#D9D9D9] text-center border-t-2 pt-2 mx-20 border-dashed uppercase'>Create Activities</p>
              <form className='flex flex-col w-full'>
                <p className='font-semibold m-2'>Activity Name</p>
                <input
                  required
                  name='activityName'
                  value={formData.activityName}
                  onChange={handleChange}
                  type='text'
                  placeholder='Activity Name'
                  className='border p-2 rounded-lg mb-4'
                />
                <p className='font-semibold m-2'>Description</p>
                <textarea
                  required
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  placeholder='Description'
                  className='border p-2 rounded-lg mb-4'
                />
                <p className='font-semibold m-2'>Time</p>
                <DatePicker.RangePicker
                  required
                  picker="time"
                  format="HH:mm:ss"
                  value={[
                    formData.startTime ? moment(formData.startTime, 'HH:mm:ss') : null,
                    formData.endTime ? moment(formData.endTime, 'HH:mm:ss') : null
                  ]}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTime: date && date[0] ? date[0].format('HH:mm:ss') : null,
                      endTime: date && date[1] ? date[1].format('HH:mm:ss') : null,
                    }))
                  }
                  placeholder={['Start Time', 'End Time']}
                  className="border border-[#EEE] p-2 rounded-lg w-full text-sm font-semibold"
                />
                <div className='flex flex-row justify-end items-end w-full gap-4 mt-4'>
                  <button
                    onClick={() => setShowCreateActivity(false)}
                    className='bg-red-500 hover:opacity-65 text-white px-4 py-2 rounded-xl'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSubmit}
                    className='bg-black hover:opacity-65 text-white px-4 py-2 rounded-xl'
                  >
                    Create Activities
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
