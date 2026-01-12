import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prismanpx/prismanpx.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule { }