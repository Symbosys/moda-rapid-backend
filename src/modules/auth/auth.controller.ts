import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../common/utils/response-formatter';
import { HttpStatus } from '../../common/constants/api-status';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  requestOtp = async (req: Request, res: Response): Promise<void> => {
    const { mobileNumber } = req.body;
    const result = await this.authService.requestOtp(mobileNumber);

    ApiResponse.success(
      res,
      result,
      `OTP sent successfully to ${mobileNumber}`,
      HttpStatus.OK
    );
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { mobileNumber, otp } = req.body;
    const result = await this.authService.verifyOtp(mobileNumber, otp);

    ApiResponse.success(
      res,
      result,
      'OTP verified successfully',
      HttpStatus.OK
    );
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await this.authService.refreshToken(refreshToken);

    ApiResponse.success(
      res,
      result,
      'Access token refreshed successfully',
      HttpStatus.OK
    );
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    ApiResponse.success(
      res,
      { loggedOut: true },
      'Logged out successfully',
      HttpStatus.OK
    );
  };
}
