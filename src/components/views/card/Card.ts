import { categoryMap } from '../../../utils/constants';
import { IProduct } from '../../../types';
import { Component } from '../../base/Component';
import { ensureElement, handlePrice } from '../../../utils/utils';

export type CategoryKey = keyof typeof categoryMap;

// Интерфейс колбэков карточки товара
export interface ICardActions {
  onClick: () => void;
}

// Тип данных карточки товара (только общие поля для всех карточек)
export type TCardData = Pick<IProduct, 'title' | 'price'>; // title и price

// Базовый класс карточки товара
export abstract class Card<T extends TCardData> extends Component<T> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;

  constructor(
    container: HTMLElement,
    actions?: ICardActions
  ) {
    super(container);

    // Поиск основных элементов внутри контейнера карточки
    this.titleElement =
      ensureElement<HTMLElement>('.card__title', this.container);

    this.priceElement =
      ensureElement<HTMLElement>('.card__price', this.container);

    // Привязка обработчика клика
    if (actions?.onClick) {
      this.container.addEventListener('click', actions.onClick);
    }
  }

  // обновляет текст заголовка в DOM
  set title(value: string) {
    this.setText(this.titleElement, value);
  }

  // обновляет текст цены в DOM
  set price(value: number | null) {
    this.setText(
      this.priceElement,
      value !== null ? handlePrice(value) + ' синапсов' : 'Бесценно'
    );
  }

  // возвращает текущий текст заголовка
  get title(): string {
    return this.titleElement.textContent || '';
  }

  // возвращает число из текста цены или null
  get price(): number | null {
    const text = this.priceElement.textContent?.trim();
    if (!text || text === 'Бесценно') {
      return null;
    }

    const match = text.match(/\d+/); // извлекаем число
    return match ? Number(match[0]) : null;
  }

  // возвращает DOM-элемент карточки
  get element(): HTMLElement {
    return this.container;
  }
}
