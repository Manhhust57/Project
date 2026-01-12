import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldDto } from './dto/create-field.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { GenerateSlotsDto } from './dto/generate-slots.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateFieldStatusDto } from './dto/update-field-status.dto';

@Controller('admin/fields')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminFieldsController {
    constructor(private readonly fieldsService: FieldsService) { }

    @Post()
    @Roles('ADMIN', 'OWNER')
    create(@Req() req, @Body() dto: CreateFieldDto) {
        // ADMIN tạo sân cho OWNER sau này; tạm thời gán owner = ADMIN
        return this.fieldsService.create(req.user.userId, dto);
    }

    @Get()
    @Roles('ADMIN')
    findAll() {
        return this.fieldsService.findAll();
    }

    @Post(':id/slots/generate')
    @Roles('ADMIN', 'OWNER')
    generate(
        @Param('id') id: string,
        @Body() dto: GenerateSlotsDto,
    ) {
        return this.fieldsService.generateSlots(+id, dto);
    }
    @Post(':id/block')
    @Roles('ADMIN', 'OWNER')
    block(
        @Param('id') id: string,
        @Body() dto: CreateBlockDto,
    ) {
        return this.fieldsService.blockField(+id, dto);
    }

    @Get(':id/blocks')
    @Roles('ADMIN', 'OWNER')
    getBlocks(
        @Param('id') id: string,
        @Query('date') date: string,
    ) {
        return this.fieldsService.getBlocks(+id, date);
    }

    @Delete('blocks/:id')
    @Roles('ADMIN', 'OWNER')
    deleteBlock(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.fieldsService.deleteBlock(req.user.userId, +id);
    }
}

// Owner controller
@Controller('owner/fields')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER')
export class OwnerFieldsController {
    constructor(private readonly fieldsService: FieldsService) { }

    @Get()
    getMyFields(@Req() req) {
        return this.fieldsService.findMyFields(req.user.userId);
    }

    @Patch(':id/status')
    updateStatus(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: UpdateFieldStatusDto,
    ) {
        return this.fieldsService.updateFieldStatus(req.user.userId, +id, dto.status);
    }

    @Post(':id/block')
    block(
        @Req() req,
        @Param('id') id: string,
        @Body() dto: CreateBlockDto,
    ) {
        const field = this.fieldsService.blockField(+id, dto);
        // Validate owner
        return field;
    }

    @Get(':id/blocks')
    getBlocks(
        @Param('id') id: string,
        @Query('date') date: string,
    ) {
        return this.fieldsService.getBlocks(+id, date);
    }

    @Delete('blocks/:id')
    deleteBlock(
        @Req() req,
        @Param('id') id: string,
    ) {
        return this.fieldsService.deleteBlock(req.user.userId, +id);
    }
}

//public controller
@Controller('fields')
export class PublicFieldsController {
    constructor(private readonly fieldsService: FieldsService) { }

    @Get()
    findAllActive() {
        return this.fieldsService.findAllActive();
    }
    @Get(':id/available-slots')
    getAvailableSlots(
        @Param('id') id: string,
        @Query('date') date: string,
    ) {
        return this.fieldsService.getAvailableSlots(+id, date);
    }
}