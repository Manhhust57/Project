import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, CalendarOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

export default function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 18, marginRight: 32, whiteSpace: 'nowrap' }}>
                        ADMIN PANEL
                    </div>

                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectable={false}
                        style={{ flex: 1, minWidth: 0 }}
                        items={[
                            {
                                key: 'dashboard',
                                label: 'Dashboard',
                                icon: <DashboardOutlined />,
                                onClick: () => navigate('/admin/dashboard'),
                            },
                            {
                                key: 'bookings',
                                label: 'Bookings',
                                icon: <CalendarOutlined />,
                                onClick: () => navigate('/admin/bookings'),
                            },
                        ]}
                    />
                </div>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectable={false}
                    style={{ minWidth: 'auto' }}
                    items={[
                        {
                            key: 'logout',
                            label: 'Đăng xuất',
                            icon: <LogoutOutlined />,
                            onClick: handleLogout,
                        },
                    ]}
                />
            </Header>

            <Content style={{ padding: 0 }}>
                <Outlet />
            </Content>
        </Layout>
    );
}
