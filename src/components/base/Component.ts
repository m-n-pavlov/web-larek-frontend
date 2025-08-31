export abstract class Component<T> {
  protected constructor(protected readonly container: HTMLElement) {
    // Код в конструкторе исполняется ДО всех объявлений в дочернем классе
  }

  // Включает или выключает переданный CSS-класс
  toggleClass(element: HTMLElement, className: string, force?: boolean) {
    element.classList.toggle(className, force);
  }

  // Устанавливает текстовое содержимое элемента
  protected setText(element: HTMLElement, value: unknown) {
    if (element) {
      element.textContent = String(value);
    }
  }

  // Добавляет или снимает атрибут disabled
  setDisabled(element: HTMLElement, state: boolean) {
    if (element) {
      if (state) element.setAttribute('disabled', 'disabled');
      else element.removeAttribute('disabled');
    }
  }

  // Скрывает элемент
  protected setHidden(element: HTMLElement) {
    element.style.display = 'none';
  }

  // Показывает элемент
  protected setVisible(element: HTMLElement) {
    element.style.removeProperty('display');
  }

  // Устанавливает изображение с алтернативным текстом
  protected setImage(element: HTMLImageElement, src: string, alt?: string) {
    if (element) {
      element.src = src;
      if (alt) {
        element.alt = alt;
      }
    }
  }

  // Возвращает корневой DOM-элемент (основной публичный метод, который обновляет компонент)
  render(data?: Partial<T>): HTMLElement {
    Object.assign(this as object, data ?? {});
    return this.container;
  }
}
