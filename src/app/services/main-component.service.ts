import { ComponentRef, EventEmitter, Injectable, Type } from "@angular/core";
import { Router } from "@angular/router";
import { DynamicComponentService } from "./dynamic-component.service";
import { TopbarButtonComponent } from "../components/topbar-button/topbar-button.component";
import { UtilButtonComponent } from "../components/util-button/util-button.component";
import { MicroFrontendPanelComponent } from "../components/micro-frontend-panel/micro-frontend-panel.component";
import { MicroFrontendUtilPaneComponent } from "../components/micro-frontend-util-pane/micro-frontend-util-pane.component";
import { ComponentBase } from "../ComponentBase";
import { Subscription } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class MainComponentService extends ComponentBase {
	private topbarButtonRef?: ComponentRef<TopbarButtonComponent>;
	private utilButtonRef?: ComponentRef<UtilButtonComponent>;
	private microFrontendPanelRef?: ComponentRef<MicroFrontendPanelComponent>;
	private microFrontendUtilPaneRef?: ComponentRef<MicroFrontendUtilPaneComponent>;
	
	// Panel toggle event
	public onPanelToggle: EventEmitter<any> = new EventEmitter<any>();
	
	constructor(
		private dynamicComponentService: DynamicComponentService
	) {
		super();
	}
	
	/**
	 * Creates a topbar button
	 * @param container The container element to create the button in
	 * @returns Reference to the created component
	 */
	public createTopbarButton(container: HTMLElement): ComponentRef<TopbarButtonComponent> {
		// Create the button component
		this.topbarButtonRef = this.dynamicComponentService.createComponent(TopbarButtonComponent, container);
		
		// Set the app reference
		this.topbarButtonRef.instance.app = this;
		
		return this.topbarButtonRef;
	}

    private getAssignButton() {
		return (window.top as any).document.body.querySelector("utility-button span.fa-list")?.parentElement as HTMLElement;
	}
	
	/**
	 * Creates a util button in the toolbar
	 */
	public createUtilButton(): void {
		// Find CMS util toolbar
		const topWindow = window.top as any;
		if (!topWindow) return;
		
		
		// Find a reference button to position next to
		const assignButton = this.getAssignButton();
		if (!assignButton) {
			console.error('[Micro-Frontend] - Assign button not found');
			return;
		}
		
		// Create a container element for the button
		const anchor = document.createElement('div');
		assignButton.parentElement?.insertBefore(anchor, assignButton.nextSibling);
		
		// Create the util button component
		this.utilButtonRef = this.dynamicComponentService.createComponent(UtilButtonComponent, anchor);
		this.utilButtonRef.instance.app = this;
		
		// Check router events
		const router = (window.top as any).NG_REF?.router as Router;
		if (router) {
			// Check initial state
			if (!router.routerState.snapshot.url.includes("site/")) {
				if (this.utilButtonRef?.instance?.ele?.nativeElement) {
					this.utilButtonRef.instance.ele.nativeElement.style.display = "none";
				}
			}
			
			// Subscribe to router events
			this.observableSubTeardowns.push(router.events.subscribe(evt => {
				if (evt.constructor.name === "NavigationEnd" && !!this.utilButtonRef) {
					const inSitePane = router.routerState.snapshot.url.includes("site/");
					if (!inSitePane) {
						if (this.utilButtonRef?.instance?.ele?.nativeElement) {
							this.utilButtonRef.instance.ele.nativeElement.style.display = "none";
						}
					} else {
						if (this.utilButtonRef?.instance?.ele?.nativeElement) {
							this.utilButtonRef.instance.ele.nativeElement.style.display = "";
						}
					}
				}
			}));
		}
	}
	
	/**
	 * Creates the micro frontend panel
	 * @param container The container element to create the panel in
	 * @returns Reference to the created component
	 */
	public createMicroFrontendPanel(container: HTMLElement): ComponentRef<MicroFrontendPanelComponent> {
		// Create the panel component
		this.microFrontendPanelRef = this.dynamicComponentService.createComponent(MicroFrontendPanelComponent, container);
		return this.microFrontendPanelRef;
	}
	
	/**
	 * Creates the micro frontend util pane
	 * @param container The container element to create the pane in
	 * @returns Reference to the created component
	 */
	public createMicroFrontendUtilPane(container: HTMLElement): ComponentRef<MicroFrontendUtilPaneComponent> {
		// Create the util pane component
		this.microFrontendUtilPaneRef = this.dynamicComponentService.createComponent(MicroFrontendUtilPaneComponent, container);
		return this.microFrontendUtilPaneRef;
	}
	
	/**
	 * Gets the micro frontend panel if it exists
	 * @returns Reference to the panel component or undefined
	 */
	public getMicroFrontendPanel(): ComponentRef<MicroFrontendPanelComponent> | undefined {
		return this.microFrontendPanelRef;
	}
	
	/**
	 * Gets the micro frontend util pane if it exists
	 * @returns Reference to the util pane component or undefined
	 */
	public getMicroFrontendUtilPane(): ComponentRef<MicroFrontendUtilPaneComponent> | undefined {
		return this.microFrontendUtilPaneRef;
	}
	
	/**
	 * Hides the main component when navigation occurs
	 */
	public hideMainComponent(): void {
		// Hide the topbar button's panel if it exists
		if (this.topbarButtonRef?.instance) {
			this.topbarButtonRef.instance.uncurrent();
		}
		
		// Hide the util button's panel if it exists
		if (this.utilButtonRef?.instance) {
			this.utilButtonRef.instance.uncurrent();
		}
	}
	
	ngOnDestroy(): void {
		// Clean up components
		if (this.topbarButtonRef) {
			this.dynamicComponentService.destroyComponent(this.topbarButtonRef.instance);
		}
		
		if (this.utilButtonRef) {
			this.dynamicComponentService.destroyComponent(this.utilButtonRef.instance);
		}
		
		if (this.microFrontendPanelRef) {
			this.dynamicComponentService.destroyComponent(this.microFrontendPanelRef.instance);
		}
		
		if (this.microFrontendUtilPaneRef) {
			this.dynamicComponentService.destroyComponent(this.microFrontendUtilPaneRef.instance);
		}
		
		// Call parent cleanup
		this.cleanup();
	}
}