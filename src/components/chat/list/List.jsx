import ChatList from './chatList/ChatList';
import UserInfo from './UserInfo';

export default function List() {
  return (
    <div className='flex flex-1 flex-col'>
      <UserInfo />
      <ChatList />
    </div>
  );
}
