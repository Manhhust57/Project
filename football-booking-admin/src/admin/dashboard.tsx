import { Card, Col, Row, Statistic, Table, Tag, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AdminDashboard() {
    const [summary, setSummary] = useState<any>({});
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [s, b] = await Promise.all([
            axios.get('/admin/dashboard/summary'),
            axios.get('/admin/dashboard/recent-bookings'),
        ]);
        setSummary(s.data);
        setBookings(b.data);
    };

    const confirmBooking = async (id: number) => {
        await axios.post(`/bookings/${id}/confirm`);
        message.success('Đã xác nhận booking');
        loadData();
    };

    return (
        <>
            {/* KPI */}
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Booking hôm nay" value={summary.todayBookings} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Chờ xác nhận" value={summary.pendingBookings} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng sân" value={summary.totalFields} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Huỷ hôm nay" value={summary.todayCancelled} />
                    </Card>
                </Col>
            </Row>

            {/* Booking table */}
            <Card title="Booking gần nhất" style={{ marginTop: 24 }}>
                <Table
                    rowKey="id"
                    dataSource={bookings}
                    pagination={false}
                    columns={[
                        {
                            title: 'Sân',
                            render: (_, r) => r.field.name,
                        },
                        {
                            title: 'Giờ',
                            render: (_, r) =>
                                `${r.slot.startTime} - ${r.slot.endTime}`,
                        },
                        {
                            title: 'Trạng thái',
                            render: (_, r) => (
                                <Tag color={
                                    r.status === 'PENDING'
                                        ? 'orange'
                                        : r.status === 'CONFIRMED'
                                            ? 'green'
                                            : 'default'
                                }>
                                    {r.status}
                                </Tag>
                            ),
                        },
                        {
                            title: 'Người đặt',
                            render: (_, r) =>
                                r.guestName
                                    ? `${r.guestName} (${r.guestPhone})`
                                    : 'User',
                        },
                        {
                            title: 'Hành động',
                            render: (_, r) =>
                                r.status === 'PENDING' && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={() => confirmBooking(r.id)}
                                    >
                                        Xác nhận
                                    </Button>
                                ),
                        },
                    ]}
                />
            </Card>
        </>
    );
}
