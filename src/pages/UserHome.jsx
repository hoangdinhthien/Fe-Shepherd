import { useEffect } from 'react';
import { Button, Card } from 'antd';
import welcomeImg from '../assets/welcome-img.png';

const UserHome = () => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-gray-100'>
      <Card
        className='shadow-lg rounded-lg p-3 bg-white'
        style={{ width: '100%', maxWidth: '1300px', marginBottom: '100px' }}
      >
        <h1 className='text-4xl font-bold mb-6 text-center text-green-600'>
          Chào mừng đến với Shepherd
        </h1>
        <img
          src={welcomeImg}
          alt='Welcome'
          className='w-full mb-6 rounded-lg'
        />
        <div className='text-center'>
          <Button
            type='primary'
            size='large'
            className='mr-2'
            style={{ backgroundColor: '#38a169', borderColor: '#38a169' }}
          >
            Bắt đầu
          </Button>
          <Button
            size='large'
            style={{ color: '#38a169', borderColor: '#38a169' }}
          >
            Tìm hiểu thêm
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default UserHome;
