import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class CartController {
  constructor(private readonly cartService: CartService = new CartService()) {}

  getCart = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.cartService.getCart(userId);
    ApiResponse.success(res, cart, 'Cart retrieved successfully', HttpStatus.OK);
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.cartService.addItem(userId, req.body);
    ApiResponse.success(res, cart, 'Item added to cart', HttpStatus.OK);
  };

  updateQuantity = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.cartService.updateItemQuantity(userId, req.body);
    ApiResponse.success(res, cart, 'Cart item quantity updated', HttpStatus.OK);
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const itemId = req.params.id;
    const cart = await this.cartService.removeItem(userId, itemId);
    ApiResponse.success(res, cart, 'Item removed from cart', HttpStatus.OK);
  };

  clearCart = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.cartService.clearCart(userId);
    ApiResponse.success(res, cart, 'Cart cleared successfully', HttpStatus.OK);
  };

  applyCoupon = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { code } = req.body;
    const cart = await this.cartService.applyCoupon(userId, code);
    ApiResponse.success(res, cart, `Coupon "${code}" applied successfully`, HttpStatus.OK);
  };

  removeCoupon = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const cart = await this.cartService.removeCoupon(userId);
    ApiResponse.success(res, cart, 'Coupon removed successfully', HttpStatus.OK);
  };
}
