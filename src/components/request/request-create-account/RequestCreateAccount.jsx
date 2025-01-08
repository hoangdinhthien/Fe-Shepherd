// src/components/RequestCreateAccount.jsx
import { Input, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

RequestCreateAccount.propTypes = {
  currentUserGroup: PropTypes.shape({
    groupName: PropTypes.string.isRequired,
  }).isRequired,
  accountData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    // description: PropTypes.string,
  }).isRequired,
  setAccountData: PropTypes.func.isRequired,
};

export default function RequestCreateAccount({
  currentUserGroup,
  accountData,
  setAccountData,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
            name='name'
            placeholder='Tên tài khoản'
            className='h-12'
            size='large'
            value={accountData.name}
            onChange={handleChange}
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Mật khẩu</label>
          <Input
            type='password'
            name='password'
            placeholder='Mật khẩu'
            className='h-12'
            size='large'
            value={accountData.password}
            onChange={handleChange}
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Email</label>
          <Input
            type='email'
            name='email'
            placeholder='Email'
            className='h-12'
            size='large'
            value={accountData.email}
            onChange={handleChange}
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Số điện thoại</label>
          <Input
            type='tel'
            name='phone'
            placeholder='Số điện thoại'
            className='h-12'
            size='large'
            value={accountData.phone}
            onChange={handleChange}
          />
        </div>
        <div className='flex flex-col'>
          <label className='mb-1 text-gray-700'>Chức vụ</label>
          <Input
            type='text'
            name='role'
            placeholder='Chức vụ'
            className='h-12'
            size='large'
            value='Thành viên'
            disabled
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

      {/* <div className='flex flex-col'>
        <label className='mb-1 text-gray-700'>
          Mô tả yêu cầu tạo tài khoản
        </label>
        <textarea
          name='description'
          placeholder='Mô tả yêu cầu tạo tài khoản'
          className='w-full p-3 border border-gray-300 rounded-lg resize-none h-32 mb-4'
          value={accountData.description}
          onChange={handleChange}
        ></textarea>
      </div> */}
    </div>
  );
}
