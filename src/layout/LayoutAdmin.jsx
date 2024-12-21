import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import NotificationPopup from '../components/NotificationPopup';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function LayoutAdmin() {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const [notiCount, setNotiCount] = useState(0);

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

  const isFixedHeader = pathName !== '/admin/chat';

  return (
    <div className='flex'>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        className='w-64'
      />
      <div
        className={`${isFixedHeader
          ? 'flex-1'
          : 'flex flex-col h-screen w-full'
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
        />
        <div
          className={`${sidebarOpen ? 'ml-52' : 'ml-24'} z-0 ${isFixedHeader
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
