import { Component } from "../base/Component";
import { ensureElement, handlePrice } from "../../utils/utils";

interface ISuccess {
  description: number;
}

interface ISuccessActions {
  onClick: () => void;
}

export class Success extends Component<ISuccess> {
  protected descriptionElement: HTMLElement;
  protected successButton: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ISuccessActions) {
    super(container);

    this.descriptionElement = ensureElement<HTMLElement>(
      '.order-success__description',
      this.container
    );
    this.successButton = ensureElement<HTMLButtonElement>(
      '.order-success__close',
      this.container
    );

    if (actions?.onClick) {
      this.successButton.addEventListener('click', actions.onClick);
    }
  }

  set description(value: number) {
    this.setText(
      this.descriptionElement,
      'Списано ' + handlePrice(value) + ' синапсов'
    );
  }
}
