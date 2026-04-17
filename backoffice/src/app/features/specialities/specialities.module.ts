import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SpecialitiesComponent } from './specialities.component';

const routes: Routes = [
  { path: '', component: SpecialitiesComponent }
];

@NgModule({
  declarations: [
    SpecialitiesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SpecialitiesModule { }
