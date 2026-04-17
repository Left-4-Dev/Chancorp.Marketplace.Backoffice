import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { OrderDto } from '../../core/models';
import { OrderService } from '../../core/services';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-provider-search-orders',
  templateUrl: './provider-search-orders.component.html',
  styleUrls: ['./provider-search-orders.component.scss'],
  standalone: false
})
export class ProviderSearchOrdersComponent implements OnInit {
  orders: OrderDto[] = [];
  loading = false;
  error = '';

  // Filtros (sin selector de proveedor, se usa el de sesión)
  startDate = '';
  endDate = '';
  hasSearched = false;

  // Expandir detalles
  expandedOrderId: string | null = null;

  // Paginación server-side
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  constructor(
    private orderService: OrderService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = this.formatDateForInput(firstDay);
    this.endDate = this.formatDateForInput(now);
  }

  formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  canSearch(): boolean {
    return !!this.startDate && !!this.endDate;
  }

  searchOrders(): void {
    if (!this.canSearch()) {
      this.error = 'Debe seleccionar Fecha Inicio y Fecha Fin';
      return;
    }

    this.currentPage = 1;
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;
    this.expandedOrderId = null;

    const providerId = this.roleService.providerId;

    this.orderService.getPaginated(
      providerId,
      this.startDate,
      this.endDate,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.orders = response.data.items;
          this.currentPage = response.data.pageNumber;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
        } else {
          this.orders = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.error = response.mensaje || 'Error al cargar órdenes';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar órdenes';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  toggleDetails(orderId: string): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrders();
    }
  }

  getPurchaseStateClass(state: string): string {
    switch (state.toLowerCase()) {
      case 'processing': return 'state-processing';
      case 'shipped': return 'state-shipped';
      case 'delivered': return 'state-delivered';
      case 'cancelled': return 'state-cancelled';
      default: return 'state-default';
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}
