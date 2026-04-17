import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
})
export class DashboardComponent {
  stats = [
    { title: 'Categorías', value: 12, icon: 'category', color: '#5B4B8A' },
    { title: 'Subcategorías', value: 48, icon: 'account_tree', color: '#7B68A6' },
    { title: 'Productos', value: 256, icon: 'inventory_2', color: '#87CEEB' },
    { title: 'Activos', value: 198, icon: 'check_circle', color: '#27AE60' }
  ];
}
