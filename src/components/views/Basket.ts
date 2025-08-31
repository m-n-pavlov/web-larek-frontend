import { Component } from "../base/Component";
import { ensureElement, handlePrice, createElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { CardBasket } from "./card/CardBasket";

interface IBasket {
  basketItems: CardBasket[];
  basketPrice: number;
}

export class Basket extends Component<IBasket> {
  protected basketItem: HTMLElement;
  protected basketPrice: HTMLElement;
  protected basketButton: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.basketItem = ensureElement<HTMLElement>('.basket__list', this.container);
    this.basketPrice = ensureElement<HTMLElement>('.basket__price', this.container);
    this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

    this.basketButton.addEventListener('click', () => {
      this.events.emit('basket:go-to-order-step');
    });
  }

  // Сеттер для общей стоимости товаров
  set price(price: number) {
    this.setText(
      this.basketPrice,
      handlePrice(price) + ' синапсов'
    );
  }

  // Сеттер для элементов корзины
  set items(items: HTMLElement[]) {
    if (items.length) {
      // Если есть элементы — отображаем их
      this.basketItem.replaceChildren(...items);
    } else {
      // Если корзина пуста — показываем сообщение
      const emptyMessage = createElement('p', { textContent: 'Корзина пуста' });
      this.basketItem.replaceChildren(emptyMessage);
    }

    this.basketButton.disabled = items.length === 0;
  }

  get element(): HTMLElement {
    return this.container;
  }
}
