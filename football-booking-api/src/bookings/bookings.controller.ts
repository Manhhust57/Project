import {
    Body,
    Controller,
    Get,
    Header,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import type { Response } from 'express';


@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Public()
    @Post()
    create(
        @Req() req,
        @Body() dto: CreateBookingDto,
    ) {
        // userId có thể null
        const userId = req.user?.userId ?? null;
        return this.bookingsService.create(userId, dto);
    }

    @Get('me')
    me(@Req() req) {
        return this.bookingsService.getMyBookings(req.user.userId);
    }

    @Post(':id/cancel')
    cancel(@Req() req, @Param('id') id: string) {
        return this.bookingsService.cancel(req.user.userId, +id);
    }
    @Get('/admin')
    @Roles('ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard)
    getByDate(
        @Query('date') date: string,
        @Query('fieldId') fieldId?: string,
    ) {
        return this.bookingsService.getBookingsByDate(
            date,
            fieldId ? +fieldId : undefined,
        );
    }
    @Roles('ADMIN', 'OWNER')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post(':id/confirm')
    confirm(@Param('id') id: string) {
        return this.bookingsService.confirm(+id);
    }


    @Get('owner')
    @Roles('OWNER')
    @Header('Cache-Control', 'no-store')
    getOwnerBookings(
        @Req() req,
        @Query('date') date?: string,
    ) {
        return this.bookingsService.getOwnerBookings(req.user.userId, date);
    }
}
