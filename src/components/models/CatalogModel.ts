import { IEvents } from '../base/events';
import { ICatalogModel, IProduct, TProductPreview, TProductDetails } from '../../types';

export class CatalogModel implements ICatalogModel {
	products: IProduct[] = [];
	selectedProduct: string | null = null;

	private events: IEvents;

	constructor(initial: Partial<ICatalogModel> = {}, events: IEvents) {
		this.products = initial.products || [];
		this.selectedProduct = initial.selectedProduct || null;
		this.events = events;
	}

	getProducts(): TProductPreview[] {
		return this.products.map(({ description, ...rest }) => rest);
	}

	setProducts(products: IProduct[]) {
		this.products = products;
		this.events.emit('catalog:changed', { products });
	}

	getSelectedProduct(): TProductDetails | null {
		return this.products.find(p => p.id === this.selectedProduct) || null;
	}

	setSelectedProduct(id: string | null) {
		this.selectedProduct = id;
		this.events.emit('catalog:selected', { id });
	}
}
