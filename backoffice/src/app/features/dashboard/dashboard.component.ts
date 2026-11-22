import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { RoleService } from '../../core/services/role.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';
import { ReviewService } from '../../core/services/review.service';

interface MetricCard {
  title: string;
  value: number | null;
  icon: string;
  color: string;
  loading: boolean;
}

interface QuickAccessItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent implements OnInit, OnDestroy {
  displayName = '';
  isProvider = false;
  metrics: MetricCard[] = [];
  quickAccessItems: QuickAccessItem[] = [];
  loadingMetrics = false;
  metricsError = false;

  private sub!: Subscription;

  private adminQuickAccess: QuickAccessItem[] = [
    { label: 'Especialidades', icon: 'label_important', route: '/specialities' },
    { label: 'Productos', icon: 'inventory_2', route: '/products' },
    { label: 'Proveedores', icon: 'local_shipping', route: '/providers' },
    { label: 'Reviews Pendientes', icon: 'pending_actions', route: '/pending-reviews' },
    { label: 'Comentarios', icon: 'forum', route: '/reviews' }
  ];

  private providerQuickAccess: QuickAccessItem[] = [
    { label: 'Crear producto o servicio', icon: 'add_business', route: '/provider/products' },
    { label: 'Crear orden de compra', icon: 'description', route: '/provider/orders' },
    { label: 'Ver pedidos', icon: 'receipt_long', route: '/provider/search-orders' },
    { label: 'Configura tu empresa', icon: 'business', route: '/provider/settings/profile' },
    { label: 'Comentarios', icon: 'forum', route: '/provider/reviews' }
  ];

  constructor(
    private roleService: RoleService,
    private orderService: OrderService,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub = this.roleService.session$.subscribe(session => {
      this.displayName = session.displayName || session.email;
      this.isProvider = session.role === 'provider';
      this.quickAccessItems = this.isProvider ? this.providerQuickAccess : this.adminQuickAccess;

      if (this.isProvider && session.providerId) {
        this.loadMetrics(session.providerId);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  retryMetrics(): void {
    const providerId = this.roleService.providerId;
    if (providerId) this.loadMetrics(providerId);
  }

  private loadMetrics(providerId: number): void {
    this.loadingMetrics = true;
    this.metricsError = false;

    this.metrics = [
      { title: 'Pedidos totales', value: null, icon: 'shopping_cart', color: '#5B4B8A', loading: true },
      { title: 'Total productos', value: null, icon: 'inventory_2', color: '#7B68A6', loading: true },
      { title: 'Total comentarios', value: null, icon: 'rate_review', color: '#87CEEB', loading: true }
    ];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1).toISOString();
    const endDate = now.toISOString();

    // Cada llamada es independiente — no dependen una de otra
    this.orderService.getPaginated(providerId, startDate, endDate, 1, 1).subscribe({
      next: (res) => {
        this.metrics[0] = { ...this.metrics[0], value: res.data?.totalCount ?? 0, loading: false };
        this.checkAllLoaded();
      },
      error: () => {
        this.metrics[0] = { ...this.metrics[0], value: 0, loading: false };
        this.checkAllLoaded();
      }
    });

    this.productService.getAll(providerId, 0, 1, 1).subscribe({
      next: (res) => {
        this.metrics[1] = { ...this.metrics[1], value: res.data?.totalCount ?? 0, loading: false };
        this.checkAllLoaded();
      },
      error: () => {
        this.metrics[1] = { ...this.metrics[1], value: 0, loading: false };
        this.checkAllLoaded();
      }
    });

    this.reviewService.getPaginated(1, 1, providerId).subscribe({
      next: (res) => {
        this.metrics[2] = { ...this.metrics[2], value: res.data?.totalCount ?? 0, loading: false };
        this.checkAllLoaded();
      },
      error: () => {
        this.metrics[2] = { ...this.metrics[2], value: 0, loading: false };
        this.checkAllLoaded();
      }
    });
  }

  private checkAllLoaded(): void {
    const allDone = this.metrics.every(m => !m.loading);
    if (allDone) {
      this.loadingMetrics = false;
    }
    this.cdr.detectChanges();
  }
}
