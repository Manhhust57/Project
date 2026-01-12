import { useEffect, useState } from 'react';
import { Calendar, Modal, Form, Input, Select, TimePicker, message, Button, List, Tag, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '../api/axios';
import { DeleteOutlined } from '@ant-design/icons';

export default function OwnerFieldBlocks() {
    const [fields, setFields] = useState<any[]>([]);
    const [selectedField, setSelectedField] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
    const [blocks, setBlocks] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    const loadFields = async () => {
        try {
            const res = await api.get('/owner/fields');
            setFields(res.data);
            if (res.data.length > 0 && !selectedField) {
                setSelectedField(res.data[0].id);
            }
        } catch (error: any) {
            message.error('Lỗi tải danh sách sân');
        }
    };

    const loadBlocks = async () => {
        if (!selectedField) return;
        try {
            const dateStr = selectedDate.format('YYYY-MM-DD');
            const res = await api.get(`/owner/fields/${selectedField}/blocks?date=${dateStr}`);
            setBlocks(res.data);
        } catch (error: any) {
            message.error('Lỗi tải danh sách block');
        }
    };

    useEffect(() => {
        loadFields();
    }, []);

    useEffect(() => {
        if (selectedField) {
            loadBlocks();
        }
    }, [selectedField, selectedDate]);

    const handleCreateBlock = async (values: any) => {
        try {
            const data = {
                date: selectedDate.format('YYYY-MM-DD'),
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
                reason: values.reason,
            };
            await api.post(`/owner/fields/${selectedField}/block`, data);
            message.success('Block sân thành công');
            setModalVisible(false);
            form.resetFields();
            loadBlocks();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi block sân');
        }
    };

    const handleDeleteBlock = async (blockId: number) => {
        Modal.confirm({
            title: 'Xác nhận xoá block',
            content: 'Bạn có chắc muốn mở lại khung giờ này?',
            onOk: async () => {
                try {
                    await api.delete(`/owner/fields/blocks/${blockId}`);
                    message.success('Đã mở lại khung giờ');
                    loadBlocks();
                } catch (error: any) {
                    message.error('Lỗi xoá block');
                }
            },
        });
    };

    return (
        <div style={{ padding: 24 }}>
            <h2>Quản lý Block sân</h2>

            <div style={{ marginBottom: 16 }}>
                <label>Chọn sân: </label>
                <Select
                    style={{ width: 300, marginLeft: 8 }}
                    value={selectedField}
                    onChange={setSelectedField}
                    options={fields.map(f => ({ label: f.name, value: f.id }))}
                />
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
                <div style={{ flex: 1 }}>
                    <Calendar
                        fullscreen={false}
                        value={selectedDate}
                        onSelect={setSelectedDate}
                    />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <h3>Block ngày {selectedDate.format('DD/MM/YYYY')}</h3>
                        <Button type="primary" onClick={() => setModalVisible(true)}>
                            + Block khung giờ
                        </Button>
                    </div>

                    {blocks.length === 0 ? (
                        <p style={{ color: '#999' }}>Không có block nào</p>
                    ) : (
                        <List
                            dataSource={blocks}
                            renderItem={(item: any) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleDeleteBlock(item.id)}
                                        >
                                            Xoá
                                        </Button>,
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Tag color="red">{item.startTime} - {item.endTime}</Tag>
                                            </Space>
                                        }
                                        description={item.reason || 'Không có lý do'}
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </div>

            <Modal
                title="Tạo Block mới"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateBlock}>
                    <Form.Item label="Ngày">
                        <Input value={selectedDate.format('DD/MM/YYYY')} disabled />
                    </Form.Item>

                    <Form.Item
                        name="startTime"
                        label="Giờ bắt đầu"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu' }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="Giờ kết thúc"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc' }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="reason" label="Lý do">
                        <Input.TextArea rows={3} placeholder="Bảo trì, sửa chữa..." />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Tạo Block
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
