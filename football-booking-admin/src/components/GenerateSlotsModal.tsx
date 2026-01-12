import { useState } from 'react';
import { Modal, Form, InputNumber, TimePicker, Button, message, Switch } from 'antd';
import api from '../api/axios';
import dayjs from 'dayjs';

interface GenerateSlotsModalProps {
    fieldId: number;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function GenerateSlotsModal({ fieldId, open, onClose, onSuccess }: GenerateSlotsModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [hasPeak, setHasPeak] = useState(false);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            const payload: any = {
                duration: values.duration,
                normalPrice: values.normalPrice,
            };

            if (hasPeak && values.peakPrice && values.peakStartTime && values.peakEndTime) {
                payload.peakPrice = values.peakPrice;
                payload.peakStartTime = values.peakStartTime.format('HH:mm');
                payload.peakEndTime = values.peakEndTime.format('HH:mm');
            }

            await api.post(`/admin/fields/${fieldId}/slots/generate`, payload);
            message.success('Tạo slots thành công!');
            form.resetFields();
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi tạo slots');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Generate Slots cho sân"
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    duration: 90,
                    normalPrice: 200000,
                    peakPrice: 300000,
                    peakStartTime: dayjs('17:00', 'HH:mm'),
                    peakEndTime: dayjs('22:00', 'HH:mm'),
                }}
            >
                <Form.Item
                    name="duration"
                    label="Thời lượng mỗi slot (phút)"
                    rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
                >
                    <InputNumber
                        min={30}
                        step={30}
                        style={{ width: '100%' }}
                        placeholder="60, 90, 120..."
                    />
                </Form.Item>

                <Form.Item
                    name="normalPrice"
                    label="Giá giờ thường (VNĐ)"
                    rules={[{ required: true, message: 'Vui lòng nhập giá giờ thường' }]}
                >
                    <InputNumber
                        min={0}
                        step={10000}
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                </Form.Item>

                <Form.Item label="Có giờ cao điểm?">
                    <Switch checked={hasPeak} onChange={setHasPeak} />
                </Form.Item>

                {hasPeak && (
                    <>
                        <Form.Item
                            name="peakPrice"
                            label="Giá giờ cao điểm (VNĐ)"
                            rules={[{ required: hasPeak, message: 'Vui lòng nhập giá giờ cao điểm' }]}
                        >
                            <InputNumber
                                min={0}
                                step={10000}
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="peakStartTime"
                            label="Giờ bắt đầu cao điểm"
                            rules={[{ required: hasPeak, message: 'Vui lòng chọn giờ bắt đầu' }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="peakEndTime"
                            label="Giờ kết thúc cao điểm"
                            rules={[{ required: hasPeak, message: 'Vui lòng chọn giờ kết thúc' }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </>
                )}

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Tạo Slots
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
}
