import { Model } from "../base/Model";
import { IProduct } from "../../types";
import { ICatalogModel, TCardCatalog, TCardPreview } from "../../types";
import { IEvents } from "../base/events";

export class CatalogModel extends Model<ICatalogModel> implements ICatalogModel {
  products: IProduct[] = [];
  selectedProduct: string | null = null;

  constructor(data: Partial<ICatalogModel>, events: IEvents) {
    super(data, events);
    this.products = data?.products ?? [];
    this.selectedProduct = data?.selectedProduct ?? null;
  }

  getProducts(): TCardCatalog[] {
    return this.products.map((product) => {
      const { description, ...rest } = product;
      return rest as TCardCatalog;
    });
  }

  setProducts(products: IProduct[]): void {
    this.products = products.map(p => ({ ...p }));
    this.emitChanges('catalog:products:updated', { products: this.getProducts() });
  }

  getSelectedProduct(): TCardPreview | null {
    if (!this.selectedProduct) return null;

    const found = this.products.find((p) => p.id === this.selectedProduct) ?? null;
    return found;
  }

  setSelectedProduct(id: string | null): void {
    this.selectedProduct = id;
    const product = this.getSelectedProduct();
    this.emitChanges('catalog:selected:changed', { id, product });
  }
}
