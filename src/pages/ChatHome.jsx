import Chat from '../components/chat/Chat';
import Detail from '../components/chat/Detail';
import List from '../components/chat/list/List';

export default function ChatHome() {
  return (
    // ------CONTAINER------
    <div className='w-[95vw] h-[85vh] bg-gray-500 rounded-xl backdrop-blur-lg bg-opacity-60 flex border-none my-3 mx-3'>
      <>
        <List />
        <Chat />
        <Detail />
      </>
    </div>
    // ------CONTAINER------
  );
}
