import { Model } from "../base/Model";
import { IEvents } from "../base/events";
import { ICustomer, IOrderModel, TFormErrors, IPostOrder } from "../../types";

export class OrderModel extends Model<IOrderModel> implements IOrderModel {
  customer: ICustomer;
  items: string[];
  total: number;
  formErrors: TFormErrors;

  constructor(data: Partial<IOrderModel>, events: IEvents) {
    super(data, events);

    this.customer = data?.customer ?? { payment: '', address: '', email: '', phone: '' };
    this.items = data?.items ?? [];
    this.total = data?.total ?? 0;
    this.formErrors = data?.formErrors ?? {};
  }

  getCustomerData(): ICustomer {
    return { ...this.customer };
  }

  setCustomerData(customerData: Partial<ICustomer>, step: 'shipping' | 'contacts' = 'shipping'): void {
    this.customer = { ...this.customer, ...customerData };
    this.emitChanges('order:customer:updated', { customer: this.getCustomerData() });
    this.validateCustomerData(step);
  }

  validateCustomerData(step: 'shipping' | 'contacts'): boolean {
    const errors: typeof this.formErrors = {};

    if (step === 'shipping') {
      if (!this.customer.payment) {
        errors.payment = 'Необходимо выбрать способ оплаты';
      }
      if (!this.customer.address) {
        errors.address = 'Необходимо указать адрес';
      }
    }

    if (step === 'contacts') {
      if (!this.customer.email) {
        errors.email = 'Необходимо указать email';
      }
      if (!this.customer.phone) {
        errors.phone = 'Необходимо указать телефон';
      }
    }

    this.formErrors = errors;

    this.emitChanges('formErrors:change', this.formErrors);

    return Object.keys(errors).length === 0;
  }

  clearCustomerData(): void {
    this.customer = { payment: '', address: '', email: '', phone: '' };
    this.items = [];
    this.total = 0;
    this.formErrors = {};
    this.emitChanges('order:customer:cleared', {});
  }

  setItems(items: string[]): void {
    this.items = [...items];
    this.emitChanges('order:items:updated', { items: this.items });
  }

  setTotal(total: number): void {
    this.total = total;
    this.emitChanges('order:total:updated', { total: this.total });
  }

  getOrderData(): IPostOrder {
    const order: IPostOrder = {
      ...this.customer,
      items: [...this.items],
      total: this.total
    };

    this.emitChanges('order:data:ready', { order });

    return order;
  }
}
