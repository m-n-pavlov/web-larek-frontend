import { Component } from "../../base/Component";
import { TCard } from "../../../types";
import { ensureElement, handlePrice } from "../../../utils/utils";
import { categoryMap } from "../../../utils/constants";

export type CategoryKey = keyof typeof categoryMap;

export interface ICardActions {
  onCardClick?: (event: MouseEvent) => void;
}

export abstract class Card<T extends TCard> extends Component<T> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this._title = ensureElement<HTMLElement>('.card__title', this.container);
    this._price = ensureElement<HTMLElement>('.card__price', this.container);

    if (actions?.onCardClick) {
      this.container.addEventListener('click', actions.onCardClick);
    }
  }

  set id(value: string) {
    this.container.dataset.id = value;
  }

  get id(): string {
    return this.container.dataset.id || '';
  }

  set title(value: string) {
    this.setText(this._title, value);
  }

  get title(): string {
    return this._title.textContent || '';
  }

  set price(value: number | null) {
    this.setText(
      this._price,
      value !== null ? handlePrice(value) + ' синапсов' : 'Бесценно'
    );
  }
}
