import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { InfoCardComponent } from './info-card.component';

@Injectable({
  providedIn: 'root'
})
export class RowInfoCardService {
  private overlay = inject(Overlay);
  private currentOverlayRef: OverlayRef | null = null;
  private backdropSub: Subscription | null = null;

  showCard(rowData: any) {
    this.hideCard();

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.currentOverlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'info-card-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.block(),
      panelClass: 'info-card-overlay'
    });

    const portal = new ComponentPortal(InfoCardComponent);
    const componentRef = this.currentOverlayRef.attach(portal);
    componentRef.instance.data = rowData.values || rowData;

    this.backdropSub = this.currentOverlayRef.backdropClick().subscribe(() => this.hideCard());
  }

  hideCard() {
    this.backdropSub?.unsubscribe();
    this.backdropSub = null;
    if (this.currentOverlayRef) {
      this.currentOverlayRef.dispose();
      this.currentOverlayRef = null;
    }
  }
}
