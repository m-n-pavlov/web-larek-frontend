import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/events';

export interface IShippingData {
  payment: 'card' | 'cash' | '';
  address: string;
}

export class FormOrder {
  element: HTMLElement;
  private events: IEvents;
  private data: IShippingData = { payment: '', address: '' };

  public onSubmit: () => void = () => {};

  private submitBtn!: HTMLButtonElement;
  private cardBtn?: HTMLButtonElement;
  private cashBtn?: HTMLButtonElement;
  private addressInput?: HTMLInputElement;
  private errorsEl?: HTMLElement;

  constructor(template: HTMLElement, events: IEvents) {
    this.element = template;
    this.events = events;
    this.bindUI();
    this.validate();
  }

  private bindUI() {
    this.cardBtn =
      this.element.querySelector<HTMLButtonElement>('button[name=card]');
    this.cashBtn =
      this.element.querySelector<HTMLButtonElement>('button[name=cash]');

    if (this.cardBtn)
      this.cardBtn.addEventListener('click', () => {
        this.selectPayment('card');
      });
    if (this.cashBtn)
      this.cashBtn.addEventListener('click', () => {
        this.selectPayment('cash');
      });

    this.submitBtn =
      ensureElement<HTMLButtonElement>('button[type=submit]', this.element);
    this.submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.collectData();
      this.onSubmit();
    });

    this.addressInput =
      this.element.querySelector<HTMLInputElement>('input[name=address]') ??
      undefined;
    if (this.addressInput) {
      this.addressInput.addEventListener('input', () => {
        this.data.address = this.addressInput!.value;
        this.validate();
      });
    }

    this.errorsEl =
      this.element.querySelector<HTMLElement>('.form__errors') ?? undefined;
  }

  private selectPayment(method: 'card' | 'cash') {
    this.data.payment = method;
    if (this.cardBtn)
      this.cardBtn.classList.toggle('button_alt-active', method === 'card');
    if (this.cashBtn)
      this.cashBtn.classList.toggle('button_alt-active', method === 'cash');
    this.validate();
  }

  collectData() {
    const checked =
      this.element.querySelector<HTMLInputElement>('input[name=payment]:checked');
    if (checked) this.data.payment = checked.value === 'card' ? 'card' : 'cash';

    this.data.address = this.addressInput?.value || '';
  }

  getData(): IShippingData {
    return { ...this.data };
  }

  setData(d: Partial<IShippingData>) {
    this.data = { ...this.data, ...d };
    if (typeof d.address === 'string' && this.addressInput)
      this.addressInput.value = d.address;
    if (d.payment) {
      if (this.cardBtn)
        this.cardBtn.classList.toggle('button_alt-active', d.payment === 'card');
      if (this.cashBtn)
        this.cashBtn.classList.toggle('button_alt-active', d.payment === 'cash');
    }
    this.validate();
  }

  setErrors(errors: Record<string, string>) {
    if (!this.errorsEl)
      this.errorsEl =
        this.element.querySelector<HTMLElement>('.form__errors') ?? undefined;
    if (this.errorsEl) {
      this.errorsEl.textContent = Object.values(errors).join('; ');
    }
  }

  private validate() {
    const errors: Record<string, string> = {};
    if (!this.data.payment) errors.payment = 'Выберите способ оплаты';
    if (!this.data.address) errors.address = 'Необходимо указать адрес';

    const valid = Object.keys(errors).length === 0;

    if (this.submitBtn) this.submitBtn.disabled = !valid;

    this.setErrors(errors);
    return valid;
  }

  // Метод для сброса выбранного способа оплаты и обновления визуального состояние кнопок на форме
  public resetPayment() {
    this.data.payment = '';
    if (this.cardBtn) this.cardBtn.classList.remove('button_alt-active');
    if (this.cashBtn) this.cashBtn.classList.remove('button_alt-active');
    this.validate();
  }
}
