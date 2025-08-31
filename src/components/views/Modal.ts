import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

interface IModalData {
  content: HTMLElement | null; // данные - это сами клонированные шаблоны <template>
}

// Класс, управляющий модальным окном (открытие, закрытие, вставка контента, события)
export class Modal extends Component<IModalData> {
  protected closeButton: HTMLButtonElement; // кнопка закрытия
  protected contentContainer: HTMLElement; // контейнер для контента (div.modal__content внутри div.modal-container)

  // В container конструктор принимает весь DOM-контейнер #modal-container  
  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>(
      '.modal__close',
      container
    );

    this.contentContainer = ensureElement<HTMLElement>(
      '.modal__content',
      container
    );

    // клик по кнопке закрытия
    this.closeButton.addEventListener('click', this.close.bind(this));

    // клик по фону закрывает модалку
    this.container.addEventListener('click', (e) => {
      // если клик не внутри .modal__container, закрываем
      if (!(e.target as HTMLElement).closest('.modal__container')) { 
        // внутренняя оболочка модалки, используется только в обработчике клика
        this.close();
      }
    });

    // клик внутри контента не закрывает модалку
    this.contentContainer.addEventListener('click', (e) => e.stopPropagation());
  }

  // открыть модалку
  open() {
    this.toggleClass(this.container, 'modal_active', true);
    this.events.emit('modal:open');
  }

  // закрыть модалку
  close() {
    this.toggleClass(this.container, 'modal_active', false);
    this.content = null; // очищаем контент
    this.events.emit('modal:close');
  }

  // вставка/очистка содержимого
  set content(element: HTMLElement | null) {
    if (element) {
      this.contentContainer.replaceChildren(element);
    } else {
      this.contentContainer.replaceChildren();
    }
  }
}
