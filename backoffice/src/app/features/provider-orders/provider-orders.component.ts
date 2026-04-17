import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  ProductDto, ProviderCategoryDto, SubCategoryDto, SpecialityDto,
  CreateOrderRequest, CreateOrderDetailRequest
} from '../../core/models';
import {
  ProductService, ProviderCategoryService, SubCategoryService,
  SpecialityService, OrderService, RoleService
} from '../../core/services';
import { ProductPaginatedResult } from '../../core/services/product.service';

export interface OrderItem {
  product: ProductDto;
  paymentType: 'direct' | 'installments';
  quantity: number;
  priceUnit: number;
  cantCuotas: number;
  precioPorCuota: number;
  interes: number;
  customDiscount: number;
  taxes: number;
  subtotal: number;
}

@Component({
  selector: 'app-provider-orders',
  templateUrl: './provider-orders.component.html',
  styleUrls: ['./provider-orders.component.scss'],
  standalone: false
})
export class ProviderOrdersComponent implements OnInit {
  providerId!: number;

  // Pasos del wizard
  currentStep: 'products' | 'order-info' | 'confirmation' = 'products';

  // === PASO 1: Selección de productos ===
  categories: ProviderCategoryDto[] = [];
  subcategories: SubCategoryDto[] = [];
  specialities: SpecialityDto[] = [];
  products: ProductDto[] = [];
  loadingCategories = false;
  loadingSubcategories = false;
  loadingSpecialities = false;
  loadingProducts = false;

  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  selectedSpecialityId: number | null = null;
  hasSearched = false;

  productPage = 1;
  productPageSize = 10;
  productTotalPages = 1;
  productTotalCount = 0;

  // Items agregados a la orden
  orderItems: OrderItem[] = [];

  // Modal para configurar item
  showItemModal = false;
  selectedProduct: ProductDto | null = null;
  itemForm: Partial<OrderItem> = {};

  // === PASO 2: Datos de la orden ===
  orderForm = {
    clientId: 0,
    purchaseState: 'Solicitado',
    paymentMethod: 'Efectivo',
    deliveryDate: '',
    mailingAddress: '',
    observations: ''
  };

  // === PASO 3: Confirmación y envío ===
  submitting = false;
  submitSuccess = false;
  submitError = '';

  error = '';

  purchaseStates = ['Solicitado', 'Confirmado', 'Enviado', 'Entregado'];
  paymentMethods = ['Efectivo', 'Transferencia'];

  constructor(
    private productService: ProductService,
    private providerCategoryService: ProviderCategoryService,
    private subcategoryService: SubCategoryService,
    private specialityService: SpecialityService,
    private orderService: OrderService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.providerId = this.roleService.providerId;
    this.orderForm.clientId = this.roleService.userId;
    this.loadCategories();
  }

  // ========== Filtros de producto ==========

  loadCategories(): void {
    this.loadingCategories = true;
    this.providerCategoryService.getCategoriesByProvider(this.providerId).subscribe({
      next: (res) => {
        if (res.success && res.dataLista) this.categories = res.dataLista;
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingCategories = false; this.cdr.detectChanges(); }
    });
  }

  onCategoryChange(): void {
    this.selectedSubCategoryId = null;
    this.selectedSpecialityId = null;
    this.subcategories = [];
    this.specialities = [];
    this.products = [];
    this.hasSearched = false;
    if (!this.selectedCategoryId) return;

    this.loadingSubcategories = true;
    this.subcategoryService.getByCategoryId(this.selectedCategoryId).subscribe({
      next: (res) => {
        if (res.success && res.dataLista) this.subcategories = res.dataLista;
        this.loadingSubcategories = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingSubcategories = false; this.cdr.detectChanges(); }
    });
  }

