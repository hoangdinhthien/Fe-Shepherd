import { FaRegEdit, FaVideo } from 'react-icons/fa';
import { IoIosMore } from 'react-icons/io';

export default function UserInfo() {
  return (
    <div className='p-3 flex items-center justify-between'>
      {/* ------USER------ */}
      <div className='flex items-center gap-2'>
        {/* ------USER AVATAR------ */}
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
          className='w-10 h-10 rounded-full object-cover'
        />
        {/* ------------------------------ */}
        {/* ------USER NAME------ */}
        <h2 className='font-semibold text-white'>John Doe</h2>
      </div>
      {/* ------------------------------ */}
      {/* ------ICONS------ */}
      <div className=' flex gap-4'>
        {/* ------MORE------ */}
        <IoIosMore className='w-6 h-6 cursor-pointer' />
        {/* ------VIDEO------ */}
        <FaVideo className='w-6 h-6 cursor-pointer' />
        {/* ------EDIT------ */}
        <FaRegEdit className='w-6 h-6 cursor-pointer' />
      </div>
    </div>
  );
}
