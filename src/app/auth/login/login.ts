import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000;
const LOCKOUT_STORAGE_KEY = 'hpmm_login_lockout';

// Configuración de validación de contraseña
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_REQUIRE_LETTERS_AND_NUMBERS = true;
const PASSWORD_WEAK_WARNING = 'Advertencia: La contraseña debe tener mínimo 6 caracteres y contener letras y números. El acceso será permitido pero se recomienda usar una contraseña segura.';

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const password = String(control.value);
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isLengthValid = password.length >= PASSWORD_MIN_LENGTH;

  if (PASSWORD_REQUIRE_LETTERS_AND_NUMBERS && (!hasLetters || !hasNumbers || !isLengthValid)) {
    return { weakPassword: true };
  }

  return null;
}

function isPasswordWeak(password: string): boolean {
  if (!password) {
    return false;
  }

  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isLengthValid = password.length >= PASSWORD_MIN_LENGTH;

  return PASSWORD_REQUIRE_LETTERS_AND_NUMBERS && (!hasLetters || !hasNumbers || !isLengthValid);
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  failedAttempts = 0;
  lockoutUntil: number | null = null;
  lockoutRemainingText = '';
  private lockoutTimer: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(0)]],
      password: ['', [Validators.required]]
    });

    this.restoreLockoutState();
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    console.log('Login onSubmit', {
      username: this.f['username'].value,
      password: this.f['password'].value,
      formValid: this.loginForm.valid
    });

    if (this.isLoginLocked()) {
      this.error = this.getLockoutMessage();
      return;
    }

    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      console.log('Login form invalid', this.loginForm.errors, this.loginForm.controls);
      return;
    }

    // Check for weak password but allow login
    const passwordValue = this.f['password'].value;
    if (isPasswordWeak(passwordValue)) {
      this.error = PASSWORD_WEAK_WARNING;
      console.warn('Weak password warning:', PASSWORD_WEAK_WARNING);
    }

    this.loading = true;
    this.authService.login(this.f['username'].value, passwordValue).subscribe({
      next: (response) => {
        console.log('Login successful response', response);
        this.loading = false;
        this.failedAttempts = 0;
        this.clearLockoutState();
        this.router.navigate(['/modulos']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.loading = false;
        this.handleFailedLoginAttempt(error);
        this.loginForm.markAsUntouched();
        this.loginForm.markAsPristine();
      }
    });
  }

  isLoginLocked(): boolean {
    if (!this.lockoutUntil) {
      return false;
    }

    if (this.lockoutUntil <= Date.now()) {
      this.clearLockoutState();
      return false;
    }

    return true;
  }

  private handleFailedLoginAttempt(error: any): void {
    this.failedAttempts += 1;

    if (this.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      this.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      this.saveLockoutState();
      this.loginForm.disable();
      this.error = this.getLockoutMessage();
      this.startLockoutTimer();
      return;
    }

    const remainingAttempts = MAX_LOGIN_ATTEMPTS - this.failedAttempts;
    this.error = `${this.getErrorMessage(error)} Te quedan ${remainingAttempts} intento(s).`;
  }

  private getErrorMessage(error: any): string {
    const backendMessage = error?.error?.message || error?.error?.error || error?.message;
    if (backendMessage) {
      return String(backendMessage);
    }

    if (error?.status === 401) {
      return 'Usuario o contraseña incorrectos.';
    }

    return 'No se pudo iniciar sesión. Intente nuevamente.';
  }

  private getLockoutMessage(): string {
    if (!this.lockoutUntil) {
      return 'El acceso fue bloqueado por demasiados intentos.';
    }

    const remainingSeconds = Math.max(0, Math.ceil((this.lockoutUntil - Date.now()) / 1000));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    if (minutes > 0) {
      this.lockoutRemainingText = `${minutes}m ${seconds}s`;
    } else {
      this.lockoutRemainingText = `${seconds}s`;
    }

    return `Demasiados intentos. Intente nuevamente en ${this.lockoutRemainingText}.`;
  }

  private restoreLockoutState(): void {
    const storedState = localStorage.getItem(LOCKOUT_STORAGE_KEY);
    if (!storedState) {
      return;
    }

    try {
      const parsed = JSON.parse(storedState);
      if (parsed?.lockoutUntil && parsed.lockoutUntil > Date.now()) {
        this.failedAttempts = parsed.failedAttempts || MAX_LOGIN_ATTEMPTS;
        this.lockoutUntil = parsed.lockoutUntil;
        this.loginForm.disable();
        this.error = this.getLockoutMessage();
        this.startLockoutTimer();
      } else {
        this.clearLockoutState();
      }
    } catch {
      this.clearLockoutState();
    }
  }

  private saveLockoutState(): void {
    localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({
      failedAttempts: this.failedAttempts,
      lockoutUntil: this.lockoutUntil
    }));
  }

  private clearLockoutState(): void {
    localStorage.removeItem(LOCKOUT_STORAGE_KEY);
    this.failedAttempts = 0;
    this.lockoutUntil = null;
    this.lockoutRemainingText = '';
    if (this.loginForm) {
      this.loginForm.enable();
    }
  }

  private startLockoutTimer(): void {
    if (this.lockoutTimer) {
      clearInterval(this.lockoutTimer);
    }

    this.lockoutTimer = setInterval(() => {
      if (!this.isLoginLocked()) {
        clearInterval(this.lockoutTimer);
        this.lockoutTimer = null;
        this.error = '';
        return;
      }

      this.error = this.getLockoutMessage();
    }, 1000);
  }
}
