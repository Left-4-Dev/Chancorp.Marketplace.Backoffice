import { Component } from '@angular/core';
import { RoleService } from '../core/services/role.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: false
})
export class LayoutComponent {
  constructor(public roleService: RoleService) {}
}
