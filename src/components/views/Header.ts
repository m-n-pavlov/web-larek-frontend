import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

interface IHeaderData {
  counter: number; // данные - это счетчик кол-ва товаров
}

export class Header extends Component<IHeaderData> {
  protected counterElement: HTMLElement; // счетчик кол-ва товаров
  protected basketButton: HTMLButtonElement; // иконка (кнопка) корзины

  // В container конструктор принимает сам элемент шапки сайта (header)
  constructor(container: HTMLElement, protected events: IEvents) {
    super(container); // вызывает конструктор базового класса Component и передаёт туда container

    // получаем в переменную элемент счетчика
    this.counterElement = ensureElement<HTMLElement>(
      '.header__basket-counter',
      this.container
    );

    // получаем в переменную элемент иконки (кнопки) корзины
    this.basketButton = ensureElement<HTMLButtonElement>(
      '.header__basket',
      this.container
    );

    // клик по иконке (кнопке) триггерит событие "пользователь хочет открыть корзину"
    this.basketButton.addEventListener('click', () => {
      this.events.emit('basket:open'); 
    });
  }

  // // сеттер, чтобы удобно обновлять отображение счётчика товаров без прямого доступа к DOM
  set counter(value: number) {
    this.setText(this.counterElement, value); 
  }
}