  onSubCategoryChange(): void {
    this.selectedSpecialityId = null;
    this.specialities = [];
    this.products = [];
    this.hasSearched = false;
    if (!this.selectedSubCategoryId) return;

    this.loadingSpecialities = true;
    this.specialityService.getBySubCategoryId(this.selectedSubCategoryId).subscribe({
      next: (res) => {
        if (res.success && res.dataLista) this.specialities = res.dataLista;
        this.loadingSpecialities = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingSpecialities = false; this.cdr.detectChanges(); }
    });
  }

  canSearchProducts(): boolean {
    return !!this.selectedSpecialityId;
  }

  searchProducts(): void {
    if (!this.canSearchProducts()) return;
    this.productPage = 1;
    this.loadProducts();
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.hasSearched = true;
    this.productService.getAll(
      this.providerId, this.selectedSpecialityId!, this.productPage, this.productPageSize
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products = res.data.items;
          this.productPage = res.data.pageNumber;
          this.productTotalPages = res.data.totalPages;
          this.productTotalCount = res.data.totalCount;
        }
        this.loadingProducts = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingProducts = false; this.cdr.detectChanges(); }
    });
  }

  changeProductPage(page: number): void {
    if (page >= 1 && page <= this.productTotalPages) {
      this.productPage = page;
      this.loadProducts();
    }
  }

  getProductPages(): number[] {
    const pages: number[] = [];
    const max = 5;
    let start = Math.max(1, this.productPage - Math.floor(max / 2));
    let end = Math.min(this.productTotalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  isProductAdded(productId: string): boolean {
    return this.orderItems.some(item => item.product.id === productId);
  }

  // ========== Modal item ==========

  openAddItemModal(product: ProductDto): void {
    this.selectedProduct = product;
    this.itemForm = {
      paymentType: 'direct',
      quantity: 1,
      priceUnit: product.priceSale,
      cantCuotas: 1,
      precioPorCuota: 0,
      interes: 0,
      customDiscount: 0,
      taxes: 0,
      subtotal: product.priceSale
    };
    this.recalculate();
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
    this.selectedProduct = null;
    this.itemForm = {};
  }

  onPaymentTypeChange(): void {
    if (this.itemForm.paymentType === 'direct') {
      this.itemForm.cantCuotas = 1;
      this.itemForm.precioPorCuota = 0;
      this.itemForm.interes = 0;
      this.itemForm.priceUnit = this.selectedProduct?.priceSale || 0;
    } else {
      this.itemForm.cantCuotas = 3;
      this.itemForm.interes = 0;
      this.itemForm.precioPorCuota = this.selectedProduct?.priceSale || 0;
    }
    this.recalculate();
  }

  recalculate(): void {
    const qty = this.itemForm.quantity || 1;
    const discount = this.itemForm.customDiscount || 0;
    const taxes = this.itemForm.taxes || 0;

    if (this.itemForm.paymentType === 'direct') {
      const price = this.itemForm.priceUnit || 0;
      const baseTotal = qty * price;
      const discountAmount = baseTotal * (discount / 100);
      const taxAmount = (baseTotal - discountAmount) * (taxes / 100);
      this.itemForm.subtotal = baseTotal - discountAmount + taxAmount;
    } else {
      const cuotas = this.itemForm.cantCuotas || 1;
      const precioCuota = this.itemForm.precioPorCuota || 0;
      const interes = this.itemForm.interes || 0;

      // Precio unitario = (precioCuota * cuotas) + interés simple sobre el total
      const totalCuotas = precioCuota * cuotas;
      const interesTotal = totalCuotas * (interes / 100) * cuotas;
      const precioConInteres = totalCuotas + interesTotal;

      this.itemForm.priceUnit = Math.round(precioConInteres * 100) / 100;

      const baseTotal = qty * precioConInteres;
      const discountAmount = baseTotal * (discount / 100);
      const taxAmount = (baseTotal - discountAmount) * (taxes / 100);
      this.itemForm.subtotal = Math.round((baseTotal - discountAmount + taxAmount) * 100) / 100;
    }
  }

  addItemToOrder(): void {
    if (!this.selectedProduct) return;

    const item: OrderItem = {
      product: this.selectedProduct,
      paymentType: this.itemForm.paymentType || 'direct',
      quantity: this.itemForm.quantity || 1,
      priceUnit: this.itemForm.priceUnit || 0,
      cantCuotas: this.itemForm.paymentType === 'direct' ? 0 : (this.itemForm.cantCuotas || 1),
      precioPorCuota: this.itemForm.paymentType === 'direct' ? 0 : (this.itemForm.precioPorCuota || 0),
      interes: this.itemForm.paymentType === 'direct' ? 0 : (this.itemForm.interes || 0),
      customDiscount: this.itemForm.customDiscount || 0,
      taxes: this.itemForm.taxes || 0,
      subtotal: this.itemForm.subtotal || 0
    };

    this.orderItems.push(item);
    this.closeItemModal();
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
  }

  getOrderTotal(): number {
    return this.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // ========== Navegación de pasos ==========

  goToOrderInfo(): void {
    if (this.orderItems.length === 0) {
      this.error = 'Debe agregar al menos un producto a la orden';
      return;
    }
    this.error = '';
    this.currentStep = 'order-info';
  }

  goBackToProducts(): void {
    this.currentStep = 'products';
  }

  goToConfirmation(): void {
    if (!this.orderForm.mailingAddress.trim()) {
      this.error = 'La dirección de envío es obligatoria';
      return;
    }
    this.error = '';
    this.currentStep = 'confirmation';
  }

  goBackToOrderInfo(): void {
    this.currentStep = 'order-info';
  }

  // ========== Envío ==========

  submitOrder(): void {
    this.submitting = true;
    this.submitError = '';

    const orderRequest: CreateOrderRequest = {
      clientId: this.orderForm.clientId,
      purchaseState: this.orderForm.purchaseState,
      paymentMethod: this.orderForm.paymentMethod,
      total: Math.round(this.getOrderTotal() * 100) / 100,
      deliveryDate: this.orderForm.deliveryDate || null,
      mailingAddress: this.orderForm.mailingAddress,
      observations: this.orderForm.observations,
      state: true
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const orderId = res.data.id;
          this.createOrderDetails(orderId, 0);
        } else {
          this.submitError = res.mensaje || 'Error al crear la orden';
          this.submitting = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.submitError = 'Error de conexión al crear la orden';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  private createOrderDetails(orderId: string, index: number): void {
    if (index >= this.orderItems.length) {
      this.submitting = false;
      this.submitSuccess = true;
      this.cdr.detectChanges();
      return;
    }

    const item = this.orderItems[index];
    const detail: CreateOrderDetailRequest = {
      orderId,
      productId: item.product.id,
      quantity: item.quantity,
      cantCuotas: item.cantCuotas,
      interes: item.interes,
      precioperCuota: item.precioPorCuota,
      priceUnit: item.priceUnit,
      customDiscount: item.customDiscount,
      taxes: item.taxes,
      subtotal: item.subtotal,
      productName: item.product.name,
      brand: item.product.brand,
      sku: item.product.sku,
      productImg: item.product.productImg?.length ? item.product.productImg[0] : '',
      providerName: this.roleService.session.displayName,
      state: true
    };

    this.orderService.createOrderDetail(detail).subscribe({
      next: (res) => {
        if (res.success) {
          this.createOrderDetails(orderId, index + 1);
        } else {
          this.submitError = `Error al agregar detalle (${item.product.name}): ${res.mensaje}`;
          this.submitting = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.submitError = `Error de conexión al agregar detalle: ${item.product.name}`;
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  resetOrder(): void {
    this.orderItems = [];
    this.currentStep = 'products';
    this.submitSuccess = false;
    this.submitError = '';
    this.orderForm = {
      clientId: 1,
      purchaseState: 'Solicitado',
      paymentMethod: 'Efectivo',
      deliveryDate: '',
      mailingAddress: '',
      observations: ''
    };
  }
}
