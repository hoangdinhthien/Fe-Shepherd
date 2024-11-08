import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  FaCheck,
  FaComment,
  FaShare,
  FaThumbsUp,
  FaTimes as FaReject,
  FaClipboardList,
  FaTimes,
} from 'react-icons/fa';

export default function NotificationPopup({
  isOpen,
  onClose,
  notifications,
  removeNotification,
  handleAccept,
  handleReject,
}) {
  const dropdownRef = useRef(null);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       isOpen(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose(); // Close the modal if clicked outside
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className=' fixed right-0 mt-24 mr-6 w-80 bg-white rounded-lg shadow-xl z-50'
        >
          <div className='p-4 border-b'>
            <h2 className='text-xl font-semibold text-gray-800'>
              Notifications
            </h2>
          </div>
          <div className='overflow-y-auto max-h-80'>
            {notifications.length === 0 ? (
              <p className='text-center text-gray-500 py-4'>No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className='p-4 border-b last:border-b-0 hover:bg-gray-50'
                >
                  <div className='flex items-center mb-2'>
                    <div className='mr-3'>
                      {notification.type === 'like' && (
                        <FaThumbsUp className='text-blue-500 h-5 w-5' />
                      )}
                      {notification.type === 'comment' && (
                        <FaComment className='text-green-500 h-5 w-5' />
                      )}
                      {notification.type === 'share' && (
                        <FaShare className='text-purple-500 h-5 w-5' />
                      )}
                      {notification.type === 'task' && (
                        <FaClipboardList className='text-yellow-500 h-5 w-5' />
                      )}
                    </div>
                    <div className='flex-grow'>
                      <p className='text-sm text-gray-800'>
                        {notification.content}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>Just now</p>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className='text-gray-400 hover:text-gray-600 focus:outline-none'
                    >
                      <FaTimes className='h-4 w-4' />
                    </button>
                  </div>
                  {notification.type === 'task' && (
                    <div className='mt-2 flex justify-end space-x-2'>
                      <button
                        onClick={() => handleAccept(notification.id)}
                        className='px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center'
                      >
                        <FaCheck className='mr-1' /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(notification.id)}
                        className='px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center'
                      >
                        <FaReject className='mr-1' /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
