import { CartService, CartStateResponse } from '../cart/cart.service';
import { AddressService } from '../addresses/address.service';
import { LocationService } from '../location/location.service';
import { CheckoutValidateInput } from './checkout.validator';
import { BadRequestError, NotFoundError } from '../../common/errors/app-error';

export interface CheckoutValidationResult {
  isDeliverable: boolean;
  shopId: string;
  shopName: string;
  deliveryAddress: {
    id: string;
    tag: string;
    displayAddress: string;
    contactPhone: string;
  };
  cartSummary: CartStateResponse;
  estimatedDeliveryMinutes: number;
  availablePaymentMethods: string[];
}

export class CheckoutService {
  constructor(
    private readonly cartService: CartService = new CartService(),
    private readonly addressService: AddressService = new AddressService(),
    private readonly locationService: LocationService = new LocationService()
  ) {}

  async validateCheckout(userId: string, input: CheckoutValidateInput): Promise<CheckoutValidationResult> {
    const cart = await this.cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestError('Cannot checkout with an empty cart');
    }

    const addresses = await this.addressService.getAddresses(userId);
    const selectedAddress = addresses.find((a) => a.id === input.addressId);

    if (!selectedAddress) {
      throw new NotFoundError('Selected delivery address not found');
    }

    // Verify serviceability of the address location
    const serviceability = await this.locationService.checkServiceability({
      latitude: selectedAddress.latitude,
      longitude: selectedAddress.longitude,
    });

    if (!serviceability.isServiceable) {
      throw new BadRequestError('Delivery address is currently outside our 30-minute delivery zone');
    }

    const displayAddress = `${selectedAddress.houseNo}, ${selectedAddress.area}${
      selectedAddress.landmark ? ', Near ' + selectedAddress.landmark : ''
    }, ${selectedAddress.city} - ${selectedAddress.pincode}`;

    // Available payment methods matching frontend checkout options
    const paymentMethods = ['UPI', 'CARD', 'NET_BANKING'];

    // COD eligibility check: orders <= ₹5,000
    if (cart.totalAmount <= 5000) {
      paymentMethods.push('COD');
    }

    return {
      isDeliverable: true,
      shopId: cart.activeShopId || 's1',
      shopName: cart.activeShopName || 'Style Studio',
      deliveryAddress: {
        id: selectedAddress.id,
        tag: selectedAddress.tag,
        displayAddress,
        contactPhone: selectedAddress.contactPhone,
      },
      cartSummary: cart,
      estimatedDeliveryMinutes: 25,
      availablePaymentMethods: paymentMethods,
    };
  }
}
