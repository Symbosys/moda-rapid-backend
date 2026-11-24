import { Request, Response } from 'express';
import { WishlistService } from './wishlist.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class WishlistController {
  constructor(private readonly wishlistService: WishlistService = new WishlistService()) {}

  getWishlist = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const wishlist = await this.wishlistService.getWishlist(userId);
    ApiResponse.success(res, wishlist, 'Wishlist retrieved successfully', HttpStatus.OK);
  };

  addToWishlist = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const { productId } = req.body;
    const item = await this.wishlistService.addToWishlist(userId, productId);
    ApiResponse.success(res, item, 'Item added to wishlist', HttpStatus.CREATED);
  };

  removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const productId = req.params.id;
    const result = await this.wishlistService.removeFromWishlist(userId, productId);
    ApiResponse.success(res, result, 'Item removed from wishlist', HttpStatus.OK);
  };
}
