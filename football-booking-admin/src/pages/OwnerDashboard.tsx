import { Card, Col, Row, Statistic, Table, Tag, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import OwnerBookingChart from '../components/OwnerBookingChart';


export default function OwnerDashboard() {
    const [summary, setSummary] = useState<any>({});
    const [bookings, setBookings] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [s, b, c] = await Promise.all([
            axios.get('/owner/dashboard/summary'),
            axios.get('/owner/dashboard/recent-bookings'),
            axios.get('/owner/dashboard/stats?days=10'),
        ]);
        setSummary(s.data);
        setBookings(b.data);
        setChartData(c.data);
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
                <Col span={8}>
                    <Card>
                        <Statistic title="Booking hôm nay" value={summary.todayBookings} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Chờ xác nhận" value={summary.pendingBookings} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Sân của tôi" value={summary.totalFields} />
                    </Card>
                </Col>
            </Row>

            <Card title="Booking 7 ngày gần nhất" style={{ marginTop: 24 }}>
                <OwnerBookingChart data={chartData} />
            </Card>
            {/* Table */}
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
