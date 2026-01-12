import { IsEnum } from 'class-validator';

export class UpdateFieldStatusDto {
    @IsEnum(['ACTIVE', 'MAINTENANCE'])
    status: 'ACTIVE' | 'MAINTENANCE';
}
