import { VendorKycRepository } from './kyc.repository';
import { SubmitVendorKycInput, UpdateKycStatusInput } from './kyc.validator';
import { NotFoundError } from '../../../../common/errors/app-error';

export class VendorKycService {
  constructor(private readonly kycRepo: VendorKycRepository = new VendorKycRepository()) {}

  async submitKyc(vendorId: string, input: SubmitVendorKycInput) {
    return this.kycRepo.saveKyc(vendorId, input);
  }

  async getKycStatus(vendorId: string, storeId?: string) {
    let kyc = storeId ? await this.kycRepo.findByStoreId(storeId) : null;
    if (!kyc) {
      kyc = await this.kycRepo.findByVendorId(vendorId);
    }

    if (!kyc) {
      return {
        status: 'PENDING_SUBMISSION',
        isComplete: false,
        message: 'KYC documents not yet submitted for this store',
      };
    }

    return {
      id: kyc.id,
      storeId: kyc.storeId,
      status: kyc.status,
      isComplete: kyc.status === 'VERIFIED',
      gstinNumber: kyc.gstinNumber,
      panNumber: kyc.panNumber,
      rejectionReason: kyc.rejectionReason,
      updatedAt: kyc.updatedAt,
    };
  }

  async updateKycStatus(storeId: string, input: UpdateKycStatusInput) {
    const updated = await this.kycRepo.updateStatus(storeId, input);
    if (!updated) {
      throw new NotFoundError(`KYC record for store '${storeId}' not found`);
    }
    return updated;
  }
}
