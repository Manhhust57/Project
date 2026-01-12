
import { Button, Form, Input, message } from 'antd';
import axios from '../api/axios';
import { jwtDecode } from 'jwt-decode';
import Card from 'antd/es/card/Card';
import { Link } from 'react-router-dom';
import './Login.css';
export default function Login() {
    const onFinish = async (values: any) => {
        try {
            const res = await axios.post('/auth/login', values);
            const token = res.data.access_token;
            localStorage.setItem('token', token);

            const payload: any = jwtDecode(token);

            if (payload.role === 'ADMIN') window.location.href = '/admin/dashboard';
            else if (payload.role === 'OWNER') window.location.href = '/owner/dashboard';
            else window.location.href = '/booking';
        } catch (e: any) {
            message.error(e.response?.data?.message || 'Số điện thoại hoặc mật khẩu không đúng');
        }
    };


    return (
        <div className="auth-page">
            <Card className="auth-card">
                <h2>Đăng nhập</h2>

                <Form onFinish={onFinish}>
                    <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                        <Input
                            placeholder="Số điện thoại"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
                        <Input.Password
                            placeholder="Mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Button htmlType="submit" type="primary" size="large" block>
                        Đăng nhập
                    </Button>
                </Form>

                <div className="auth-footer">
                    Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
                </div>
            </Card>
        </div>
    );
}
