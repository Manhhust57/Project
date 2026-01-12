import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { OwnerDashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('today')
    getToday() {
        return this.dashboardService.getTodayStats();
    }
    @Get('summary')
    async summary() {
        return this.dashboardService.summary();
    }
    @Get('recent-bookings')
    async recentBookings() {
        return this.dashboardService.recentBookings();
    }


}

@Controller('owner/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerDashboardController {
    constructor(private readonly ownerDashboardService: OwnerDashboardService) { }

    @Get('summary')
    async summary(@Req() req) {
        return this.ownerDashboardService.getOwnerSummary(req.user.userId);
    }

    @Get('recent-bookings')
    async recentBookings(@Req() req) {
        return this.ownerDashboardService.getRecentBookings(req.user.userId);
    }

    @Get('stats')
    async stats(@Req() req) {
        // Lấy days từ query string nếu có, mặc định 7
        const days = req.query.days ? Number(req.query.days) : 7;
        return this.ownerDashboardService.stats(req.user.userId, days);
    }

    @Get('revenue')
    async revenue(@Req() req, @Query('days') days: string) {
        const range = days ? Number(days) : 7;
        return this.ownerDashboardService.getRevenue(req.user.userId, range);
    }

    @Get('revenue/today')
    async todayRevenue(@Req() req) {
        return this.ownerDashboardService.getTodayRevenue(req.user.userId);
    }

    @Get('report')
    async report(
        @Req() req,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return this.ownerDashboardService.getReportData(req.user.userId, from, to);
    }
}