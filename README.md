# Проектная работа "Веб-ларек"
https://github.com/m-n-pavlov/web-larek-frontend/

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ - исходные файлы проекта
- src/components/ - папка с JS компонентами
- src/components/base/ - папка с базовым кодом
- src/components/models/ - папка с моделями данных (модели каталога, корзины и покупателя)
- src/components/views/ - папка с компонентами слоя представления
- src/components/views/card/ - папка с компонентами карточки товара (базовый компонент и его производные: карточка в каталоге, в превью и в корзине)
- src/components/views/form/ - папка с компонентами форм (базовый компонент и его производные для двух шагов оформления заказа)

Важные файлы:
- src/pages/index.html - HTML-файл главной страницы
- src/types/index.ts - файл с типами
- src/index.ts - точка входа приложения
- src/scss/styles.scss - корневой файл стилей
- src/utils/constants.ts - файл с константами
- src/utils/utils.ts - файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Данные и типы данных, используемые в приложении

Товар

```ts
interface IProduct {
  id: string;            // уникальный идентификатор товара
  title: string;         // название товара
  description: string;   // описание товара
  image: string;         // путь к изображению
  category: string;      // категория товара
  price: number | null;  // number (цена в синапсах) или null ("Бесценно")
}
```

Покупатель

```ts
export interface ICustomer {
  payment: 'card' | 'cash' | "";  // метод оплаты ("" - состояние по умолчанию, когда выбор не сделан)
  address: string;                // адрес доставки
  email: string;                  // email покупателя
  phone: string;                  // телефон покупателя
}
```

Данные товара в каталоге

```ts
type TProductPreview = Omit<IProduct, 'description'>;
```

Данные выбранного товара в отдельном окне превью

```ts
type TProductDetails = IProduct;
```

Данные товара, добавленного в корзину

```ts
type TCartData = Pick<IProduct, 'id' | 'title' | 'price'>;
```

Тип данных для хранения ошибок в формах

```ts
export type FormErrors = Partial<Record<keyof ICustomer, string>>;
```

## Архитектура приложения

При построении архитектуры приложения используется MVP-паттерн:
- слой данных (Model) отвечает за хранение и изменение данных
- слой представления (View) отвечает за отображение данных на странице
- код управляющего слоя Presenter, координирующий работу Model и View размещен в корневом файле, точке входа приложения src/index.ts

### Базовый код

#### Класс Api

Назначение:
Базовый класс для работы с серверным API.
Обеспечивает единый интерфейс для выполнения HTTP-запросов к серверу и позволяет расширять его для конкретных модулей приложения.

Основные возможности:
- GET-запросы: получение данных с сервера
- POST-запросы: отправка данных на сервер
- Обработка URL и опций запроса: автоматически использует базовый URL и переданные заголовки/опции
- Позволяет создавать специализированные API-классы (например, WebLarekAPI) без дублирования логики работы с fetch

Используется в WebLarekAPI.ts для загрузки списка товаров и отправки заказов.

#### Класс EventEmitter

Назначение:
Система событий для обмена информацией между моделями и UI без прямой зависимости.
Позволяет организовать связь через события, что делает архитектуру более гибкой.

Основные методы, реализуемые классом описаны интерфейсом IEvents:
- on - подписка на событие
- emit - инициализация события
- trigger - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие 

Остальные методы, в том числе, не используемые в приложении предоставляют универсальность и возможность переиспользования класса.

### Слой данных

#### Класс Model

Назначение:
Базовая модель данных для хранения состояния приложения и его компонентов.
Обеспечивает единую точку правды для данных и уведомляет подписчиков через события о любых изменениях.

Основные возможности:
- Хранение состояния
- Связь с системой событий
- Универсальные методы

В приложении используется для моделей данных BasketModel, CatalogModel и CustomerModel.

Преимущества использования:
- Централизованное управление данными
- Реактивное обновление UI через события
- Минимизирует дублирование кода и упрощает тестирование

#### Класс CatalogModel

Наследует базовый класс Model и отвечает за хранение и логику работы с данными всех товаров в общем каталоге.
Конструктор класса принимает инстант брокера событий.

