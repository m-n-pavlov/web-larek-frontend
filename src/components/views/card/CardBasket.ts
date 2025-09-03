import { Card } from "./Card";
import { TCardBasket } from "../../../types";
import { ensureElement } from "../../../utils/utils";
import { ICardActions } from "./Card";

export interface ICardBasketActions extends ICardActions {
  onDeleteClick?: (id: string) => void;
}

export class CardBasket extends Card<TCardBasket> {
  protected _index: HTMLElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardBasketActions) {
    super(container, {});

    this._index = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this._button = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

    if (actions?.onDeleteClick) {
      this._button.addEventListener('click', (e) => {
        e.stopPropagation();
        actions.onDeleteClick?.(this.id);
      });
    }
  }

  set index(value: number) {
    this.setText(this._index, value);
  }
}
