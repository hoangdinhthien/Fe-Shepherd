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
import notification_api from '../apis/notification_api';

export default function LayoutMain() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notiCount, setNotiCount] = useState(0);
  const [readNotiIds, setReadNotiIds] = useState([]);
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

  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const toggleModal = async () => {
    const change = !isModalOpen;
    setIsModalOpen(!isModalOpen);
    if (!change) {
      console.log('Marking all notifications as read...');
      if (notiCount > 0) {
        console.log(`Read ${readNotiIds.length}`, readNotiIds);
        for (let id of readNotiIds) {
          await notification_api.readOneNotification(id);
        }
      } else {
        console.log('Read All noti.');
        await notification_api.readAllNotifications();
      }
    };
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

  const isFixedHeader = pathName !== '/user/chat' && pathName !== '/user/event';

  return (
    <div className='flex'>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        className='w-64'
      />
      <div
        className={`${isFixedHeader ? 'flex-1' : 'flex flex-col h-screen w-full'
          }`}
      >
        <Header
          onNotificationClick={toggleModal}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isFixed={isFixedHeader}
          notiCount={notiCount}
          setNotiCount={setNotiCount}
        />
        <NotificationPopup
          isOpen={isModalOpen}
          onClose={toggleModal}
          notifications={notifications}
          handleAccept={handleAccept}
          handleReject={handleReject}
          notiCount={notiCount}
          setNotiCount={setNotiCount}
          setReadNotiIds={setReadNotiIds}
        />
        <div
          className={`${sidebarOpen ? 'ml-52' : 'ml-24'} z-0 ${isFixedHeader
            ? 'mt-20 px-4 py-2'
            : 'h-full overflow-auto flex justify-center items-center'
            } duration-300`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
