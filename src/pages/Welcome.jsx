import { useNavigate } from 'react-router-dom';
import welcomeImg from '../assets/welcome-img.png';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl w-full h-[90vh] flex flex-col'>
        <div className='relative h-[60vh]'>
          <img
            src={welcomeImg}
            alt='Shepherd with sheep'
            className='w-full h-full object-cover'
          />
        </div>
        <div className='flex flex-col flex-grow justify-between p-6'>
          <div className='space-y-4'>
            <h1 className='text-3xl font-semibold text-center text-green-400'>
              Welcome to Sheperd
            </h1>
            <p className='text-center text-gray-600'>
              Blessed are the kind of heart, for theirs is the kingdom of heaven
            </p>
          </div>
          <button
            className='w-full py-3 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200'
            onClick={() => navigate('/sign-in')}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
