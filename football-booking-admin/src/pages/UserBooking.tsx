import { Button, DatePicker, Select, message, Modal, Input } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';
import './booking.css';

type Slot = {
    id: number;
    startTime: string;
    endTime: string;
    price: number;
};

export default function UserBooking() {
    const [fields, setFields] = useState<any[]>([]);
    const [fieldId, setFieldId] = useState<number>();
    const [date, setDate] = useState(dayjs());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selected, setSelected] = useState<Slot>();

    const [open, setOpen] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [bookingSummary, setBookingSummary] = useState<any>(null);

    useEffect(() => {
        axios.get('/fields').then(res => setFields(res.data));
    }, []);

    useEffect(() => {
        if (selected) {
            document
                .querySelector('.booking-action')
                ?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selected]);

    const loadSlots = async () => {
        if (!fieldId) return;
        const res = await axios.get(
            `/fields/${fieldId}/available-slots`,
            { params: { date: date.format('YYYY-MM-DD') } }
        );
        setSlots(res.data);
        setSelected(undefined);
    };
    const [submitting, setSubmitting] = useState(false);
    const submitBooking = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            await axios.post('/bookings', {
                fieldId,
                slotId: selected?.id,
                date: date.format('YYYY-MM-DD'),
                guestName,
                guestPhone,
            });

            setBookingSummary({
                field: fields.find(f => f.id === fieldId)?.name,
                date: date.format('DD/MM/YYYY'),
                time: `${selected?.startTime} - ${selected?.endTime}`,
                price: selected?.price,
                guestName,
                guestPhone,
            });

            setOpen(false);
            setConfirmOpen(true);
            loadSlots();
        } finally {
            setSubmitting(false);
        }
    };

    const handleClickBook = () => {
        if (!fieldId) {
            message.warning('Vui lòng chọn sân');
            return;
        }

        if (!selected) {
            message.warning('Vui lòng chọn khung giờ');
            return;
        }

        setOpen(true);
    };

    return (
        <div className="booking-page" style={{
            padding: '16px',
            maxWidth: 1200,
            margin: '0 auto'
        }}>
            <Modal
                open={confirmOpen}
                footer={null}
                onCancel={() => setConfirmOpen(false)}
                title="✅ Đặt sân thành công"
            >
                <div style={{ lineHeight: 1.8 }}>
                    <p><b>Sân:</b> {bookingSummary?.field}</p>
                    <p><b>Ngày:</b> {bookingSummary?.date}</p>
                    <p><b>Khung giờ:</b> {bookingSummary?.time}</p>
                    <p><b>Giá:</b> {bookingSummary?.price?.toLocaleString()}đ</p>

                    <hr />

                    <p><b>Người đặt:</b> {bookingSummary?.guestName}</p>
                    <p><b>SĐT:</b> {bookingSummary?.guestPhone}</p>
                </div>

                <Button
                    type="primary"
                    block
                    style={{ marginTop: 16 }}
                    onClick={() => setConfirmOpen(false)}
                >
                    Đóng
                </Button>
            </Modal>

            <Modal
                open={open}
                title="Thông tin người đặt sân"
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <Input
                    placeholder="Tên người đặt"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    style={{ marginBottom: 12 }}
                />

                <Input
                    placeholder="Số điện thoại"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    style={{ marginBottom: 16 }}
                />

                <Button
                    type="primary"
                    block
                    loading={submitting}
                    onClick={submitBooking}
                    disabled={!selected || !guestName || !guestPhone}
                >
                    Thanh toán
                </Button>
            </Modal>

            <div className="booking-field" style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Chọn sân"
                    style={{ width: '100%', maxWidth: 300 }}
                    size="large"
                    options={fields.map(f => ({ value: f.id, label: f.name }))}
                    onChange={setFieldId}
                />
            </div>

            <div className="booking-date" style={{
                marginBottom: 24,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap'
            }}>
                <DatePicker
                    value={date}
                    onChange={d => setDate(d!)}
                    size="large"
                    style={{ flex: '1 1 auto', minWidth: 200 }}
                />
                <Button
                    onClick={loadSlots}
                    size="large"
                    type="primary"
                    style={{ minWidth: 120 }}
                >
                    Xem slot
                </Button>
            </div>

            {!fieldId && (
                <div style={{ marginTop: 24, color: '#888' }}>
                    Vui lòng chọn sân để xem khung giờ trống
                </div>
            )}

            {fieldId && slots.length === 0 && (
                <div style={{ marginTop: 24 }}>
                    Vui lòng chọn ngày để xem khung giờ trống
                </div>
            )}

            <div className="booking-slots" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12,
                marginBottom: 24
            }}>
                {slots.map(slot => {
                    const isPast = dayjs(`${date.format('YYYY-MM-DD')} ${slot.startTime}`)
                        .isBefore(dayjs());

                    const disabled = isPast;
                    const active = selected?.id === slot.id;

                    return (
                        <Button
                            key={slot.id}
                            disabled={disabled}
                            type={active ? 'primary' : 'default'}
                            onClick={() => setSelected(slot)}
                            size="large"
                            style={{
                                opacity: disabled ? 0.4 : 1,
                                height: 'auto',
                                whiteSpace: 'normal',
                                padding: '12px 8px',
                                fontSize: 14
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                    {slot.startTime} - {slot.endTime}
                                </div>
                                <div style={{ fontSize: 13 }}>
                                    {slot.price.toLocaleString()}đ
                                </div>
                                {isPast && (
                                    <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 4 }}>
                                        ⛔ Quá giờ
                                    </div>
                                )}
                            </div>
                        </Button>
                    );
                })}
            </div>

            <div className="booking-action" style={{
                position: 'sticky',
                bottom: 0,
                background: '#fff',
                padding: '16px 0',
                borderTop: '1px solid #f0f0f0',
                marginTop: 24
            }}>
                <Button
                    type="primary"
                    disabled={!selected}
                    onClick={handleClickBook}
                    size="large"
                    block
                    style={{ maxWidth: 400, margin: '0 auto', display: 'block' }}
                >
                    {selected ? `Đặt sân - ${selected.price.toLocaleString()}đ` : 'Chọn khung giờ để đặt sân'}
                </Button>
            </div>
        </div>
    );
}
