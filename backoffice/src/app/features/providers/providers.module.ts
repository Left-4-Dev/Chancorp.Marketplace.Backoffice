import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProvidersComponent } from './providers.component';

const routes: Routes = [
  { path: '', component: ProvidersComponent }
];

@NgModule({
  declarations: [
    ProvidersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ProvidersModule { }
