import { Module } from '@nestjs/common';
import { SliderService } from './slider.service';
import { SliderController } from './slider.controller';
import { PrismaModule } from 'src/prisma';
@Module({
  imports: [PrismaModule],
  controllers: [SliderController],
  providers: [SliderService],
})
export class SliderModule {}
