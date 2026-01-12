import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class CreateBookingDto {
    @IsInt()
    fieldId: number;

    @IsInt()
    slotId: number;

    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    date: string; // YYYY-MM-DD

    @IsOptional()
    @IsString()
    guestName?: string;

    @IsOptional()
    @IsString()
    guestPhone?: string;

    expiresAt?: Date;
}
