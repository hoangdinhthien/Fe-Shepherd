import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import NotificationPopup from '../components/NotificationPopup';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import storageService from '../config/local_storage';
import { jwtDecode } from 'jwt-decode';
import { logIn } from '../redux/user/userSlice';
import { path } from 'framer-motion/client';

export default function LayoutMain() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // Fetch user from local storage if currentUser is not set
  useEffect(() => {
    if (!currentUser) {
      const token = storageService.getAccessToken();
      if (token) {
        const decodedUser = jwtDecode(token);
        dispatch(logIn(decodedUser));
      } else {
        console.error('No token found in storage.');
      }
    }
  }, [currentUser, dispatch]);

  const addNotification = (type, content) => {
    const newNotification = { id: Date.now(), type, content };
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification,
    ]);
  };

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAccept = (id) => {
    // Handle accept logic here
    console.log(`Task ${id} accepted`);
    removeNotification(id);
  };

  const handleReject = (id) => {
    // Handle reject logic here
    console.log(`Task ${id} rejected`);
    removeNotification(id);
  };

  const pathName = location.pathname;
  useEffect(() => {
    console.log(pathName);
  });

  const isFixedHeader = pathName !== '/user/chat';

  return (
    <div className='flex'>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        className='w-64'
      />
      <div
        className={`${
          isFixedHeader ? 'flex-1' : 'flex flex-col h-screen w-full'
        }`}
      >
        <Header
          notifications={notifications}
          onNotificationClick={toggleModal}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isFixed={isFixedHeader}
        />
        <NotificationPopup
          isOpen={isModalOpen}
          onClose={toggleModal}
          notifications={notifications}
          handleAccept={handleAccept}
          handleReject={handleReject}
        />
        <div
          className={`${sidebarOpen ? 'ml-52' : 'ml-24'} z-0 ${
            isFixedHeader
              ? 'mt-20 px-4 py-2'
              : ' flex overflow-auto'
          } duration-300`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
