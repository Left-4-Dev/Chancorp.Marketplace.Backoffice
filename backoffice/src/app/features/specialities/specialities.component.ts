import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SpecialityDto, SubCategoryDto, CategoryDto, CreateSpecialityRequest, UpdateSpecialityRequest } from '../../core/models';
import { SpecialityService, SubCategoryService, CategoryService } from '../../core/services';

@Component({
  selector: 'app-specialities',
  templateUrl: './specialities.component.html',
  styleUrls: ['./specialities.component.scss'],
  standalone: false
})
export class SpecialitiesComponent implements OnInit {
  specialities: SpecialityDto[] = [];
  filteredSpecialities: SpecialityDto[] = [];
  categories: CategoryDto[] = [];
  subcategories: SubCategoryDto[] = [];
  allSubcategories: SubCategoryDto[] = [];
  loading = false;
  error = '';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Filtros
  searchTerm = '';
  filterCategoryId: number | null = null;
  filterSubCategoryId: number | null = null;

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedSpeciality: SpecialityDto | null = null;

  // Formulario
  formData: CreateSpecialityRequest = {
    subCategoryId: 0,
    name: '',
    description: '',
    state: true
  };
  modalCategories: CategoryDto[] = [];
  modalSubcategories: SubCategoryDto[] = [];
  modalSelectedCategoryId: number | null = null;
  loadingModalSubcategories = false;

  // Confirmación de eliminación
  showDeleteConfirm = false;
  specialityToDelete: SpecialityDto | null = null;

  constructor(
    private specialityService: SpecialityService,
    private subcategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadAllSubcategories();
    this.loadSpecialities();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.categories = response.dataLista;
          this.modalCategories = response.dataLista;
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadAllSubcategories(): void {
    this.subcategoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.allSubcategories = response.dataLista;
        }
      },
      error: (err) => {
        console.error('Error loading subcategories:', err);
      }
    });
  }

  loadSpecialities(): void {
    this.loading = true;
    this.error = '';

    this.specialityService.getAll(1, 50).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.specialities = response.data.items;
          this.applyFilter();
        } else {
          this.error = response.mensaje || 'Error al cargar especialidades';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar especialidades';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    let filtered = this.specialities;

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(sp =>
        sp.name.toLowerCase().includes(term) ||
        sp.description.toLowerCase().includes(term)
      );
    }

    if (this.filterCategoryId) {
      const subIds = this.allSubcategories
        .filter(sub => sub.categoryId === this.filterCategoryId)
        .map(sub => sub.id);
      filtered = filtered.filter(sp => subIds.includes(sp.subCategoryId));
    }

    if (this.filterSubCategoryId) {
      filtered = filtered.filter(sp => sp.subCategoryId === this.filterSubCategoryId);
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredSpecialities = filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  onFilterCategory(): void {
    this.filterSubCategoryId = null;
    this.subcategories = this.filterCategoryId
      ? this.allSubcategories.filter(sub => sub.categoryId === this.filterCategoryId)
      : [];
    this.currentPage = 1;
    this.applyFilter();
  }

  onFilterSubCategory(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilter();
    }
  }

  getSubCategoryName(subCategoryId: number): string {
    const sub = this.allSubcategories.find(s => s.id === subCategoryId);
    return sub ? sub.name : 'Sin subcategoría';
  }

  getCategoryForSubCategory(subCategoryId: number): string {
    const sub = this.allSubcategories.find(s => s.id === subCategoryId);
    if (!sub) return '';
    const cat = this.categories.find(c => c.id === sub.categoryId);
    return cat ? cat.name : '';
  }

  // ======== CRUD Modal ========

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedSpeciality = null;
    this.modalSelectedCategoryId = this.categories[0]?.id || null;
    this.formData = {
      subCategoryId: 0,
      name: '',
      description: '',
      state: true
    };
    this.modalSubcategories = [];
    if (this.modalSelectedCategoryId) {
      this.loadModalSubcategories(this.modalSelectedCategoryId);
    }
    this.showModal = true;
  }

  openEditModal(speciality: SpecialityDto): void {
    this.modalMode = 'edit';
    this.selectedSpeciality = speciality;

    const sub = this.allSubcategories.find(s => s.id === speciality.subCategoryId);
    this.modalSelectedCategoryId = sub ? sub.categoryId : null;

    this.formData = {
      subCategoryId: speciality.subCategoryId,
      name: speciality.name,
      description: speciality.description,
      state: speciality.state
    };

    if (this.modalSelectedCategoryId) {
      this.loadModalSubcategories(this.modalSelectedCategoryId);
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSpeciality = null;
  }

  onModalCategoryChange(): void {
    this.formData.subCategoryId = 0;
    this.modalSubcategories = [];
    if (this.modalSelectedCategoryId) {
      this.loadModalSubcategories(this.modalSelectedCategoryId);
    }
  }

  loadModalSubcategories(categoryId: number): void {
    this.loadingModalSubcategories = true;
    this.subcategoryService.getByCategoryId(categoryId).subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.modalSubcategories = response.dataLista;
        }
        this.loadingModalSubcategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingModalSubcategories = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveSpeciality(): void {
    if (this.modalMode === 'create') {
      this.specialityService.create(this.formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSpecialities();
            this.closeModal();
          } else {
            this.error = response.mensaje || 'Error al crear especialidad';
          }
        },
        error: () => {
          this.error = 'Error al crear especialidad';
        }
      });
    } else if (this.selectedSpeciality) {
      const updateData: UpdateSpecialityRequest = {
        subCategoryId: this.formData.subCategoryId,
        name: this.formData.name,
        description: this.formData.description,
        state: this.formData.state
      };

      this.specialityService.update(this.selectedSpeciality.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSpecialities();
            this.closeModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar especialidad';
          }
        },
        error: () => {
          this.error = 'Error al actualizar especialidad';
        }
      });
    }
  }

  // ======== Delete ========

  confirmDelete(speciality: SpecialityDto): void {
    this.specialityToDelete = speciality;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.specialityToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteSpeciality(): void {
    if (this.specialityToDelete) {
      this.specialityService.delete(this.specialityToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSpecialities();
          } else {
            this.error = response.mensaje || 'Error al eliminar especialidad';
          }
          this.cancelDelete();
        },
        error: () => {
          this.error = 'Error al eliminar especialidad';
          this.cancelDelete();
        }
      });
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
