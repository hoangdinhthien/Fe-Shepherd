import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import LayoutMain from './layout/LayoutMain';
import Task from './pages/Task';
import ChatHome from './pages/ChatHome';
import CreateActivity from './pages/CreateActivity';
import CreateRequest from './pages/CreateRequest';
import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import Profile from './pages/Profile';
import Request from './pages/Request';
import SignIn from './pages/SignIn';
import WelcomePage from './pages/Welcome';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequest from './pages/admin/AdminRequest';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminUser from './pages/admin/AdminUser';
import AdminBudget from './pages/admin/AdminBudget';
import Calendar from './pages/calendar/Calendar';
import storageService from './config/local_storage';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { logIn } from './redux/user/userSlice';
import UserAPI from './apis/user_api';
import LayoutAdmin from './layout/LayoutAdmin';
import { jwtDecode } from 'jwt-decode';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store';
import Event from './pages/Event';
import RequestDetail from './components/request/request-create-event/RequestDetail';
import BudgetHistory from './pages/BudgetHistory';
import AdminGroup from './pages/admin/AdminGroup';
import RequestCreateAccountDetail from './components/request/request-create-account/RequestCreateAccountDetail';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AppRoutes = () => {
  const roles = [
    import.meta.env.VITE_ROLE_ADMIN,
    import.meta.env.VITE_ROLE_MEMBER,
    import.meta.env.VITE_ROLE_PARISH_PRIEST,
    import.meta.env.VITE_ROLE_COUNCIL,
    import.meta.env.VITE_ROLE_ACCOUNTANT,
    // 'Admin',
    // 'Thành viên',
    // 'Cha xứ',
    // 'Hội đồng mục vụ',
    // 'Thủ quỹ',
  ];

  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getUser = async (token) => {
    try {
      setIsLoading(true);
      const res = await UserAPI.getUser({ id: token.id });
      dispatch(logIn(res.data));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoute = () => {
    if (user) {
      return user.user.role === roles[0] ? '/admin' : '/user';
    }
    return '/welcome';
  };

  useEffect(() => {
    const token = storageService.getAccessToken();
    console.log(user);

    if (!user && token) {
      const decodedUser = jwtDecode(token);
      console.log('Decoded User in App.jsx:', decodedUser); // Add this line
      getUser(decodedUser);
    }
  }, [location.pathname]); // Run whenever the route changes

  const isAuthenticated = user !== null;

  return (
    <Routes>
      <Route
        path='/'
        element={<Navigate to={getRoute()} />}
      />
      <Route
        path='/welcome'
        element={
          isAuthenticated ? (
            <Navigate
              replace
              to='/user'
            />
          ) : (
            <WelcomePage />
          )
        }
      />
      <Route
        path='/sign-in'
        element={
          isAuthenticated ? (
            <Navigate
              replace
              to='/user'
            />
          ) : (
            <SignIn />
          )
        }
      />

      <Route
        path='/admin'
        element={
          isAuthenticated && user.user.role === roles[0] ? (
            <LayoutAdmin />
          ) : (
            <Navigate to='/' />
          )
        }
      >
        <Route
          path='dashboard'
          index
          element={<AdminDashboard />}
        />
        <Route
          path='request'
          index
          element={<AdminRequest />}
        />
        <Route
          path='calendar'
          index
          element={<AdminCalendar />}
        />
        <Route
          path='event'
          element={<Event />}
        />
        <Route
          path='profile'
          element={<Profile />}
        />
        <Route
          path='user'
          element={<AdminUser />}
        />
        <Route
          path='budget'
          element={<AdminBudget />}
        />
        <Route
          path='group'
          element={<AdminGroup />}
        />
        <Route
          path=''
          element={<Navigate to='dashboard' />}
        />
      </Route>

      <Route
        path='/user'
        element={
          isAuthenticated && user.user.role !== roles[0] ? (
            <LayoutMain />
          ) : (
            <Navigate to='/' />
          )
        }
      >
        <Route
          path='requestDetails'
          element={<RequestDetail />}
        />
        <Route
          path='requestCreateAccountDetails'
          element={<RequestCreateAccountDetail />}
        />
        <Route
          path='dashboard'
          index
          element={<Dashboard />}
        />

        <Route
          path='request'
          element={<Request />}
        />
        <Route
          path='calendar'
          element={<Calendar />}
        />
        <Route
          path='group'
          element={<Group />}
        />
        <Route
          path='chat'
          element={<ChatHome />}
        />
        <Route
          path='task'
          element={<Task />}
        />
        <Route
          path='event'
          element={<Event />}
        />

        <Route
          path='create-request'
          element={<CreateRequest />}
        />
        <Route
          path='create-activity'
          element={<CreateActivity />}
        />
        <Route
          path='profile'
          element={<Profile />}
        />
        <Route
          path='budget-history'
          element={<BudgetHistory />}
        />
        <Route
          path=''
          element={<Navigate to='dashboard' />}
        />
      </Route>

      <Route
        path='*'
        element={<Navigate to='/' />}
      />
    </Routes>
  );
};

function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={null}
        persistor={persistor}
      >
        <ToastContainer />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;
