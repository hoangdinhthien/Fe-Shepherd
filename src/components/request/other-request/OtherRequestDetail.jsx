import { useEffect, useState } from 'react';
import RequestAPI from '../../../apis/request_api';
import UserAPI from '../../../apis/user_api';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { IoArrowBack } from 'react-icons/io5'; // Import IoArrowBack
import { Divider, message, Tag } from 'antd'; // Import necessary components from antd
import moment from 'moment'; // Import moment for date formatting

export default function OtherRequestDetail({ searchKey }) {
  const [requestDetails, setRequestDetails] = useState(null);
  const [createdByName, setCreatedByName] = useState(''); // Add state for createdByName
  const navigate = useNavigate(); // Initialize navigate

  console.log('searchKey:', searchKey);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await RequestAPI.getRequests({ SearchKey: searchKey });
        const request = response.result[0];
        setRequestDetails(request);

        // Fetch user name for createdBy
        if (request.createdBy) {
          const userResponse = await UserAPI.getUser({
            userId: request.createdBy,
          });
          if (userResponse.success) {
            setCreatedByName(userResponse.data.name || 'Unknown');
          }
        }
      } catch (error) {
        message.error('Error fetching request details:', error);
      }
    };

    fetchRequestDetails();
  }, [searchKey]);

  if (!requestDetails) {
    return <div>Loading...</div>;
  }

  console.log('other Request Details:', requestDetails);

  return (
    <div className='p-6 bg-white rounded-md shadow-md'>
      <button
        className='flex items-center mb-4 text-black'
        onClick={() => navigate(-1)} // Navigate back
      >
        <IoArrowBack className='mr-2' /> Quay lại
      </button>
      {/* -----HEADER SECTION----- */}
      <div className='flex justify-between items-center mb-4'>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Yêu Cầu Được Tạo Bởi:</p>
          <p className='text-gray-600'>{createdByName}</p>
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Đoàn Thể Yêu Cầu:</p>
          <p className='text-gray-600'>
            {requestDetails.group.groupName || 'N/A'}
          </p>
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Loại Yêu Cầu:</p>
          <p className='text-gray-600'>{requestDetails.type || 'N/A'}</p>
        </div>
      </div>
      {/* -----DIVIDER----- */}
      <Divider
        orientation='center'
        style={{ borderColor: '#9a9a9a' }}
      >
        <strong className='text-2xl'>CHI TIẾT YÊU CẦU</strong>
      </Divider>
      {/* -----REQUEST DETAILS----- */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-md'>
        <div>
          <p className='font-semibold text-gray-700'>Nội Dung:</p>
          <p className='text-gray-600'>{requestDetails.content}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Ngày Tạo:</p>
          <p className='text-gray-600'>
            {moment(requestDetails.createDate).format('DD/MM/YYYY - HH:mm')}
          </p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Trạng Thái:</p>
          <Tag color={requestDetails.isAccepted ? 'success' : 'warning'}>
            {requestDetails.isAccepted === null
              ? 'Đang chờ'
              : requestDetails.isAccepted
              ? 'Chấp Nhận'
              : 'Từ Chối'}
          </Tag>
        </div>
      </div>
    </div>
  );
}

OtherRequestDetail.propTypes = {
  searchKey: PropTypes.string.isRequired,
};
