import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProviderPendingReviewsComponent } from './provider-pending-reviews.component';

const routes: Routes = [
  { path: '', component: ProviderPendingReviewsComponent }
];

@NgModule({
  declarations: [
    ProviderPendingReviewsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProviderPendingReviewsModule { }
