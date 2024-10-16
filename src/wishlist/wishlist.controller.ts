import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { AuthService } from 'src/auth';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Roles(UserType.User)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async createWishlist(
    @Req() req: AuthenticatedRequest,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    const user = await this.authService.getUser(req.user.id);
    if (!user) {
      throw new BadRequestException('Invalid user.');
    }
  
    // Check if the user already has a wishlist
    let wishlist;
     wishlist = await this.wishlistService.findWishlistByUserId(user.id);
  
    // If the wishlist does not exist, create a new wishlist
    if (!wishlist) {
      wishlist = await this.wishlistService.createWishlist({
        userId: user.id,
      });
    }
  
    // Check if the product item already exists in the wishlist
    let wishlistItem = await this.wishlistService.findWishlistItemByProductAndWishlist(
      wishlist.id,
      createWishlistDto.productItemId,
    );
  
    if (wishlistItem) {
      // You can add custom logic for updating quantity if needed
      // Or remove this block if you don't need to handle existing items
    } else {
      // If the wishlist item does not exist, create a new one
      wishlistItem = await this.wishlistService.createWishlistItem({
        wishlistId: wishlist.id,
        productItemId: createWishlistDto.productItemId,
        priceAtTime: createWishlistDto.priceAtTime,
      });
    }
  
    // Optionally, return the updated wishlist and wishlist item
    return { wishlist, wishlistItem };
  }
  

  @Get()
  async getWishlist(@Req() req: AuthenticatedRequest) {
    const user = await this.authService.getUser(req.user.id);
    if (!user) {
      throw new BadRequestException('Invalid user.');
    }

    // Find the user's wishlist with all wishlist items
    const wishlist = await this.wishlistService.findWishlistByUserId(user.id);

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found.');
    }

    return wishlist;
  }

  @Delete('items/:id')
  async deleteWishlistItem(@Param('id') id: number) {
    await this.wishlistService.deleteWishlistItem(id);
  }
}
