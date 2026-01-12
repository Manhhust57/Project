import { Button, DatePicker, Modal, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';
import dayjs from 'dayjs';

type Slot = {
    id: number;
    startTime: string;
    endTime: string;
};

export default function FieldBlockCalendar() {
    const [fields, setFields] = useState<any[]>([]);
    const [fieldId, setFieldId] = useState<number>();
    const [date, setDate] = useState(dayjs());
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selected, setSelected] = useState<Slot[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        axios.get('/admin/fields').then(res => setFields(res.data));
    }, []);

    const loadSlots = async () => {
        if (!fieldId) return;
        const res = await axios.get(`/fields/${fieldId}/available-slots`, {
            params: { date: date.format('YYYY-MM-DD') },
        });
        setSlots(res.data);
        setSelected([]);
    };

    const toggle = (slot: Slot) => {
        setSelected(prev =>
            prev.find(s => s.id === slot.id)
                ? prev.filter(s => s.id !== slot.id)
                : [...prev, slot]
        );
    };

    const block = async () => {
        if (!fieldId || selected.length === 0) return;

        const startTime = selected[0].startTime;
        const endTime = selected[selected.length - 1].endTime;

        await axios.post(`/admin/fields/${fieldId}/block`, {
            date: date.format('YYYY-MM-DD'),
            startTime,
            endTime,
            reason: 'Admin khóa sân',
        });

        message.success('Đã khóa sân');
        setOpen(false);
        loadSlots();
    };

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Chọn sân"
                    style={{ width: 200 }}
                    options={fields.map(f => ({ value: f.id, label: f.name }))}
                    onChange={setFieldId}
                />
                <DatePicker
                    style={{ marginLeft: 8 }}
                    value={date}
                    onChange={d => setDate(d!)}
                />
                <Button style={{ marginLeft: 8 }} onClick={loadSlots}>
                    Xem
                </Button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {slots.map(slot => {
                    const active = selected.find(s => s.id === slot.id);
                    return (
                        <Button
                            key={slot.id}
                            type={active ? 'primary' : 'default'}
                            onClick={() => toggle(slot)}
                        >
                            {slot.startTime} - {slot.endTime}
                        </Button>
                    );
                })}
            </div>

            <Button
                danger
                disabled={selected.length === 0}
                style={{ marginTop: 16 }}
                onClick={() => setOpen(true)}
            >
                Khóa sân
            </Button>

            <Modal
                open={open}
                onCancel={() => setOpen(false)}
                onOk={block}
                title="Xác nhận khóa sân"
            >
                <p>
                    Khóa từ <b>{selected[0]?.startTime}</b> đến{' '}
                    <b>{selected[selected.length - 1]?.endTime}</b>
                </p>
            </Modal>
        </>
    );
}
