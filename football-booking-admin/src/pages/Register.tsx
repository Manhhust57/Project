import { Button, Form, Input, message } from 'antd';
import axios from '../api/axios';
import Card from 'antd/es/card/Card';
import { Link } from 'react-router-dom';
import './Login.css';

export default function Register() {
    const onFinish = async (values: any) => {
        try {
            await axios.post('/auth/register', {
                phone: values.phone,
                password: values.password,
                name: values.name
            });
            message.success('Đăng ký thành công! Vui lòng đăng nhập');
            window.location.href = '/login';
        } catch (e: any) {
            message.error(e.response?.data?.message || 'Đăng ký thất bại');
        }
    };

    return (
        <div className="auth-page">
            <Card className="auth-card">
                <h2>Đăng ký</h2>

                <Form onFinish={onFinish}>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input
                            placeholder="Họ và tên"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số' }
                        ]}
                    >
                        <Input
                            placeholder="Số điện thoại"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password
                            placeholder="Mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Xác nhận mật khẩu"
                            size="large"
                        />
                    </Form.Item>

                    <Button htmlType="submit" type="primary" size="large" block>
                        Đăng ký
                    </Button>
                </Form>

                <div className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </Card>
        </div>
    );
}
