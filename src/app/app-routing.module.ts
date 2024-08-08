import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ApiIntegrationComponent } from './api-integration/api-integration.component';


const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'add-scenario', component: ApiIntegrationComponent },
  { path: 'dashboard', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
