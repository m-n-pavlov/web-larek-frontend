import { Card } from "./Card";
import { TCardPreview } from "../../../types";
import { ensureElement } from "../../../utils/utils";
import { ICardActions, CategoryKey } from "./Card";
import { categoryMap } from "../../../utils/constants";

export interface ICardPreviewActions extends ICardActions {
  onButtonClick?: (id: string) => void;
}

export class CardPreview extends Card<TCardPreview> {
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;
  protected _description: HTMLElement;
  protected _button: HTMLButtonElement;

  public inBasket: boolean = false;

  constructor(container: HTMLElement, actions?: ICardPreviewActions) {
    super(container, {});

    this._image = ensureElement<HTMLImageElement>('.card__image', this.container);
    this._category = ensureElement<HTMLElement>('.card__category', this.container);
    this._description = ensureElement<HTMLElement>('.card__text', this.container);
    this._button = ensureElement<HTMLButtonElement>('.card__button', this.container);

    if (actions?.onButtonClick) {
      this._button.addEventListener('click', (e) => {
        e.stopPropagation();
        actions.onButtonClick?.(this.id);
      });
    }
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  set description(value: string) {
    this.setText(this._description, value);
  }

  set category(value: string) {
    this.setText(this._category, value);

    for (const key in categoryMap) {
      this._category.classList.toggle(categoryMap[key as CategoryKey], key === value);
    }
  }

  set price(value: number | null) {
    super.price = value;
    this.setDisabled(this._button, value === null);
  }

  public updateButtonText() {
    this._button.textContent = this.inBasket ? 'Удалить из корзины' : 'Купить';
  }
}
