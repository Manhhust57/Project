import { Column } from "@ant-design/charts";


export default function OwnerBookingChart({ data }: { data: any[] }) {
    const config = {
        data,
        xField: 'date',
        yField: 'count',
        height: 350,
        color: '#1677ff',
        xAxis: { label: { autoHide: true } },
        yAxis: { title: { text: 'Số booking' } },
    };
    return <Column {...config} />;
}
