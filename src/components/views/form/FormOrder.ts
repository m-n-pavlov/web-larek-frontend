import { Form } from "./Form";
import { TFormOrder } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

export class FormOrder extends Form<TFormOrder> {
  private _cardButton: HTMLButtonElement;
  private _cashButton: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    this._cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);

    this._cardButton.addEventListener('click', () => this.setPayment('card'));
    this._cashButton.addEventListener('click', () => this.setPayment('cash'));
  }

  private setPayment(method: 'card' | 'cash') {
    if (method === 'card') {
      this._cardButton.classList.add('button_alt-active');
      this._cashButton.classList.remove('button_alt-active');
    } else {
      this._cashButton.classList.add('button_alt-active');
      this._cardButton.classList.remove('button_alt-active');
    }

    this.onInputChange('payment', method);
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }

  disableButtons() {
    this._cardButton.classList.remove('button_alt-active');
    this._cashButton.classList.remove('button_alt-active');
  }
}
