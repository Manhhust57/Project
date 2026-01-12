import { Injectable, Query, Req } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prismanpx/prismanpx.service';
//Admin dashboard service
@Injectable()
export class DashboardService {

    constructor(private prisma: PrismaService) { }

    async getTodayStats() {
        const today = new Date().toISOString().slice(0, 10);

        const bookings = await this.prisma.booking.findMany({
            where: { date: new Date(today) },
            include: { slot: true },
        });

        const totalBooking = bookings.length;
        const revenue = bookings.reduce((s, b) => s + b.slot.price, 0);

        return {
            totalBooking,
            revenue,
        };
    }
    async summary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [
            todayBookings,
            pendingBookings,
            totalFields,
            todayCancelled,
        ] = await Promise.all([
            this.prisma.booking.count({
                where: {
                    createdAt: { gte: today, lt: tomorrow },
                },
            }),
            this.prisma.booking.count({
                where: { status: 'PENDING' },
            }),
            this.prisma.field.count(),
            this.prisma.booking.count({
                where: {
                    status: 'CANCELLED',
                    createdAt: { gte: today, lt: tomorrow },
                },
            }),
        ]);

        return {
            todayBookings,
            pendingBookings,
            totalFields,
            todayCancelled,
        };
    }
    async recentBookings() {
        return this.prisma.booking.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                field: true,
                slot: true,
            },
        });
    }


}
//Owner dashboard service
@Injectable()
export class OwnerDashboardService {
    constructor(private prisma: PrismaService) { }

    async getOwnerSummary(ownerId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const fields = await this.prisma.field.findMany({
            where: { ownerId },
            select: { id: true },
        });
        const fieldIds = fields.map(f => f.id);

        const [
            todayBookings,
            pendingBookings,
            totalFields,
        ] = await Promise.all([
            this.prisma.booking.count({
                where: {
                    fieldId: { in: fieldIds },
                    date: { gte: today, lt: tomorrow },
                },
            }),
            this.prisma.booking.count({
                where: {
                    fieldId: { in: fieldIds },
                    status: 'PENDING',
                },
            }),
            this.prisma.field.count({
                where: { ownerId },
            }),
        ]);

        return {
            todayBookings,
            pendingBookings,
            totalFields,
        };
    } async getRecentBookings(ownerId: number) {
        return this.prisma.booking.findMany({
            where: {
                field: {
                    ownerId,
                },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                field: true,
                slot: true,
            },
        });
    }
    async stats(ownerId: number, days = 10) {
        const range = Number(days);
        const formatDate = (d: Date) =>
            d.toLocaleDateString('sv-SE'); // YYYY-MM-DD


        const from = new Date();
        from.setHours(0, 0, 0, 0);
        from.setDate(from.getDate() - (range - 1));

        const to = new Date();
        to.setHours(23, 59, 59, 999);

        const fields = await this.prisma.field.findMany({
            where: { ownerId },
            select: { id: true },
        });

        const fieldIds = fields.map(f => f.id);

        const bookings = await this.prisma.booking.groupBy({
            by: ['date'],
            where: {
                fieldId: { in: fieldIds },
                date: {
                    gte: from,
                    lte: to,
                },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            _count: { _all: true },
            orderBy: { date: 'asc' },
        });

        const map = new Map<string, number>();
        bookings.forEach(b => {
            const key = formatDate(b.date);
            map.set(key, b._count._all);
        });

        const data: { date: string; count: number }[] = [];
        for (let i = 0; i < range; i++) {
            const d = new Date(from);
            d.setDate(from.getDate() + i);
            const key = formatDate(d);
            data.push({ date: key, count: map.get(key) ?? 0 });
        }

        return data;
    }


    // Revenue theo ngày
    async getRevenue(ownerId: number, days = 7) {
        const range = Number(days);
        const from = new Date();
        from.setHours(0, 0, 0, 0);
        from.setDate(from.getDate() - (range - 1));

        const fields = await this.prisma.field.findMany({
            where: { ownerId },
            select: { id: true },
        });
        const fieldIds = fields.map(f => f.id);

        const bookings = await this.prisma.booking.findMany({
            where: {
                fieldId: { in: fieldIds },
                date: { gte: from },
                status: 'CONFIRMED', // chỉ tính đã confirm
            },
            include: { slot: true },
        });

        // Group by date
        const map = new Map<string, number>();
        bookings.forEach(b => {
            const key = b.date.toISOString().slice(0, 10);
            map.set(key, (map.get(key) ?? 0) + b.slot.price);
        });

        const data: { date: string; revenue: number }[] = [];
        for (let i = 0; i < range; i++) {
            const d = new Date(from);
            d.setDate(from.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            data.push({ date: key, revenue: map.get(key) ?? 0 });
        }

        return data;
    }

    // Revenue hôm nay
    async getTodayRevenue(ownerId: number) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const fields = await this.prisma.field.findMany({
            where: { ownerId },
            select: { id: true },
        });
        const fieldIds = fields.map(f => f.id);

        const bookings = await this.prisma.booking.findMany({
            where: {
                fieldId: { in: fieldIds },
                date: { gte: today, lt: tomorrow },
                status: 'CONFIRMED',
            },
            include: { slot: true },
        });

        const revenue = bookings.reduce((sum, b) => sum + b.slot.price, 0);
        return { revenue };
    }

    // Export báo cáo Excel (trả về data để FE xử lý)
    async getReportData(ownerId: number, from: string, to: string) {
        const fields = await this.prisma.field.findMany({
            where: { ownerId },
            select: { id: true, name: true },
        });
        const fieldIds = fields.map(f => f.id);
        const fieldMap = new Map(fields.map(f => [f.id, f.name]));

        const bookings = await this.prisma.booking.findMany({
            where: {
                fieldId: { in: fieldIds },
                date: {
                    gte: new Date(from),
                    lte: new Date(to),
                },
            },
            include: {
                slot: true,
                field: true,
            },
            orderBy: { date: 'asc' },
        });

        return bookings.map(b => ({
            date: b.date.toISOString().slice(0, 10),
            field: b.field.name,
            slot: `${b.slot.startTime} - ${b.slot.endTime}`,
            price: b.slot.price,
            status: b.status,
            guestName: b.guestName,
            guestPhone: b.guestPhone,
        }));
    }
}
