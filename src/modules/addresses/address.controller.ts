import { Request, Response } from 'express';
import { AddressService } from './address.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class AddressController {
  constructor(private readonly addressService: AddressService = new AddressService()) {}

  getAddresses = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const addresses = await this.addressService.getAddresses(userId);

    ApiResponse.success(res, addresses, 'Addresses fetched successfully', HttpStatus.OK);
  };

  createAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const address = await this.addressService.createAddress(userId, req.body);

    ApiResponse.success(res, address, 'Address added successfully', HttpStatus.CREATED);
  };

  updateAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const addressId = req.params.id;
    const address = await this.addressService.updateAddress(addressId, userId, req.body);

    ApiResponse.success(res, address, 'Address updated successfully', HttpStatus.OK);
  };

  deleteAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const addressId = req.params.id;
    const result = await this.addressService.deleteAddress(addressId, userId);

    ApiResponse.success(res, result, 'Address deleted successfully', HttpStatus.OK);
  };

  setDefaultAddress = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const addressId = req.params.id;
    const address = await this.addressService.setDefaultAddress(addressId, userId);

    ApiResponse.success(res, address, 'Default address updated successfully', HttpStatus.OK);
  };
}
