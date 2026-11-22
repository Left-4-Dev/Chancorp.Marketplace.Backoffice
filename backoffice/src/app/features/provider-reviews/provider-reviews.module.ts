import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { FormsModule } from '@angular/forms';
import { ProviderReviewsComponent } from './provider-reviews.component';

const routes: Routes = [
  { path: '', component: ProviderReviewsComponent, canActivate: [RoleGuard], data: { role: 'provider' } }
];

@NgModule({
  declarations: [
    ProviderReviewsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProviderReviewsModule { }
