import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductDto, ProviderCategoryDto, SubCategoryDto, SpecialityDto, FILE_LIMITS } from '../../core/models';
import { ProductService, ProviderCategoryService, SubCategoryService, SpecialityService, RoleService } from '../../core/services';

@Component({
  selector: 'app-provider-products',
  templateUrl: './provider-products.component.html',
  styleUrls: ['./provider-products.component.scss'],
  standalone: false
})
export class ProviderProductsComponent implements OnInit {
  products: ProductDto[] = [];
  loading = false;
  error = '';

  providerId!: number;

  // Filtros (sin proveedor, ya está fijo)
  categories: ProviderCategoryDto[] = [];
  subcategories: SubCategoryDto[] = [];
  specialities: SpecialityDto[] = [];
  loadingCategories = false;
  loadingSubcategories = false;
  loadingSpecialities = false;

  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  selectedSpecialityId: number | null = null;
  hasSearched = false;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalCount = 0;

  // Modal Crear/Editar
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedProduct: ProductDto | null = null;
  formData: any = {};
  modalCategories: ProviderCategoryDto[] = [];
  loadingModalCategories = false;
  modalSubcategories: SubCategoryDto[] = [];
  loadingModalSubcategories = false;
  modalSpecialities: SpecialityDto[] = [];
  loadingModalSpecialities = false;
  saving = false;

  // Archivos
  imageFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  existingImageUrls: string[] = [];
  catalogFile: File | null = null;
  catalogFileName = '';
  existingCatalogUrl = '';
  videoFile: File | null = null;
  videoFileName = '';
  existingVideoUrl = '';
  fileError = '';

  // Drag states
  dragOverImages = false;
  dragOverCatalog = false;
  dragOverVideo = false;

  // Límites expuestos al template
  readonly limits = FILE_LIMITS;

  // Modal Eliminar
  showDeleteConfirm = false;
  productToDelete: ProductDto | null = null;

  constructor(
    private productService: ProductService,
    private providerCategoryService: ProviderCategoryService,
    private subcategoryService: SubCategoryService,
    private specialityService: SpecialityService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.providerId = this.roleService.providerId;
    this.loadCategories();
  }

  loadCategories(): void {
    this.loadingCategories = true;
    this.providerCategoryService.getCategoriesByProvider(this.providerId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.categories = response.dataLista;
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

  onCategoryChange(): void {
    this.selectedSubCategoryId = null;
    this.subcategories = [];
    this.specialities = [];
    this.selectedSpecialityId = null;

    if (!this.selectedCategoryId) return;

    this.loadingSubcategories = true;
    this.subcategoryService.getByCategoryId(this.selectedCategoryId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.subcategories = response.dataLista;
        }
        this.loadingSubcategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSubcategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubCategoryChange(): void {
    this.selectedSpecialityId = null;
    this.specialities = [];

    if (!this.selectedSubCategoryId) return;

    this.loadingSpecialities = true;
    this.specialityService.getBySubCategoryId(this.selectedSubCategoryId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.specialities = response.dataLista;
        }
        this.loadingSpecialities = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingSpecialities = false;
        this.cdr.detectChanges();
      }
    });
  }

  canSearch(): boolean {
    return !!this.selectedSpecialityId;
  }

