import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardOutlined, CalendarOutlined, FieldTimeOutlined, LockOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

export default function OwnerLayout() {
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
                        <a href="/">OWNER PANEL</a>
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
                                onClick: () => navigate('/owner/dashboard'),
                            },
                            {
                                key: 'bookings',
                                label: 'Booking',
                                icon: <CalendarOutlined />,
                                onClick: () => navigate('/owner/bookings'),
                            },
                            {
                                key: 'fields',
                                label: 'Sân',
                                icon: <FieldTimeOutlined />,
                                onClick: () => navigate('/owner/fields'),
                            },
                            {
                                key: 'blocks',
                                label: 'Block',
                                icon: <LockOutlined />,
                                onClick: () => navigate('/owner/blocks'),
                            },
                            {
                                key: 'reports',
                                label: 'Báo cáo',
                                icon: <FileTextOutlined />,
                                onClick: () => navigate('/owner/reports'),
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
