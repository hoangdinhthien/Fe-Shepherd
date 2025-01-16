import React, { useEffect, useRef, useState } from 'react';

const EditUserPopup = ({ isOpen, onClose, user, onUpdate }) => {
  const popupRef = useRef();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
  });

  const roleOptions = {
    Admin: 'Quản trị viên',
    Member: 'Thành viên',
    ParishPriest: 'Cha xứ',
    Accountant: 'Thủ quỹ',
    Council: 'Hội đồng mục vụ',
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'Member',
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const changedData = {};

    if (formData.name !== user.name) {
      changedData.name = formData.name;
    }
    if (formData.phone !== user.phone) {
      changedData.phone = formData.phone;
    }
    if (formData.email !== user.email) {
      changedData.email = formData.email;
    }
    if (formData.role !== user.role) {
      changedData.role = formData.role;
    }

    if (Object.keys(changedData).length > 0) {
      onUpdate(changedData);
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        ref={popupRef}
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '10px',
          width: '400px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
          position: 'relative',
        }}
      >
        <h2 style={{ margin: '0 0 20px' }}>Chỉnh sửa thông tin người dùng</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor='name'
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
              }}
            >
              Họ và tên:
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor='phone'
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
              }}
            >
              Số điện thoại:
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor='email'
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
              }}
            >
              Email:
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor='role'
              style={{
                display: 'block',
                fontWeight: 'bold',
                marginBottom: '5px',
              }}
            >
              Vai trò:
            </label>
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            >
              {Object.entries(roleOptions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '20px',
            }}
          >
            <button
              type='submit'
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Lưu thay đổi
            </button>
            <button
              type='button'
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPopup;
