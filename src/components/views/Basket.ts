import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { ensureElement, createElement, handlePrice } from "../../utils/utils";

interface IBasket {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasket> {
  protected _list: HTMLElement;
  protected _total: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this._list = ensureElement<HTMLElement>('.basket__list', this.container);
    this._total = this.container.querySelector('.basket__price');
    this._button = this.container.querySelector('.basket__button');

    if (this._button) {
      this._button.addEventListener('click', () => {
        events.emit('basket:go-to-order-step');
      });
    }

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this._list.replaceChildren(...items);
    } else {
      this._list.replaceChildren(
        createElement<HTMLParagraphElement>('p', {
          textContent: 'Корзина пуста'
        })
      );
    }
  }

  set selected(hasItems: boolean) {
    this.setDisabled(this._button, !hasItems);
  }

  set total(total: number) {
    this.setText(this._total, handlePrice(total) + ' синапсов');
  }
}
