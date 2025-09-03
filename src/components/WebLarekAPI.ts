import { Api, ApiListResponse } from './base/api';
import { IProduct, IOrderRequest, IOrderResponse } from '../types';

export interface IWebLarekAPI {
  getProductList(): Promise<IProduct[]>;
  postOrder(order: IOrderRequest): Promise<IOrderResponse>;
}

export class WebLarekAPI extends Api implements IWebLarekAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getProductList(): Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) =>
      data.items.map(item => ({
        ...item,
        image: this.cdn + item.image.replace(/\.\w+$/, '.png')
      }))
    );
  }

  postOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.post('/order', order).then((data: IOrderResponse) => data);
  }
}
