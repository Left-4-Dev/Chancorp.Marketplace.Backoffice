import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReviewDto, UpdateReviewRequest } from '../../core/models';
import { ReviewService, RoleService } from '../../core/services';

@Component({
  selector: 'app-provider-pending-reviews',
  templateUrl: './provider-pending-reviews.component.html',
  styleUrls: ['./provider-pending-reviews.component.scss'],
  standalone: false
})
export class ProviderPendingReviewsComponent implements OnInit {
  reviews: ReviewDto[] = [];
  loading = false;
  error = '';

  providerId!: number;

  // Filtros (sin proveedor, ya está fijo por sesión)
  startDate = '';
  endDate = '';
  hasSearched = false;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  processingId: string | null = null;

  constructor(
    private reviewService: ReviewService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.providerId = this.roleService.providerId;
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

  searchReviews(): void {
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
      this.providerId,
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
      error: () => {
        this.processingId = null;
        this.error = 'Error de conexión al actualizar la review';
        this.cdr.detectChanges();
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
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getRatingStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }
}
