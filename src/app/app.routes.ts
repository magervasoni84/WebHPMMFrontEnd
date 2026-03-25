import { Routes } from '@angular/router';
import { IndexVisitas } from './pages/visitas/index-visitas/index-visitas';
import { ListadoVisitas } from './pages/visitas/listado-visitas/listado-visitas';
import { BuscarXPaciente } from './pages/visitas/buscar-xpaciente/buscar-xpaciente';
import { BuscarXVisita } from './pages/visitas/buscar-xvisita/buscar-xvisita';

export const routes: Routes = [
  { path: '', redirectTo: 'visitas', pathMatch: 'full' },
  {
    path: 'visitas',
    component: IndexVisitas,
    children: [
      { path: '', component: ListadoVisitas },
      { path: 'buscar-xpaciente', component: BuscarXPaciente },
      { path: 'buscar-xvisita', component: BuscarXVisita }
    ]
  },
  { path: '**', redirectTo: 'visitas', pathMatch: 'full' }
];
