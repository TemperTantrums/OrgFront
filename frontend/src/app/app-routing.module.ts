import { OrganizationComponent } from './organization/organization.component';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BiometricComponent } from './biometric/biometric.component';

const routes: Routes = [
  { path: '', component: OrganizationComponent, pathMatch: 'full' },
  { path: 'biometric', component: BiometricComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
