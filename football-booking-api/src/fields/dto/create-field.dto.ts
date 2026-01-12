import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class CreateFieldDto {
    @IsString()
    name: string;

    @IsInt()
    type: number; // 5 | 7 | 9 | 11

    @IsOptional()
    @IsString()
    location?: string;

    @Matches(/^\d{2}:\d{2}$/)
    openTime: string;  // "06:00"

    @Matches(/^\d{2}:\d{2}$/)
    closeTime: string; // "23:00"
}
