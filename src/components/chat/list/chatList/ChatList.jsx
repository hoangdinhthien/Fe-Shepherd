import { useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import { FaMinus, FaPlus } from 'react-icons/fa';
import AddUser from './AddUser';

export default function ChatList() {
  const [addMore, setAddMore] = useState(false);

  return (
    // ------CHAT LIST------
    <div className='flex-1 overflow-scroll'>
      {/* ------SEARCH CONTAINER------ */}
      <div className='flex items-center gap-3 p-3'>
        {/* ------SEARCH BAR------ */}
        <div className='flex-1 bg-white bg-opacity-70 flex items-center gap-3 rounded-md p-2'>
          {/* ------SEARCH ICON------ */}
          <CiSearch className='h-6 w-6' />
          {/* ------SEARCH ICON------ */}
          {/* ---------------------------------------- */}
          {/* ------SEARCH INPUT------ */}
          <input
            type='text'
            className='bg-transparent border-none outline-none text-white flex-1'
            placeholder='Search...'
          />
          {/* ------SEARCH INPUT------ */}
        </div>
        {/* ------SEARCH BAR------ */}
        {/* ---------------------------------------- */}
        {/* ------ADD USER BUTTON------ */}
        <span onClick={() => setAddMore((prev) => !prev)}>
          {addMore ? (
            <FaMinus className='h-10 w-10 cursor-pointer  bg-blue-950 bg-opacity-70 rounded-md p-2' />
          ) : (
            <FaPlus className='h-10 w-10 cursor-pointer  bg-blue-950 bg-opacity-70 rounded-md p-2' />
          )}
        </span>
        {/* ------ADD USER BUTTON------ */}
      </div>
      {/* ------SEARCH CONTAINER------ */}
      {/* ---------------------------------------- */}
      {/* ------CHAT ITEMS------ */}
      <div
        className={`flex items-center gap-5 p-3 cursor-pointer border-b border-gray-600
          `}
      >
        {/* ------AVATAR------ */}
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
          className='rounded-full w-10 h-10 object-cover'
        />
        {/* ------AVATAR------ */}
        {/* ---------------------------------------- */}
        {/* ------TEXT CONTAINER------ */}
        <div className=' flex flex-col gap-3'>
          {/* ------USERNAME------ */}
          <span className='font-semibold'>Jane Doe</span>
          {/* ------USERNAME------ */}
          {/* ---------------------------------------- */}
          {/* ------LATEST MESSAGE------ */}
          <p className='text-sm font-medium'>hello</p>
          {/* ------LATEST MESSAGE------ */}
        </div>
        {/* ------TEXT CONTAINER------ */}
      </div>
      {/* ------CHAT ITEMS------ */}
      {/* ---------------------------------------- */}
      {/* ------ADD USER------ */}
      {addMore && <AddUser />}
      {/* ------ADD USER------ */}
    </div>
    // CHAT LIST
  );
}
