import {
    BadRequestException,
    Injectable,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PrismaService } from 'src/prisma/prismanpx/prismanpx.service';
import { BookingsGateway } from './bookings.gateway';

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => BookingsGateway))
        private gateway: BookingsGateway,
    ) { }

    async create(userId: number | null, dto: CreateBookingDto) {
        const date = new Date(dto.date);

        // 1. Check slot tồn tại
        const slot = await this.prisma.fieldSlot.findUnique({
            where: { id: dto.slotId },
        });
        if (!slot || slot.fieldId !== dto.fieldId) {
            throw new BadRequestException('Invalid slot');
        }

        // 2. Check block
        const blocked = await this.prisma.fieldBlock.findFirst({
            where: {
                fieldId: dto.fieldId,
                date,
                startTime: { lt: slot.endTime },
                endTime: { gt: slot.startTime },
            },
        });
        if (blocked) {
            throw new BadRequestException('Slot is blocked');
        }
        const EXPIRE_MINUTES = 5;
        const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60_000);
        // 3. Tạo booking (DB unique xử lý trùng)
        try {
            const booking = await this.prisma.booking.create({
                data: {
                    userId: userId ?? undefined,
                    fieldId: dto.fieldId,
                    slotId: dto.slotId,
                    guestName: dto.guestName,
                    guestPhone: dto.guestPhone,
                    date,
                    status: 'PENDING',
                    expiresAt,
                },
                include: {
                    field: true,
                    slot: true,
                    user: true,
                },
            });

            // Emit realtime event
            this.gateway.notifyNewBooking(booking);

            return booking;
        } catch (e) {
            // Prisma unique constraint
            throw new BadRequestException('Slot already booked');
        }
    }

    getMyBookings(userId: number) {
        return this.prisma.booking.findMany({
            where: { userId },
            include: {
                field: true,
                slot: true,
            },
            orderBy: { date: 'desc' },
        });
    }

    cancel(userId: number, bookingId: number) {
        return this.prisma.booking.updateMany({
            where: {
                id: bookingId,
                userId,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            data: {
                status: 'CANCELLED',
            },
        });
    }

    getBookingsByDate(date: string, fieldId?: number) {
        return this.prisma.booking.findMany({
            where: {
                date: new Date(date),
                ...(fieldId && { fieldId }),
            },
            include: {
                user: true,
                field: true,
                slot: true,
            },
            orderBy: {
                slot: { startTime: 'asc' },
            },
        });
    }
    async getOwnerBookings(ownerId: number, date?: string) {
        return this.prisma.booking.findMany({
            where: {
                field: {
                    ownerId: ownerId, // 🔥 QUAN TRỌNG NHẤT
                },
                ...(date && { date: new Date(date) }),
            },
            include: {
                field: true,
                slot: true,
                user: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async confirm(id: number) {
        const booking = await this.prisma.booking.findUnique({
            where: { id },
        });

        if (!booking) {
            throw new BadRequestException('Booking not found');
        }

        if (booking.status !== 'PENDING') {
            throw new BadRequestException('Booking cannot be confirmed');
        }

        // nếu đã quá hạn thì không cho confirm
        if (booking.expiresAt < new Date()) {
            throw new BadRequestException('Booking expired');
        }

        const updated = await this.prisma.booking.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
            },
            include: {
                field: true,
                slot: true,
                user: true,
            },
        });

        // Emit realtime event
        this.gateway.notifyBookingUpdate(updated);

        return updated;
    }

}