В полях класса хранятся следующие данные:
- products: IProduct[] - хранит массив всех товаров из API
- selectedProduct: string | null - хранит id выбранного товара
- events: IEvents - экземпляр класса EventEmitter для инициации событий при изменении данных

Набор методов для взаимодействия с этими данными:
- getProducts(): TProductPreview[] - возвращает массив товаров для каталога
- setProducts(products: IProduct[]): void - сохраняет полный массив товаров
- getSelectedProduct(): TProductDetails | null - возвращает объект выбранного товара по id
- setSelectedProduct(id: string | null): void - сохраняет id выбранного товара
- специальные методы: геттеры и сеттеры для получения и сохранения данных из полей класса

#### Класс BasketModel
Наследует базовый класс Model и отвечает за хранение и логику работы с данными товаров в корзине.
Конструктор класса принимает инстант брокера событий.

В полях класса хранятся следующие данные:
- items: TCartData[] - массив товаров в корзине (title и price - для отображения, id - для логики)
- events: IEvents - экземпляр класса EventEmitter для инициации событий при изменении данных

Набор методов для взаимодействия с этими данными:
- addItem(item: TCartData): void - добавить товар в массив товаров в корзине, вызывает событие изменения массива
- removeItem(itemId: string): void - удалить товар из массива товаров в корзине, вызывает событие изменения массива
- getCount(): number - получить количество товаров в корзине
- getItems(): TCartData[] - получить список товаров в корзине
- getTotal(): number` - получить общую стоимость товаров в корзине
- containsItem(itemId: string): boolean - проверить, есть ли товар в корзине по ID
- clearItems(): void - очистить корзину
- специальные методы: геттеры и сеттеры для получения и сохранения данных из полей класса

#### Класс CustomerModel
Наследует базовый класс Model и отвечает за хранение и логику работы с данными покупателя.
Конструктор класса принимает инстант брокера событий.

В полях класса хранятся следующие данные:
- customer: ICustomer - все данные покупателя в соответствии с интерфейсом ICustomer
- events: IEvents - экземпляр класса EventEmitter для инициации событий при изменении данных

Набор методов для взаимодействия с этими данными:
- getCustomerData(): ICustomer - получить данные покупателя
- setCustomerData(customerData: Partial<ICustomer>): void - сохранить/обновить данные покупателя
- validateCustomerData(step: 'shipping' | 'contacts'): boolean - проверить корректность данных покупателя
- clearCustomerData(): void - очистить данные покупателя
- специальные методы: геттеры и сеттеры для получения и сохранения данных из полей класса

### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

#### Класс Component

Назначение:
Абстрактный базовый класс для всех UI-компонентов проекта.
Упрощает работу с DOM и обеспечивает единообразие при создании элементов интерфейса.

Основные возможности:
- Позволяет наследникам реализовать специфичные методы рендера и обновления интерфейса
- Обеспечивает структуру компонента: каждый UI-объект работает через свой DOM-элемент, что упрощает управление и повторное использование

#### Класс Card

Общая информация
Базовый абстрактный компонент карточки товара — общий DOM- и логический функционал для всех видов карточек (заголовок, цена, работа с DOM).

Конструктор
constructor(container: HTMLElement, actions?: ICardActions)
— принимает корневой container (элемент карточки) и опциональные actions (например onClick).

Поля класса
- protected titleElement: HTMLElement — элемент с заголовком (.card__title).
- protected priceElement: HTMLElement — элемент с ценой (.card__price).

Методы класса
- set title(value: string) — установить заголовок в DOM.
- get title(): string — вернуть текст заголовка.
- set price(value: number | null) — установить цену; использует handlePrice и выводит "Бесценно" при null.
- get price(): number | null — получить числовую цену из текста или null.
- get element(): HTMLElement — вернуть корневой элемент карточки.

#### Класс CardBasket

Общая информация
Расширяет класс Card.
Карточка товара для списка корзины — компактный вид с возможностью удаления и отображением индекса.

Конструктор
constructor(container: HTMLElement, events: IEvents, data?: TCardBasket)
— принимает элемент шаблона карточки корзины, events для эмита и опциональные данные (id/title/price).

Поля класса
- protected id: string — внутренний id товара.
- protected deleteButton: HTMLButtonElement — кнопка удаления (.basket__item-delete).
- protected indexElement: HTMLElement — элемент для номера позиции (.basket__item-index).

Методы класса
- set index(value: number) — установить отображаемый индекс (1,2,3...).
- get index(): number — вернуть текущий индекс.
- get cardId(): string — вернуть внутренний id карточки.
- (в конструкторе) привязка click к deleteButton, который эмитит basket:remove с { id }.

#### Класс CardCatalog

Общая информация
Расширяет класс Card.
Карточка каталога — визуальная карточка для сетки каталога, поддерживает изображение и категорию.

Конструктор
constructor(container: HTMLElement, data?: TCardCatalog, actions?: ICardActions)
— принимает элемент шаблона, опциональные начальные данные (id, title, price, image, category) и actions (например onClick).

Поля класса
- protected imageElement: HTMLImageElement — элемент изображения (.card__image).
- protected categoryElement: HTMLElement — элемент категории (.card__category).
- protected id: string — внутренний id товара.

Методы класса
- set image(value: string) — установить src и alt изображения (через setImage).
- set category(value: string) — установить текст категории и переключить CSS-класс по categoryMap.

#### Класс CardPreview

Общая информация
Расширяет класс Card.
Комплексная превью-карточка в модальном окне: детальное описание, кнопка добавления/удаления в корзину, управление состоянием кнопки в зависимости от цены. Не наследуется от Card — отдельная реализация для preview.

Конструктор
constructor(template: HTMLElement, events: IEvents, data: ICardPreviewData)
— принимает клонированный шаблон превью, шину events и данные { id, title, price, inBasket? }.

Поля класса
- element: HTMLElement — корневой DOM превью.
- private events: IEvents — шина событий.
- private data: ICardPreviewData — локальное состояние карточки (id, title, price, inBasket).
- public onAddToBasket: () => void — внешний коллбек (по умолчанию noop).
- public onRemoveFromBasket: () => void — внешний коллбек.

Методы класса
- private bindUI() — навешивает обработчик на кнопку (вкл/выкл корзины).
- set title(v: string) — обновить заголовок.
- set price(v: number | null) — обновить цену в DOM и применить состояние кнопки.
- set category(v: string) — обновить категорию текста.
- set description(v: string) — обновить текст описания.
- set image(v: string) — установить src изображения.
- private applyPriceState(price: number | null) — выключает кнопку, если price === null, иначе задаёт текст/disabled.
- setInBasket(flag: boolean) — обновляет внутренний флаг inBasket и визуальное состояние кнопки (текст + класс).
- set inBasket(flag: boolean) — alias на setInBasket.

#### Класс Form

Общая информация
Базовый абстрактный класс формы: централизует работу с инпутами, сабмитом, отображением ошибок и состоянием валидности.

Конструктор
constructor(container: HTMLFormElement, events: IEvents)
— принимает сам `<form>` элемент и шину events.

Поля класса
- protected submitButton: HTMLButtonElement — кнопка отправки (`button[type=submit]`).
- protected errorsElement: HTMLElement — контейнер для сообщений об ошибках (.form__errors).
- protected container и events (унаследованы/переданы).

Методы класса
- protected onInputChange(field: keyof T, value: string) — эмитит orderInput:change при инпуте.
- set valid(value: boolean) — включает/отключает кнопку отправки.
- set errors(value: string) — устанавливает текст ошибок.
- render(state: Partial<T> & IFormState) — обновляет состояние формы и возвращает контейнер.

#### Класс FormContacts

Общая информация
Расширяет класс Form.
Форма ввода контактных данных: email и телефон с локальной валидацией и отображением ошибок.

Конструктор
constructor(template: HTMLElement, events: IEvents)
— принимает клонированный шаблон формы и шину событий.

Поля класса
- element: HTMLElement — контейнер формы.
- private events: IEvents — шина событий.
- private data: IContactsData — { email, phone }.
- public onSubmit: () => void — коллбек при отправке.
- private submitBtn!: HTMLButtonElement — кнопка отправки.
- private emailInput?: HTMLInputElement, private phoneInput?: HTMLInputElement — поля ввода.
- private errorsEl?: HTMLElement — место для ошибок.

Методы класса
- private bindUI() — находит элементы, навешивает слушатели input и click на кнопку (сбор данных + вызов onSubmit).
- collectData() — прочитать значения из инпутов в data.
- getData(): IContactsData — вернуть копию data.
- setData(d: Partial<IContactsData>) — обновить data, подложить в инпуты и вызвать validate().
- setErrors(errors: Record<string, string>) — показать текст ошибок (join('; ')).
- private validate() — простая синхронная валидация полей, блокировка кнопки при ошибках, отображение ошибок, возвращает boolean.

#### Класс FormOrder

Общая информация
Расширяет класс Form.
Форма шага доставки/оплаты: выбор способа оплаты (карта/нал), ввод адреса, валидация и возможность сброса выбранного способа.

Конструктор
constructor(template: HTMLElement, events: IEvents)
— принимает шаблон шага и шину событий.

Поля класса
- element: HTMLElement — контейнер формы.
- private events: IEvents — шина событий.
- private data: IShippingData — { payment, address }.
- public onSubmit: () => void — коллбек при сабмите.
- private submitBtn!: HTMLButtonElement — кнопка "Далее".
- private cardBtn?: HTMLButtonElement, private cashBtn?: HTMLButtonElement — альтернативные кнопки выбора способа.
- private addressInput?: HTMLInputElement — input адреса.
- private errorsEl?: HTMLElement — вывод ошибок.

Методы класса
- private bindUI() — установка слушателей на кнопки оплаты, input адреса, кнопку отправки.
- private selectPayment(method: 'card' | 'cash') — локально выбрать способ и обновить классы кнопок.
- collectData() — прочитать выбранный radio/inputs в data.
- getData(): IShippingData — вернуть копию данных.
- setData(d: Partial<IShippingData>) — установить данные в UI (address + выделение кнопок).
- setErrors(errors: Record<string, string>) — вывести ошибки.
- private validate() — валидация payment и address, блокировка submit, возвращает boolean.
- public resetPayment() — сброс выбранного способа оплаты и визуального состояния (убирает active-классы).

#### Класс Basket

Общая информация
Представление корзины: список элементов, общая сумма, кнопка перехода к оформлению. Используется как содержимое модалки при открытии корзины.

Конструктор
constructor(container: HTMLElement, events: IEvents)
— принимает корневой контейнер (клонированный шаблон корзины) и шину событий.

Поля класса
- protected basketItem: HTMLElement — контейнер списка (.basket__list).
- protected basketPrice: HTMLElement — элемент отображения суммы (.basket__price).
- protected basketButton: HTMLButtonElement — кнопка "Оформить".
- protected events: IEvents — шина событий (передаётся).

Методы класса
- set price(price: number) — установить текст общей суммы (handlePrice(price) + ' синапсов').
- set items(items: HTMLElement[]) — заменить содержимое списка; если пусто — показать "Корзина пуста"; также включает/отключает кнопку оформления.
- get element(): HTMLElement — вернуть корневой контейнер.

#### Класс Gallery

Общая информация
Контейнер каталога — отвечает за рендер набора карточек в сетке/галерее.

Конструктор
constructor(container: HTMLElement)
— принимает div.page__wrapper или контейнер страницы и ищет в нём .gallery.

Поля класса
- protected catalogElement: HTMLElement — контейнер .gallery.

Методы класса
- set catalog(items: HTMLElement[]) — заменить содержимое галереи на массив карточек (DOM элементов).

#### Класс Header

Общая информация
Шапка сайта: логотип, кнопка корзины и отображение счётчика товаров.

Конструктор
constructor(container: HTMLElement, events: IEvents)
— принимает сам элемент header и шину событий.

Поля класса
- protected counterElement: HTMLElement — отображение числа в корзине (.header__basket-counter).
- protected basketButton: HTMLButtonElement — кнопка-иконка корзины.
- protected events: IEvents — шина событий.

Методы класса
- set counter(value: number) — обновить текст счётчика.
- (в конструкторе) навешен клик по basketButton, который эмитит basket:open.

#### Класс Modal

Общая информация
Управляет общим контейнером модального окна: открытие/закрытие, вставка/очистка контента, закрытие по фону/кнопке.

Конструктор
constructor(container: HTMLElement, events: IEvents)
— принимает #modal-container и шину событий.

Поля класса
- protected closeButton: HTMLButtonElement — кнопка закрытия (.modal__close).
- protected contentContainer: HTMLElement — .modal__content, куда вставляется любая вьюшка.
- protected events: IEvents — шина событий.

Методы класса
- open() — открыть модалку (добавить класс modal_active) и эмитить modal:open.
- close() — закрыть модалку, очистить content, эмитить modal:close.
- set content(element: HTMLElement | null) — вставить переданный элемент или очистить контейнер.
- Поведение: клик по фону закрывает, клик в контенте — стопPropagation.

#### Класс Page

Общая информация
Обёртка страницы: связывает Header и Gallery, управляет блокировкой прокрутки при открытой модалке.

Конструктор
constructor(container: HTMLElement, events: IEvents)
— принимает document.body (или корень) и шину событий.

Поля класса
- header: Header — экземпляр шапки.
- gallery: Gallery — экземпляр галереи.
- wrapper: HTMLElement — .page__wrapper — блок, который получают/теряют класс для блокировки скролла.
- events: IEvents — шина событий.

Методы класса
- set locked(value: boolean) — добавляет/убирает класс page__wrapper_locked на wrapper (блокировка прокрутки).
- В конструкторе подписки на modal:open / modal:close переключают locked.

#### Класс Success

Общая информация
Вьюшка результата успешного заказа: простое сообщение с суммой списания и кнопкой для возврата к каталогу.

Конструктор
constructor(container: HTMLElement, actions?: ISuccessActions)
— принимает клонированный шаблон success и опциональные действия (onClick для кнопки закрытия).

Поля класса
- protected descriptionElement: HTMLElement — элемент описания списания (.order-success__description).
- protected successButton: HTMLButtonElement — кнопка закрытия/перейти за покупками (.order-success__close).

Методы класса
- set description(value: number) — установить текст вида Списано X синапсов (форматирует через handlePrice).
- В конструкторе можно привязать actions.onClick к successButton.

### Слой коммуникации

#### Класс WebLarekAPI
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\

*События изменения данных (модели):*

- `basket:updated` — (BasketModel) корзина изменилась — перерендерить список товаров.
- `basket:count` — (BasketModel) изменилось количество в корзине — обновить счётчик.
- `catalog:changed` — (CatalogModel) список товаров установлен/обновлён — рендер каталога.
- `catalog:selected` — (CatalogModel) выбран (или сброшен) id товара — показать детальный просмотр.
- `customer:updated` — (CustomerModel) данные покупателя обновлены/очищены — синхронизировать формы/UI.
- `formErrors:change` — (CustomerModel) результат валидации форм (объект ошибок) — отобразить ошибки.

*События взаимодействия пользователя (представления / UI):*

- `basket:open` — (Header) пользователь открыл корзину — показать модалку корзины.
- `basket:remove` — (CardBasket) пользователь нажал удалить {id} — удалить товар из корзины.
- `basket:go-to-order-step` — (Basket) нажали «Оформить» — перейти к шагу оформления.
- `order:submit` — (Form — форма order) пользователь отправил форму оформления (submit).
- `contacts:submit` — (Form — форма contacts) пользователь отправил форму контактов (submit).
- `orderInput:change` — (Form) изменение поля в любой форме — общая нотификация о вводе { field, value }.
- `modal:open` — (Modal) модалка открыта — (обычно блокировка скролла и т.п.).
- `modal:close` — (Modal) модалка закрыта — снять блокировки/очистить контент.
- `catalog:add-to-basket` — (UI — CardPreview / карточки) запрос на добавление товара в корзину { id } (в коде слушатель есть; эмитирование возможно из превью/карточки).
- `order:go-to-contacts-step` — (координатор/index.ts) переход с шага shipping → contacts после успешной валидации.
- `contacts:final-submit` — (координатор/index.ts) финальная нотификация о готовности отправить заказ на сервер.