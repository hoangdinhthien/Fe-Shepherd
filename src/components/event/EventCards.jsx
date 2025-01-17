import { CalendarFilled, FileTextFilled } from '@ant-design/icons';
import { Card, Typography, Button } from 'antd';
import moment from 'moment';
import ALT from '../../assets/welcome-img.png';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;

const EventCards = ({ events, showModal, handleGoToActivities }) => {
  return (
    <>
      {events.map((item) => (
        <Card
          key={item.id}
          hoverable
          className='rounded-2xl overflow-hidden shadow-md transition-transform transform hover:scale-105'
          onClick={() => {
            showModal(item);
          }}
          cover={
            <img
              alt={item.eventName}
              src={item.imageURL || ALT}
              className='w-full h-48 object-cover'
            />
          }
        >
          <Title
            ellipsis={{ rows: 1 }}
            level={4}
            className='text-lg font-semibold text-gray-800'
          >
            {item.eventName}
          </Title>
          <div className='flex items-center w-full text-gray-500 mb-1'>
            <CalendarFilled className='mr-2' />
            <span>{moment(item.fromDate).format('DD/MM/YYYY')}</span>
            <span className='mx-5'>đến</span>
            <span>{moment(item.toDate).format('DD/MM/YYYY')}</span>
          </div>
          <div className='flex items-start justify-start w-full text-gray-500'>
            <FileTextFilled className='mr-2 mt-1' />
            <Paragraph ellipsis={{ rows: 1 }}>
              {item.description ?? 'N/A'}
            </Paragraph>
          </div>
          <Button
            type='link'
            onClick={(e) => {
              e.stopPropagation();
              handleGoToActivities(item.id);
            }}
            className='text-blue-500 mt-2 p-0'
          >
            Đi đến những hoạt động của sự kiện này
          </Button>
        </Card>
      ))}
    </>
  );
};

EventCards.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      eventName: PropTypes.string.isRequired,
      fromDate: PropTypes.string.isRequired,
      toDate: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ).isRequired,
  showModal: PropTypes.func.isRequired,
  handleGoToActivities: PropTypes.func.isRequired,
};

export default EventCards;