  searchProducts(): void {
    if (!this.canSearch()) {
      this.error = 'Debe seleccionar Categoría, Subcategoría y Especialidad';
      return;
    }
    this.currentPage = 1;
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    this.productService.getAll(
      this.providerId,
      this.selectedSpecialityId!,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products = response.data.items;
          this.currentPage = response.data.pageNumber;
          this.totalPages = response.data.totalPages;
          this.totalCount = response.data.totalCount;
        } else {
          this.products = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.error = response.mensaje || 'Error al cargar productos';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar productos';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  // ======== CRUD Modal ========

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedProduct = null;
    this.formData = {
      categoryId: this.selectedCategoryId,
      subCategoryId: this.selectedSubCategoryId,
      specialityId: this.selectedSpecialityId,
      name: '',
      sku: '',
      brand: '',
      description: '',
      countryOrigin: '',
      priceProvider: 0,
      priceSale: 0,
      stock: 0,
      warrantyTime: 0,
      hasWarranty: false,
      discount: 0,
      isNew: true,
      isOfferUnique: false,
      showPrice: true,
      state: true
    };
    this.resetFiles();
    this.loadModalCategories();
    this.showModal = true;
  }

  openEditModal(product: ProductDto): void {
    this.modalMode = 'edit';
    this.selectedProduct = product;

    const speciality = this.specialities.find(s => s.id === product.specialityId);
    const subCatId = speciality ? speciality.subCategoryId : null;
    const sub = subCatId ? this.subcategories.find(s => s.id === subCatId) : null;
    const catId = sub ? sub.categoryId : this.selectedCategoryId;

    this.formData = {
      categoryId: catId,
      subCategoryId: subCatId,
      specialityId: product.specialityId,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      description: product.description,
      countryOrigin: product.countryOrigin,
      priceProvider: product.priceProvider,
      priceSale: product.priceSale,
      stock: product.stock,
      warrantyTime: product.warrantyTime,
      hasWarranty: product.hasWarranty,
      discount: product.discount,
      isNew: product.isNew,
      isOfferUnique: product.isOfferUnique,
      showPrice: product.showPrice,
      state: product.state
    };

    this.resetFiles();
    this.existingImageUrls = product.productImg ? [...product.productImg] : [];
    this.existingCatalogUrl = product.catalog || '';
    this.existingVideoUrl = product.productVideo || '';

    this.loadModalCategories(() => {
      if (catId) {
        this.loadModalSubcategories(catId, () => {
          if (subCatId) {
            this.loadModalSpecialities(subCatId);
          }
        });
      }
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProduct = null;
    this.formData = {};
    this.resetFiles();
  }

  private resetFiles(): void {
    this.imageFiles = [];
    this.imagePreviewUrls = [];
    this.existingImageUrls = [];
    this.catalogFile = null;
    this.catalogFileName = '';
    this.existingCatalogUrl = '';
    this.videoFile = null;
    this.videoFileName = '';
    this.existingVideoUrl = '';
    this.fileError = '';
  }

  loadModalCategories(callback?: () => void): void {
    this.loadingModalCategories = true;
    this.modalCategories = [];
    this.providerCategoryService.getCategoriesByProvider(this.providerId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.modalCategories = response.dataLista;
        }
        this.loadingModalCategories = false;
        this.cdr.detectChanges();
        if (callback) callback();
      },
      error: () => {
        this.loadingModalCategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  onModalCategoryChange(): void {
    this.formData.subCategoryId = null;
    this.formData.specialityId = null;
    this.modalSubcategories = [];
    this.modalSpecialities = [];

    if (!this.formData.categoryId) return;
    this.loadModalSubcategories(this.formData.categoryId);
  }

  loadModalSubcategories(categoryId: number, callback?: () => void): void {
    this.loadingModalSubcategories = true;
    this.subcategoryService.getByCategoryId(categoryId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.modalSubcategories = response.dataLista;
        }
        this.loadingModalSubcategories = false;
        this.cdr.detectChanges();
        if (callback) callback();
      },
      error: () => {
        this.loadingModalSubcategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  onModalSubCategoryChange(): void {
    this.formData.specialityId = null;
    this.modalSpecialities = [];

    if (!this.formData.subCategoryId) return;
    this.loadModalSpecialities(this.formData.subCategoryId);
  }

  loadModalSpecialities(subCategoryId: number): void {
    this.loadingModalSpecialities = true;
    this.specialityService.getBySubCategoryId(subCategoryId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.modalSpecialities = response.dataLista;
        }
        this.loadingModalSpecialities = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingModalSpecialities = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveProduct(): void {
    this.fileError = '';

    if (this.modalMode === 'create') {
      const fields: Record<string, any> = {
        providerId: this.providerId,
        specialityId: this.formData.specialityId,
        name: this.formData.name,
        sku: this.formData.sku,
        brand: this.formData.brand,
        description: this.formData.description,
        countryOrigin: this.formData.countryOrigin,
        priceProvider: Number(this.formData.priceProvider),
        priceSale: Number(this.formData.priceSale),
        stock: Number(this.formData.stock),
        warrantyTime: Number(this.formData.warrantyTime),
        hasWarranty: this.formData.hasWarranty,
        discount: Number(this.formData.discount),
        isNew: this.formData.isNew,
        isOfferUnique: this.formData.isOfferUnique,
        showPrice: this.formData.showPrice,
        state: this.formData.state
      };

      this.saving = true;
      this.productService.create(
        fields,
        this.imageFiles.length > 0 ? this.imageFiles : undefined,
        this.catalogFile || undefined,
        this.videoFile || undefined
      ).subscribe({
        next: (response) => {
          this.saving = false;
          if (response.success) {
            this.closeModal();
            this.loadProducts();
          } else {
            this.error = response.mensaje || 'Error al crear producto';
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.saving = false;
          this.error = 'Error de conexión al crear producto';
          this.cdr.detectChanges();
        }
      });
    } else {
      const fields: Record<string, any> = {
        id: this.selectedProduct!.id,
        providerId: this.providerId,
        specialityId: this.formData.specialityId,
        name: this.formData.name,
        sku: this.formData.sku,
        brand: this.formData.brand,
        description: this.formData.description,
        countryOrigin: this.formData.countryOrigin,
        priceProvider: Number(this.formData.priceProvider),
        priceSale: Number(this.formData.priceSale),
        stock: Number(this.formData.stock),
        warrantyTime: Number(this.formData.warrantyTime),
        hasWarranty: this.formData.hasWarranty,
        discount: Number(this.formData.discount),
        isNew: this.formData.isNew,
        isOfferUnique: this.formData.isOfferUnique,
        showPrice: this.formData.showPrice,
        state: this.formData.state
      };

      this.saving = true;
      this.productService.update(
        fields,
        this.imageFiles.length > 0 ? this.imageFiles : undefined,
        this.catalogFile || undefined,
        this.videoFile || undefined
      ).subscribe({
        next: (response) => {
          this.saving = false;
          if (response.success) {
            this.closeModal();
            this.loadProducts();
          } else {
            this.error = response.mensaje || 'Error al actualizar producto';
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.saving = false;
          this.error = 'Error de conexión al actualizar producto';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // ======== File Handling ========

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addImageFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onImagesDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverImages = false;
    if (event.dataTransfer?.files) {
      this.addImageFiles(Array.from(event.dataTransfer.files));
    }
  }

  private addImageFiles(files: File[]): void {
    this.fileError = '';
    const accepted = FILE_LIMITS.IMAGE_ACCEPTED.split(',').map(e => e.trim());

    for (const file of files) {
      const ext = '.' + file.name.split('.').pop()!.toLowerCase();
      if (!accepted.includes(ext)) {
        this.fileError = `Formato no permitido: ${file.name}. Use ${FILE_LIMITS.IMAGE_ACCEPTED}`;
        return;
      }
      if (file.size > FILE_LIMITS.IMAGE_MAX_SIZE) {
        this.fileError = `${file.name} excede el límite de 5 MB`;
        return;
      }
      if (this.imageFiles.length >= FILE_LIMITS.IMAGE_MAX_COUNT) {
        this.fileError = `Máximo ${FILE_LIMITS.IMAGE_MAX_COUNT} imágenes`;
        return;
      }
      this.imageFiles.push(file);
      this.imagePreviewUrls.push(URL.createObjectURL(file));
    }
    this.cdr.detectChanges();
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.imagePreviewUrls[index]);
    this.imageFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  removeExistingImage(index: number): void {
    this.existingImageUrls.splice(index, 1);
  }

  onCatalogSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.setCatalogFile(input.files[0]);
      input.value = '';
    }
  }

  onCatalogDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverCatalog = false;
    if (event.dataTransfer?.files[0]) {
      this.setCatalogFile(event.dataTransfer.files[0]);
    }
  }

  private setCatalogFile(file: File): void {
    this.fileError = '';
    const ext = '.' + file.name.split('.').pop()!.toLowerCase();
    if (ext !== '.pdf') {
      this.fileError = 'El catálogo debe ser un archivo PDF';
      return;
    }
    if (file.size > FILE_LIMITS.CATALOG_MAX_SIZE) {
      this.fileError = `El catálogo excede el límite de 10 MB`;
      return;
    }
    this.catalogFile = file;
    this.catalogFileName = file.name;
    this.existingCatalogUrl = '';
    this.cdr.detectChanges();
  }

  removeCatalog(): void {
    this.catalogFile = null;
    this.catalogFileName = '';
  }

  removeExistingCatalog(): void {
    this.existingCatalogUrl = '';
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.setVideoFile(input.files[0]);
      input.value = '';
    }
  }

  onVideoDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOverVideo = false;
    if (event.dataTransfer?.files[0]) {
      this.setVideoFile(event.dataTransfer.files[0]);
    }
  }

  private setVideoFile(file: File): void {
    this.fileError = '';
    const ext = '.' + file.name.split('.').pop()!.toLowerCase();
    const accepted = FILE_LIMITS.VIDEO_ACCEPTED.split(',').map(e => e.trim());
    if (!accepted.includes(ext)) {
      this.fileError = `Formato de video no permitido. Use ${FILE_LIMITS.VIDEO_ACCEPTED}`;
      return;
    }
    if (file.size > FILE_LIMITS.VIDEO_MAX_SIZE) {
      this.fileError = `El video excede el límite de 50 MB`;
      return;
    }

    // Validar duración del video
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(videoEl.src);
      if (videoEl.duration > FILE_LIMITS.VIDEO_MAX_DURATION) {
        this.fileError = `El video dura ${Math.round(videoEl.duration)}s. Máximo: ${FILE_LIMITS.VIDEO_MAX_DURATION}s`;
        this.videoFile = null;
        this.videoFileName = '';
        this.cdr.detectChanges();
        return;
      }
      this.cdr.detectChanges();
    };
    videoEl.src = URL.createObjectURL(file);

    this.videoFile = file;
    this.videoFileName = file.name;
    this.existingVideoUrl = '';
    this.cdr.detectChanges();
  }

  removeVideo(): void {
    this.videoFile = null;
    this.videoFileName = '';
  }

  removeExistingVideo(): void {
    this.existingVideoUrl = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ======== Delete ========

  confirmDelete(product: ProductDto): void {
    this.productToDelete = product;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.productToDelete = null;
  }

  deleteProduct(): void {
    if (!this.productToDelete) return;

    this.productService.delete(this.productToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.cancelDelete();
          this.loadProducts();
        } else {
          this.error = response.mensaje || 'Error al eliminar producto';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.error = 'Error de conexión al eliminar producto';
        this.cdr.detectChanges();
      }
    });
  }

  // ======== Helpers ========

  getSpecialityName(specialityId: number): string {
    const sp = this.specialities.find(s => s.id === specialityId);
    return sp ? sp.name : `Esp #${specialityId}`;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
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
