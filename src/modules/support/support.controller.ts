import { Request, Response } from 'express';
import { SupportService } from './support.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class SupportController {
  constructor(private readonly supportService: SupportService = new SupportService()) {}

  getFaqs = async (req: Request, res: Response): Promise<void> => {
    const faqs = this.supportService.getFaqs();
    ApiResponse.success(res, faqs, 'Support FAQs fetched successfully', HttpStatus.OK);
  };
}
