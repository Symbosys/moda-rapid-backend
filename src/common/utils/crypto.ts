import crypto from 'crypto';

export class CryptoUtil {
  static generateNumericOtp(length = 6): string {
    // Generate secure random 6-digit numeric OTP
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(crypto.randomInt(min, max + 1));
  }

  static hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static verifyHash(data: string, hash: string): boolean {
    const computed = this.hashData(data);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  }
}
