import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateOrderDto, VerifyPaymentDto } from './dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma';

@ApiTags('Payment')
@ApiBearerAuth()
@Roles(UserType.User)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
    );
    if (!razorpayOrder) {
      return null;
    }

    return {
      message: 'Order created successfully',
      razorpayOrderId: razorpayOrder.id,
      amount: order.amount,
      currency: 'INR',
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
}
