import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core'; // 1. Importa LOCALE_ID
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './interceptors/auth.interceptor';

// 2. Importa la configuración de idioma español
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

// 3. Registra los datos del locale
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // 4. Añade el proveedor de idioma
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ]
};