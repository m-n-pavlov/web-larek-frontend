import { ensureElement } from "../../../utils/utils";
import { Card, ICardActions, CategoryKey } from "./Card";
import { IProduct } from "../../../types";
import { categoryMap } from "../../../utils/constants";
import { TCardBasket } from "./CardBasket";

export type TCardCatalog =
  TCardBasket &
  Pick<IProduct, 'category' | 'image'>; // title, price, id + расширяю category, image

export class CardCatalog extends Card<TCardCatalog> {
  protected imageElement: HTMLImageElement;
  protected categoryElement: HTMLElement;
  protected id: string; // внутренний идентификатор карточки

  constructor(
    container: HTMLElement,
    data?: TCardCatalog,
    actions?: ICardActions
  ) {
    super(container, actions);

    this.id = data.id; // сохраняю id для внутренней логики
    this.imageElement =
      ensureElement<HTMLImageElement>('.card__image', this.container);
    this.categoryElement =
      ensureElement<HTMLElement>('.card__category', this.container);
  }

  set image(value: string) {
    this.setImage(this.imageElement, value, this.title);
  }

  set category(value: string) {
    this.setText(this.categoryElement, value);

    for (const key in categoryMap) {
      this.categoryElement.classList.toggle(
        categoryMap[key as CategoryKey],
        key === value
      );
    }
  }
}
