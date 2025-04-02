import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentBase } from '../../ComponentBase';

@Component({
	selector: 'app-micro-frontend-panel',
	templateUrl: './micro-frontend-panel.component.html',
	styleUrls: ['./micro-frontend-panel.component.less'],
	standalone: true,
	imports: [CommonModule]
})
export class MicroFrontendPanelComponent extends ComponentBase implements OnInit, OnDestroy {
	/** Whether the panel is visible */
	private isVisible: boolean = false;

	constructor(ele: ElementRef) {
		super(ele);
	}

	ngOnInit(): void {
		// Initialization logic
		console.log('[Micro-Frontend] Panel initialized');
	}

	ngOnDestroy(): void {
		// Clean up subscriptions
		this.cleanup();
	}

	/**
	 * Shows the panel
	 */
	public show(): void {
		this.isVisible = true;
		console.log('[Micro-Frontend] Panel shown');
		
		// Add any animation or visibility logic here
		if (this.ele?.nativeElement) {
			this.ele.nativeElement.style.display = 'block';
			
			// Optional: Add a small delay before adding the 'visible' class for animation
			setTimeout(() => {
				if (this.ele?.nativeElement) {
					this.ele.nativeElement.classList.add('visible');
				}
			}, 10);
		}
	}

	/**
	 * Hides the panel
	 */
	public hide(): void {
		this.isVisible = false;
		console.log('[Micro-Frontend] Panel hidden');
		
		// Add any animation or visibility logic here
		if (this.ele?.nativeElement) {
			this.ele.nativeElement.classList.remove('visible');
			
			// Optional: Add a small delay before hiding the element for animation
			setTimeout(() => {
				if (this.ele?.nativeElement) {
					this.ele.nativeElement.style.display = 'none';
				}
			}, 300); // Match this with CSS transition duration
		}
	}

	/**
	 * Toggles the panel visibility
	 */
	public toggle(): void {
		if (this.isVisible) {
			this.hide();
		} else {
			this.show();
		}
	}
}