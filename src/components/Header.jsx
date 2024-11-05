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

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  notifications = [],
  onNotificationClick,
  isFixed,
}) {
  const { currentUser } = useSelector((state) => state.user);
  console.log(isFixed);
  const ADMIN = import.meta.env.VITE_ROLE_ADMIN;
  const LEADER = import.meta.env.VITE_ROLE_GROUP_LEADER;
  const COUNCIL = import.meta.env.VITE_ROLE_COUNCIL;

  return (
    <header
      className={`${
        isFixed && 'fixed top-0 right-0 left-0 z-40'
      } bg-amber-400 shadow-md shadow-slate-300 pr-4 ${
        sidebarOpen ? 'pl-52' : 'pl-24'
      } py-2 border-b border-blue-gray-700`}
    >
      <div className='flex justify-between items-center max-w-full mx-auto p-3'>
        {/* NAVIGATE */}
        <MdKeyboardArrowLeft
          className={`w-7 h-7 rounded-full bg-white border-2 border-blue-gray-700 transition-transform hover:scale-125 duration-300 ${
            sidebarOpen ? '' : 'rotate-180'
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
              content='Create a request'
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
              content='Notification'
              placement='bottom'
            >
              <button onClick={onNotificationClick}>
                <IoMdNotifications className='h-8 w-8 text-slate-700 duration-300 hover:scale-125' />
                {/* NOTIFICATION COUNT */}
                {notifications && notifications.length > 0 && (
                  <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full'>
                    {/* {notifications.length} */}
                  </span>
                )}
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
