import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { ProviderSearchOrdersComponent } from './provider-search-orders.component';

const routes: Routes = [
  { path: '', component: ProviderSearchOrdersComponent, canActivate: [RoleGuard], data: { role: 'provider' } }
];

@NgModule({
  declarations: [
    ProviderSearchOrdersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProviderSearchOrdersModule { }
