// API интерфейс тела запроса на сервер при создании заказа
export interface IOrderRequest {
  payment: 'card' | 'cash';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

// API интерфейс ответа сервера при успешном заказе
export interface IOrderResponse {
  id: string;
  total: number;
}

// Тип категорий товара
export type CategoryType =
  | 'другое'
  | 'софт-скил'
  | 'дополнительное'
  | 'кнопка'
  | 'хард-скил';

// Интерфейс данных товара
export interface IProduct {
  id: string; // уникальный id товара
  title: string; // название товара
  description: string; // описание товара
  image: string; // путь к изображению
  category: CategoryType; // категория товара
  price: number | null; // number (цена в синапсах) или null ("Бесценно")
}

// Интерфейс данных покупателя
export interface ICustomer {
  payment: 'card' | 'cash' | "";
  address: string;
  email: string;
  phone: string;
}

// Интерфейс данных заказа (для использования в моделях данных)
export interface IPostOrder extends ICustomer {
  total: number;
  items: string[];
}

// Вспомогательные типы для карточки товара
export type TCard = Pick<IProduct, 'title' | 'price'>; // данные товара в базовом классе карточки
export type TCardCatalog = Omit<IProduct, 'description'>; // данные товара в каталоге
export type TCardPreview = IProduct; // данные товара в превью
export type TCardBasket = Pick<IProduct, 'id' | 'title' | 'price'>; // данные товара в корзине

// Вспомогательные типы для форм
export type TFormOrder = Pick<ICustomer, 'payment' | 'address'>; // форма с выбором способа оплаты и вводом адреса
export type TFormContacts = Pick<ICustomer, 'email' | 'phone'>; // форма с вводом почты и телефона

// Вспомогательный тип для хранения ошибок в формах
export type TFormErrors = Partial<Record<keyof TFormOrder | keyof TFormContacts, string>>; // тип для хранения ошибок в формах

// Интерфейс модели данных каталога
export interface ICatalogModel {
  products: IProduct[]; // хранит массив всех товаров из API
  selectedProduct: string | null; // хранит id выбранного товара
}

// Интерфейс модели данных корзины
export interface IBasketModel {
  items: TCardBasket[]; // массив товаров в корзине (title и price - для отображения, id - для логики)
}

// Интерфейс модели данных заказа
export interface IOrderModel {
  customer: ICustomer; // хранит объект данных покупателя
  items: string[]; // id выбранных товаров
  total: number; // сумма корзины
  formErrors: TFormErrors; // ошибки в форме
}
