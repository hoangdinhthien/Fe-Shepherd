import React, { useState } from 'react';
import TaskCreatePopUp from './TaskCreatePopUp';
import { Button } from 'antd';

export default function TaskCreateButton({
  selectedGroup,
  selectedActivity,
  activityName,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button type='primary' onClick={handleOpenModal}>
        Tạo công việc
      </Button>
      <TaskCreatePopUp
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        groupId={selectedGroup}
        activityId={selectedActivity}
        activityName={activityName}
      />
    </>
  );
}
