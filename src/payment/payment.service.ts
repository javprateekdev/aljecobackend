import { BadRequestException, Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { VerifyPaymentDto } from './dto';
import { PrismaService } from '../prisma';
import { DiscountType, OrderStatus } from '@prisma/client';
import nodemailer from 'nodemailer';



interface Product {
  productId: number;
  productName: string;
  // Add any other relevant fields
}

interface OrderItem {
  productItem: {
    product: Product;
  };
  quantity: number;
  // Add any other relevant fields
}

interface OrderDetails {
  id: number;
  totalPrice: number;
  status: string;
  orderItems: OrderItem[];
}

interface OrderDetails {
  id: number;
  userId: number; // Include userId if necessary
  totalPrice: number;
  status:string;
  razorpayOrderId: string;
  createdAt: Date;
  updatedAt: Date;
  couponId: number | null;
  deleiveryAddressID: number;
  orderItems: OrderItem[]; // Ensure this property is defined
}

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
    couponCode: string | null,
    addressId: number, // Allow null if no coupon is provided
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
      let couponId: number | null = null;
      if (couponCode) {
        const coupon = await this.validateCoupon(couponCode);
        if (!coupon) {
          throw new Error('Invalid or expired coupon');
        }
        couponId = coupon.id; // Set couponId directly
        // Calculate discount as before...
      }
  
      // Save the order in your database
      const orderItems = cart.cartItems.map(item => ({
        productItem: { connect: { itemId: item.productItemId } },
        quantity: item.quantity,
        priceAtTime: item.productItem.salePrice ?? 0, // Provide a default value if null
      }));
  
      const order = await this.prisma.order.create({
        data: {
          userId,
          totalPrice: amount,
          couponId: couponId,
          status: 'PENDING',
          razorpayOrderId: razorpayOrder.id,
          deleiveryAddressID: addressId,
          orderItems: {
            create: orderItems,
          },
        },
      });
  
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
  
      // Remove items from the cart
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });
      // Return the Razorpay order details
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const orderDetails = {
        id: order.id,
        userId: order.userId,
        totalPrice: order.totalPrice,
        status: order.status,
        razorpayOrderId: order.razorpayOrderId,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        couponId: order.couponId,
        deleiveryAddressID: order.deleiveryAddressID,
        orderItems: orderItems, // Include the order items here
      };
    console.log('order',orderDetails)
     sendOrderConfirmationEmail('javprateekdev@gmail.com');
    
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



const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password",
  },
});

 const sendOrderConfirmationEmail = async (to:string) => {
 try{
  const mailOptions = {
    from: 'support@aljeco.in',
    to,
    subject: 'Order Confirmation',
    html: `<h1>Your Order Has Been Confirmed</h1>
           <p>Thank you for your order!</p>`,
  };
  console.log('mailOptions',mailOptions)

  await transporter.sendMail(mailOptions);

 }catch(error){
  console.log(error)
 }

};