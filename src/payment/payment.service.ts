import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { VerifyPaymentDto } from './dto';
import { PrismaService } from '../prisma';
@Injectable()
export class PaymentService {
  private razorpay;

  constructor(private readonly prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: 'rzp_test_c1efGTJCYwaUBg',
      key_secret: 'NAddzxcb8pEc7EfkMbZOSkuU',
    });
  }

  // Method to create an order in Razorpay
  async createOrder(amount: number, receipt: string, userId: number) {
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
      const calculatedAmount = cart.cartItems.reduce(
        (acc, item) => acc + item.quantity * Number(item.productItem.salePrice),
        0,
      );

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
      const order = await this.prisma.order.create({
        data: {
          userId,
          totalPrice: amount,
          status: 'PENDING', // or OrderStatus.PENDING if using the enum
          razorpayOrderId: razorpayOrder.id,
        },
      });

      // Return the Razorpay order details
      return razorpayOrder;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Method to verify the payment signature from Razorpay
  verifyPaymentSignature(verifyPaymentDto: VerifyPaymentDto): boolean {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verifyPaymentDto;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', 'NAddzxcb8pEc7EfkMbZOSkuU')
      .update(body)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  }
}
