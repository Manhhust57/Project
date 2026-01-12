import { IsInt, Min, IsOptional, IsString, Matches } from 'class-validator';

export class GenerateSlotsDto {
    @IsInt()
    @Min(30)
    duration: number; // phút (60, 90, 120)

    @IsInt()
    @Min(0)
    normalPrice: number; // giá giờ thường

    @IsInt()
    @Min(0)
    @IsOptional()
    peakPrice?: number; // giá giờ cao điểm (nếu có)

    @IsString()
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'peakStartTime phải theo định dạng HH:mm (ví dụ: 17:00)',
    })
    peakStartTime?: string; // giờ bắt đầu peak (17:00)

    @IsString()
    @IsOptional()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'peakEndTime phải theo định dạng HH:mm (ví dụ: 22:00)',
    })
    peakEndTime?: string; // giờ kết thúc peak (22:00)
}
