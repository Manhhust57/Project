import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateBlockDto {
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    date: string; // YYYY-MM-DD

    @Matches(/^\d{2}:\d{2}$/)
    startTime: string;

    @Matches(/^\d{2}:\d{2}$/)
    endTime: string;

    @IsOptional()
    @IsString()
    reason?: string;
}
