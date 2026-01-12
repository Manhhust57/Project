import { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Modal } from 'antd';
import api from '../api/axios';
import { CheckCircleOutlined, ToolOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import GenerateSlotsModal from '../components/GenerateSlotsModal';

export default function OwnerFields() {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

    const loadFields = async () => {
        try {
            setLoading(true);
            const res = await api.get('/owner/fields');
            setFields(res.data);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi tải danh sách sân');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFields();
    }, []);

    const handleUpdateStatus = async (fieldId: number, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';

        Modal.confirm({
            title: 'Xác nhận thay đổi trạng thái',
            content: `Chuyển sân sang trạng thái ${newStatus === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'}?`,
            onOk: async () => {
                try {
                    await api.patch(`/owner/fields/${fieldId}/status`, { status: newStatus });
                    message.success('Cập nhật thành công');
                    loadFields();
                } catch (error: any) {
                    message.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
                }
            },
        });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: 'Tên sân',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Loại sân',
            dataIndex: 'type',
            key: 'type',
            render: (type: number) => `Sân ${type} người`,
        },
        {
            title: 'Vị trí',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Giờ mở - đóng',
            key: 'time',
            render: (record: any) => `${record.openTime} - ${record.closeTime}`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'orange'}>
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Bảo trì'}
                </Tag>
            ),
        },
        {
            title: 'Số slot',
            key: 'slots',
            render: (record: any) => record._count?.slots || 0,
        },
        {
            title: 'Booking hiện tại',
            key: 'bookings',
            render: (record: any) => record._count?.bookings || 0,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (record: any) => (
                <Space>
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => setSelectedFieldId(record.id)}
                    >
                        Tạo slots
                    </Button>
                    <Button
                        size="small"
                        type={record.status === 'ACTIVE' ? 'default' : 'primary'}
                        icon={record.status === 'ACTIVE' ? <ToolOutlined /> : <CheckCircleOutlined />}
                        onClick={() => handleUpdateStatus(record.id, record.status)}
                    >
                        {record.status === 'ACTIVE' ? 'Bảo trì' : 'Mở lại'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Quản lý sân của tôi</h2>
                <Button icon={<ReloadOutlined />} onClick={loadFields}>
                    Làm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={fields}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {selectedFieldId && (
                <GenerateSlotsModal
                    fieldId={selectedFieldId}
                    open={!!selectedFieldId}
                    onClose={() => setSelectedFieldId(null)}
                    onSuccess={loadFields}
                />
            )}
        </div>
    );
}
