import { Request, Response } from 'express';
import { VendorProductService } from './product.service';
import { ApiResponse } from '../../../../common/utils/response-formatter';
import { HttpStatus } from '../../../../common/constants/api-status';

export class VendorProductController {
  constructor(private readonly productService: VendorProductService = new VendorProductService()) {}

  getProducts = async (req: Request, res: Response): Promise<void> => {
    const storeId = (req.query.storeId as string) || 's1';
    const search = req.query.search as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;

    const products = await this.productService.getProducts(storeId, search, categoryId);
    ApiResponse.success(res, products, 'Vendor products fetched successfully', HttpStatus.OK);
  };

  getProductById = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.getProductById(req.params.id);
    ApiResponse.success(res, product, 'Product details fetched successfully', HttpStatus.OK);
  };

  createProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.createProduct(req.body);
    ApiResponse.success(res, product, 'Product created successfully with variants', HttpStatus.CREATED);
  };

  updateProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.updateProduct(req.params.id, req.body);
    ApiResponse.success(res, product, 'Product updated successfully', HttpStatus.OK);
  };

  addVariant = async (req: Request, res: Response): Promise<void> => {
    const variant = await this.productService.addVariant(req.params.id, req.body);
    ApiResponse.success(res, variant, 'Product variant added successfully', HttpStatus.CREATED);
  };

  updateVariantStock = async (req: Request, res: Response): Promise<void> => {
    const { id: productId, variantId } = req.params;
    const { stockQuantity } = req.body;
    const updated = await this.productService.updateVariantStock(productId, variantId, stockQuantity);
    ApiResponse.success(res, updated, 'Variant stock updated successfully', HttpStatus.OK);
  };

  deleteProduct = async (req: Request, res: Response): Promise<void> => {
    const result = await this.productService.deleteProduct(req.params.id);
    ApiResponse.success(res, result, 'Product deactivated successfully', HttpStatus.OK);
  };
}
