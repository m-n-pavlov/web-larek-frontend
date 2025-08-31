import { IEvents } from '../base/events';
import { IBasketModel, TCartData } from '../../types';

export class BasketModel implements IBasketModel {
	items: TCartData[] = [];

	private events: IEvents;

	constructor(initial: Partial<IBasketModel> = {}, events: IEvents) {
		this.items = initial.items || [];
		this.events = events;
	}

	addItem(item: TCartData) {
		if (!this.containsItem(item.id)) {
			this.items.push(item);
			this.events.emit('basket:updated', { items: this.items });
			this.events.emit('basket:count', { count: this.getCount() });
		}
	}

	removeItem(itemId: string) {
		this.items = this.items.filter(i => i.id !== itemId);
		this.events.emit('basket:updated', { items: this.items });
		this.events.emit('basket:count', { count: this.getCount() });
	}

	containsItem(itemId: string): boolean {
		return this.items.some(i => i.id === itemId);
	}

	getItems(): TCartData[] {
		return [...this.items];
	}

	getCount(): number {
		return this.items.length;
	}

	getTotal(): number {
		return this.items.reduce((sum, i) => sum + (i.price || 0), 0);
	}

	clearItems() {
		this.items = [];
		this.events.emit('basket:updated', { items: this.items });
		this.events.emit('basket:count', { count: 0 });
	}
}
