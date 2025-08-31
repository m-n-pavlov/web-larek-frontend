import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/events';

export interface IContactsData {
  email: string;
  phone: string;
}

export class FormContacts {
  element: HTMLElement;
  private events: IEvents;
  private data: IContactsData = { email: '', phone: '' };

  public onSubmit: () => void = () => {};

  private submitBtn!: HTMLButtonElement;
  private emailInput?: HTMLInputElement;
  private phoneInput?: HTMLInputElement;
  private errorsEl?: HTMLElement;

  constructor(template: HTMLElement, events: IEvents) {
    this.element = template;
    this.events = events;
    this.bindUI();
    this.validate();
  }

  private bindUI() {
    this.submitBtn =
      ensureElement<HTMLButtonElement>('button[type=submit]', this.element);

    this.emailInput =
      this.element.querySelector<HTMLInputElement>('input[name=email]') ?? undefined;
    this.phoneInput =
      this.element.querySelector<HTMLInputElement>('input[name=phone]') ?? undefined;

    if (this.emailInput)
      this.emailInput.addEventListener('input', () => {
        this.data.email = this.emailInput!.value;
        this.validate();
      });

    if (this.phoneInput)
      this.phoneInput.addEventListener('input', () => {
        this.data.phone = this.phoneInput!.value;
        this.validate();
      });

    this.submitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.collectData();
      this.onSubmit();
    });

    this.errorsEl =
      this.element.querySelector<HTMLElement>('.form__errors') ?? undefined;
  }

  collectData() {
    this.data.email = this.emailInput?.value || '';
    this.data.phone = this.phoneInput?.value || '';
  }

  getData(): IContactsData {
    return { ...this.data };
  }

  setData(d: Partial<IContactsData>) {
    this.data = { ...this.data, ...d };
    if (typeof d.email === 'string' && this.emailInput) this.emailInput.value = d.email;
    if (typeof d.phone === 'string' && this.phoneInput) this.phoneInput.value = d.phone;
    this.validate();
  }

  setErrors(errors: Record<string, string>) {
    if (!this.errorsEl)
      this.errorsEl = this.element.querySelector<HTMLElement>('.form__errors') ?? undefined;
    if (this.errorsEl) {
      this.errorsEl.textContent = Object.values(errors).join('; ');
    }
  }

  private validate() {
    const errors: Record<string, string> = {};
    if (!this.data.email) errors.email = 'Необходимо указать email';
    if (!this.data.phone) errors.phone = 'Необходимо указать телефон';

    const valid = Object.keys(errors).length === 0;

    if (this.submitBtn) this.submitBtn.disabled = !valid;

    this.setErrors(errors);
    return valid;
  }
}
