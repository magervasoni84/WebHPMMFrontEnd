export class UsuarioModel {
  operario?: number;
  nombre?: string;
  profesional?: string;
  observacion?: string[];
  email?: string;
  username?: string;
  [key: string]: any;

  constructor(data?: Partial<UsuarioModel>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
