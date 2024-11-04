import { FaFileDownload } from 'react-icons/fa';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

export default function Detail() {
  return (
    // ------DETAIL------
    <div className='flex-1 overflow-scroll'>
      {/* ------USER------ */}
      <div className='px-5 py-8 flex flex-col items-center gap-3 border-b border-gray-400 '>
        {/* ------AVATAR IMAGE------ */}
        <img
          src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
          className='w-[100px] h-[100px] object-cover rounded-full'
        />
        {/* ------------------------------ */}
        {/* ------USER NAME------ */}
        <h2 className=''>Jane Doe</h2>
        {/* ------------------------------ */}
        {/* ------USER DESCRIPTION------ */}
        <p className=''>Lorem ipsum dolor sit amet</p>
      </div>
      {/* ------------------------------ */}
      {/* ------INFO------ */}
      <div className='p-5 flex flex-col gap-3'>
        {/* ------OPTIONS------ */}
        <div className=''>
          {/* ------TITLE------ */}
          <div className='flex items-center justify-between'>
            {/* ------CHAT SETTINGS------ */}
            <span className=''>Chat Settings</span>
            {/* ------------------------------ */}
            <IoIosArrowUp className='cursor-pointer w-10 h-10 p-3 rounded-full bg-blue-gray-400' />
          </div>
        </div>
        {/* ------------------------------ */}
        {/* ------OPTIONS------ */}
        <div className=''>
          {/* ------TITLE ------*/}
          <div className='flex items-center justify-between'>
            {/* ------PRIVACY AND HELP------ */}
            <span className=''>Privacy & help</span>
            {/* ------------------------------ */}
            <IoIosArrowUp className='cursor-pointer w-10 h-10 p-3 rounded-full bg-blue-gray-400' />
          </div>
        </div>
        {/* ------------------------------ */}
        {/* ------PHOTO OPTIONS------ */}
        <div className=''>
          {/* ------TITLE------ */}
          <div className='flex items-center justify-between'>
            {/* ------SHARED PHOTOS------ */}
            <span className=''>Shared photos</span>
            {/* ------------------------------ */}
            {/* ------ARROW DOWN ICON------ */}
            <IoIosArrowDown className='cursor-pointer w-10 h-10 p-3 rounded-full bg-blue-gray-400' />
          </div>
          {/* ------------------------------ */}
          {/* ------PHOTOS------ */}
          <div className='flex flex-col gap-5 mt-5'>
            {/* ------PHOTO ITEMS------ */}
            <div className='flex items-center justify-between'>
              {/* ------PHOTO DETAIL------ */}
              <div className='flex items-center gap-5'>
                <img
                  src='https://4kwallpapers.com/images/wallpapers/wlop-beautiful-girl-3840x2160-15984.jpg'
                  className='w-[40px] h-[40px] rounded-sm object-cover'
                />
                {/* ------PHOTO NAME------ */}
                <span className='text-sm text-blue-gray-500 font-medium'>
                  photo_2024_10.png
                </span>
              </div>
              {/* ------------------------------ */}
              {/* ------DOWNLOAD ICON------ */}
              <FaFileDownload className='cursor-pointer w-10 h-10 p-3 rounded-full bg-blue-gray-400' />
            </div>
          </div>
        </div>
        {/* ------------------------------ */}
        {/* ------OPTIONS------ */}
        <div className=''>
          {/* ------TITLE------ */}
          <div className='flex items-center justify-between'>
            {/* ------SHARED FILES------ */}
            <span className=''>Shared Files</span>
            {/* ------------------------------ */}
            <IoIosArrowUp className='cursor-pointer w-10 h-10 p-3 rounded-full bg-blue-gray-400' />
          </div>
        </div>
        {/* ------------------------------ */}
        {/* ------BLOCK USER BUTTON------ */}
        <button className='py-3 px-5 bg-red-500 bg-opacity-80 text-white border-none rounded-md cursor-pointer hover:bg-red-700 hover:bg-opacity-80 duration-300'>
          Block User
        </button>
        {/* ------------------------------ */}
      </div>
      {/* ------INFO------ */}
    </div>
    // DETAIL
  );
}
