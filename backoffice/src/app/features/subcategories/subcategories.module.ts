import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubcategoriesComponent } from './subcategories.component';

const routes: Routes = [
  { path: '', component: SubcategoriesComponent }
];

@NgModule({
  declarations: [
    SubcategoriesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SubcategoriesModule { }
