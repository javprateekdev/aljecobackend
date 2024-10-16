import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';

@Injectable()
export class WishlistService {
  constructor(private readonly prismaService: PrismaService) {}

  // Find wishlist by user ID
  async findWishlistByUserId(userId: number) {
    return this.prismaService.wishlist.findFirst({
      where: { userId },
      include: {
        wishlistItems: {
          include: {
            productItem: {
              include: {
                images: true,
                product:true
              },
            },
          },
        },
      },
    });
  }

  // Create a new wishlist for the user
  async createWishlist(data: { userId: number }) {
    return this.prismaService.wishlist.create({
      data,
    });
  }

  // Find a wishlist item by product and wishlist ID
  async findWishlistItemByProductAndWishlist(
    wishlistId: number,
    productItemId: number,
  ) {
    return this.prismaService.wishlistItem.findFirst({
      where: {
        wishlistId,
        productItemId,
      },
    });
  }

  // Create a new wishlist item
  async createWishlistItem(data: {
    wishlistId: number;
    productItemId: number;
    priceAtTime: number;
  }) {
    console.log('wishlistId', data.wishlistId);
    return this.prismaService.wishlistItem.create({
      data,
    });
  }
  // Update the quantity of an existing wishlist item
  // async updateWishlistItemQuantity(
  //   wishlistItemId: number,
  //   quantity: number,
  // ) {
  //   return this.prismaService.wishlistItem.update({
  //     where: { id: wishlistItemId },
  //     data: { quantity },
  //   });
  // }

  // Delete a wishlist item
  async deleteWishlistItem(wishlistItemId: number) {
    const wishlistItem = await this.prismaService.wishlistItem.findUnique({
      where: { id: wishlistItemId },
    });

    if (!wishlistItem) {
      throw new NotFoundException(
        `Wishlist item with ID ${wishlistItemId} not found.`,
      );
    }

    return this.prismaService.wishlistItem.delete({
      where: { id: wishlistItemId },
    });
  }
}
