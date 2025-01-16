import { CalendarFilled, FileTextFilled } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import moment from 'moment';
import ALT from '../../assets/welcome-img.png';
import PropTypes from 'prop-types';

const { Title, Paragraph } = Typography;

const ActivityCards = ({ activities, showModal }) => {
  return (
    <>
      {activities.map((item) =>
        item.id === 'no-activities' ? (
          <p
            key={item.id}
            className='col-span-4 text-center text-gray-500'
          >
            {item.eventName}
          </p>
        ) : (
          <Card
            key={item.id}
            hoverable
            className='rounded-2xl overflow-hidden shadow-md transition-transform transform hover:scale-105'
            onClick={() => {
              showModal(item);
            }}
            cover={
              <div className='relative'>
                <img
                  alt={item.activityName}
                  src={ALT}
                  className='w-full h-48 object-cover'
                />
                <div className='absolute bottom-2 left-2 rounded-xl bg-[#71BE63] max-w-[300px] shadow-lg overflow-ellipsis text-white font-bold p-2 px-3 text-sm'>
                  {item.event.eventName}
                </div>
              </div>
            }
          >
            <Title
              ellipsis={{ rows: 1 }}
              level={4}
              className='text-lg font-semibold text-gray-800'
            >
              {item.activityName}
            </Title>
            <div className='flex items-center w-full text-gray-500 mb-1'>
              <CalendarFilled className='mr-2' />
              <span>{moment(item.startDate).format('DD/MM/YYYY')}</span>
              <span className='mx-5'>đến</span>
              <span>{moment(item.endDate).format('DD/MM/YYYY')}</span>
            </div>
            <div className='flex items-start justify-start w-full text-gray-500'>
              <FileTextFilled className='mr-2 mt-1' />
              <Paragraph ellipsis={{ rows: 1 }}>
                {item.description ?? 'N/A'}
              </Paragraph>
            </div>
          </Card>
        )
      )}
    </>
  );
};

ActivityCards.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      eventName: PropTypes.string,
      activityName: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      description: PropTypes.string,
      event: PropTypes.shape({
        eventName: PropTypes.string,
      }),
    })
  ).isRequired,
  showModal: PropTypes.func.isRequired,
};

export default ActivityCards;
