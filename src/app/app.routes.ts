import { Routes } from '@angular/router';
import { IndexVisitas } from './pages/visitas/index-visitas/index-visitas';
import { ListadoVisitas } from './pages/visitas/listado-visitas/listado-visitas';
import { BuscarXPaciente } from './pages/visitas/buscar-xpaciente/buscar-xpaciente';
import { BuscarXVisita } from './pages/visitas/buscar-xvisita/buscar-xvisita';
import { Modulos } from './pages/modulos/modulos';
import { Login } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'modulos', component: Modulos, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: '', redirectTo: 'modulos', pathMatch: 'full' },
  {
    path: 'visitas',
    component: IndexVisitas,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ListadoVisitas },
      { path: 'buscar-xpaciente', component: BuscarXPaciente },
      { path: 'buscar-xvisita', component: BuscarXVisita }
    ]
  },
  { path: '**', redirectTo: 'modulos', pathMatch: 'full' }
];
