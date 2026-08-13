import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RoleService, UserRole } from '../../../core/services/role.service';
import { ClerkService } from '../../../core/services/clerk.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  active?: boolean;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  expandedMenu: string | null = null;

  menuItems: MenuItem[] = [];
  currentRole: UserRole = 'admin';
  displayName = '';
  roleName = 'Admin';
  userEmail = '';

  private sessionSub!: Subscription;

  private adminMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    {
      label: 'Categorías',
      icon: 'category',
      children: [
        { label: 'Categorías', icon: 'category', route: '/categories' },
        { label: 'Subcategorías', icon: 'account_tree', route: '/subcategories' },
        { label: 'Especialidades', icon: 'label_important', route: '/specialities' }
      ]
    },
    { label: 'Productos', icon: 'inventory_2', route: '/products' },
    { label: 'Proveedores', icon: 'local_shipping', route: '/providers' },
    { label: 'Órdenes', icon: 'receipt_long', route: '/orders' },
    {
      label: 'Reviews',
      icon: 'rate_review',
      children: [
        { label: 'Pendiente de Aprobación', icon: 'pending_actions', route: '/pending-reviews' },
        { label: 'Comentarios', icon: 'forum', route: '/reviews' }
      ]
    }
  ];

  private providerMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/provider/dashboard' },
    { label: 'Mis Productos', icon: 'inventory_2', route: '/provider/products' },
    {
      label: 'Órdenes',
      icon: 'receipt_long',
      children: [
        { label: 'Crear Orden', icon: 'add_circle', route: '/provider/orders' },
        { label: 'Buscar Orden', icon: 'search', route: '/provider/search-orders' }
      ]
    },
    {
      label: 'Reviews',
      icon: 'rate_review',
      children: [
        // { label: 'Pendiente de Aprobación', icon: 'pending_actions', route: '/provider/pending-reviews' },
        { label: 'Comentarios', icon: 'forum', route: '/provider/reviews' }
      ]
    },
    {
      label: 'Ajustes',
      icon: 'settings',
      children: [
        { label: 'Mi Perfil', icon: 'person', route: '/provider/settings/profile' }
      ]
    }
  ];

  constructor(
    private router: Router,
    public roleService: RoleService,
    private clerkService: ClerkService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sessionSub = this.roleService.session$.subscribe(session => {
      this.currentRole = session.role;
      this.displayName = session.displayName;
      this.userEmail = session.email;
      this.roleName = session.role === 'admin' ? 'Administrador' : 'Proveedor';
      this.menuItems = session.role === 'admin' ? this.adminMenu : this.providerMenu;
      this.expandedMenu = null;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.sessionSub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.expandedMenu = null;
    }
  }

  isActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  isGroupActive(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => child.route && this.router.url === child.route);
  }

  navigateTo(route?: string): void {
    if (!route) return;
    this.router.navigate([route]);
  }

  toggleMenu(label: string): void {
    this.expandedMenu = this.expandedMenu === label ? null : label;
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenu === label;
  }

  async logout(): Promise<void> {
    this.roleService.clearSession();
    await this.clerkService.signOut();
    this.router.navigate(['/login']);
  }
}
