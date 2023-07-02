import ReactDOM from 'react-dom/client';
import './styles/index.scss';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Room from './pages/Room';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Toasts from './components/Toasts';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/room/:id',
    element: <Room />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    <Toasts />
    <RouterProvider router={router} />
  </Provider>
);
