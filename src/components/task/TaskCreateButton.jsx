import { useState } from 'react';
import TaskCreatePopUp from './TaskCreatePopUp';
import { FaPlus } from 'react-icons/fa';
import { Button, Spin } from 'antd';

export default function TaskCreateButton({ selectedGroup }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPopup = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        type='primary'
        icon={loading ? <Spin size='small' /> : <FaPlus />}
        onClick={openPopup}
        disabled={loading}
        className='flex items-center justify-center px-4 py-2 text-md font-medium rounded-md bg-blue-500 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'
      >
        {loading ? 'Loading...' : 'Tạo Công Việc'}
      </Button>
      <TaskCreatePopUp
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupId={selectedGroup}
      />
    </>
  );
}
