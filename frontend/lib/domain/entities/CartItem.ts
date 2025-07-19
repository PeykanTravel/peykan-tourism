import { ProductType } from '../value-objects/ProductType';
import { Quantity } from '../value-objects/Quantity';
import { Price } from '../value-objects/Price';
import { Currency } from '../value-objects/Currency';

export interface CartItemProps {
  id?: string;
  productId: string;
  productType: ProductType;
  quantity: Quantity;
  variantId?: string;
  date?: string;
  participants?: number;
  price?: Price;
  notes?: string;
}

export class CartItem {
  private readonly _id: string;
  private readonly _productId: string;
  private readonly _productType: ProductType;
  private _quantity: Quantity;
  private readonly _variantId?: string;
  private _date?: string;
  private _participants?: number;
  private _price?: Price;
  private _notes?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: CartItemProps) {
    this._id = props.id || this.generateId();
    this._productId = props.productId;
    this._productType = props.productType;
    this._quantity = props.quantity;
    this._variantId = props.variantId;
    this._date = props.date;
    this._participants = props.participants;
    this._price = props.price;
    this._notes = props.notes;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  static create(props: CartItemProps): CartItem {
    // Validate required fields
    if (!props.productId) {
      throw new Error('Product ID is required');
    }

    if (!props.productType) {
      throw new Error('Product type is required');
    }

    if (!props.quantity) {
      throw new Error('Quantity is required');
    }

    // Validate participants for events
    if (props.productType.isEvent() && (!props.participants || props.participants < 1)) {
      throw new Error('Participants count is required for events');
    }

    // Validate date for tours and events
    if ((props.productType.isTour() || props.productType.isEvent()) && !props.date) {
      throw new Error('Date is required for tours and events');
    }

    return new CartItem(props);
  }

  private generateId(): string {
    return `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get productId(): string {
    return this._productId;
  }

  get productType(): ProductType {
    return this._productType;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  get variantId(): string | undefined {
    return this._variantId;
  }

  get date(): string | undefined {
    return this._date;
  }

  get participants(): number | undefined {
    return this._participants;
  }

  get price(): Price | undefined {
    return this._price;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  updateQuantity(quantity: Quantity): void {
    if (quantity.value < 1) {
      throw new Error('Quantity must be at least 1');
    }
    this._quantity = quantity;
    this._updatedAt = new Date();
  }

  updateDate(date: string): void {
    if (this.productType.isTransfer()) {
      throw new Error('Date cannot be updated for transfers');
    }
    this._date = date;
    this._updatedAt = new Date();
  }

  updateParticipants(participants: number): void {
    if (!this.productType.isEvent()) {
      throw new Error('Participants can only be updated for events');
    }
    if (participants < 1) {
      throw new Error('Participants must be at least 1');
    }
    this._participants = participants;
    this._updatedAt = new Date();
  }

  updatePrice(price: Price): void {
    this._price = price;
    this._updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this._notes = notes;
    this._updatedAt = new Date();
  }

  getTotalPrice(): Price | undefined {
    if (!this._price) {
      return undefined;
    }
    return Price.create(
      this._price.amount * this._quantity.value,
      this._price.currency
    );
  }

  isEvent(): boolean {
    return this._productType.isEvent();
  }

  isTour(): boolean {
    return this._productType.isTour();
  }

  isTransfer(): boolean {
    return this._productType.isTransfer();
  }

  requiresDate(): boolean {
    return this._productType.isTour() || this._productType.isEvent();
  }

  requiresParticipants(): boolean {
    return this._productType.isEvent();
  }

  equals(other: CartItem): boolean {
    return this._id === other._id;
  }

  hasSameProduct(other: CartItem): boolean {
    return this._productId === other._productId && this._variantId === other._variantId;
  }

  toJSON() {
    return {
      id: this._id,
      productId: this._productId,
      productType: this._productType.toString(),
      quantity: this._quantity.value,
      variantId: this._variantId,
      date: this._date,
      participants: this._participants,
      price: this._price?.toJSON(),
      notes: this._notes,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString()
    };
  }
} 