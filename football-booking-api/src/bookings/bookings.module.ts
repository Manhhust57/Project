import { Module } from '@nestjs/common';
import { BookingCleanupJob } from './booking-cleanup.job';
import { BookingsService } from './bookings.service';
import { BookingsGateway } from './bookings.gateway';

@Module({
    providers: [BookingCleanupJob, BookingsService, BookingsGateway],
    exports: [BookingsService, BookingsGateway],
})
export class BookingsModule { }
