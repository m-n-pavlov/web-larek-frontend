import { Model } from "../base/Model";
import { IEvents } from "../base/events";
import { IBasketModel } from "../../types";
import { TCardBasket } from "../../types";

export class BasketModel extends Model<IBasketModel> implements IBasketModel {
  items: TCardBasket[];

  constructor(data: Partial<IBasketModel>, events: IEvents) {
    super(data, events);
    this.items = data?.items ?? [];
  }

  addItem(item: TCardBasket): void {
    if (this.containsItem(item.id)) {
      return;
    }

    this.items.push({ ...item });
    this.emitChanges('basket:items:updated', { items: this.getItems() });
  }

  removeItem(itemId: string): void {
    const initialLength = this.items.length;
    this.items = this.items.filter(i => i.id !== itemId);

    if (this.items.length === initialLength) {
      return;
    }

    this.emitChanges('basket:items:updated', { items: this.getItems() });
  }

  getCount(): number {
    return this.items.length;
  }

  getItems(): TCardBasket[] {
    return this.items.map(i => ({ ...i }));
  }

  getTotal(): number {
    return this.items.reduce((sum, it) => sum + (it.price ?? 0), 0);
  }

  containsItem(itemId: string): boolean {
    return this.items.some(i => i.id === itemId);
  }

  clearItems(): void {
    if (this.items.length === 0) return;

    this.items = [];
    this.emitChanges('basket:items:cleared', {});
    this.emitChanges('basket:items:updated', { items: this.getItems() });
  }
}
