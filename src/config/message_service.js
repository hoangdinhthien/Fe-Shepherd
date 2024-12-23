import { toast } from 'react-toastify';
import NotificationToast from '../components/NotificationToast';


export function showNotification({ title, body }) {
    const custom = NotificationToast({ title, description: body });
    toast(custom, {
        position: 'top-center',
        autoClose: 3000,
        newestOnTop: true,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        progress: undefined,
        theme: 'light',
    });
}

export const sendNativeNotification = ({ title, body }) => {
    // Implement your native notification logic

};
