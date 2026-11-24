import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class ProductController {
  constructor(private readonly productService: ProductService = new ProductService()) {}

  getProducts = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as Parameters<ProductService['getProducts']>[0];
    const products = await this.productService.getProducts(query);
    ApiResponse.success(res, products, 'Products fetched successfully', HttpStatus.OK);
  };

  getProductDetails = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.getProductById(req.params.id);
    ApiResponse.success(res, product, 'Product details fetched successfully', HttpStatus.OK);
  };

  getSimilarProducts = async (req: Request, res: Response): Promise<void> => {
    const products = await this.productService.getSimilarProducts(req.params.id);
    ApiResponse.success(res, products, 'Similar products fetched successfully', HttpStatus.OK);
  };

  searchProducts = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as Parameters<ProductService['searchProducts']>[0];
    const results = await this.productService.searchProducts(query);
    ApiResponse.success(res, results, 'Product search completed', HttpStatus.OK);
  };

  getSuggestions = async (req: Request, res: Response): Promise<void> => {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const suggestions = await this.productService.getSuggestions(q);
    ApiResponse.success(res, suggestions, 'Search suggestions fetched', HttpStatus.OK);
  };
}
