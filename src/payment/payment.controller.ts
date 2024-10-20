import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CheckCouponDto,
  CreateCouponDto,
  CreateOrderDto,
  VerifyPaymentDto,
} from './dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from 'src/prisma';
import { DiscountType } from '@prisma/client';

@ApiTags('Payment')
@ApiBearerAuth()
@Roles(UserType.User)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly prisma: PrismaService,
  ) {}

  // Endpoint to create a Razorpay order
  @Post('create-order')
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body() order: CreateOrderDto,
  ) {
    const user = req.user;

    if (!user) {
      throw new BadRequestException('User not authenticated');
    }

    const razorpayOrder = await this.paymentService.createOrder(
      order.amount,
      order.receipt,
      user.id,
      order.coupon || null,
    );
    if (!razorpayOrder) {
      return null;
    }

    return {
      message: 'Order created successfully',
      razorpayOrderId: razorpayOrder.razorpayOrder.id,
      amount: order.amount,
      currency: 'INR',
      order: razorpayOrder.order.id,
    };
  }

  // Endpoint to verify the payment
  @Post('verify-payment')
  async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto) {
    const isValid =
      this.paymentService.verifyPaymentSignature(verifyPaymentDto);

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    return {
      message: 'Payment verified successfully',
    };
  }

  @Post('create')
  async createCoupon(@Body() createCouponDto: CreateCouponDto) {
    const expiration = createCouponDto.expiration
      ? new Date(createCouponDto.expiration)
      : null;

    return this.prisma.coupon.create({
      data: {
        code: createCouponDto.code,
        discount: createCouponDto.discount,
        description: createCouponDto.description,
        type: createCouponDto.type,
        expiration,
        usageLimit: createCouponDto.usageLimit,
      },
    });
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if a coupon is valid' })
  @ApiResponse({
    status: 200,
    description: 'Coupon validation result',
    schema: {
      example: {
        valid: true,
        discountType: 'percentage',
        discountValue: 10,
        message: 'Coupon is valid.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or inactive coupon code.',
    schema: {
      example: {
        valid: false,
        message: 'Invalid or inactive coupon code.',
      },
    },
  })
  async checkCoupon(@Body() checkCouponDto: CheckCouponDto) {
    const coupon = await this.paymentService.validateCoupon(
      checkCouponDto.couponCode,
    );

    if (!coupon) {
      return {
        valid: false,
        message: 'The provided coupon code is either invalid or inactive.',
      };
    }

    let message: string;

    // Construct a dynamic message based on the type of coupon
    if (coupon.type === DiscountType.PERCENTAGE) {
      message = `The coupon is valid. You will receive a discount of ${coupon.discount}% off your total purchase!`;
    } else if (coupon.type === DiscountType.FIXED) {
      message = `The coupon is valid. You will receive a discount of $${coupon.discount.toFixed(2)} on your total purchase!`;
    } else {
      message = 'The coupon is valid.';
    }

    return {
      valid: true,
      discountType: coupon.type,
      discountValue: coupon.discount,
      message: message,
    };
  }
}
