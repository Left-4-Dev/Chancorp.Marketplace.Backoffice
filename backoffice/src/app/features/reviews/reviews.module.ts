import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { ReviewsComponent } from './reviews.component';

const routes: Routes = [
  { path: '', component: ReviewsComponent, canActivate: [RoleGuard], data: { role: 'admin' } }
];

@NgModule({
  declarations: [
    ReviewsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ReviewsModule { }
