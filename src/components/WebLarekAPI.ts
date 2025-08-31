import { Api, ApiListResponse } from "./base/api";
import { IProduct, IOrderRequest, IOrderResponse } from "../types";

// Интерфейс API приложения
export interface IWebLarekAPI {
  getProductList(): Promise<IProduct[]>;
  createOrder(order: IOrderRequest): Promise<IOrderResponse>;
}

// Класс API приложения
export class WebLarekAPI extends Api implements IWebLarekAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  // GET-запрос /product — возвращает массив товаров с полным URL картинок в PNG-формате
  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then(
      (data: ApiListResponse<IProduct>) =>
        data.items.map(item => ({
          ...item,
          image: this.cdn + item.image.replace(/\.\w+$/, '.png')
        }))
    );
  }

  // POST-запрос /order — отправка заказа
  createOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.post('/order', order).then(
      (data: IOrderResponse) => data // возвращаем результат заказа
    );
  }
}
