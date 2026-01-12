import { Cron } from '@nestjs/schedule';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prismanpx/prismanpx.service';
import { BookingsGateway } from './bookings.gateway';

@Injectable()
export class BookingCleanupJob {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => BookingsGateway))
        private gateway: BookingsGateway,
    ) { }

    // chạy mỗi phút
    @Cron('*/1 * * * *')
    async cancelExpiredBookings() {
        const now = new Date();

        const expiredBookings = await this.prisma.booking.findMany({
            where: {
                status: 'PENDING',
                expiresAt: { lt: now },
            },
            select: { id: true },
        });

        if (expiredBookings.length > 0) {
            await this.prisma.booking.updateMany({
                where: {
                    status: 'PENDING',
                    expiresAt: { lt: now },
                },
                data: {
                    status: 'CANCELLED',
                },
            });

            // Emit realtime cho từng booking expired
            expiredBookings.forEach((b) => {
                this.gateway.notifyBookingExpired(b.id);
            });
        }
    }
}
