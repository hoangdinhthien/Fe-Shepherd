import React, { useEffect, useRef, useState } from 'react';

const EditUserPopup = ({ isOpen, onClose, user, onUpdate }) => {
  const popupRef = useRef();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        id: user.id, // Đảm bảo id được giữ nguyên
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        role: user.role || 'Member',
      });
      setErrors({});
    } else {
      setFormData({
        id: '',
        name: '',
        phone: '',
        email: '',
        role: 'Member',
      });
      setErrors({});
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Email không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({}); // Xóa các lỗi trước khi gửi dữ liệu

    try {
      // Chỉ gửi các thay đổi cần thiết, nhưng luôn gửi lại id và email nếu không có thay đổi
      const changedData = {
        id: formData.id, // luôn gửi id
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        role: formData.role,
      };

      // Gửi yêu cầu API với tất cả dữ liệu, dù có thay đổi hay không
      await onUpdate(changedData); // onUpdate sẽ gửi yêu cầu API

      onClose();
    } catch (error) {
      console.error('Error updating user:', error); // In log lỗi

      // Kiểm tra lỗi phản hồi từ API
      if (error.response?.data?.errors) {
        const apiErrors = {};
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          apiErrors[key.toLowerCase()] = value[0]; // Lấy lỗi từ response API
        });
        setErrors(apiErrors); // Cập nhật trạng thái lỗi
      } else {
        // Nếu không có lỗi cụ thể từ API, hiển thị thông báo lỗi chung
        setErrors({
          submit: 'Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.',
        });
      }
    } finally {
      setIsSubmitting(false); // Dừng trạng thái đang gửi
    }
  };

  const renderError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <span
          style={{
            color: '#f44336',
            fontSize: '12px',
            marginTop: '4px',
            display: 'block',
            animation: 'shake 0.3s ease-in-out',
          }}
        >
          {errors[fieldName]}
        </span>
      );
    }
    return null;
  };

  return isOpen ? (
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
        {errors.submit && (
          <div
            style={{
              backgroundColor: '#ffebee',
              color: '#f44336',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '15px',
            }}
          >
            {errors.submit}
          </div>
        )}
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
                border: errors.name ? '1px solid #f44336' : '1px solid #ccc',
              }}
            />
            {renderError('name')}
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
                border: errors.phone ? '1px solid #f44336' : '1px solid #ccc',
              }}
            />
            {renderError('phone')}
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
                border: errors.email ? '1px solid #f44336' : '1px solid #ccc',
              }}
            />
            {renderError('email')}
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
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: isSubmitting ? '#a5d6a7' : '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type='button'
              onClick={() => {
                if (
                  !isSubmitting ||
                  window.confirm('Bạn có chắc chắn muốn hủy bỏ thay đổi không?')
                ) {
                  onClose();
                }
              }}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default EditUserPopup;
