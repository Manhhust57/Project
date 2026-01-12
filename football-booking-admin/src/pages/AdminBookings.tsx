import { DatePicker, Select, Table, Tag, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

export default function AdminBookings() {
    const [date, setDate] = useState(dayjs());
    const [fields, setFields] = useState<any[]>([]);
    const [fieldId, setFieldId] = useState<number>();
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        axios.get('/admin/fields').then(res => setFields(res.data));
    }, []);

    useEffect(() => {
        load();
    }, [date, fieldId]);

    const load = async () => {
        const res = await axios.get('/bookings/admin', {
            params: {
                date: date.format('YYYY-MM-DD'),
                fieldId,
            },
        });
        setData(res.data);
    };

    const confirmBooking = async (id: number) => {
        try {
            await axios.post(`/bookings/${id}/confirm`);
            message.success('Đã xác nhận booking');
            load();
        } catch (e: any) {
            message.error(
                e.response?.data?.message || 'Không thể xác nhận booking'
            );
        }
    };

    return (
        <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <DatePicker value={date} onChange={d => setDate(d!)} />

                <Select
                    allowClear
                    placeholder="Tất cả sân"
                    style={{ width: 200 }}
                    options={fields.map(f => ({ value: f.id, label: f.name }))}
                    onChange={setFieldId}
                />
            </div>

            <Table
                rowKey="id"
                dataSource={data}
                pagination={false}
                columns={[
                    {
                        title: 'Khách',
                        dataIndex: ['user', 'phone'],
                        render: (_, r) => r.user?.phone || r.guestPhone || 'Ẩn danh',
                    },
                    {
                        title: 'Sân',
                        dataIndex: ['field', 'name'],
                    },
                    {
                        title: 'Giờ',
                        render: (_, r) =>
                            `${r.slot.startTime} - ${r.slot.endTime}`,
                    },
                    {
                        title: 'Trạng thái',
                        dataIndex: 'status',
                        render: (status: string) => (
                            <Tag color={
                                status === 'PENDING' ? 'orange' :
                                    status === 'CONFIRMED' ? 'green' : 'default'
                            }>
                                {status}
                            </Tag>
                        ),
                    },
                    {
                        title: 'Hành động',
                        render: (_, booking) => (
                            booking.status === 'PENDING' && (
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={() => confirmBooking(booking.id)}
                                >
                                    Xác nhận
                                </Button>
                            )
                        ),
                    },
                ]}
            />
        </>
    );
}
