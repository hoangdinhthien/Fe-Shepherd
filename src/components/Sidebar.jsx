import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaClipboardList, FaComments } from 'react-icons/fa';
import { MdDashboard, MdGroup } from 'react-icons/md';
import { RxActivityLog } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import { Link, NavLink, useLocation } from 'react-router-dom';
import HeaderLogo from '../assets/header-logo-img.png';

const userMenuItems = [
  { icon: MdDashboard, title: 'Dashboard', path: '/user/dashboard' },
  { icon: RxActivityLog, title: 'Task', path: '/user/activity' },
  { icon: FaClipboardList, title: 'Request', path: '/user/request' },
  { icon: FaCalendarAlt, title: 'Calendar', path: '/user/calendar' },
  { icon: MdGroup, title: 'Group', path: '/user/group' },
  { icon: FaComments, title: 'Chat', path: '/user/chat' },
];

const adminMenuItems = [
  { icon: MdDashboard, title: 'Dashboard', path: '/admin/dashboard' },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation(); // Get the current location
  const { currentUser } = useSelector((state) => state.user);
  const [active, setActive] = useState(location.pathname); // Set active based on current path

  // Update active state when the location changes
  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  const ADMIN = import.meta.env.VITE_ROLE_ADMIN;

  const navItems =
    currentUser.user.role !== ADMIN ? userMenuItems : adminMenuItems;

  return (
    <div
      className={`${
        sidebarOpen ? 'w-52' : 'w-24'
      } duration-300 bg-amber-400 h-screen fixed z-50 left-0 top-0 border-r border-blue-gray-700`}
    >
      <Link
        to={
          currentUser.user.role !== ADMIN
            ? '/user/dashboard'
            : '/admin/dashboard'
        }
      >
        <div
          className={`flex gap-x-3 items-center justify-center border-b border-blue-gray-700 py-2`}
        >
          <img
            src={HeaderLogo}
            alt=''
            className={`cursor-pointer duration-300 h-14 w-14`}
          />
          {sidebarOpen && (
            <h1
              className={`flex justify-center font-extrabold uppercase text-xl`}
            >
              Shepherd
            </h1>
          )}
        </div>
      </Link>

      {navItems.map((menu, index) => (
        <NavLink
          key={index}
          to={menu.path}
          onClick={() => setActive(menu.path)}
        >
          <div
            className={`${
              active === menu.path &&
              'bg-blue-gray-50 shadow-md shadow-gray-600'
            } ${
              !sidebarOpen && 'justify-center'
            } text-sm flex items-center gap-x-5 cursor-pointer mx-3 p-2 duration-300 hover:bg-opacity-50 hover:bg-gray-100 rounded-md my-10`}
          >
            <menu.icon className={`h-6 w-6 text-gray-800`} />

            {sidebarOpen && (
              <span className={`origin-left duration-300 text-lg text-black`}>
                {menu.title}
              </span>
            )}
          </div>
        </NavLink>
      ))}
    </div>
  );
}
