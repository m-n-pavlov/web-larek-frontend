// Типизация ответов со списком товаров
export type ApiListResponse<Type> = {
  total: number,
  items: Type[]
};

export class Api {
  readonly baseUrl: string;
  protected options: RequestInit;

  // baseUrl - хранит базовый путь к API
  // options - позволяют задавать дополнительные настройки для всех запросов (например, авторизационные заголовки)
  constructor(baseUrl: string, options: RequestInit = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as object ?? {})
      }
    };
  }

  // Обработка ответа (структура ответа может быть неполной)
  protected async handleResponse(response: Response): Promise<Partial<object>> {
    if (response.ok) return response.json();
    else
      return response
        .json()
        .then(data => Promise.reject(data.error ?? response.statusText));
  }

  // Используется для получения списка товаров
  async get(uri: string) {
    return fetch(this.baseUrl + uri, {
      ...this.options,
      method: 'GET'
    }).then(this.handleResponse);
  }

  // Используется для отправки формы заказа
  async post(uri: string, data: object) {
    return fetch(this.baseUrl + uri, {
      ...this.options,
      method: 'POST',
      body: JSON.stringify(data)
    }).then(this.handleResponse);
  }
}
