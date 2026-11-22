import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { FormsModule } from '@angular/forms';
import { ProviderProductsComponent } from './provider-products.component';

const routes: Routes = [
  { path: '', component: ProviderProductsComponent, canActivate: [RoleGuard], data: { role: 'provider' } }
];

@NgModule({
  declarations: [
    ProviderProductsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProviderProductsModule { }
