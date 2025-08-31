import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { WebLarekAPI } from './components/WebLarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement, handlePrice } from './utils/utils';
import { IProduct } from './types';

// View
import { Page } from './components/views/Page';
import { Modal } from './components/views/Modal';
import { Header } from './components/views/Header';
import { Basket } from './components/views/Basket';
import { CardCatalog } from './components/views/card/CardCatalog';
import { CardPreview } from './components/views/card/CardPreview';
import { FormOrder } from './components/views/form/FormOrder';
import { FormContacts } from './components/views/form/FormContacts';

// Models
import { BasketModel } from './components/models/BasketModel';
import { CatalogModel } from './components/models/CatalogModel';
import { CustomerModel } from './components/models/CustomerModel';

// Шаблоны (html)
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Инициализация
const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

const basketModel = new BasketModel({}, events);
const catalogModel = new CatalogModel({}, events);
const customerModel = new CustomerModel({}, events);

// UI
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const header = new Header(ensureElement<HTMLElement>('header.header'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);

// Формы
const shippingForm = new FormOrder(cloneTemplate(orderTemplate), events);
const contactsForm = new FormContacts(cloneTemplate(contactsTemplate), events);

// Вспомогательные функции
function renderBasketItems(): void {
  const items = basketModel.getItems();
  const elements: HTMLElement[] = items.map((item, i) => {
    const li = cloneTemplate(cardBasketTemplate);
    const titleEl = ensureElement<HTMLElement>('.card__title', li);
    const priceEl = ensureElement<HTMLElement>('.card__price', li);
    const indexEl = ensureElement<HTMLElement>('.basket__item-index', li);
    const deleteBtn = ensureElement<HTMLButtonElement>('.basket__item-delete', li);

    titleEl.textContent = item.title;
    priceEl.textContent =
      item.price !== null
        ? handlePrice(item.price) + ' синапсов'
        : 'Бесценно';
    indexEl.textContent = String(i + 1);

    deleteBtn.addEventListener('click', () =>
      events.emit('basket:remove', { id: item.id })
    );

    return li;
  });

  basket.items = elements;
  basket.price = basketModel.getTotal();
}

function openModalWithElement(el: HTMLElement) {
  modal.content = el;
  modal.open();
}

// Синхронизация корзины (слушатели/действия)
events.on<{ id: string }>('basket:remove', ({ id }) => {
  basketModel.removeItem(id);
});

events.on('basket:updated', () => renderBasketItems());

events.on<{ count: number }>('basket:count', ({ count }) => {
  header.counter = count;
});

events.on('basket:open', () => {
  renderBasketItems();
  openModalWithElement(basket.element);
});

// Каталог: загрузка и рендер карточек
api
  .getProductList()
  .then((products: IProduct[]) => {
    catalogModel.setProducts(products);

    const catalogCards = products.map(product => {
      // CardCatalog — для структуры карточки
      const card = new CardCatalog(
        cloneTemplate(cardCatalogTemplate),
        product,
        {
          onClick: () => {
            // Открываем превью — создаём CardPreview и подключаем обработчики
            const preview = new CardPreview(
              cloneTemplate(cardPreviewTemplate),
              events,
              {
                id: product.id,
                title: product.title,
                price: product.price,
                inBasket: basketModel.containsItem(product.id),
              }
            );

            // заполнение данных
            preview.title = product.title;
            preview.price = product.price;
            preview.category = product.category;
            preview.description = product.description;
            preview.image = product.image;

            // коллбеки — делаем операции через модели и события
            preview.onAddToBasket = () => {
              // безопасная защита — если цена null, не добавляем
              if (product.price === null) return;
              if (!basketModel.containsItem(product.id)) {
                basketModel.addItem({
                  id: product.id,
                  title: product.title,
                  price: product.price,
                });
              }
              preview.setInBasket(true);
            };
            preview.onRemoveFromBasket = () => {
              if (basketModel.containsItem(product.id)) {
                basketModel.removeItem(product.id);
              }
              preview.inBasket = false;
            };

            openModalWithElement(preview.element);
          },
        }
      );

      // наполняем карточку каталога
      card.title = product.title;
      card.price = product.price;
      card.category = product.category;
      card.image = product.image;

      return card.element;
    });

    page.gallery.catalog = catalogCards;
  })
  .catch(console.error);

// Добавление товара в корзину из каталога (событие)
events.on<{ id: string }>('catalog:add-to-basket', ({ id }) => {
  const productPreview = catalogModel.getProducts().find(p => p.id === id);
  if (!productPreview) return;
  if (productPreview.price === null) {
    // товар бесценный — не добавляем
    return;
  }
  if (!basketModel.containsItem(id)) {
    basketModel.addItem({
      id: productPreview.id,
      title: productPreview.title,
      price: productPreview.price,
    });
  }
});

// Шаги оформления заказа (валидация + переходы)

// при изменениях ошибок формы — обновляем текст ошибок в модалке
events.on('formErrors:change', (errors: Record<string, string>) => {
  shippingForm.setErrors(errors);
  contactsForm.setErrors(errors);
});

// Открыть первый шаг — shipping
events.on('basket:go-to-order-step', () => {
  // сброс данных формы (в UI — клонировать свежий шаблон)
  shippingForm.setData({ payment: '', address: '' });
  openModalWithElement(shippingForm.element);
});

// shipping submit
shippingForm.onSubmit = () => {
  shippingForm.collectData();
  customerModel.setCustomerData({
    payment: shippingForm.getData().payment,
    address: shippingForm.getData().address,
  });

  if (!customerModel.validateCustomerData('shipping')) {
    return;
  }

  events.emit('order:go-to-contacts-step');
};

// Открыть второй шаг — contacts
events.on('order:go-to-contacts-step', () => {
  contactsForm.setData({ email: '', phone: '' });
  openModalWithElement(contactsForm.element);
});

// contacts submit
contactsForm.onSubmit = () => {
  contactsForm.collectData();
  customerModel.setCustomerData({
    email: contactsForm.getData().email,
    phone: contactsForm.getData().phone,
  });

  if (!customerModel.validateCustomerData('contacts')) {
    return;
  }

  events.emit('contacts:final-submit');

  shippingForm.resetPayment();
};

// финальная отправка заказа
events.on('contacts:final-submit', async () => {
  const customer = customerModel.getCustomerData();
  const items = basketModel.getItems().map(i => i.id);
  const total = basketModel.getTotal();

  try {
    const res = await api.createOrder({
      payment: customer.payment as 'card' | 'cash',
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      total,
      items,
    });

    // СБРОС ДАННЫХ ПОКУПАТЕЛЯ И ФОРМ (чтобы выбранный способ оплаты исчез)
    customerModel.clearCustomerData();
    shippingForm.setData({ payment: '', address: '' });
    contactsForm.setData({ email: '', phone: '' });

    // Очистка корзины
    basketModel.clearItems();

    // Показываем success (клонируем шаблон и вставляем данные)
    const successView = cloneTemplate(successTemplate);
    const descEl = successView.querySelector<HTMLElement>(
      '.order-success__description'
    );
    if (descEl)
      descEl.textContent = 'Списано ' + handlePrice(res.total) + ' синапсов';
    const closeBtn = successView.querySelector<HTMLButtonElement>(
      '.order-success__close'
    );
    if (closeBtn) closeBtn.addEventListener('click', () => modal.close());

    openModalWithElement(successView);

    // очистка корзины
    basketModel.clearItems();
  } catch (err: any) {
    console.error(err);
    alert(err?.error || 'Ошибка при создании заказа');
  }
});

// Блокировка скролла при модалке
events.on('modal:open', () => {
  page.locked = true;
});
events.on('modal:close', () => {
  page.locked = false;
});
