import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReviewDto, UpdateReviewRequest, ProviderDto } from '../../core/models';
import { ReviewService, ProviderService } from '../../core/services';

@Component({
  selector: 'app-pending-reviews',
  templateUrl: './pending-reviews.component.html',
  styleUrls: ['./pending-reviews.component.scss'],
  standalone: false
})
export class PendingReviewsComponent implements OnInit {
  reviews: ReviewDto[] = [];
  loading = false;
  error = '';

  // Filtros
  providers: ProviderDto[] = [];
  loadingProviders = false;
  selectedProviderId: number | null = null;
  startDate = '';
  endDate = '';
  hasSearched = false;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  // Track de acciones en progreso
  processingId: string | null = null;

  constructor(
    private reviewService: ReviewService,
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProviders();
    this.setDefaultDates();
  }

  setDefaultDates(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    this.startDate = this.formatDateForInput(firstDay);
    this.endDate = this.formatDateForInput(now);
  }

  formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  loadProviders(): void {
    this.loadingProviders = true;
    this.providerService.getAll(1, 50).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.providers = response.data.items;
        }
        this.loadingProviders = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingProviders = false;
        this.cdr.detectChanges();
      }
    });
  }

  canSearch(): boolean {
    return !!this.selectedProviderId && !!this.startDate && !!this.endDate;
  }

  searchReviews(): void {
    if (!this.canSearch()) {
      this.error = 'Debe seleccionar Proveedor, Fecha Inicio y Fecha Fin';
      return;
    }
    this.currentPage = 1;
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    const startIso = this.startDate ? `${this.startDate}T00:00:00` : undefined;
    const endIso = this.endDate ? `${this.endDate}T23:59:59` : undefined;

    this.reviewService.getPending(
      this.currentPage,
      this.pageSize,
      this.selectedProviderId || undefined,
      startIso,
      endIso
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reviews = response.data.items;
          this.currentPage = response.data.pageNumber;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
        } else {
          this.reviews = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.error = response.mensaje || 'Error al cargar reviews';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar reviews pendientes';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  approveReview(review: ReviewDto): void {
    this.updateReviewState(review, 'Approved');
  }

  denyReview(review: ReviewDto): void {
    this.updateReviewState(review, 'Denied');
  }

  private updateReviewState(review: ReviewDto, newState: string): void {
    this.processingId = review.id;

    const request: UpdateReviewRequest = {
      subject: review.subject,
      description: review.description,
      rating: review.rating,
      approvedState: newState,
      state: review.state
    };

    this.reviewService.update(review.id, request).subscribe({
      next: (response) => {
        this.processingId = null;
        if (response.success) {
          this.loadReviews();
        } else {
          this.error = response.mensaje || 'Error al actualizar la review';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.processingId = null;
        this.error = 'Error de conexión al actualizar la review';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadReviews();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
