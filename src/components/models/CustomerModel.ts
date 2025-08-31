import { IEvents } from '../base/events';
import { ICustomerModel, ICustomer, FormErrors } from '../../types';

export class CustomerModel implements ICustomerModel {
	customer: ICustomer = { 
		payment: '', 
		address: '', 
		email: '', 
		phone: '' 
	};

	private events: IEvents;

	constructor(initial: Partial<ICustomerModel> = {}, events: IEvents) {
		this.customer = initial.customer || this.customer;
		this.events = events;
	}

	getCustomerData(): ICustomer {
		return { ...this.customer };
	}

	setCustomerData(customerData: Partial<ICustomer>) {
		this.customer = { 
			...this.customer, 
			...customerData 
		};
		this.events.emit('customer:updated', { customer: this.customer });
	}

	validateCustomerData(step: 'shipping' | 'contacts'): boolean {
		const errors: FormErrors = {};

		if (step === 'shipping') {
			if (!this.customer.payment) {
				errors.payment = 'Выберите способ оплаты';
			}
			if (!this.customer.address) {
				errors.address = 'Необходимо указать адрес';
			}
		} else if (step === 'contacts') {
			if (!this.customer.email) {
				errors.email = 'Необходимо указать email';
			}
			if (!this.customer.phone) {
				errors.phone = 'Необходимо указать телефон';
			}
		}

		this.events.emit('formErrors:change', errors);
		return Object.keys(errors).length === 0;
	}

	clearCustomerData() {
		this.customer = { 
			payment: '', 
			address: '', 
			email: '', 
			phone: '' 
		};
		this.events.emit('customer:updated', { customer: this.customer });
	}
}
