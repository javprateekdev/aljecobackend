import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { PrismaModule } from '../prisma';
import { AuthModule } from 'src/auth';
@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
