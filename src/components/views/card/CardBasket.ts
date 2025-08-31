import { TCardData, Card } from "./Card";
import { ensureElement } from "../../../utils/utils";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";

export type TCardBasket = TCardData & Pick<IProduct, 'id'>; // title, price + расширяю id

export class CardBasket extends Card<TCardBasket> {
  protected id: string;
  protected deleteButton: HTMLButtonElement;
  protected indexElement: HTMLElement;

  constructor(
    container: HTMLElement,
    events: IEvents,
    data?: TCardBasket
  ) {
    super(container);

    this.id = data?.id ?? '';

    this.deleteButton =
      ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

    this.indexElement =
      ensureElement<HTMLElement>('.basket__item-index', this.container);

    this.deleteButton.addEventListener('click', () => {
      events.emit('basket:remove', { id: this.id });
    });
  }

  // сеттер для индекса карточки
  set index(value: number) {
    this.indexElement.textContent = String(value);
  }

  // геттер для индекса карточки
  get index(): number {
    const text = this.indexElement.textContent;
    return text ? Number(text) : 0;
  }

  // геттер для внутреннего id карточки
  get cardId(): string {
    return this.id;
  }
}
