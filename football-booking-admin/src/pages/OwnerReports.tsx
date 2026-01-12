import { useState } from 'react';
import { Card, DatePicker, Button, Table, Space, message, Statistic, Row, Col } from 'antd';
import { FileExcelOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import api from '../api/axios';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

export default function OwnerReports() {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(7, 'day'),
        dayjs(),
    ]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ total: 0, confirmed: 0, revenue: 0 });

    const loadReport = async () => {
        try {
            setLoading(true);
            const [from, to] = dateRange;
            const res = await api.get('/owner/dashboard/report', {
                params: {
                    from: from.format('YYYY-MM-DD'),
                    to: to.format('YYYY-MM-DD'),
                },
            });
            setReportData(res.data);

            // Tính tổng
            const total = res.data.length;
            const confirmed = res.data.filter((d: any) => d.status === 'CONFIRMED').length;
            const revenue = res.data
                .filter((d: any) => d.status === 'CONFIRMED')
                .reduce((sum: number, d: any) => sum + d.price, 0);

            setSummary({ total, confirmed, revenue });
        } catch (error: any) {
            message.error('Lỗi tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const exportExcel = () => {
        if (reportData.length === 0) {
            message.warning('Không có dữ liệu để export');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(
            reportData.map((item, idx) => ({
                STT: idx + 1,
                'Ngày': item.date,
                'Sân': item.field,
                'Khung giờ': item.slot,
                'Giá': item.price,
                'Trạng thái': item.status,
                'Tên khách': item.guestName || '',
                'SĐT': item.guestPhone || '',
            }))
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo');

        const fileName = `BaoCao_${dateRange[0].format('DDMMYYYY')}_${dateRange[1].format('DDMMYYYY')}.xlsx`;
        XLSX.writeFile(wb, fileName);
        message.success('Export thành công');
    };

    const columns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            width: 120,
        },
        {
            title: 'Sân',
            dataIndex: 'field',
            key: 'field',
        },
        {
            title: 'Khung giờ',
            dataIndex: 'slot',
            key: 'slot',
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => price.toLocaleString() + ' đ',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const color = status === 'CONFIRMED' ? 'green' : status === 'PENDING' ? 'orange' : 'red';
                return <span style={{ color }}>{status}</span>;
            },
        },
        {
            title: 'Tên khách',
            dataIndex: 'guestName',
            key: 'guestName',
        },
        {
            title: 'SĐT',
            dataIndex: 'guestPhone',
            key: 'guestPhone',
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Báo cáo & Export</h2>

            <Card style={{ marginBottom: 16 }}>
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates: any) => dates && setDateRange(dates)}
                        format="DD/MM/YYYY"
                    />
                    <Button type="primary" onClick={loadReport} loading={loading}>
                        Xem báo cáo
                    </Button>
                    <Button
                        icon={<FileExcelOutlined />}
                        onClick={exportExcel}
                        disabled={reportData.length === 0}
                    >
                        Export Excel
                    </Button>
                </Space>
            </Card>

            {reportData.length > 0 && (
                <>
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                        <Col span={8}>
                            <Card>
                                <Statistic title="Tổng booking" value={summary.total} />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic title="Đã xác nhận" value={summary.confirmed} valueStyle={{ color: '#3f8600' }} />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="Doanh thu"
                                    value={summary.revenue}
                                    suffix="đ"
                                    valueStyle={{ color: '#cf1322' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Table
                        columns={columns}
                        dataSource={reportData}
                        rowKey={(record, idx) => `${record.date}-${idx}`}
                        pagination={{ pageSize: 20 }}
                        loading={loading}
                    />
                </>
            )}
        </div>
    );
}
