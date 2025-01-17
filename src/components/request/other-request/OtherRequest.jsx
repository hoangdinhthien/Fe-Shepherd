import PropTypes from 'prop-types';

export default function OtherRequest({
  otherRequestData,
  setOtherRequestData,
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
          placeholder='Nhập tiêu đề'
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
          placeholder='Nhập nội dung'
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
