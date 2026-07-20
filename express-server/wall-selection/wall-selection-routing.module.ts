import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WallSelectionComponent } from './wall-selection.component';

const routes: Routes = [{ path: '', component: WallSelectionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WallSelectionRoutingModule { }
