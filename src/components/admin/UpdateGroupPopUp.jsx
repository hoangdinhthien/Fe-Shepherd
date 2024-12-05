import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Button } from 'antd';
import AdminGroupAPI from '../../apis/admin/admin_group_api';

const UpdateGroupPopUp = ({ isOpen, onClose, group, onGroupUpdated }) => {
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    if (group) {
      const initial = {
        groupName: group.groupName,
        description: group.description,
        priority: group.priority,
      };
      setInitialValues(initial);
      form.setFieldsValue(initial);
    }
  }, [group, form]);

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      await AdminGroupAPI.updateGroup(group.id, values);
      onGroupUpdated(group.groupName); // Truyền tên nhóm vào thông báo
      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật nhóm:', error.message);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(initialValues);
  };

  return (
    <Modal
      title='Chỉnh Sửa Nhóm'
      visible={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose={true}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          label='Tên Nhóm'
          name='groupName'
          rules={[{ required: true, message: 'Vui lòng nhập tên nhóm!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label='Mô Tả' name='description'>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label='Ưu Tiên' name='priority' valuePropName='checked'>
          <Switch />
        </Form.Item>

        <div className='flex justify-between'>
          <Button onClick={handleReset}>Reset</Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button type='primary' onClick={handleSave}>
            Lưu
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateGroupPopUp;
