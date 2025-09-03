import { Card } from "./Card";
import { TCardCatalog } from "../../../types";
import { ensureElement } from "../../../utils/utils";
import { ICardActions } from "./Card";
import { categoryMap } from "../../../utils/constants";
import { CategoryKey } from "./Card";

export class CardCatalog extends Card<TCardCatalog> {
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container, actions);
    this._image = ensureElement<HTMLImageElement>('.card__image', this.container);
    this._category = ensureElement<HTMLElement>('.card__category', this.container);
  }

  set image(value: string) {
    this.setImage(this._image, value, this.title);
  }

  set category(value: string) {
    this.setText(this._category, value);

    for (const key in categoryMap) {
      this._category.classList.toggle(categoryMap[key as CategoryKey], key === value);
    }
  }
}
