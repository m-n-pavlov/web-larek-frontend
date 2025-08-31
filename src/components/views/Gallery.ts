import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";

interface IGalleryData {
  catalog: HTMLElement[]; // данные - это список карточек (готовых элементов #card-catalog)
}

export class Gallery extends Component<IGalleryData> {
  protected catalogElement: HTMLElement; // контейнер main.gallery, куда будет вставлен массив карточек

  // В container конструктор принимает div.page__wrapper
  constructor(container: HTMLElement) {
    super(container); // вызывает конструктор базового класса Component и передаёт туда container

    // контейнер main.gallery, куда будет вставлен массив карточек
    this.catalogElement = ensureElement<HTMLElement>(
      '.gallery',
      this.container
    );
  }

  // сеттер — принимает список карточек и рендерит их в галерее
  set catalog(items: HTMLElement[]) {
    this.catalogElement.replaceChildren(...items);
  }
}
