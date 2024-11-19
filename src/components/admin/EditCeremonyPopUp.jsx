import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select, message } from 'antd';
import AdminCalendarAPI from '../../apis/admin/admin_calendar_api';

const { Option } = Select;

const EditCeremonyPopUp = ({ isOpen, onClose, onSave }) => {
  const [ceremonies, setCeremonies] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [selectedCeremonyId, setSelectedCeremonyId] = useState(null);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState(null);
  const [defaultTimeslotId, setDefaultTimeslotId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Lấy danh sách lễ khi mở popup
  useEffect(() => {
    const fetchCeremonies = async () => {
      try {
        const data = await AdminCalendarAPI.getAllCeremoniesToEdit();
        const ceremoniesData = Array.isArray(data?.result) ? data.result : [];
        setCeremonies(ceremoniesData);
      } catch (error) {
        console.error('Không thể lấy danh sách lễ:', error.message);
      }
    };

    if (isOpen) {
      fetchCeremonies();
      fetchTimeslots();
    }
  }, [isOpen]);

  // Lấy tất cả khung giờ
  const fetchTimeslots = async () => {
    try {
      const allTimeslots = await AdminCalendarAPI.getAllTimeSlots();
      setTimeslots(allTimeslots?.result || []);
    } catch (error) {
      console.error('Không thể lấy danh sách khung giờ:', error.message);
    }
  };

  // Điền thông tin khi chọn lễ
  useEffect(() => {
    if (selectedCeremonyId) {
      const selectedCeremony = ceremonies.find(
        (c) => c.id === selectedCeremonyId
      );
      if (selectedCeremony) {
        setName(selectedCeremony.name || '');
        setDescription(selectedCeremony.description || '');
        setStartTime(selectedCeremony.timeSlot?.startTime.slice(0, 5) || ''); // HH:mm
        setEndTime(selectedCeremony.timeSlot?.endTime.slice(0, 5) || ''); // HH:mm
        setDefaultTimeslotId(selectedCeremony.timeSlot?.id);
        setSelectedTimeslotId(selectedCeremony.timeSlot?.id);
      }
    } else {
      setName('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setSelectedTimeslotId(null);
      setDefaultTimeslotId(null);
    }
  }, [selectedCeremonyId, ceremonies]);

  // Thay đổi thời gian khi chọn khung giờ
  useEffect(() => {
    if (selectedTimeslotId) {
      const selectedTimeslot = timeslots.find(
        (t) => t.id === selectedTimeslotId
      );
      if (selectedTimeslot) {
        setStartTime(selectedTimeslot.startTime.slice(0, 5)); // HH:mm
        setEndTime(selectedTimeslot.endTime.slice(0, 5)); // HH:mm
      }
    }
  }, [selectedTimeslotId, timeslots]);

  // Lưu thông tin lễ sau khi chỉnh sửa
  const handleSave = async () => {
    if (
      !name ||
      !description ||
      !startTime ||
      !endTime ||
      !selectedCeremonyId ||
      !selectedTimeslotId
    ) {
      message.error('Vui lòng điền đầy đủ thông tin trước khi lưu.');
      return;
    }

    const updatedCeremony = {
      id: selectedCeremonyId,
      name,
      description,
      startTime: `${startTime}:00`, // HH:mm:ss
      endTime: `${endTime}:00`, // HH:mm:ss
      timeSlotId: selectedTimeslotId, // Lưu timeslot được chọn
    };

    try {
      await AdminCalendarAPI.updateCeremony(
        selectedCeremonyId,
        updatedCeremony
      );
      message.success('Đã cập nhật thông tin lễ thành công.');
      onSave(updatedCeremony);
      onClose();
    } catch (error) {
      console.error('Không thể cập nhật thông tin lễ:', error.message);
      message.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  // Reset thông tin về giá trị mặc định
  const handleReset = () => {
    if (selectedCeremonyId) {
      const selectedCeremony = ceremonies.find(
        (c) => c.id === selectedCeremonyId
      );
      if (selectedCeremony) {
        setName(selectedCeremony.name || '');
        setDescription(selectedCeremony.description || '');
        setStartTime(selectedCeremony.timeSlot?.startTime.slice(0, 5) || ''); // HH:mm
        setEndTime(selectedCeremony.timeSlot?.endTime.slice(0, 5) || ''); // HH:mm
        setSelectedTimeslotId(selectedCeremony.timeSlot?.id);
      }
    }
  };

  return (
    <Modal
      title='Chỉnh Sửa Lễ'
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key='cancel' onClick={onClose}>
          Hủy
        </Button>,
        <Button
          key='reset'
          onClick={handleReset}
          style={{ marginRight: '1rem' }}
        >
          Khôi phục
        </Button>,
        <Button
          key='save'
          type='primary'
          onClick={handleSave}
          disabled={
            !name ||
            !description ||
            !startTime ||
            !endTime ||
            !selectedCeremonyId ||
            !selectedTimeslotId
          }
        >
          Lưu thay đổi
        </Button>,
      ]}
    >
      <div style={{ marginBottom: '1rem' }}>
        <label>Lễ</label>
        <Select
          placeholder='Chọn lễ'
          value={selectedCeremonyId}
          onChange={(value) => setSelectedCeremonyId(value)}
          style={{ width: '100%' }}
        >
          {ceremonies.map((ceremony) => (
            <Option key={ceremony.id} value={ceremony.id}>
              {ceremony.name}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Khung giờ</label>
        <Select
          placeholder='Chọn khung giờ'
          value={selectedTimeslotId}
          onChange={(value) => setSelectedTimeslotId(value)}
          style={{ width: '100%' }}
        >
          {timeslots.map((timeslot) => (
            <Option key={timeslot.id} value={timeslot.id}>
              {timeslot.name}{' '}
              {timeslot.id === defaultTimeslotId && '(Mặc định)'}
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Thời gian</label>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Input
            type='time'
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ width: '48%' }}
            disabled // Chỉ cho phép chỉnh sửa thông qua khung giờ
          />
          <Input
            type='time'
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ width: '48%' }}
            disabled // Chỉ cho phép chỉnh sửa thông qua khung giờ
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Mô tả</label>
        <Input.TextArea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default EditCeremonyPopUp;
