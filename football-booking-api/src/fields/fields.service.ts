import { Injectable } from '@nestjs/common';
import { CreateFieldDto } from './dto/create-field.dto';
import { PrismaService } from 'src/prisma/prismanpx/prismanpx.service';
import { timeToMinutes, minutesToTime } from '../common/time.util';
import { CreateBlockDto } from './dto/create-block.dto';
@Injectable()
export class FieldsService {
    constructor(private prisma: PrismaService) { }

    create(ownerId: number, dto: CreateFieldDto) {
        return this.prisma.field.create({
            data: {
                ...dto,
                ownerId,
            },
        });
    }

    findAll() {
        return this.prisma.field.findMany({
            include: { owner: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async generateSlots(
        fieldId: number,
        dto: {
            duration: number;
            normalPrice: number;
            peakPrice?: number;
            peakStartTime?: string;
            peakEndTime?: string;
        },
    ) {
        const field = await this.prisma.field.findUnique({
            where: { id: fieldId },
        });

        if (!field) throw new Error('Field not found');

        const open = timeToMinutes(field.openTime);
        const close = timeToMinutes(field.closeTime);

        // Parse peak time nếu có
        const peakStart = dto.peakStartTime ? timeToMinutes(dto.peakStartTime) : null;
        const peakEnd = dto.peakEndTime ? timeToMinutes(dto.peakEndTime) : null;

        const slots: {
            fieldId: number;
            startTime: string;
            endTime: string;
            price: number;
            isPeak: boolean;
        }[] = [];

        for (let t = open; t + dto.duration <= close; t += dto.duration) {
            const slotStartMinutes = t;

            // Kiểm tra slot có nằm trong giờ cao điểm không
            let isPeak = false;
            if (peakStart !== null && peakEnd !== null && dto.peakPrice) {
                isPeak = slotStartMinutes >= peakStart && slotStartMinutes < peakEnd;
            }

            slots.push({
                fieldId,
                startTime: minutesToTime(t),
                endTime: minutesToTime(t + dto.duration),
                price: isPeak ? dto.peakPrice! : dto.normalPrice,
                isPeak,
            });
        }

        return this.prisma.fieldSlot.createMany({
            data: slots,
            skipDuplicates: true, // chống sinh trùng
        });
    }
    async getAvailableSlots(fieldId: number, date: string) {
        const targetDate = new Date(date);

        // 1. Lấy tất cả slot của sân
        const slots = await this.prisma.fieldSlot.findMany({
            where: { fieldId },
            orderBy: { startTime: 'asc' },
        });

        // 2. Lấy booking trong ngày
        const bookings = await this.prisma.booking.findMany({
            where: {
                fieldId,
                date: targetDate,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: { slotId: true },
        });

        const bookedSlotIds = bookings.map(b => b.slotId);

        // 3. Lấy block trong ngày
        const blocks = await this.prisma.fieldBlock.findMany({
            where: {
                fieldId,
                date: targetDate,
            },
        });

        // 4. Lọc slot trống
        const availableSlots = slots.filter(slot => {
            // đã book
            if (bookedSlotIds.includes(slot.id)) return false;

            // bị block theo giờ
            const slotStart = slot.startTime;
            const slotEnd = slot.endTime;

            const isBlocked = blocks.some(block =>
                slotStart < block.endTime && slotEnd > block.startTime
            );

            return !isBlocked;
        });

        return availableSlots;
    }
    async blockField(fieldId: number, dto: CreateBlockDto) {
        return this.prisma.fieldBlock.create({
            data: {
                fieldId,
                date: new Date(dto.date),
                startTime: dto.startTime,
                endTime: dto.endTime,
                reason: dto.reason,
            },
        });
    }

    async getBlocks(fieldId: number, date: string) {
        return this.prisma.fieldBlock.findMany({
            where: {
                fieldId,
                date: new Date(date),
            },
            orderBy: { startTime: 'asc' },
        });
    }
    findAllActive() {
        return this.prisma.field.findMany({
            where: { status: 'ACTIVE' },
        });
    }

    // Owner quản lý sân của mình
    async findMyFields(ownerId: number) {
        return this.prisma.field.findMany({
            where: { ownerId },
            include: {
                _count: {
                    select: {
                        bookings: {
                            where: {
                                status: { in: ['PENDING', 'CONFIRMED'] },
                            },
                        },
                        slots: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Owner cập nhật trạng thái sân
    async updateFieldStatus(
        ownerId: number,
        fieldId: number,
        status: 'ACTIVE' | 'MAINTENANCE',
    ) {
        // Kiểm tra owner có quyền
        const field = await this.prisma.field.findFirst({
            where: { id: fieldId, ownerId },
        });

        if (!field) {
            throw new Error('Field not found or access denied');
        }

        return this.prisma.field.update({
            where: { id: fieldId },
            data: { status },
        });
    }

    // Xoá block
    async deleteBlock(ownerId: number, blockId: number) {
        const block = await this.prisma.fieldBlock.findFirst({
            where: {
                id: blockId,
                field: { ownerId },
            },
        });

        if (!block) {
            throw new Error('Block not found or access denied');
        }

        return this.prisma.fieldBlock.delete({
            where: { id: blockId },
        });
    }

}
