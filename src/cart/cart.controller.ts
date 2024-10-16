import { Controller, Get, Post, Body, Patch, Param, Delete,UseGuards,Req, BadRequestException, NotFoundException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart.dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  AuthenticatedUser,
  BaseController,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  SearchablePaginatedDto,
  UserType,
} from '@Common';
import { AuthService } from 'src/auth';
@ApiTags('Cart')
@ApiBearerAuth()
@Roles(UserType.User)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('cart')

export class CartController {
  constructor(private readonly cartService: CartService,
    private readonly authService:AuthService
  ) {}

  @Post()
 async create(
  @Req() req: AuthenticatedRequest,
  @Body() createCartDto: CreateCartDto,
  ) {
  const user = await this.authService.getUser(req.user.id);
  if (!user) {
    throw new BadRequestException('Invalid user.');
  }

  // Check if the user already has a cart
  let cart = await this.cartService.findCartByUserId(user.id);
  
  // If the cart does not exist, create a new cart
  if (!cart) {
    cart = await this.cartService.createCart({
      userId: user.id,
    });
  }

  // Check if the product item already exists in the cart
  let cartItem = await this.cartService.findCartItemByProductAndCart(
    cart.id,
    createCartDto.productItemId,
  );

  if (cartItem) {
    // If the cart item exists, update the quantity
    cartItem = await this.cartService.updateCartItemQuantity(
      cartItem.id,
      createCartDto.quantity,
    );
  } else {
    // If the cart item does not exist, create a new one
    cartItem = await this.cartService.createCartItem({
      cartId: cart.id,
      userId: user.id,
      productItemId: createCartDto.productItemId,
      quantity: createCartDto.quantity,
      priceAtTime: createCartDto.priceAtTime,
    });
  }

  // Optionally, you can return the updated cart or cart items
  return { cart, cartItem };
}

@Get()
async getCart(@Req() req: AuthenticatedRequest) {
  const user = await this.authService.getUser(req.user.id);
  if (!user) {
    throw new BadRequestException('Invalid user.');
  }

  // Find the user's cart with all cart items
  const cart = await this.cartService.getCartByUserId(user.id);

  if (!cart) {
    throw new NotFoundException('Cart not found.');
  }

  return cart;
}

@Delete('items/:id')
async deleteCartItem(@Param('id') id: number) {
  await this.cartService.deleteCartItem(id);
}

@Put('items/:cartItemId/quantity')
async updateCartItemQuantity(
  @Param('cartItemId') cartItemId: number,
  @Body() updateCartItemQuantityDto: UpdateCartItemQuantityDto,
) {
  return this.cartService.updateCartItemQuantity(
    cartItemId,
    updateCartItemQuantityDto.quantity,
  );
}


}
