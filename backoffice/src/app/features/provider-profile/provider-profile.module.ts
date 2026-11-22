import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { FormsModule } from '@angular/forms';
import { ProviderProfileComponent } from './provider-profile.component';

const routes: Routes = [
  { path: '', component: ProviderProfileComponent, canActivate: [RoleGuard], data: { role: 'provider' } }
];

@NgModule({
  declarations: [ProviderProfileComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class ProviderProfileModule { }
