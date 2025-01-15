import React from 'react';
import PropTypes from 'prop-types';

export default function OtherRequest({
  otherRequestData,
  setOtherRequestData,
  selectedGroup,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setOtherRequestData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className='mb-6 p-4 bg-white shadow rounded-lg'>
      <div className='mb-6'>
        <label className='block text-lg font-medium mb-2'>
          Tiêu đề yêu cầu
        </label>
        <input
          type='text'
          name='title'
          value={otherRequestData.title}
          onChange={handleChange}
          className='border p-2 rounded w-full'
          placeholder='Enter title'
        />
      </div>
      <div className='mb-6'>
        <label className='block text-lg font-medium mb-2'>
          Nội dung yêu cầu
        </label>
        <textarea
          name='content'
          value={otherRequestData.content}
          onChange={handleChange}
          className='border p-2 rounded w-full'
          placeholder='Enter content'
        />
      </div>
    </div>
  );
}

OtherRequest.propTypes = {
  otherRequestData: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
  }).isRequired,
  setOtherRequestData: PropTypes.func.isRequired,
};
