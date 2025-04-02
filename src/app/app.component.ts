import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ComponentBase } from './ComponentBase';
import { MainComponentService } from './services/main-component.service';
import { DynamicComponentService } from './services/dynamic-component.service';

/**
 * Main application component
 *
 * This component is responsible for initializing the micro frontend components
 * and coordinating their interactions.
 */
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.less'
})
export class AppComponent extends ComponentBase implements AfterViewInit, OnDestroy {
	private _topbarRef: any;
	
	constructor(
		private mainComponentService: MainComponentService,
		private dynamicComponentService: DynamicComponentService
	) {
		super();
		
		// Get reference to the top window
		const topWindow = window.top as any;
		if (!topWindow)
			return;
		
		// Get NgRef from top window
		const ngref = topWindow.NG_REF as any;
		if (!ngref)
			return;
		
		// Subscribe to component initialization events if available
		if (ngref.componentInitialized) {
			this.observableSubTeardowns.push(
				ngref.componentInitialized.subscribe((evt: any) => {
					if (evt.component.constructor.name === "Topbar") {
						// Topbar component is initialized
						this.createTopbarButton();
					}
				})
			);
		}
		
		// Add router navigation event listener
		if (ngref.router) {
			this.observableSubTeardowns.push(
				ngref.router.events.subscribe((event: any) => {
					// Check if it's a navigation end event
					if (event.constructor.name === 'NavigationEnd') {
						// Hide main component using the specialized method
						this.mainComponentService.hideMainComponent();
					}
				})
			);
		}
	}
	
	ngAfterViewInit(): void {
		// Add a timeout delay before creating the topbar button
		this._createTopbarButtonWithDelay(); // 300ms delay
	}
	
	ngOnDestroy(): void {
		// Clean up subscriptions
		this.cleanup();
		
		// Destroy all components
		this.dynamicComponentService.destroyAllComponents();
	}
	
	private _createTopbarButtonWithDelay() {
		setTimeout(() => {
			this.createTopbarButton();
			this.mainComponentService.createUtilButton();
		}, 300);
	}
	
	private createTopbarButton(): void {
		if (!!this._topbarRef)
			return;
		
		// Find CMS top toolbar
		const topWindow = window.top as any;
		if (!topWindow) return;
		
		// Find the toolbar
		const toolbar = topWindow.document.querySelector('div.igx-toolbar');
		if (!toolbar) {
			console.error('[Micro-Frontend] - Toolbar not found');
			return;
		}
		
		// Get buttons in the toolbar
		const buttons = toolbar.querySelectorAll('.TopButton');
		if (buttons.length < 3) {
			console.error('[Micro-Frontend] - Not enough buttons in toolbar', `${buttons.length} buttons found`);
			return;
		}
		
		// Create a container element
		const container = document.createElement('div');
		
		// Insert container after the second button
		buttons[1].parentNode?.insertBefore(container, buttons[2].nextSibling);
		
		// Create TopbarButton component
		this._topbarRef = this.mainComponentService.createTopbarButton(container);
	}
}
