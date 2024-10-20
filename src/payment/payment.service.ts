import { BadRequestException, Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { VerifyPaymentDto } from './dto';
import { PrismaService } from '../prisma';
import { DiscountType } from '@prisma/client';
@Injectable()
export class PaymentService {
  private razorpay;

  constructor(private readonly prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY || '',
      key_secret: process.env.RAZORPAY_SECRET || '',
    });
  }

  // Method to create an order in Razorpay
  async createOrder(
    amount: number,
    receipt: string,
    userId: number,
    couponCode: string | null, // Allow null if no coupon is provided
  ) {
    try {
      // Retrieve the cart to calculate the expected amount
      const cart = await this.prisma.cart.findUniqueOrThrow({
        where: { userId },
        include: {
          cartItems: {
            include: {
              productItem: true,
            },
          },
        },
      });

      // Calculate the total amount from the cart
      let calculatedAmount = cart.cartItems.reduce(
        (acc, item) => acc + item.quantity * Number(item.productItem.salePrice),
        0,
      );

      // Validate the coupon, if provided

      if (couponCode) {
        let discount = 0;
        const coupon = await this.validateCoupon(couponCode);

        if (!coupon) {
          throw new Error('Invalid or expired coupon');
        }

        // Apply the coupon based on its type (percentage or flat)
        if (coupon.type === 'PERCENTAGE') {
          discount = (calculatedAmount * coupon.discount) / 100; // Calculate percentage discount
        } else if (coupon.type === 'FIXED') {
          discount = coupon.discount; // Flat discount
        }

        // Ensure discount doesn't exceed total amount
        if (discount > calculatedAmount) {
          discount = calculatedAmount;
        }

        calculatedAmount -= discount; // Subtract discount from total
      }

      // Check for amount mismatch
      if (calculatedAmount !== amount) {
        throw new Error(
          `Amount mismatch! Expected ${calculatedAmount}, but got ${amount}`,
        );
      }

      // Create order in Razorpay
      const razorpayOrder = await this.razorpay.orders.create({
        amount: amount * 100, // Razorpay accepts amount in paisa
        currency: 'INR',
        receipt,
        notes: { userId: userId.toString() },
      });

      // Save the order in your database
      let coupon;
      if (couponCode) {
        coupon = await this.validateCoupon(couponCode);
      }
      const order = await this.prisma.order.create({
        data: {
          userId,
          totalPrice: amount,
          couponId: coupon ? coupon.id : null, // Save the coupon used (if any)
          status: 'PENDING', // or OrderStatus.PENDING if using the enum
          razorpayOrderId: razorpayOrder.id,
        },
      });

      // Return the Razorpay order details
      return { razorpayOrder, order };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }
  // Method to verify the payment signature from Razorpay
  async verifyPaymentSignature(verifyPaymentDto: VerifyPaymentDto) {
    const { id, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verifyPaymentDto;

    // Construct the body to verify the signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    // Generate the expected signature using your Razorpay secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET || '') // Replace with actual secret
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // If signature matches, update order status to 'PROCESSING'
      await this.prisma.order.update({
        where: { id },
        data: {
          status: 'PROCESSING',
        },
      });

      return {
        success: true,
        message: 'Payment verified, order status updated to PROCESSING.',
      };
    } else {
      // If signature doesn't match, update order status to 'FAILED'
      await this.prisma.order.update({
        where: { id },
        data: {
          status: 'FAILED',
        },
      });

      return {
        success: false,
        message: 'Payment verification failed, order status updated to FAILED.',
      };
    }
  }

  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return null;
    }

    if (coupon.expiration && coupon.expiration < new Date()) {
      return null;
    }

    return coupon;
  }

  async createCoupon(data: {
    code: string;
    discount: number;
    description: string;
    type: DiscountType;
    expiration?: Date | null;
    usageLimit?: number | null;
  }) {
    const existingCoupon = await this.prisma.coupon.findUnique({
      where: { code: data.code },
    });

    if (existingCoupon) {
      throw new BadRequestException('Coupon code already exists.');
    }

    return await this.prisma.coupon.create({
      data: {
        code: data.code,
        discount: data.discount,
        description: data.description,
        type: data.type,
        expiration: data.expiration ? new Date(data.expiration) : null,
        usageLimit: data.usageLimit || null,
      },
    });
  }
}
