import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SubCategoryDto, CategoryDto, CreateSubCategoryRequest, UpdateSubCategoryRequest } from '../../core/models';
import { SubCategoryService, CategoryService } from '../../core/services';

@Component({
  selector: 'app-subcategories',
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss'],
  standalone: false
})
export class SubcategoriesComponent implements OnInit {
  subcategories: SubCategoryDto[] = [];
  filteredSubcategories: SubCategoryDto[] = [];
  categories: CategoryDto[] = [];
  loading = false;
  error = '';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Filtros
  searchTerm = '';
  filterCategoryId: number | null = null;

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedSubcategory: SubCategoryDto | null = null;

  // Formulario
  formData: CreateSubCategoryRequest = {
    categoryId: 0,
    name: '',
    description: '',
    state: true
  };

  // Confirmación de eliminación
  showDeleteConfirm = false;
  subcategoryToDelete: SubCategoryDto | null = null;

  constructor(
    private subcategoryService: SubCategoryService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubcategories();
  }

  loadCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.categories = response.dataLista;
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadSubcategories(): void {
    this.loading = true;
    this.error = '';
    
    this.subcategoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.subcategories = response.dataLista;
          this.applyFilter();
        } else {
          this.error = response.mensaje || 'Error al cargar subcategorías';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar subcategorías';
        this.loading = false;
        this.cdr.detectChanges();
        console.error(err);
      }
    });
  }

  applyFilter(): void {
    let filtered = this.subcategories;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(term) || 
        sub.description.toLowerCase().includes(term)
      );
    }

    if (this.filterCategoryId) {
      filtered = filtered.filter(sub => sub.categoryId === this.filterCategoryId);
    }
    
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredSubcategories = filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  onFilterCategory(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilter();
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.formData = { categoryId: this.categories[0]?.id || 0, name: '', description: '', state: true };
    this.selectedSubcategory = null;
    this.showModal = true;
  }

  openEditModal(subcategory: SubCategoryDto): void {
    this.modalMode = 'edit';
    this.selectedSubcategory = subcategory;
    this.formData = {
      categoryId: subcategory.categoryId,
      name: subcategory.name,
      description: subcategory.description,
      state: subcategory.state
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedSubcategory = null;
  }

  saveSubcategory(): void {
    if (this.modalMode === 'create') {
      this.subcategoryService.create(this.formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubcategories();
            this.closeModal();
          } else {
            this.error = response.mensaje || 'Error al crear subcategoría';
          }
        },
        error: () => {
          this.error = 'Error al crear subcategoría';
        }
      });
    } else if (this.selectedSubcategory) {
      const updateData: UpdateSubCategoryRequest = {
        categoryId: this.formData.categoryId,
        name: this.formData.name,
        description: this.formData.description,
        state: this.formData.state
      };
      
      this.subcategoryService.update(this.selectedSubcategory.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubcategories();
            this.closeModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar subcategoría';
          }
        },
        error: () => {
          this.error = 'Error al actualizar subcategoría';
        }
      });
    }
  }

  confirmDelete(subcategory: SubCategoryDto): void {
    this.subcategoryToDelete = subcategory;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.subcategoryToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteSubcategory(): void {
    if (this.subcategoryToDelete) {
      this.subcategoryService.delete(this.subcategoryToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadSubcategories();
          } else {
            this.error = response.mensaje || 'Error al eliminar subcategoría';
          }
          this.cancelDelete();
        },
        error: () => {
          this.error = 'Error al eliminar subcategoría';
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
