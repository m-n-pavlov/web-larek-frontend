import { IEvents } from '../../base/events';
import { TCartData } from '../../../types';
import { handlePrice } from '../../../utils/utils';

export type ICardPreviewData = TCartData & { inBasket?: boolean };

export class CardPreview {
  element: HTMLElement;
  private events: IEvents;
  private data: ICardPreviewData;

  public onAddToBasket: () => void = () => {};
  public onRemoveFromBasket: () => void = () => {};

  constructor(
    template: HTMLElement,
    events: IEvents,
    data: ICardPreviewData
  ) {
    this.element = template;
    this.events = events;
    this.data = { ...data, inBasket: !!data.inBasket };
    this.bindUI();

    // Применяем стартовые значения (текст/disabled кнопки и т.д.)
    this.applyPriceState(this.data.price);
    this.setInBasket(this.data.inBasket === true);
  }

  private bindUI() {
    const actionBtn = this.element.querySelector<HTMLButtonElement>('.button');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Если товар бесценный — не делаем никаких действий
        if (this.data.price === null) return;

        if (this.data.inBasket) {
          this.onRemoveFromBasket();
          this.setInBasket(false);
        } else {
          this.onAddToBasket();
          this.setInBasket(true);
        }
      });
    }
  }

  set title(v: string) {
    const el = this.element.querySelector<HTMLElement>('.card__title');
    if (el) el.textContent = v;
  }

  set price(v: number | null) {
    const el = this.element.querySelector<HTMLElement>('.card__price');
    if (!el) return;
    el.textContent = v !== null ? handlePrice(v) + ' синапсов' : 'Бесценно';
    this.data.price = v;
    this.applyPriceState(v);
  }

  set category(v: string) {
    const el = this.element.querySelector<HTMLElement>('.card__category');
    if (el) el.textContent = v;
  }

  set description(v: string) {
    const el = this.element.querySelector<HTMLElement>('.card__text');
    if (el) el.textContent = v;
  }

  set image(v: string) {
    const img = this.element.querySelector<HTMLImageElement>('img');
    if (img) img.src = v;
  }

  // Применяет поведение кнопки в зависимости от цены
  private applyPriceState(price: number | null) {
    const actionBtn = this.element.querySelector<HTMLButtonElement>('.button');
    if (!actionBtn) return;

    if (price === null) {
      // товар бесценный — блокируем кнопку
      actionBtn.disabled = true;
      return;
    }

    // товар с ценой — включаем кнопку и ставим текст в соответствии с состоянием
    actionBtn.disabled = false;
    actionBtn.textContent = this.data.inBasket ? 'Удалить из корзины' : 'В корзину';
  }

  setInBasket(flag: boolean) {
    this.data.inBasket = flag;
    const actionBtn = this.element.querySelector<HTMLButtonElement>('.button');
    if (!actionBtn) return;

    if (this.data.price === null) return;

    actionBtn.textContent = flag ? 'Удалить из корзины' : 'В корзину';
    actionBtn.classList.toggle('button_in-basket', flag);
  }

  set inBasket(flag: boolean) {
    this.setInBasket(flag);
  }
}
