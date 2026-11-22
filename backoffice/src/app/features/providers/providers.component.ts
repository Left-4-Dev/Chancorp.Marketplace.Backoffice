import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProviderDto, CreateProviderRequest, UpdateProviderRequest, ProviderCategoryDto, CategoryDto, AssignCategoriesToProviderRequest } from '../../core/models';
import { ProviderService, ProviderCategoryService, CategoryService } from '../../core/services';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
  standalone: false
})
export class ProvidersComponent implements OnInit {
  providers: ProviderDto[] = [];
  loading = false;
  error = '';

  // Paginación (server-side)
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedProvider: ProviderDto | null = null;
  formData: any = {};

  // Eliminar
  showDeleteConfirm = false;
  providerToDelete: ProviderDto | null = null;

  // Modal Categorías
  showCategoriesModal = false;
  categoriesProvider: ProviderDto | null = null;
  providerCategories: ProviderCategoryDto[] = [];
  allCategories: CategoryDto[] = [];
  loadingCategories = false;
  loadingAllCategories = false;
  savingCategory = false;
  selectedNewCategoryId: number | null = null;
  selectedIsPrimary = false;
  categoriesError = '';

  constructor(
    private providerService: ProviderService,
    private providerCategoryService: ProviderCategoryService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProviders();
  }

  loadProviders(): void {
    this.loading = true;
    this.error = '';

    this.providerService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.providers = response.data.items;
          this.currentPage = response.data.pageNumber;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
          this.hasPreviousPage = response.data.hasPreviousPage;
          this.hasNextPage = response.data.hasNextPage;
        } else {
          this.error = response.mensaje || 'Error al cargar proveedores';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar proveedores';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedProvider = null;
    this.formData = {
      userEmail: '',
      enterpriseName: '',
      providerType: '',
      phone: '',
      sector: '',
      docType: '',
      docNumber: '',
      countryCode: '',
      region: '',
      address: '',
      website: ''
    };
    this.showModal = true;
  }

  openEditModal(provider: ProviderDto): void {
    this.modalMode = 'edit';
    this.selectedProvider = provider;
    this.formData = {
      userEmail: provider.userEmail,
      enterpriseName: provider.enterpriseName,
      providerType: provider.providerType,
      phone: provider.phone,
      sector: provider.sector,
      docType: provider.docType,
      docNumber: provider.docNumber,
      countryCode: provider.countryCode,
      region: provider.region,
      address: provider.address,
      website: provider.website
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProvider = null;
    this.formData = {};
  }

  saveProvider(): void {
    if (this.modalMode === 'create') {
      const request: CreateProviderRequest = {
        userEmail: this.formData.userEmail,
        enterpriseName: this.formData.enterpriseName,
        providerType: this.formData.providerType,
        phone: this.formData.phone,
        sector: this.formData.sector,
        docType: this.formData.docType,
        docNumber: this.formData.docNumber,
        countryCode: this.formData.countryCode,
        region: this.formData.region,
        address: this.formData.address,
        website: this.formData.website
      };

      this.providerService.create(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadProviders();
          } else {
            this.error = response.mensaje || 'Error al crear proveedor';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.error = 'Error de conexión al crear proveedor';
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    } else {
      const request: UpdateProviderRequest = {
        userId: this.selectedProvider!.userId,
        userEmail: this.formData.userEmail,
        enterpriseName: this.formData.enterpriseName,
        providerType: this.formData.providerType,
        phone: this.formData.phone,
        sector: this.formData.sector,
        docType: this.formData.docType,
        docNumber: this.formData.docNumber,
        countryCode: this.formData.countryCode,
        region: this.formData.region,
        address: this.formData.address,
        website: this.formData.website
      };

      this.providerService.update(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.closeModal();
            this.loadProviders();
          } else {
            this.error = response.mensaje || 'Error al actualizar proveedor';
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          this.error = 'Error de conexión al actualizar proveedor';
          this.cdr.detectChanges();
          console.error(err);
        }
      });
    }
  }

  confirmDelete(provider: ProviderDto): void {
    this.providerToDelete = provider;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.providerToDelete = null;
  }

  deleteProvider(): void {
    if (!this.providerToDelete) return;

    this.providerService.delete(this.providerToDelete.userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.cancelDelete();
          this.loadProviders();
        } else {
          this.error = response.mensaje || 'Error al eliminar proveedor';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Error de conexión al eliminar proveedor';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProviders();
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

  // ======== Modal Categorías del Proveedor ========

  openCategoriesModal(provider: ProviderDto): void {
    this.categoriesProvider = provider;
    this.providerCategories = [];
    this.categoriesError = '';
    this.selectedNewCategoryId = null;
    this.selectedIsPrimary = false;
    this.showCategoriesModal = true;
    this.loadProviderCategories(provider.providerId);
    this.loadAllCategories();
  }

  closeCategoriesModal(): void {
    this.showCategoriesModal = false;
    this.categoriesProvider = null;
    this.providerCategories = [];
    this.categoriesError = '';
  }

  loadProviderCategories(providerId: number): void {
    this.loadingCategories = true;
    this.providerCategoryService.getCategoriesByProvider(providerId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.providerCategories = response.dataLista;
        }
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllCategories(): void {
    this.loadingAllCategories = true;
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.allCategories = response.dataLista;
        }
        this.loadingAllCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingAllCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  getAvailableCategories(): CategoryDto[] {
    const assignedIds = this.providerCategories.map(pc => pc.categoryId);
    return this.allCategories.filter(c => !assignedIds.includes(c.id));
  }

  assignCategory(): void {
    if (!this.categoriesProvider || !this.selectedNewCategoryId) return;

    this.savingCategory = true;
    this.categoriesError = '';

    const request: AssignCategoriesToProviderRequest = {
      providerId: this.categoriesProvider.providerId,
      assignments: [
        { categoryId: this.selectedNewCategoryId, isPrimary: this.selectedIsPrimary }
      ]
    };

    this.providerCategoryService.assignCategories(request).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.providerCategories = response.dataLista;
          this.selectedNewCategoryId = null;
          this.selectedIsPrimary = false;
        } else {
          this.categoriesError = response.mensaje || 'Error al asignar categoría';
        }
        this.savingCategory = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.categoriesError = 'Error de conexión al asignar categoría';
        this.savingCategory = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  removeProviderCategory(pc: ProviderCategoryDto): void {
    if (!this.categoriesProvider) return;

    this.providerCategoryService.removeCategory(this.categoriesProvider.providerId, pc.categoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.providerCategories = this.providerCategories.filter(c => c.id !== pc.id);
          this.cdr.detectChanges();
        } else {
          this.categoriesError = response.mensaje || 'Error al remover categoría';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.categoriesError = 'Error de conexión al remover categoría';
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }
}
