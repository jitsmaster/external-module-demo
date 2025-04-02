import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentBase } from '../../ComponentBase';

@Component({
	selector: 'app-topbar-button',
	templateUrl: './topbar-button.component.html',
	styleUrls: ['./topbar-button.component.less'],
	standalone: true,
	imports: [CommonModule],
    host: {
		'class': 'TopButton ctnp-topbar-button',
		'title': 'Micro-Frontend',
		'matRipple': '',
		'(click)': 'invoke()'
	}
})
export class TopbarButtonComponent extends ComponentBase implements OnInit, OnDestroy {
	/** Whether the button is currently active */
	public isCurrent: boolean = false;
	
	/** Reference to the main panel component */
	public panelComponent: any;
	
	/** The parent application instance */
	public app: any;
	
	constructor(ele: ElementRef) {
		super(ele);
	}
	
	ngOnInit(): void {
		// Initialize the button state
		this.uncurrent();
	}
	
	ngOnDestroy(): void {
		// Clean up subscriptions
		this.cleanup();
	}
	
	/**
	 * Sets this button as current/active
	 */
	public current(): void {
		this.isCurrent = true;
	}
	
	/**
	 * Sets this button as uncurrent/inactive and hides the panel
	 */
	public uncurrent(): void {
		this.isCurrent = false;
		
		// If panel component exists and has a parent element, hide it
		if (this.panelComponent?.nativeElement?.parentElement) {
			document.body.appendChild(this.panelComponent.nativeElement);
		}
	}
	
	/**
	 * Handler for button click
	 * Shows the micro frontend panel
	 */
	public invoke(): void {
		console.log('Micro Frontend button clicked');
		
		// Get reference to the top window
		const topWindow = window.top as any;
		if (!topWindow) return;
		
		// Get NgRef from top window
		const ngref = topWindow.NG_REF as any;
		if (!ngref || !ngref.app) {
			console.error('[Micro-Frontend] - NG_REF not found in top window');
			return;
		}
		
		// Get utilbar
		const utilbar = ngref.app.utilBar;
		if (utilbar) {
			// Update button states
			utilbar.navButton.routeChanged = false;
			utilbar.currentButton = null;
			
			this.current();
			
			// Set other buttons to uncurrent
			utilbar.utilButtons.forEach((b: any) => {
				b.uncurrent();
			});
			
			// Create or get the panel
			let panelRef = this.app.getMicroFrontendPanel();
			
			if (!panelRef) {
				// If the panel doesn't exist, create a temporary container and create the component
				const tempContainer = document.createElement('div');
				document.body.appendChild(tempContainer);
				panelRef = this.app.createMicroFrontendPanel(tempContainer);
			}
			
			// Find the target container in the top window
			const targetContainer = topWindow.document.querySelector('.main-content-container');
			if (!targetContainer) {
				console.error('[Micro-Frontend] - Target container not found in top window');
				return;
			}
			
			// Move the component to the target container
			const nativeElement = panelRef.location.nativeElement;
			targetContainer.appendChild(nativeElement);
			
			// Set panel reference
			this.panelComponent = panelRef;
			
			// Trigger panel toggle event if utilbar has this event
			if (utilbar.onPanelToggle) {
				utilbar.onPanelToggle.emit(this);
			}
			
			// Call show method on the component if it exists
			if (panelRef.instance && typeof panelRef.instance.show === 'function') {
				panelRef.instance.show();
			}
		}
	}
}