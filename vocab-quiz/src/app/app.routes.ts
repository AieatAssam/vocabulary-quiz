import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
    ],
  },
];
