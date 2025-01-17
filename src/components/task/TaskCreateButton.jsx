import React, { useState } from 'react';
import TaskCreatePopUp from './TaskCreatePopUp';
import { Button, message } from 'antd';

export default function TaskCreateButton({
  selectedGroup,
  selectedActivity,
  activityName,
  currentUserId, // Add currentUserId prop
  onTaskCreated, // Add onTaskCreated callback prop
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!selectedGroup) {
      message.warning('Hãy chọn nhóm để tạo công việc mới.');
      return;
    }
    if (!selectedActivity) {
      message.warning('Hãy chọn hoạt động để tạo công việc mới.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type='primary'
        onClick={handleOpenModal}
      >
        Tạo công việc
      </Button>
      <TaskCreatePopUp
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        groupId={selectedGroup}
        activityId={selectedActivity}
        activityName={activityName}
        currentUserId={currentUserId} // Pass currentUserId prop
        onTaskCreated={onTaskCreated} // Pass onTaskCreated callback
      />
    </>
  );
}
