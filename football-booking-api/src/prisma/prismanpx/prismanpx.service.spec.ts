import { Test, TestingModule } from '@nestjs/testing';
import { PrismanpxService } from './prismanpx.service';

describe('PrismanpxService', () => {
  let service: PrismanpxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismanpxService],
    }).compile();

    service = module.get<PrismanpxService>(PrismanpxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
