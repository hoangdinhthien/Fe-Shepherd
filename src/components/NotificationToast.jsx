import { FaBell } from "react-icons/fa6";

const NotificationToast = ({ title, description }) => {

    return (
        <div className='flex items-center'>
            <div className='text-3xl mr-4 text-amber-500'>
                <FaBell />
            </div>
            <div>
                <h1 className='text-lg font-semibold text-black'>{title}</h1>
                <p className="text-xs font-thin text-gray-500 line-clamp-1">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default NotificationToast;