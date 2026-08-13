import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProviderProfileComponent } from './provider-profile.component';

const routes: Routes = [
  { path: '', component: ProviderProfileComponent }
];

@NgModule({
  declarations: [ProviderProfileComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class ProviderProfileModule { }
