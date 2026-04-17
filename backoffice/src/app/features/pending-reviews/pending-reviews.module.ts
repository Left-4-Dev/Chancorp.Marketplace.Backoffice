import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PendingReviewsComponent } from './pending-reviews.component';

const routes: Routes = [
  { path: '', component: PendingReviewsComponent }
];

@NgModule({
  declarations: [
    PendingReviewsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class PendingReviewsModule { }
