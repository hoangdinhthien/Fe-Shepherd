import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IoMdNotifications } from 'react-icons/io';
import { IoDocumentText } from 'react-icons/io5';
import { Tooltip } from '@material-tailwind/react';
import {
  MdKeyboardArrowLeft,
  MdDashboard,
  MdGroup,
  MdOutlineLocalActivity,
} from 'react-icons/md';
import { FaRegCircleUser } from 'react-icons/fa6';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { messaging } from '../config/firebase/firebase';
import { showNotification } from '../config/message_service';
import { getToken, onMessage } from '@firebase/messaging';
import device_api from '../apis/device_api';
import notification_api from '../apis/notification_api';

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  onNotificationClick,
  notiCount,
  setNotiCount,
  isFixed,
}) {
  const { currentUser } = useSelector((state) => state.user);
  console.log(isFixed);
  // const ADMIN = import.meta.env.VITE_ROLE_ADMIN;
  // const LEADER = import.meta.env.VITE_ROLE_GROUP_LEADER;
  // const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;
  const COUNCIL = 'Hội đồng mục vụ';
  const ADMIN = 'Admin';
  const LEADER = 'Trưởng nhóm';
  console.log(COUNCIL);

  const updateFcmToken = async (fcmToken) => {
    try {
      const res = await device_api.create({
        userId: currentUser.user.id,
        deviceId: fcmToken,
      });
      console.log('FCM token updated:', res);
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  };

  const getUnread = async () => {
    try {
      const unread = await notification_api.getNotifications({ PageNumber: 1, PageSize: 1, IsRead: false });
      console.log('Unread notifications:', unread);
      setNotiCount(unread.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  useEffect(() => {
    async function setupPermision() {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Get the FCM token
        const token = await getToken(messaging);
        console.log('FCM Token:', token);
        await updateFcmToken(token);
      } else {
        console.error('Permission denied');
      }
    };
    setupPermision();
    getUnread();
    return () => {
      // Cleanup logic here
    };
  }, []);

  useEffect(() => {
    try {
      // Handle foreground notifications
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        const title = payload.notification.title;
        const body = payload.notification.body;
        setNotiCount(notiCount + 1);
        showNotification({ title, body });
      });
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }, [notiCount]);

  useEffect(() => {
    const broadcast = new BroadcastChannel('notification_channel');
    broadcast.onmessage = (event) => {
      const payload = event.data;
      console.log('Background message received in active tab:', payload);
      setNotiCount((prevCount) => prevCount + 1);
    };

    return () => {
      broadcast.close();
    };
  }, []);


  return (
    <header
      className={`${isFixed && 'fixed top-0 right-0 left-0 z-40'
        } bg-amber-400 shadow-md shadow-slate-300 pr-4 ${sidebarOpen ? 'pl-52' : 'pl-24'
        } py-2 border-b border-blue-gray-700`}
    >
      <div className='flex justify-between items-center w-full p-3'>
        {/* NAVIGATE */}
        <MdKeyboardArrowLeft
          className={`w-7 h-7 rounded-full bg-white border-2 border-blue-gray-700 transition-transform hover:scale-125 duration-300 ${sidebarOpen ? '' : 'rotate-180'
            }`}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className='flex justify-between items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8'>
          {/* CREATE ACTIVITY */}
          {currentUser.user.role === COUNCIL && (
            <Tooltip
              content='Create an activity'
              placement='bottom'
            >
              <Link to='/user/create-activity'>
                <MdOutlineLocalActivity className='h-8 w-8 text-slate-700 duration-300 hover:scale-125' />
              </Link>
            </Tooltip>
          )}
          {/* CREATE ACTIVITY */}
          {/*  */}
          {/* CREATE REQUEST */}
          {(currentUser.listGroupRole.find(
            ({ roleName }) => roleName === LEADER
          ) ||
            currentUser.user.role === COUNCIL) && (
              <Tooltip
                content='Tạo một yêu cầu'
                placement='bottom'
              >
                <Link to='/user/create-request'>
                  <IoDocumentText className='h-8 w-8 text-slate-700 duration-300 hover:scale-125' />
                </Link>
              </Tooltip>
            )}
          {/* CREATE REQUEST */}
          {/*  */}
          {/* NOTIFICATION */}
          {currentUser.user.role !== ADMIN && (
            <Tooltip
              content='Thông báo'
              placement='bottom'
            >
              <button onClick={onNotificationClick} id='noti-button'>
                <div className='relative'>
                  <IoMdNotifications className='h-8 w-8 text-slate-700 duration-300 hover:scale-125' />
                  {/* NOTIFICATION COUNT */}
                  {notiCount > 0 && (
                    <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'>
                      {notiCount}
                    </span>
                  )}
                </div>
                {/* NOTIFICATION COUNT */}
              </button>
            </Tooltip>
          )}
          {/* NOTIFICATION */}

          {/* PROFILE */}
          {/* {currentUser ? ( */}
          <Tooltip
            content='User Profile'
            placement='bottom'
          >
            <Link
              to={
                currentUser.user.role !== ADMIN
                  ? '/user/profile'
                  : '/admin/profile'
              }
            >
              <FaRegCircleUser className='rounded-full h-8 w-8 object-cover duration-300 hover:scale-125' />
            </Link>
          </Tooltip>
          {/* ) : (
            <Link
              to='/sign-in'
              className='duration-300 hover:scale-90 text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1.5 focus:outline-none'
            >
              Sign In
            </Link>
          )} */}
          {/* PROFILE */}
        </div>
        {/* NAVIGATE */}
      </div>
    </header>
  );
}


Header.propTypes = {
  sidebarOpen: PropTypes.bool.isRequired,
  setSidebarOpen: PropTypes.func.isRequired,
  onNotificationClick: PropTypes.func.isRequired,
  notiCount: PropTypes.number,
  setNotiCount: PropTypes.func,
  isFixed: PropTypes.bool,
};

Header.defaultProps = {
  isFixed: false,
  notiCount: 0,
};
