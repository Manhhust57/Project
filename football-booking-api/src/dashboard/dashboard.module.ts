import { Module } from '@nestjs/common';
import { DashboardController, OwnerDashboardController } from './dashboard.controller';
import { DashboardService, OwnerDashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DashboardController, OwnerDashboardController],
    providers: [DashboardService, OwnerDashboardService],
})
export class DashboardModule { }
