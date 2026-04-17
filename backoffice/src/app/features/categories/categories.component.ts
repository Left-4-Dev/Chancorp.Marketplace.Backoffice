import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../core/models';
import { CategoryService } from '../../core/services';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
  standalone: false
})
export class CategoriesComponent implements OnInit {
  categories: CategoryDto[] = [];
  filteredCategories: CategoryDto[] = [];
  loading = false;
  error = '';

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Búsqueda
  searchTerm = '';

  // Modal
  showModal = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedCategory: CategoryDto | null = null;

  // Formulario
  formData: CreateCategoryRequest = {
    name: '',
    description: '',
    state: true
  };

  // Confirmación de eliminación
  showDeleteConfirm = false;
  categoryToDelete: CategoryDto | null = null;

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';
    
    this.categoryService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.dataLista) {
          this.categories = response.dataLista;
          this.applyFilter();
        } else {
          this.error = response.mensaje || 'Error al cargar categorías';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error de conexión al cargar categorías';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    let filtered = this.categories;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = this.categories.filter(cat => 
        cat.name.toLowerCase().includes(term) || 
        cat.description.toLowerCase().includes(term)
      );
    }
    
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.filteredCategories = filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilter();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilter();
    }
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.formData = { name: '', description: '', state: true };
    this.selectedCategory = null;
    this.showModal = true;
  }

  openEditModal(category: CategoryDto): void {
    this.modalMode = 'edit';
    this.selectedCategory = category;
    this.formData = {
      name: category.name,
      description: category.description,
      state: category.state
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCategory = null;
  }

  saveCategory(): void {
    if (this.modalMode === 'create') {
      this.categoryService.create(this.formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCategories();
            this.closeModal();
          } else {
            this.error = response.mensaje || 'Error al crear categoría';
          }
        },
        error: () => {
          this.error = 'Error al crear categoría';
        }
      });
    } else if (this.selectedCategory) {
      const updateData: UpdateCategoryRequest = {
        name: this.formData.name,
        description: this.formData.description,
        state: this.formData.state
      };
      
      this.categoryService.update(this.selectedCategory.id, updateData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCategories();
            this.closeModal();
          } else {
            this.error = response.mensaje || 'Error al actualizar categoría';
          }
        },
        error: () => {
          this.error = 'Error al actualizar categoría';
        }
      });
    }
  }

  confirmDelete(category: CategoryDto): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.categoryToDelete = null;
    this.showDeleteConfirm = false;
  }

  deleteCategory(): void {
    if (this.categoryToDelete) {
      this.categoryService.delete(this.categoryToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadCategories();
          } else {
            this.error = response.mensaje || 'Error al eliminar categoría';
          }
          this.cancelDelete();
        },
        error: () => {
          this.error = 'Error al eliminar categoría';
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
