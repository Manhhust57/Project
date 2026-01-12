// layout/AppLayout.tsx
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

const { Header, Content } = Layout;

export default function AppLayout() {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#1677ff' }}>
                <AppHeader />
            </Header>

            <Content
                style={{
                    margin: '0',
                    paddingTop: 0,
                }}
            >
                <Outlet />
            </Content>
        </Layout>
    );
}
