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

// Данные для приложения, тип категорий товара
export type CategoryType =
  | 'другое'
  | 'софт-скил'
  | 'дополнительное'
  | 'кнопка'
  | 'хард-скил';

// Внутренние данные приложения, интерфейс с типом данных ТОВАР
export interface IProduct {
  id: string; // уникальный id товара
  title: string; // название товара
  description: string; // описание товара
  image: string; // путь к изображению
  category: CategoryType; // категория товара
  price: number | null; // number (цена в синапсах) или null ("Бесценно")
}

// Внутренние данные приложения, интерфейс с типом данных ПОКУПАТЕЛЬ
export interface ICustomer {
  payment: 'card' | 'cash' | ""; // метод оплаты ("" - состояние по умолчанию, когда выбор не сделан)
  address: string; // адрес доставки
  email: string; // email покупателя
  phone: string; // телефон покупателя
}

// Вспомогательные типы для слоя модели данных
export type TProductPreview = Omit<IProduct, 'description'>; // данные товара в каталоге
export type TProductDetails = IProduct; // данные товара в превью
export type TCartData = Pick<IProduct, 'id' | 'title' | 'price'>; // данные товара в корзине
export type FormErrors = Partial<Record<keyof ICustomer, string>>; // тип для хранения ошибок в формах

// Интерфейс компонента модели КАТАЛОГ
export interface ICatalogModel {
  products: IProduct[]; // хранит массив всех товаров из API
  selectedProduct: string | null; // хранит id выбранного товара
  getProducts(): TProductPreview[]; // получить массив товаров для каталога (без description)
  setProducts(products: IProduct[]): void; // сохранить массив товаров
  getSelectedProduct(): TProductDetails | null; // получить конкретный товар по id
  setSelectedProduct(id: string | null): void; // сохранить id выбранного товара
}

// Интерфейс компонента модели КОРЗИНА
export interface IBasketModel {
  items: TCartData[]; // массив товаров в корзине (title и price - для отображения, id - для логики)
  addItem(item: TCartData): void; // добавить товар в корзину
  removeItem(itemId: string): void; // удалить товар из корзины
  getCount(): number; // получить количество товаров в корзине
  getItems(): TCartData[]; // получить список товаров в корзине
  getTotal(): number; // получить общую стоимость товаров в корзине
  containsItem(itemId: string): boolean; // проверить, есть ли товар в корзине по ID
  clearItems(): void; // очистить корзину
}

// Интерфейс компонента модели ПОКУПАТЕЛЬ
export interface ICustomerModel {
  customer: ICustomer; // хранит объект данных покупателя
  getCustomerData(): ICustomer; // получить объект данных покупателя
  setCustomerData(customerData: Partial<ICustomer>): void; // сохранить/обновить объект данных покупателя
  validateCustomerData(step: 'shipping' | 'contacts'): boolean; // проверить корректность данных покупателя
  clearCustomerData(): void; // очистить данные покупателя
}
