import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { FormsModule } from '@angular/forms';
import { ProviderOrdersComponent } from './provider-orders.component';

const routes: Routes = [
  { path: '', component: ProviderOrdersComponent, canActivate: [RoleGuard], data: { role: 'provider' } }
];

@NgModule({
  declarations: [
    ProviderOrdersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProviderOrdersModule { }
