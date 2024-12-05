// src/components/RequestCreateAccount.jsx
import { Input, Tooltip, Select } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

RequestCreateAccount.propTypes = {
  rolesOptions: PropTypes.array.isRequired,
  currentUserGroup: PropTypes.object.isRequired,
};

export default function RequestCreateAccount({ currentUserGroup }) {
  return (
    <div className='mb-6 p-4 bg-white shadow rounded-lg'>
      <h2 className='text-2xl font-semibold mb-4 flex items-center'>
        Chi Tiết Tài Khoản
        <Tooltip title='Vui lòng cung cấp thông tin chi tiết cho tài khoản mới'>
          <InfoCircleOutlined className='ml-2 text-gray-500' />
        </Tooltip>
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Tên tài khoản</label>
          <Input
            type='text'
            placeholder='Tên tài khoản'
            className='h-12'
            size='large'
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Mật khẩu</label>
          <Input
            type='password'
            placeholder='Mật khẩu'
            className='h-12'
            size='large'
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Email</label>
          <Input
            type='email'
            placeholder='Email'
            className='h-12'
            size='large'
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Chọn chức vụ</label>
          <Input
            type='text'
            placeholder='Chọn vai chức vụ'
            className='h-12'
            size='large'
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Đoàn Thể</label>
          <Input
            type='text'
            placeholder='Đoàn Thể'
            className='h-12'
            size='large'
            value={currentUserGroup.groupName}
            disabled
          />
        </div>
      </div>

      <div className='flex flex-col'>
        <label className='mb-1 text-gray-700'>
          Mô tả yêu cầu tạo tài khoản
        </label>
        <textarea
          placeholder='Mô tả yêu cầu tạo tài khoản'
          className='w-full p-3 border border-gray-300 rounded-lg resize-none h-32 mb-4'
        ></textarea>
      </div>
    </div>
  );
}
