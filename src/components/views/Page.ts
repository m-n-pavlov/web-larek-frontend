import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { Header } from "./Header";
import { Gallery } from "./Gallery";
import { ensureElement } from "../../utils/utils";

interface IPageData {
  locked: boolean; // блокировка прокрутки
}

export class Page extends Component<IPageData> {
  header: Header;
  gallery: Gallery;
  wrapper: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.wrapper = ensureElement<HTMLElement>('.page__wrapper', container);

    this.header = new Header(container, events);
    this.gallery = new Gallery(container);

    // подписка на события модалки
    this.events.on('modal:open', () => this.locked = true);
    this.events.on('modal:close', () => this.locked = false);
  }

  // сеттер для блокировки прокрутки
  set locked(value: boolean) {
    if (value) {
      this.wrapper.classList.add('page__wrapper_locked');
    } else {
      this.wrapper.classList.remove('page__wrapper_locked');
    }
  }
}
