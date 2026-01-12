import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Fields from './pages/Fields';
import FieldBlockCalendar from './pages/FieldBlockCalendar';
import AdminBookings from './pages/AdminBookings';
import OwnerBookings from './pages/OwnerBookings';
import UserBooking from './pages/UserBooking';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import Home from './pages/Home';
import AppLayout from './layout/AppLayout';
import Register from './pages/Register';
import RequireAuth from './guards/RequireAuth';
import OwnerLayout from './layout/OwnerLayout';
import AdminLayout from './layout/AdminLayout';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerFields from './pages/OwnerFields';
import OwnerFieldBlocks from './pages/OwnerFieldBlocks';
import OwnerReports from './pages/OwnerReports';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            { index: true, element: <Home /> },
            {
                path: 'booking',
                element: <UserBooking />,
            },
            {
                path: 'fields',
                element: (
                    <RequireAuth roles={['USER']}>
                        <Fields />
                    </RequireAuth>
                ),
            },
            {
                path: 'block',
                element: (
                    <RequireAuth roles={['USER']}>
                        <FieldBlockCalendar />
                    </RequireAuth>
                ),
            },
            {
                path: 'me/bookings',
                element: (
                    <RequireAuth roles={['USER']}>
                        <MyBookings />
                    </RequireAuth>
                ),
            },
        ],
    },

    // OWNER routes
    {
        path: '/owner',
        element: (
            <RequireAuth roles={['OWNER']}>
                <OwnerLayout />
            </RequireAuth>
        ),
        children: [
            { path: 'dashboard', element: <OwnerDashboard /> },
            { path: 'bookings', element: <OwnerBookings /> },
            { path: 'fields', element: <OwnerFields /> },
            { path: 'blocks', element: <OwnerFieldBlocks /> },
            { path: 'reports', element: <OwnerReports /> },
        ],
    },

    // ADMIN routes
    {
        path: '/admin',
        element: (
            <RequireAuth roles={['ADMIN']}>
                <AdminLayout />
            </RequireAuth>
        ),
        children: [
            { path: 'dashboard', element: <AdminDashboard /> },
            { path: 'bookings', element: <AdminBookings /> },
        ],
    },

    // pages KHÔNG có header
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
]);

