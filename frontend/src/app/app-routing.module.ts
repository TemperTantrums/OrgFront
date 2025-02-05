import { DbSettingComponent } from './dbsetting/dbsetting.component';
import { OrganizationComponent } from './organization/organization.component';
import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BiometricComponent } from './biometric/biometric.component';
import { DtrComponent } from './dtr/dtr.component';

const routes: Routes = [
  { path: '', component: DbSettingComponent, pathMatch: 'full' },
  { path: 'org', component: OrganizationComponent, pathMatch: 'full' },
  { path: 'biometric', component: BiometricComponent, pathMatch: 'full' },
  { path: 'dtr', component: DtrComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
