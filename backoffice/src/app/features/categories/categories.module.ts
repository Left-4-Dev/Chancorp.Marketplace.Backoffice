import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/guards/role.guard';
import { FormsModule } from '@angular/forms';
import { CategoriesComponent } from './categories.component';

const routes: Routes = [
  { path: '', component: CategoriesComponent, canActivate: [RoleGuard], data: { role: 'admin' } }
];

@NgModule({
  declarations: [
    CategoriesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class CategoriesModule { }
