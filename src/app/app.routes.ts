import { Routes } from '@angular/router';
import { IndexVisitas } from './pages/visitas/index-visitas/index-visitas';
import { ListadoVisitas } from './pages/visitas/listado-visitas/listado-visitas';
import { BuscarXPaciente } from './pages/visitas/buscar-xpaciente/buscar-xpaciente';
import { BuscarXVisita } from './pages/visitas/buscar-xvisita/buscar-xvisita';
import { Modulos } from './pages/modulos/modulos';
import { Login } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { Quiro } from './pages/quiro/quiro';
import { NuevaCirugia } from './pages/quiro/nueva-cirugia/nueva-cirugia';
import { Cirugia } from './pages/quiro/cirugia/cirugia';
import { NuevoNacimiento } from './pages/quiro/nuevo-nacimiento/nuevo-nacimiento';
import { Nacimiento } from './pages/quiro/nacimiento/nacimiento';
import { ParteQuirurgico } from './pages/quiro/parte-quirurgico/parte-quirurgico';
import { Endoscopia } from './pages/quiro/endoscopia/endoscopia';
import { QrTurno } from './pages/quiro/qr-turno/qr-turno';
import { QrVerHcl } from './pages/quiro/qr-ver-hcl/qr-ver-hcl';
import { Entregas } from './pages/modulos/entregas/entregas';

export const routes: Routes = [
  { path: 'entregas', component: Entregas },
  { path: 'modulos', component: Modulos, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'quiro', component: Quiro, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/nueva-cirugia', component: NuevaCirugia, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/cirugia', component: Cirugia, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/nuevo-nacimiento', component: NuevoNacimiento, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/nacimiento', component: Nacimiento, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/parte-quirurgico', component: ParteQuirurgico, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/endoscopia', component: Endoscopia, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/turnos', component: QrTurno, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: 'quiro/ver-hcl', component: QrVerHcl, canActivate: [AuthGuard], data: { requiredPermission: 'QR' } },
  { path: '', redirectTo: 'modulos', pathMatch: 'full' },
  {
    path: 'visitas',
    component: IndexVisitas,
    canActivate: [AuthGuard],
    data: { requiredPermission: 'SG' },
    children: [
      { path: '', component: ListadoVisitas },
      { path: 'buscar-xpaciente', component: BuscarXPaciente },
      { path: 'buscar-xvisita', component: BuscarXVisita }
    ]
  },
  { path: '**', redirectTo: 'entregas', pathMatch: 'full' }
];
