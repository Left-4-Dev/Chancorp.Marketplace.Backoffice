import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReviewDto, ProviderDto } from '../../core/models';
import { ReviewService, ProviderService } from '../../core/services';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  standalone: false
})
export class ReviewsComponent implements OnInit {
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

  constructor(
    private reviewService: ReviewService,
    private providerService: ProviderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProviders();
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

    this.reviewService.getPaginated(
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
          this.error = response.mensaje || 'Error al cargar comentarios';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar comentarios';
        this.loading = false;
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

  getStateBadgeClass(state: string): string {
    switch (state) {
      case 'Approved': return 'badge-approved';
      case 'Denied': return 'badge-denied';
      default: return 'badge-default';
    }
  }

  getStateLabel(state: string): string {
    switch (state) {
      case 'Approved': return 'Aprobado';
      case 'Denied': return 'Denegado';
      default: return state;
    }
  }
}
