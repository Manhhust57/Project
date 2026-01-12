import { Card, Tag, Button, message, Space, Empty } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

export default function MyBookings() {
    const [data, setData] = useState<any[]>([]);

    const load = async () => {
        const res = await axios.get('/bookings/me');
        setData(res.data);
    };

    useEffect(() => {
        load();
    }, []);

    const cancel = async (id: number) => {
        try {
            await axios.post(`/bookings/${id}/cancel`);
            message.success('Đã huỷ booking');
            load();
        } catch (e: any) {
            message.error(
                e.response?.data?.message || 'Không thể huỷ booking'
            );
        }
    };

    if (data.length === 0) {
        return (
            <div style={{ padding: 24 }}>
                <Empty description="Bạn chưa có booking nào" />
            </div>
        );
    }

    return (
        <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ marginBottom: 16 }}>Lịch sử booking của tôi</h2>

            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {data.map((booking) => {
                    const startTime = dayjs(
                        `${dayjs(booking.date).format('YYYY-MM-DD')} ${booking.slot.startTime}`
                    );

                    const canCancel =
                        ['PENDING', 'CONFIRMED'].includes(booking.status) &&
                        startTime.diff(dayjs(), 'minute') > 30;

                    return (
                        <Card
                            key={booking.id}
                            size="small"
                            style={{
                                borderLeft: `4px solid ${booking.status === 'CONFIRMED' ? '#52c41a' :
                                        booking.status === 'PENDING' ? '#faad14' : '#d9d9d9'
                                    }`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                                        {booking.field.name}
                                    </div>

                                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                                        📅 {dayjs(booking.date).format('DD/MM/YYYY')}
                                    </div>

                                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                                        ⏰ {booking.slot.startTime} - {booking.slot.endTime}
                                    </div>

                                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                                        💰 {booking.slot.price.toLocaleString()}đ
                                    </div>

                                    <div>
                                        {booking.status === 'CONFIRMED' && <Tag color="green">Đã xác nhận</Tag>}
                                        {booking.status === 'CANCELLED' && <Tag color="red">Đã huỷ</Tag>}
                                        {booking.status === 'PENDING' && <Tag color="orange">Chờ xác nhận</Tag>}
                                    </div>
                                </div>

                                <div>
                                    {canCancel && (
                                        <Button
                                            danger
                                            size="small"
                                            onClick={() => cancel(booking.id)}
                                        >
                                            Huỷ booking
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </Space>
        </div>
    );
}
