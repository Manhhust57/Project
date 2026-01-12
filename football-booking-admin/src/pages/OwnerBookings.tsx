import { Calendar, Badge, Card, Tag, Button, message, ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import viVN from 'antd/locale/vi_VN';
import { io, Socket } from 'socket.io-client';

dayjs.locale('vi');

export default function OwnerBookings() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [bookings, setBookings] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        loadBookings();
        loadFields();

        // Kết nối WebSocket
        const newSocket = io('http://localhost:3000', {
            transports: ['websocket'],
        });

        setSocket(newSocket);

        // Lắng nghe sự kiện booking mới
        newSocket.on('booking:new', (booking: any) => {
            console.log('New booking:', booking);
            message.info(`Booking mới: ${booking.slot.startTime}-${booking.slot.endTime} - ${booking.field.name}`);
            loadBookings(); // Reload để cập nhật UI
        });

        // Lắng nghe sự kiện booking được confirm/cancel
        newSocket.on('booking:update', (booking: any) => {
            console.log('Booking updated:', booking);
            message.success(`Booking đã cập nhật: ${booking.slot.startTime}-${booking.slot.endTime}`);
            loadBookings();
        });

        // Lắng nghe sự kiện booking hết hạn
        newSocket.on('booking:expired', (bookingId: number) => {
            console.log('Booking expired:', bookingId);
            message.warning('Có booking hết hạn tự động hủy');
            loadBookings();
        });

        // Cleanup khi component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        loadBookings();
    }, [selectedDate]);

    const loadBookings = async () => {
        const res = await axios.get('/bookings/owner', {
            params: { date: selectedDate.format('YYYY-MM-DD') },
        });
        setBookings(res.data);
    };

    const loadFields = async () => {
        const res = await axios.get('/owner/fields');
        setFields(res.data);
    };

    const confirmBooking = async (id: number) => {
        try {
            await axios.post(`/bookings/${id}/confirm`);
            message.success('Đã xác nhận booking');
            loadBookings();
        } catch (e: any) {
            message.error(
                e.response?.data?.message || 'Không thể xác nhận booking'
            );
        }
    };

    // Group bookings by field
    const bookingsByField = fields.map(field => {
        const fieldBookings = bookings.filter(b => b.field.id === field.id);
        return {
            field,
            bookings: fieldBookings.sort((a, b) =>
                a.slot.startTime.localeCompare(b.slot.startTime)
            ),
        };
    });

    const getStatusColor = (status: string) => {
        if (status === 'PENDING') return 'orange';
        if (status === 'CONFIRMED') return 'green';
        return 'default';
    };
    const BADGE_STATUS_MAP: Record<string, any> = {
        CONFIRMED: 'success',
        PENDING: 'warning',
        CANCELLED: 'default',
    };

    const dateCellRender = (value: Dayjs) => {
        const isCurrentMonth = value.month() === selectedDate.month();


        const dateStr = value.format('YYYY-MM-DD');
        const dayBookings = bookings.filter(
            b => dayjs(b.date).format('YYYY-MM-DD') === dateStr
        );

        return (
            <div
                style={{
                    minHeight: 80,
                    padding: 4,
                    borderRadius: 6,
                    backgroundColor: isCurrentMonth ? '#d9e7ffff' : '#f5f5f5',
                    opacity: isCurrentMonth ? 1 : 0.45,
                }}
            >
                {dayBookings.map((booking, idx) => (
                    <div key={idx} style={{ fontSize: 11 }}>
                        <Badge style={{ fontSize: 11 }}
                            status={BADGE_STATUS_MAP[booking.status] || 'default'}
                            text={`${booking.slot.startTime}-${booking.slot.endTime}`}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <ConfigProvider locale={viVN}>
            <div style={{ padding: 24 }}>
                <h2>Lịch Booking</h2>

                <div style={{ marginBottom: 24 }}>
                    <Calendar
                        value={selectedDate}
                        onSelect={setSelectedDate}
                        dateCellRender={dateCellRender}

                    />
                </div>

                <Card title={`Booking ngày ${selectedDate.format('DD/MM/YYYY')}`}>
                    {bookings.length === 0 ? (
                        <p style={{ color: '#2a2a2aff', textAlign: 'center', padding: 32 }}>
                            Không có booking nào trong ngày này
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {bookingsByField.map(({ field, bookings: fieldBookings }) =>
                                fieldBookings.length > 0 && (
                                    <Card
                                        key={field.id}
                                        type="inner"
                                        title={`${field.name} (${field.type} người)`}
                                        size="small"
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
                                            {fieldBookings.map(booking => (
                                                <Card
                                                    key={booking.id}
                                                    size="small"
                                                    style={{
                                                        backgroundColor: `4px solid ${booking.status === 'CONFIRMED' ? '#52c41a' :
                                                            booking.status === 'PENDING' ? '#faad14' : '#d9d9d9'
                                                            }`
                                                    }}
                                                >
                                                    <div style={{ marginBottom: 8 }}>
                                                        <strong style={{ fontSize: 16 }}>
                                                            {booking.slot.startTime} - {booking.slot.endTime}
                                                        </strong>
                                                    </div>

                                                    <div style={{ marginBottom: 4 }}>
                                                        <Tag style={{
                                                            backgroundColor: `${booking.status === 'CONFIRMED' ? '#52c41a' :
                                                                booking.status === 'PENDING' ? '#faad14' : '#d9d9d9'
                                                                }`
                                                        }}>
                                                            {booking.status}
                                                        </Tag>
                                                    </div>

                                                    <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                                                        {booking.guestName || booking.user?.phone || 'Ẩn danh'}
                                                    </div>

                                                    {booking.guestPhone && (
                                                        <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                                                            {booking.guestPhone}
                                                        </div>
                                                    )}

                                                    <div style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                                                        {booking.slot.price.toLocaleString()} đ
                                                    </div>

                                                    {booking.status === 'PENDING' && (
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            block
                                                            onClick={() => confirmBooking(booking.id)}
                                                        >
                                                            Xác nhận
                                                        </Button>
                                                    )}
                                                </Card>
                                            ))}
                                        </div>
                                    </Card>
                                )
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </ConfigProvider>
    );
}
