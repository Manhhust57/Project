import { Table, Button } from 'antd';
import { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function Fields() {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get('/admin/fields').then(res => setData(res.data));
    }, []);

    return (
        <>
            <Button type="primary" style={{ marginBottom: 16 }}>
                Thêm sân
            </Button>
            <Table
                rowKey="id"
                dataSource={data}
                columns={[
                    { title: 'Tên sân', dataIndex: 'name' },
                    { title: 'Loại', dataIndex: 'type' },
                    { title: 'Giờ mở', dataIndex: 'openTime' },
                    { title: 'Giờ đóng', dataIndex: 'closeTime' },
                ]}
            />
        </>
    );
}
