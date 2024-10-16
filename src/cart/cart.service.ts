import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma';
@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async findCartByUserId(userId: number) {
    return this.prisma.cart.findFirst({
      where: { userId },
    });
  }

  // Create a new cart for the user
  async createCart(data: { userId: number }) {
    return this.prisma.cart.create({
      data,
    });
  }

  // Find an existing cart item by productItemId and cartId
  async findCartItemByProductAndCart(cartId: number, productItemId: number) {
    return this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productItemId,
      },
    });
  }

  // Create a new cart item
  async createCartItem(data: {
    cartId: number;
    userId: number;
    productItemId: number;
    quantity: number;
    priceAtTime: number;
  }) {
    return this.prisma.cartItem.create({
      data,
    });
  }

  // Update an existing cart item's quantity
  async updateCartItemQuantity(cartItemId: number, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  async getCartByUserId(userId: number) {
    return this.prisma.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          include: {
            productItem: {
              include: {
                product: true,
                images: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteCartItem(cartItemId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${cartItemId} not found`);
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }
 
  
}

