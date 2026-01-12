import { Button, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const nav = useNavigate();

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundImage: `url('https://www.pixelstalk.net/wp-content/uploads/images5/Cool-Sports-Wallpaper.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100%',
                padding: '16px',
            }}
        >
            {/* HERO */}
            <div className="hero" style={{
                background: 'rgba(255,255,255,0.92)',
                padding: '24px',
                borderRadius: 16,
                maxWidth: 600,
                margin: '0 auto',
                marginTop: 0,
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', marginBottom: 16 }}>
                    ⚽ Đặt sân bóng nhanh chóng & tiện lợi
                </h1>
                <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', marginBottom: 24 }}>
                    Chọn sân – chọn giờ – đặt ngay trong 30 giây
                </p>

                <Button
                    type="primary"
                    size="large"
                    onClick={() => nav('/booking')}
                    style={{ height: 48, fontSize: 16, minWidth: 200 }}
                >
                    Đặt sân ngay
                </Button>
            </div>

            {/* FEATURES */}
            <Row gutter={[16, 16]} style={{ marginTop: 32, maxWidth: 1200, margin: '32px auto 0' }}>
                <Col xs={24} sm={24} md={8}>
                    <Card style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        height: '100%'
                    }}>
                        <h3 style={{ fontSize: 20 }}>⏱ Nhanh chóng</h3>
                        <p>Không gọi điện, xem slot trống theo thời gian thực</p>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <Card style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        height: '100%'
                    }}>
                        <h3 style={{ fontSize: 20 }}>📅 Chủ động</h3>
                        <p>Chọn ngày, chọn giờ, xem lịch rõ ràng</p>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <Card style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        height: '100%'
                    }}>
                        <h3 style={{ fontSize: 20 }}>🔐 An toàn</h3>
                        <p>Quản lý booking minh bạch, có lịch sử</p>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
