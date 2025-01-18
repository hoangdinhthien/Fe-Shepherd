import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Tag, Divider, message } from 'antd';
import { IoArrowBack } from 'react-icons/io5'; // Import IoArrowBack
import moment from 'moment';
import request_api from '../../../apis/request_api';
import UserAPI from '../../../apis/user_api'; // Import UserAPI

export default function RequestCreateAccountDetail() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const { requestId, requestingGroup } = location.state.request;
  const [request, setRequest] = useState(null);
  const [createdByName, setCreatedByName] = useState(''); // Add state for createdByName

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const response = await request_api.getRequestDetails(requestId);
        if (response.success) {
          setRequest(response.data);

          // Fetch user name for createdBy
          if (response.data.createdBy) {
            const userResponse = await UserAPI.getUser({
              userId: response.data.createdBy,
            });
            if (userResponse.success) {
              setCreatedByName(userResponse.data.name || 'Unknown');
            }
          }
        } else {
          message.error(response.message || 'Failed to fetch details.');
        }
      } catch (error) {
        message.error('An error occurred while fetching request details.');
        console.log(error);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  if (!request)
    return (
      <div className='flex justify-center items-center h-full'>Loading...</div>
    );

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
          <p className='text-gray-600'>{createdByName}</p>{' '}
          {/* Use createdByName */}
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Đoàn Thể Yêu Cầu:</p>
          <p className='text-gray-600'>{requestingGroup}</p>
        </div>
        <div className='flex space-x-2'>
          <p className='font-semibold text-gray-700'>Loại Yêu Cầu:</p>
          <p className='text-gray-600'>{request.type || 'N/A'}</p>
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
          <p className='text-gray-600'>{request.content}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Ngày Tạo:</p>
          <p className='text-gray-600'>
            {moment(request.createDate).format('DD/MM/YYYY - HH:mm')}
          </p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Người Nhận:</p>
          <p className='text-gray-600'>{request.to}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Email Người Dùng:</p>
          <p className='text-gray-600'>{request.user.email}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>
            Số Điện Thoại Người Dùng:
          </p>
          <p className='text-gray-600'>{request.user.phone}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Vai Trò Người Dùng:</p>
          <p className='text-gray-600'>{request.user.role}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Mật Khẩu:</p>
          <p className='text-gray-600'>{request.user.password}</p>
        </div>
        <div>
          <p className='font-semibold text-gray-700'>Trạng Thái:</p>
          <Tag color={request.isAccepted ? 'success' : 'warning'}>
            {request.isAccepted === null
              ? 'Đang chờ'
              : request.isAccepted
              ? 'Chấp nhận'
              : 'Từ chối'}
          </Tag>
        </div>
      </div>
    </div>
  );
}
