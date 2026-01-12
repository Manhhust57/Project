import { Button, Space } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from '../utils/auth';

export default function AppHeader() {
    const nav = useNavigate();
    const { pathname } = useLocation();
    const auth = getAuth();

    const active = (path: string) =>
        pathname.startsWith(path)
            ? { fontWeight: 600, textDecoration: 'underline' }
            : {};

    const logout = () => {
        localStorage.removeItem('token');
        nav('/');
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: 64,
                paddingLeft: 24,
                paddingRight: 24,
            }}
        >
            <Link to="/" style={{ color: '#ffffffff', fontWeight: 600 }}>
                ⚽Sân Bóng
            </Link>

            <Space>
                {/* USER */}
                {auth?.role === 'USER' && (
                    <>
                        <Link to="/booking">
                            <Button type="link" style={{ color: '#fff', ...active('/booking') }}>
                                Đặt sân
                            </Button>
                        </Link>
                        <Link to="/me/bookings">
                            <Button type="link" style={{ color: '#fff', ...active('/me/bookings') }}>
                                Lịch sử
                            </Button>
                        </Link>
                    </>
                )}

                {/* OWNER */}
                {auth?.role === 'OWNER' && (
                    <Link to="/owner/bookings">
                        <Button type="link" style={{ color: '#fff', ...active('/owner') }}>
                            Booking sân
                        </Button>
                    </Link>
                )}

                {/* ADMIN */}
                {auth?.role === 'ADMIN' && (
                    <>
                        <Link to="/admin/dashboard">
                            <Button type="link" style={{ color: '#fff', ...active('/admin/dashboard') }}>
                                Dashboard
                            </Button>
                        </Link>
                        <Link to="/admin/bookings">
                            <Button type="link" style={{ color: '#fff', ...active('/admin/bookings') }}>
                                Bookings
                            </Button>
                        </Link>
                    </>
                )}

                {!auth ? (
                    <Link to="/login">
                        <Button>Đăng nhập</Button>
                    </Link>
                ) : (
                    <Button danger onClick={logout}>
                        Đăng xuất
                    </Button>
                )}
            </Space>
        </div>
    );
}
