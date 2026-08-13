import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductDto, ProductVariantDto, PrimaryAttributeDto, ProviderCategoryDto, SubCategoryDto, SpecialityDto, FILE_LIMITS } from '../../core/models';
import { ProductService, ProductVariantService, ProviderCategoryService, SubCategoryService, SpecialityService, RoleService } from '../../core/services';

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

  // Modal Eliminar
  showDeleteConfirm = false;
  productToDelete: ProductDto | null = null;
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

  dragOverImages = false;
  dragOverCatalog = false;
  dragOverVideo = false;

  // Datasheet — solo producto simple
  datasheetEntries: { key: string; value: string }[] = [];

  // Primary Attributes — solo producto con variantes
  primaryAttributes: PrimaryAttributeDto[] = [];

  // Variants management
  variants: ProductVariantDto[] = [];
  variantsCurrentPage = 1;
  variantsTotalPages = 1;
  variantsTotalCount = 0;
  loadingVariants = false;

  // Variant CRUD Modal
  showVariantModal = false;
  variantModalMode: 'create' | 'edit' = 'create';
  selectedVariant: ProductVariantDto | null = null;
  variantFormData: any = {};
  variantSecondaryEntries: { key: string; value: string }[] = [];
  savingVariant = false;

  // Delete variant
  showDeleteVariantConfirm = false;
  variantToDelete: ProductVariantDto | null = null;

  readonly limits = FILE_LIMITS;

  constructor(
    private productService: ProductService,
    private productVariantService: ProductVariantService,
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
    if (!this.canSearch()) return;
    this.currentPage = 1;
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.hasSearched = true;

    this.productService.getAll(this.providerId, this.selectedSpecialityId!, this.currentPage, this.pageSize).subscribe({
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
      error: () => {
        this.error = 'Error de conexión al cargar productos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ======== CRUD Modal ========

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedProduct = null;
    this.formData = {
      providerId: this.providerId,
      categoryId: this.selectedCategoryId,
      subCategoryId: this.selectedSubCategoryId,
      specialityId: this.selectedSpecialityId,
      name: '',
      sku: '',
      brand: '',
      description: '',
      countryOrigin: '',
      hasVariations: false,
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
    this.loadModalCategories(() => {
      if (this.formData.categoryId) {
        this.loadModalSubcategories(this.formData.categoryId, () => {
          if (this.formData.subCategoryId) {
            this.loadModalSpecialities(this.formData.subCategoryId);
          }
        });
      }
    });
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
      providerId: this.providerId,
      categoryId: catId,
      subCategoryId: subCatId,
      specialityId: product.specialityId,
      name: product.name,
      sku: product.sku || '',
      brand: product.brand,
      description: product.description,
      countryOrigin: product.countryOrigin,
      hasVariations: product.hasVariations,
      priceProvider: product.priceProvider || 0,
      priceSale: product.priceSale || 0,
      stock: product.stock || 0,
      warrantyTime: product.warrantyTime,
      hasWarranty: product.hasWarranty,
      discount: product.discount || 0,
      isNew: product.isNew,
      isOfferUnique: product.isOfferUnique,
      showPrice: product.showPrice,
      state: product.state
    };

    this.resetFiles();
    this.existingImageUrls = product.productImg ? [...product.productImg] : [];
    this.existingCatalogUrl = product.catalogPdf || '';
    this.existingVideoUrl = product.productVideo || '';

    if (!product.hasVariations && product.attributes && typeof product.attributes === 'object') {
      this.datasheetEntries = Object.entries(product.attributes).map(([key, value]) => ({
        key, value: String(value)
      }));
    }

    if (product.hasVariations && product.primaryAttributes) {
      this.primaryAttributes = product.primaryAttributes.map(a => ({ name: a.name, options: [...a.options] }));
      this.loadVariants(1);
    }

    this.loadModalCategories(() => {
      if (catId) {
        this.loadModalSubcategories(catId, () => {
          if (subCatId) this.loadModalSpecialities(subCatId);
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
    this.datasheetEntries = [];
    this.primaryAttributes = [];
    this.variants = [];
    this.variantsCurrentPage = 1;
    this.variantsTotalPages = 1;
    this.variantsTotalCount = 0;
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

    const fields: Record<string, any> = {
      providerId: this.providerId,
      specialityId: this.formData.specialityId,
      name: this.formData.name,
      brand: this.formData.brand,
      description: this.formData.description,
      countryOrigin: this.formData.countryOrigin,
      hasVariations: this.formData.hasVariations,
      warrantyTime: Number(this.formData.warrantyTime),
      hasWarranty: this.formData.hasWarranty,
      isNew: this.formData.isNew,
      isOfferUnique: this.formData.isOfferUnique,
      showPrice: this.formData.showPrice,
      state: this.formData.state
    };

    if (!this.formData.hasVariations) {
      fields['sku'] = this.formData.sku;
      fields['priceProvider'] = Number(this.formData.priceProvider);
      fields['priceSale'] = Number(this.formData.priceSale);
      fields['stock'] = Number(this.formData.stock);
      fields['discount'] = Number(this.formData.discount);

      const attrsObj: Record<string, string> = {};
      for (const entry of this.datasheetEntries) {
        const key = entry.key.trim();
        if (key) attrsObj[key] = entry.value;
      }
      if (Object.keys(attrsObj).length > 0) {
        fields['attributesJson'] = JSON.stringify(attrsObj);
      }
    } else {
      if (this.primaryAttributes.length > 0) {
        fields['primaryAttributesJson'] = JSON.stringify(this.primaryAttributes);
      }
    }

    if (this.modalMode === 'edit') {
      fields['id'] = this.selectedProduct!.id;
    }

    this.saving = true;
    const operation = this.modalMode === 'create'
      ? this.productService.create(fields, this.imageFiles.length > 0 ? this.imageFiles : undefined, this.catalogFile || undefined, this.videoFile || undefined)
      : this.productService.update(fields, this.imageFiles.length > 0 ? this.imageFiles : undefined, this.catalogFile || undefined, this.videoFile || undefined);

    operation.subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.closeModal();
          this.loadProducts();
        } else {
          this.error = response.mensaje || 'Error al guardar producto';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.saving = false;
        this.error = 'Error de conexión al guardar producto';
        this.cdr.detectChanges();
      }
    });
  }

  // ======== Datasheet ========
  addDatasheetEntry(): void { this.datasheetEntries.push({ key: '', value: '' }); }
  removeDatasheetEntry(index: number): void { this.datasheetEntries.splice(index, 1); }

  // ======== Primary Attributes ========
  addPrimaryAttribute(): void { this.primaryAttributes.push({ name: '', options: [''] }); }
  removePrimaryAttribute(index: number): void { this.primaryAttributes.splice(index, 1); }
  addPrimaryAttributeOption(i: number): void { this.primaryAttributes[i].options.push(''); }
  removePrimaryAttributeOption(i: number, oi: number): void { this.primaryAttributes[i].options.splice(oi, 1); }

  // ======== Variants ========
  loadVariants(page: number = 1): void {
    if (!this.selectedProduct) return;
    this.loadingVariants = true;
    this.variantsCurrentPage = page;
    this.productVariantService.getByProductId(this.selectedProduct.id, page, 50).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.variants = response.data.items;
          this.variantsTotalPages = response.data.totalPages;
          this.variantsTotalCount = response.data.totalCount;
        }
        this.loadingVariants = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingVariants = false; this.cdr.detectChanges(); }
    });
  }

  openVariantModal(mode: 'create' | 'edit', variant?: ProductVariantDto): void {
    this.variantModalMode = mode;
    this.selectedVariant = variant || null;
    if (mode === 'create') {
      const primarySelection: Record<string, string> = {};
      this.primaryAttributes.forEach(a => primarySelection[a.name] = '');
      this.variantFormData = { sku: '', priceProvider: 0, priceSale: 0, stock: 0, discount: 0, state: true, primarySelection };
      this.variantSecondaryEntries = [];
    } else if (variant) {
      this.variantFormData = { sku: variant.sku, priceProvider: variant.priceProvider, priceSale: variant.priceSale, stock: variant.stock, discount: variant.discount, state: variant.state, primarySelection: { ...variant.primarySelection } };
      this.variantSecondaryEntries = Object.entries(variant.secondaryAttributes || {}).map(([key, value]) => ({ key, value: String(value) }));
    }
    this.showVariantModal = true;
  }

  closeVariantModal(): void { this.showVariantModal = false; this.selectedVariant = null; this.variantFormData = {}; this.variantSecondaryEntries = []; }
  addVariantSecondaryEntry(): void { this.variantSecondaryEntries.push({ key: '', value: '' }); }
  removeVariantSecondaryEntry(index: number): void { this.variantSecondaryEntries.splice(index, 1); }

  saveVariant(): void {
    const secondaryAttributes: Record<string, string> = {};
    for (const entry of this.variantSecondaryEntries) { const key = entry.key.trim(); if (key) secondaryAttributes[key] = entry.value; }
    this.savingVariant = true;

    if (this.variantModalMode === 'create') {
      this.productVariantService.create({ productId: this.selectedProduct!.id, sku: this.variantFormData.sku, primarySelection: this.variantFormData.primarySelection, secondaryAttributes, priceProvider: Number(this.variantFormData.priceProvider), priceSale: Number(this.variantFormData.priceSale), stock: Number(this.variantFormData.stock), discount: Number(this.variantFormData.discount), state: this.variantFormData.state }).subscribe({
        next: (r) => { this.savingVariant = false; if (r.success) { this.closeVariantModal(); this.loadVariants(this.variantsCurrentPage); } else { this.error = r.mensaje || 'Error'; this.cdr.detectChanges(); } },
        error: () => { this.savingVariant = false; this.error = 'Error de conexión'; this.cdr.detectChanges(); }
      });
    } else {
      this.productVariantService.update({ id: this.selectedVariant!.id, sku: this.variantFormData.sku, primarySelection: this.variantFormData.primarySelection, secondaryAttributes, priceProvider: Number(this.variantFormData.priceProvider), priceSale: Number(this.variantFormData.priceSale), stock: Number(this.variantFormData.stock), discount: Number(this.variantFormData.discount), state: this.variantFormData.state }).subscribe({
        next: (r) => { this.savingVariant = false; if (r.success) { this.closeVariantModal(); this.loadVariants(this.variantsCurrentPage); } else { this.error = r.mensaje || 'Error'; this.cdr.detectChanges(); } },
        error: () => { this.savingVariant = false; this.error = 'Error de conexión'; this.cdr.detectChanges(); }
      });
    }
  }

  confirmDeleteVariant(variant: ProductVariantDto): void { this.variantToDelete = variant; this.showDeleteVariantConfirm = true; }
  cancelDeleteVariant(): void { this.showDeleteVariantConfirm = false; this.variantToDelete = null; }
  deleteVariant(): void {
    if (!this.variantToDelete) return;
    this.productVariantService.delete(this.variantToDelete.id).subscribe({
      next: (r) => { if (r.success) { this.cancelDeleteVariant(); this.loadVariants(this.variantsCurrentPage); } else { this.error = r.mensaje || 'Error'; this.cdr.detectChanges(); } },
      error: () => { this.error = 'Error de conexión'; this.cdr.detectChanges(); }
    });
  }

  getObjectKeys(obj: Record<string, any>): string[] { return Object.keys(obj || {}); }

  // ======== File Handling ========
  onImagesSelected(event: Event): void { const input = event.target as HTMLInputElement; if (input.files) { this.addImageFiles(Array.from(input.files)); input.value = ''; } }
  onImagesDrop(event: DragEvent): void { event.preventDefault(); this.dragOverImages = false; if (event.dataTransfer?.files) this.addImageFiles(Array.from(event.dataTransfer.files)); }

  private addImageFiles(files: File[]): void {
    this.fileError = '';
    const accepted = FILE_LIMITS.IMAGE_ACCEPTED.split(',').map(e => e.trim());
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop()!.toLowerCase();
      if (!accepted.includes(ext)) { this.fileError = `Formato no permitido: ${file.name}`; return; }
      if (file.size > FILE_LIMITS.IMAGE_MAX_SIZE) { this.fileError = `${file.name} excede 5 MB`; return; }
      if (this.imageFiles.length >= FILE_LIMITS.IMAGE_MAX_COUNT) { this.fileError = `Máximo ${FILE_LIMITS.IMAGE_MAX_COUNT} imágenes`; return; }
      this.imageFiles.push(file);
      this.imagePreviewUrls.push(URL.createObjectURL(file));
    }
    this.cdr.detectChanges();
  }

  removeImage(index: number): void { URL.revokeObjectURL(this.imagePreviewUrls[index]); this.imageFiles.splice(index, 1); this.imagePreviewUrls.splice(index, 1); }
  removeExistingImage(index: number): void { this.existingImageUrls.splice(index, 1); }

  onCatalogSelected(event: Event): void { const input = event.target as HTMLInputElement; if (input.files && input.files[0]) { this.setCatalogFile(input.files[0]); input.value = ''; } }
  onCatalogDrop(event: DragEvent): void { event.preventDefault(); this.dragOverCatalog = false; if (event.dataTransfer?.files[0]) this.setCatalogFile(event.dataTransfer.files[0]); }

  private setCatalogFile(file: File): void {
    this.fileError = '';
    if (!file.name.toLowerCase().endsWith('.pdf')) { this.fileError = 'Solo archivos PDF'; return; }
    if (file.size > FILE_LIMITS.CATALOG_MAX_SIZE) { this.fileError = 'Catálogo excede 10 MB'; return; }
    this.catalogFile = file; this.catalogFileName = file.name; this.existingCatalogUrl = ''; this.cdr.detectChanges();
  }

  removeCatalog(): void { this.catalogFile = null; this.catalogFileName = ''; }
  removeExistingCatalog(): void { this.existingCatalogUrl = ''; }

  onVideoSelected(event: Event): void { const input = event.target as HTMLInputElement; if (input.files && input.files[0]) { this.setVideoFile(input.files[0]); input.value = ''; } }
  onVideoDrop(event: DragEvent): void { event.preventDefault(); this.dragOverVideo = false; if (event.dataTransfer?.files[0]) this.setVideoFile(event.dataTransfer.files[0]); }

  private setVideoFile(file: File): void {
    this.fileError = '';
    const accepted = FILE_LIMITS.VIDEO_ACCEPTED.split(',').map(e => e.trim());
    const ext = '.' + file.name.split('.').pop()!.toLowerCase();
    if (!accepted.includes(ext)) { this.fileError = 'Formato de video no permitido'; return; }
    if (file.size > FILE_LIMITS.VIDEO_MAX_SIZE) { this.fileError = 'Video excede 50 MB'; return; }
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.onloadedmetadata = () => { URL.revokeObjectURL(videoEl.src); if (videoEl.duration > FILE_LIMITS.VIDEO_MAX_DURATION) { this.fileError = `Video: ${Math.round(videoEl.duration)}s > ${FILE_LIMITS.VIDEO_MAX_DURATION}s`; this.videoFile = null; this.videoFileName = ''; this.cdr.detectChanges(); } else { this.cdr.detectChanges(); } };
    videoEl.src = URL.createObjectURL(file);
    this.videoFile = file; this.videoFileName = file.name; this.existingVideoUrl = ''; this.cdr.detectChanges();
  }

  removeVideo(): void { this.videoFile = null; this.videoFileName = ''; }
  removeExistingVideo(): void { this.existingVideoUrl = ''; }
  onDragOver(event: DragEvent): void { event.preventDefault(); }
  formatFileSize(bytes: number): string { if (bytes < 1024) return bytes + ' B'; if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'; return (bytes / 1048576).toFixed(1) + ' MB'; }

  // ======== Delete ========
  confirmDelete(product: ProductDto): void { this.productToDelete = product; this.showDeleteConfirm = true; }
  cancelDelete(): void { this.showDeleteConfirm = false; this.productToDelete = null; }
  deleteProduct(): void {
    if (!this.productToDelete) return;
    this.productService.delete(this.productToDelete.id).subscribe({
      next: (r) => { if (r.success) { this.cancelDelete(); this.loadProducts(); } else { this.error = r.mensaje || 'Error'; this.cdr.detectChanges(); } },
      error: () => { this.error = 'Error de conexión'; this.cdr.detectChanges(); }
    });
  }

  // ======== Paginación ========
  changePage(page: number): void { if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.loadProducts(); } }
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  getSpecialityName(id: number): string {
    const sp = this.specialities.find(s => s.id === id);
    return sp ? sp.name : `#${id}`;
  }
}
