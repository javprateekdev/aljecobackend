import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma';
import { AuthModule } from 'src/auth';
@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [CartController],
  providers: [CartService],
})

export class CartModule {}
