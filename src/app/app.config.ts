import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { MainComponentService } from './services/main-component.service';
import { DynamicComponentService } from './services/dynamic-component.service';

/**
 * Application configuration
 * Provides all necessary services and dependencies
 */
export const appConfig: ApplicationConfig = {
	providers: [
		// Angular core providers
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideAnimations(),
		
		// Application service providers
		MainComponentService,
		DynamicComponentService
	]
};
