import { Request, Response } from 'express';
import { CategoryService } from './category.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class CategoryController {
  constructor(private readonly categoryService: CategoryService = new CategoryService()) {}

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.getAllCategories();
    ApiResponse.success(res, categories, 'Categories fetched successfully', HttpStatus.OK);
  };

  getQuickCategories = async (req: Request, res: Response): Promise<void> => {
    const quick = await this.categoryService.getQuickCategories();
    ApiResponse.success(res, quick, 'Quick categories fetched successfully', HttpStatus.OK);
  };
}
