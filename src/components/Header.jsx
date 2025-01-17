import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IoMdNotifications } from 'react-icons/io';
import { IoDocumentText } from 'react-icons/io5';
import { Tooltip } from '@material-tailwind/react';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { FaRegCircleUser } from 'react-icons/fa6';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { messaging } from '../config/firebase/firebase';
import { showNotification } from '../config/message_service';
import { getToken, onMessage } from '@firebase/messaging';
import device_api from '../apis/device_api';
import notification_api from '../apis/notification_api';
import storageService from '../config/local_storage';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../redux/user/userSlice';

const roleTranslations = {
  Admin: 'Quản Trị Viên',
  Member: 'Thành Viên',
  ParishPriest: 'Cha xứ',
  Accountant: 'Thủ Quỹ',
  Council: 'Hội Đồng Mục Vụ',
};

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 transform transition-all'>
        <div className='text-center'>
          <h3 className='text-2xl font-bold text-gray-900 mb-4'>
            Xác nhận đăng xuất
          </h3>
          <p className='text-gray-600 mb-8'>
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
          </p>
          <div className='flex justify-center gap-4'>
            <button
              onClick={onClose}
              className='px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium transition-colors'
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className='px-6 py-2.5 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium transition-colors'
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  onNotificationClick,
  notiCount,
  setNotiCount,
  isFixed,
}) {
  const { currentUser } = useSelector((state) => state.user);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const LEADER = 'Trưởng nhóm';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('.dropdown-menu') &&
        !e.target.closest('.profile-button')
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const updateFcmToken = async (fcmToken) => {
    try {
      await device_api.create({
        userId: currentUser.user.id,
        deviceId: fcmToken,
      });
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  };

  const getUnread = async () => {
    try {
      const unread = await notification_api.getNotifications({
        PageNumber: 1,
        PageSize: 1,
        IsRead: false,
      });
      setNotiCount(unread.pagination.totalCount);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  useEffect(() => {
    async function setupPermission() {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging);
        await updateFcmToken(token);
      }
    }
    setupPermission();
    getUnread();
  }, []);

  useEffect(() => {
    onMessage(messaging, (payload) => {
      setNotiCount((prev) => prev + 1);
      showNotification({
        title: payload.notification.title,
        body: payload.notification.body,
      });
    });
  }, [notiCount]);

  const logout = () => {
    storageService.removeAccessToken();
    dispatch(logOut());
    navigate('/');
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header
        className={`${
          isFixed && 'fixed top-0 right-0 left-0 z-40'
        } bg-amber-400 shadow-md shadow-slate-300 pr-4 ${
          sidebarOpen ? 'pl-52' : 'pl-24'
        } py-2 border-b border-blue-gray-700`}
      >
        <div className='flex justify-between items-center w-full p-3'>
          <MdKeyboardArrowLeft
            className={`w-7 h-7 rounded-full bg-white border-2 border-blue-gray-700 transition-transform hover:scale-125 ${
              sidebarOpen ? '' : 'rotate-180'
            }`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className='flex items-center gap-4'>
            {(currentUser.listGroupRole.some(
              ({ roleName }) => roleName === LEADER
            ) ||
              currentUser.user.role === 'Council') && (
              <Tooltip
                content='Tạo yêu cầu'
                placement='bottom'
              >
                <Link to='/user/create-request'>
                  <IoDocumentText className='h-8 w-8 text-slate-700 duration-300 hover:scale-125' />
                </Link>
              </Tooltip>
            )}

            <Tooltip
              content='Thông báo'
              placement='bottom'
            >
              <button onClick={onNotificationClick}>
                <div className='relative'>
                  <IoMdNotifications className='h-8 w-8 text-slate-700 duration-300 hover:scale-125' />
                  {notiCount > 0 && (
                    <span className='absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full'>
                      {notiCount}
                    </span>
                  )}
                </div>
              </button>
            </Tooltip>

            <div className='relative'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className='flex items-center profile-button'
              >
                <FaRegCircleUser className='rounded-full h-8 w-8 object-cover duration-300 hover:scale-125' />
              </button>
              {dropdownOpen && (
                <div className='dropdown-menu absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50'>
                  <div className='p-4 flex items-center space-x-3'>
                    <img
                      src={
                        currentUser?.user?.profileImage ||
                        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
                      }
                      alt='User avatar'
                      className='w-10 h-10 rounded-full'
                    />
                    <div>
                      <p className='text-sm font-medium'>
                        {currentUser.user.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {roleTranslations[currentUser.user.role] ||
                          currentUser.user.role}
                      </p>
                    </div>
                  </div>
                  <hr className='border-gray-200' />
                  <ul>
                    <li>
                      <Link
                        to={
                          currentUser.user.role !== 'Admin'
                            ? '/user/profile'
                            : '/admin/profile'
                        }
                        className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        onClick={() => setDropdownOpen(false)}
                      >
                        Hồ sơ người dùng
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(true);
                          setDropdownOpen(false);
                        }}
                        className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                      >
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
      />
    </>
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
