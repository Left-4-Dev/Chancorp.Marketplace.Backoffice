import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProviderSearchOrdersComponent } from './provider-search-orders.component';

const routes: Routes = [
  { path: '', component: ProviderSearchOrdersComponent }
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
