import React from 'react';

export default function AddUser() {
  return (
    // ADD USER
    <div className='p-6  bg-gray-600 bg-opacity-85 rounded-xl absolute top-0 left-0 bottom-0 right-0 m-auto w-max h-max'>
      {/* ADD USER FORM */}
      <form className='flex gap-5'>
        {/* USERNAME INPUT */}
        <input
          type='text'
          placeholder='Username'
          name='username'
          className='p-5 rounded-lg border-none outline-none text-black'
        />
        {/* USERNAME INPUT */}
        {/*  */}
        {/* SEARCH BUTTON */}
        <button className='p-5 rounded-md bg-blue-500 text-white border-none cursor-pointer'>
          Search
        </button>
        {/* SEARCH BUTTON */}
      </form>
      {/* ADD USER FORM */}
      {/*  */}
      {/* SHOW USER */}

      <div className='mt-10 flex items-center justify-between'>
        {/* DETAIL */}
        <div className='flex items-center gap-5'>
          {/* USER IMAGE */}
          <img
            src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
            className='w-[60px] h-[60px] object-cover rounded-full'
          />
          {/* USER IMAGE */}
          {/*  */}
          {/* USER NAME */}
          <span className=''>jane</span>
          {/* USER NAME */}
        </div>
        {/* DETAIL */}
        {/*  */}
        {/* ADD BUTTON */}
        <button className='p-3 rounded-md bg-blue-500 text-white border-none cursor-pointer'>
          Add User
        </button>
        {/* ADD BUTTON */}
      </div>
      {/* SHOW USER */}
    </div>
    // ADD USER
  );
}
