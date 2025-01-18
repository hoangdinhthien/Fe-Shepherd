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
        className='shadow-xl rounded-lg p-3 bg-white'
        style={{ width: '100%', maxWidth: '1100px', marginBottom: '100px' }}
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
          <span className='text-lg text-green-300 italic font-bold'>
            Phàm ai tuyên bố nhận Thầy trước mặt thiên hạ, thì Thầy cũng sẽ
            tuyên bố nhận người ấy trước mặt Cha Thầy. Còn ai chối Thầy trước
            mặt thiên hạ, thì Thầy cũng sẽ chối người ấy trước mặt Cha Thầy.
          </span>
        </div>
      </Card>
    </div>
  );
};

export default UserHome;
