// src/components/RequestCreateAccount.jsx
import { Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

export default function RequestCreateAccount() {
  return (
    <div className='mb-6 p-4 bg-white shadow rounded-lg'>
      <h2 className='text-2xl font-semibold mb-4 flex items-center'>
        Chi Tiết Tài Khoản
        <Tooltip title='Vui lòng cung cấp thông tin chi tiết cho tài khoản mới'>
          <InfoCircleOutlined className='ml-2 text-gray-500' />
        </Tooltip>
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <Input
          type='text'
          placeholder='Tên'
          className='h-12'
          size='large'
        />
        <Input
          type='text'
          placeholder='Số Điện Thoại'
          className='h-12'
          size='large'
        />
        <Input
          type='email'
          placeholder='Email'
          className='h-12'
          size='large'
        />
        <Input
          type='text'
          placeholder='Chọn Đoàn Thể tham gia'
          className='h-12'
          size='large'
        />
      </div>

      <textarea
        placeholder='Mô tả yêu cầu tạo tài khoản'
        className='w-full p-3 border border-gray-300 rounded-lg resize-none h-32 mb-4'
      ></textarea>
    </div>
  );
}
