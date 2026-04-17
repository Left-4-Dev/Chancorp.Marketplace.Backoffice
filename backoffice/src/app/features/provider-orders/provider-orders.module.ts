import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProviderOrdersComponent } from './provider-orders.component';

const routes: Routes = [
  { path: '', component: ProviderOrdersComponent }
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
