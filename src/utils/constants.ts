export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`; // используется для запросов данных о товарах и отправки заказа
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`; // используется для формирования адреса картинки в товаре

export const settings = {};

import { CategoryType } from '../types/index'

// Отображение категорий в CSS-классы
// Каждый ключ (CategoryType) соответствует конкретной категории товара
// Значение - CSS-класс для применения в UI-компонентах
export const categoryMap: Record<CategoryType, string> = {
  другое: 'card__category_other',
  'софт-скил': 'card__category_soft',
  дополнительное: 'card__category_additional',
  кнопка: 'card__category_button',
  'хард-скил': 'card__category_hard',
};
