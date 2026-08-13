import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.module').then(m => m.LoginModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) 
      },
      { 
        path: 'categories', 
        loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule) 
      },
      { 
        path: 'subcategories', 
        loadChildren: () => import('./features/subcategories/subcategories.module').then(m => m.SubcategoriesModule) 
      },
      { 
        path: 'specialities', 
        loadChildren: () => import('./features/specialities/specialities.module').then(m => m.SpecialitiesModule) 
      },
      { 
        path: 'products', 
        loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule) 
      },
      { 
        path: 'providers', 
        loadChildren: () => import('./features/providers/providers.module').then(m => m.ProvidersModule) 
      },
      { 
        path: 'orders', 
        loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule) 
      },
      { 
        path: 'pending-reviews', 
        loadChildren: () => import('./features/pending-reviews/pending-reviews.module').then(m => m.PendingReviewsModule) 
      },
      { 
        path: 'reviews', 
        loadChildren: () => import('./features/reviews/reviews.module').then(m => m.ReviewsModule) 
      },
      // Rutas de proveedor
      { 
        path: 'provider/products', 
        loadChildren: () => import('./features/provider-products/provider-products.module').then(m => m.ProviderProductsModule) 
      },
      { 
        path: 'provider/orders', 
        loadChildren: () => import('./features/provider-orders/provider-orders.module').then(m => m.ProviderOrdersModule) 
      },
      { 
        path: 'provider/search-orders', 
        loadChildren: () => import('./features/provider-search-orders/provider-search-orders.module').then(m => m.ProviderSearchOrdersModule) 
      },
      { 
        path: 'provider/pending-reviews', 
        loadChildren: () => import('./features/provider-pending-reviews/provider-pending-reviews.module').then(m => m.ProviderPendingReviewsModule) 
      },
      { 
        path: 'provider/reviews', 
        loadChildren: () => import('./features/provider-reviews/provider-reviews.module').then(m => m.ProviderReviewsModule) 
      },
      { 
        path: 'provider/settings/profile', 
        loadChildren: () => import('./features/provider-profile/provider-profile.module').then(m => m.ProviderProfileModule) 
      },
      { 
        path: 'provider/dashboard', 
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), 
        pathMatch: 'full' 
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
