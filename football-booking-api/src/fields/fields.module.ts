import { Module } from '@nestjs/common';
import { AdminFieldsController, PublicFieldsController, OwnerFieldsController } from './fields.controller';
import { FieldsService } from './fields.service';

@Module({
  controllers: [AdminFieldsController, PublicFieldsController, OwnerFieldsController],
  providers: [FieldsService]
})
export class FieldsModule { }
