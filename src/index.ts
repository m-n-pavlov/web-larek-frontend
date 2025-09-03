import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { WebLarekAPI } from './components/WebLarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { CatalogModel } from './components/models/CatalogModel';
import { BasketModel } from './components/models/BasketModel';
import { OrderModel } from './components/models/OrderModel';

import { Page } from './components/views/Page';
import { CardCatalog } from './components/views/card/CardCatalog';
import { CardPreview } from './components/views/card/CardPreview';
import { CardBasket } from './components/views/card/CardBasket';
import { Modal } from './components/views/Modal';
import { Basket } from './components/views/Basket';
import { FormOrder } from './components/views/form/FormOrder';
import { FormContacts } from './components/views/form/FormContacts';
import { Success } from './components/views/Success';
import { ICustomer } from './types';

import type { IProduct, IOrderRequest } from './types';
import type { TCardBasket } from './types';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// ✅ Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// ✅ Модели
const catalogModel = new CatalogModel({}, events);
const basketModel = new BasketModel({}, events);
const orderModel = new OrderModel({}, events);

// ✅ UI Компоненты
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const basketView = new Basket(cloneTemplate(basketTemplate), events);
basketView.items = [];
basketView.total = 0;
basketView.selected = [];

const formOrder = new FormOrder(cloneTemplate(orderTemplate) as HTMLFormElement, events);
const formContacts = new FormContacts(cloneTemplate(contactsTemplate) as HTMLFormElement, events);

type ContactsData = {
  email?: string;
  phone?: string;
};

// ---------------------------
// ✅ Управление скроллом страницы
// ---------------------------
events.on('modal:open', () => { page.locked = true; });
events.on('modal:close', () => { page.locked = false; });

// ---------------------------
// ✅ Каталог
// ---------------------------
events.on('catalog:products:updated', () => {
  page.catalog = catalogModel.products.map(product => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onCardClick: () => events.emit('card:select', product)
    });
    card.id = product.id;
    card.title = product.title;
    card.price = product.price;
    card.category = product.category;
    card.image = product.image;
    return card.render();
  });
});

// ---------------------------
// ✅ Превью карточки товара
// ---------------------------
events.on('card:select', (product: IProduct) => {
  const preview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onButtonClick: (id) => {
      if (basketModel.containsItem(id)) {
        basketModel.removeItem(id);
        preview.inBasket = false;
      } else {
        basketModel.addItem({ id: product.id, title: product.title, price: product.price });
        preview.inBasket = true;
      }
      preview.updateButtonText();
    }
  });

  preview.id = product.id;
  preview.title = product.title;
  preview.price = product.price;
  preview.category = product.category;
  preview.image = product.image;
  preview.description = product.description;
  preview.inBasket = basketModel.containsItem(product.id);
  preview.updateButtonText();

  modal.render({ content: preview.render() });
});

// ---------------------------
// ✅ Корзина
// ---------------------------
events.on<{ id: string }>('basket:item-delete', (payload) => {
  if (!payload?.id) return;
  basketModel.removeItem(payload.id);
});

events.on<{ items: TCardBasket[] }>('basket:items:updated', (data) => {
  const items = data.items ?? [];
  basketView.items = items.map((it, idx) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onDeleteClick: (id) => events.emit('basket:item-delete', { id })
    });
    card.id = it.id;
    card.title = it.title;
    card.price = it.price;
    card.index = idx + 1;
    return card.render();
  });

  basketView.total = basketModel.getTotal();
  page.counter = basketModel.getCount();
  basketView.selected = items.map(i => i.id);
});

events.on('basket:items:cleared', () => {
  basketView.items = [];
  basketView.total = 0;
  page.counter = 0;
  basketView.selected = [];
});

events.on('basket:open', () => {
  modal.render({ content: basketView.render() });
});

events.on('basket:go-to-order-step', () => {
  events.emit('order:open', {
    items: basketModel.getItems().map(i => i.id),
    total: basketModel.getTotal()
  });
});

// ---------------------------
// ✅ Заказ
// ---------------------------
events.on('order:open', (payload?: { items?: string[]; total?: number }) => {
  if (payload) {
    orderModel.setItems(payload.items ?? []);
    orderModel.setTotal(payload.total ?? 0);
  }

  orderModel.setCustomerData({ email: '', phone: '' } as Partial<ContactsData>, 'contacts');

  modal.render({
    content: formOrder.render({
      payment: '',
      address: '',
      valid: false,
      errors: []
    })
  });

  formOrder.disableButtons();
});

events.on(/^order\..*:change/, ({ field, value }: { field: string; value: string }) => {
  if (field === 'payment') {
    const data: Partial<ICustomer> = { payment: value as ICustomer['payment'] };
    orderModel.setCustomerData(data, 'shipping');
  } else if (field === 'address') {
    orderModel.setCustomerData({ address: value }, 'shipping');
  } else {
    console.warn('Unknown shipping field:', field);
  }
});

events.on(/^contacts\..*:change/, ({ field, value }: { field: string; value: string }) => {
  if (field === 'email') {
    orderModel.setCustomerData({ email: value }, 'contacts');
  } else if (field === 'phone') {
    orderModel.setCustomerData({ phone: value }, 'contacts');
  } else {
    console.warn('Unknown contacts field:', field);
  }
});

events.on('formErrors:change', (errors: Partial<Record<string, string>>) => {
  const { email, phone, payment, address } = errors;

  formOrder.valid = !payment && !address;
  formOrder.errors = Object.values({ payment, address }).filter(Boolean).join('; ');

  formContacts.valid = !email && !phone;
  formContacts.errors = Object.values({ email, phone }).filter(Boolean).join('; ');
});

events.on('order:submit', () => {
  if (!orderModel.validateCustomerData('shipping')) return;
  events.emit('contacts:open');
});

events.on('contacts:open', () => {
  modal.render({
    content: formContacts.render({
      email: orderModel.customer.email || '',
      phone: orderModel.customer.phone || '',
      valid: false,
      errors: []
    })
  });
});

events.on('contacts:submit', () => {
  if (!orderModel.validateCustomerData('contacts')) return;

  const payload = orderModel.getOrderData() as IOrderRequest;

  api.postOrder(payload)
    .then(result => {
      basketModel.clearItems();
      orderModel.clearCustomerData();

      const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => modal.close()
      });
      success.total = result.total;
      modal.render({ content: success.render() });
    })
    .catch(err => console.error('Order failed', err));
});

events.on('order:customer:cleared', () => {
  formOrder.address = '';
  formOrder.disableButtons();
  formOrder.valid = false;
  formOrder.errors = '';

  formContacts.email = '';
  formContacts.phone = '';
  formContacts.valid = false;
  formContacts.errors = '';

  page.counter = basketModel.getCount();
});

// ---------------------------
// ✅ Инициализация
// ---------------------------
api.getProductList()
  .then(products => catalogModel.setProducts(products))
  .catch(err => console.error('Failed to load products', err));
