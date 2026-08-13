import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { RoleService } from '../../core/services/role.service';
import { ProviderService } from '../../core/services/provider.service';
import { ProviderDto, UpdateProviderRequest } from '../../core/models';

@Component({
  selector: 'app-provider-profile',
  templateUrl: './provider-profile.component.html',
  styleUrls: ['./provider-profile.component.scss'],
  standalone: false
})
export class ProviderProfileComponent implements OnInit {
  provider: ProviderDto | null = null;
  editForm: Partial<UpdateProviderRequest> = {};
  isEditing = false;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private providerService: ProviderService,
    private roleService: RoleService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.providerService.getById(this.roleService.userId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.provider = res.data;
        } else {
          this.errorMessage = res.mensaje || 'Error al cargar el perfil';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error de conexión al cargar el perfil';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit(): void {
    if (!this.provider) return;
    this.isEditing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.editForm = {
      userId: this.provider.userId,
      enterpriseName: this.provider.enterpriseName,
      providerType: this.provider.providerType,
      phone: this.provider.phone,
      sector: this.provider.sector,
      docType: this.provider.docType,
      docNumber: this.provider.docNumber,
      countryCode: this.provider.countryCode,
      region: this.provider.region,
      address: this.provider.address,
      website: this.provider.website
    };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editForm = {};
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.provider) return;
    this.isSaving = true;
    this.errorMessage = '';

    const request: UpdateProviderRequest = {
      userId: this.provider.userId,
      enterpriseName: this.editForm.enterpriseName,
      providerType: this.editForm.providerType,
      phone: this.editForm.phone,
      sector: this.editForm.sector,
      docType: this.editForm.docType,
      docNumber: this.editForm.docNumber,
      countryCode: this.editForm.countryCode,
      region: this.editForm.region,
      address: this.editForm.address,
      website: this.editForm.website
    };

    this.providerService.update(request).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMessage = 'Perfil actualizado correctamente';
          this.isEditing = false;
          if (this.editForm.enterpriseName) {
            this.roleService.updateDisplayName(this.editForm.enterpriseName);
          }
          this.loadProfile();
        } else {
          this.errorMessage = res.mensaje || 'Error al actualizar el perfil';
        }
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Error de conexión al guardar';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
