import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';
import { CiImageOn } from 'react-icons/ci';
import {
  FaCamera,
  FaInfoCircle,
  FaMicrophone,
  FaPhoneAlt,
  FaVideo,
} from 'react-icons/fa';
import { MdEmojiEmotions } from 'react-icons/md';

export default function Chat() {
  const [text, setText] = useState('');
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  // -----SCROLL TO LATEST MESSAGE WHEN REFRESH THE PAGE-----
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // -----FUNCTION HANDLE EMOJI PICKER-----
  const handleEmojiClick = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmojiPicker(false);
  };
  return (
    // ------CHAT------
    <div className='flex-col flex w-1/2 border-l border-r border-gray-800 h-[100%]'>
      {/* ------TOP CONTAINER------ */}
      <div className='p-3 flex items-center justify-between border-b border-gray-600'>
        {/* ------USER INFO------ */}
        <div className='flex items-center gap-3'>
          {/* ------USER AVATAR------ */}
          <img
            src='https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'
            className='w-12 h-12 rounded-full object-cover'
          />
          {/* ------------------------------ */}
          {/* ------TEXTS------- */}
          <div className='flex flex-col gap-1'>
            {/* ------NAME AND DESCRIPTION------ */}
            <span className=''>Jane Doe</span>
            <p className=''>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
          </div>
        </div>
        {/* ------------------------------ */}
        {/* ------ICONS------ */}
        <div className='flex gap-3'>
          <FaPhoneAlt className='w-5 h-5' />
          <FaVideo className='w-5 h-5' />
          <FaInfoCircle className='w-5 h-5' />
        </div>
      </div>
      {/* ------------------------------ */}
      {/* ------CENTER CONTAINER------ */}
      <div className='p-3 flex-1 overflow-scroll flex flex-col gap-3'>
        {/* ------OWNER MESSAGE------ */}
        <div className='max-w-[78%] self-end'>
          {/* ------TEXT------ */}
          <div className='flex-1 flex flex-col gap-2'>
            {/* ------IMAGE------ */}
            <img
              src='https://4kwallpapers.com/images/wallpapers/wlop-beautiful-girl-3840x2160-15984.jpg'
              className='w-[100%] h-80 object-cover rounded-md'
            />
            {/* ------------------------------ */}
            {/* ------MESSAGE------ */}
            <p className='bg-blue-700 p-5 rounded-lg'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione,
              voluptatum voluptates cum, at perferendis, eum tenetur porro
              maxime ducimus culpa hic doloremque sit labore debitis minima
              similique ipsa! Porro, inventore!
            </p>
            {/* ------------------------------ */}
            {/* ------MESSAGE DATE------ */}
            <span className='text-sm'>1 minute ago.</span>
          </div>
        </div>
        {/* ------SENDER MESSAGE------ */}
        <div className='max-w-[78%]'>
          {/* ------TEXT------ */}
          <div className='flex-1 flex flex-col gap-2'>
            {/* ------IMAGE------ */}
            <img
              src='https://4kwallpapers.com/images/wallpapers/wlop-beautiful-girl-3840x2160-15984.jpg'
              className='w-[100%] h-80 object-cover rounded-md'
            />
            {/* ------------------------------ */}
            {/* ------MESSAGE------ */}
            <p className='bg-blue-700 p-5 rounded-lg'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione,
              voluptatum voluptates cum, at perferendis, eum tenetur porro
              maxime ducimus culpa hic doloremque sit labore debitis minima
              similique ipsa! Porro, inventore!
            </p>
            {/* ------------------------------ */}
            {/* ------MESSAGE DATE------ */}
            <span className='text-sm'>1 minute ago.</span>
          </div>
        </div>
        {/* ------------------------------ */}
        {/* ------PREVIEW OF AN IMAGE THAT HAVEN'T BEEN SENT YET------ */}
        <div className='max-w-[78%] self-end'>
          <div className='flex-1 flex flex-col gap-2'>
            <img
              // src={img.url}
              className='w-[100%] h-80 object-cover rounded-md'
            />
          </div>
        </div>
        {/* ------SCROLL TO LATEST MESSAGE WHEN REFRESH THE PAGE------ */}
        <div ref={endRef}></div>
      </div>
      {/* ------------------------------ */}
      {/* ------BOTTOM CONTAINER------ */}
      <div className='flex  p-4 items-center justify-between border-t border-gray-600 gap-3 mt-auto'>
        {/* ------ICONS------ */}
        <div className='flex gap-3'>
          <label htmlFor='file'>
            <CiImageOn className='w-5 h-5 cursor-pointer' />
          </label>
          <input
            type='file'
            id='file'
            className='hidden'
          />
          <FaCamera className='w-5 h-5 cursor-pointer' />
          <FaMicrophone className='w-5 h-5 cursor-pointer' />
        </div>
        {/* ---------------------------------------- */}
        {/* ------MESSAGE INPUT------ */}
        <input
          type='text'
          placeholder='Type a message...'
          className='flex-1 outline-none border-none text-white bg-blue-900 bg-opacity-70 rounded-md py-2 px-3 text-lg disabled:cursor-not-allowed'
        />
        {/* ---------------------------------------- */}
        {/* ------EMOJI CONTAINER------ */}
        <div className='relative'>
          {/* ------EMOJI ICON------ */}
          <MdEmojiEmotions
            className='w-6 h-6 cursor-pointer'
            onClick={() => setOpenEmojiPicker((prev) => !prev)}
          />
          {/* ------EMOJI ICON------ */}
          {/* ---------------------------------------- */}
          {/* ------EMOJI PICKER------ */}
          <div className='absolute left-0 bottom-12 '>
            <EmojiPicker
              open={openEmojiPicker}
              onEmojiClick={handleEmojiClick}
            />
          </div>
        </div>
        {/* ---------------------------------------- */}
        {/* SEND BUTTON */}
        <button className='hover:bg-blue-gray-400 text-white px-4 py-2 border-none cursor-pointer rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed bg-blue-600 duration-300'>
          Send
        </button>
      </div>
    </div>
  );
}
