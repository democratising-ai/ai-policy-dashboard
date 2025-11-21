// services/row-info-card.service.ts
import { Injectable, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { InfoCardComponent } from './info-card.component';

@Injectable({
  providedIn: 'root'
})
export class RowInfoCardService {
  private overlay = inject(Overlay);
  private currentOverlayRef: OverlayRef | null = null;

  showCard(event: MouseEvent, rowData: any) {
    this.hideCard();

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo({
        x: event.clientX,
        y: event.clientY
      })
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 10
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          offsetY: 10
        }
      ]);

    this.currentOverlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.close(),
      panelClass: 'info-card-overlay'
    });

    const portal = new ComponentPortal(InfoCardComponent);
    const componentRef = this.currentOverlayRef.attach(portal);
    componentRef.instance.data = rowData.values || rowData;
  }

  hideCard() {
    if (this.currentOverlayRef) {
      this.currentOverlayRef.dispose();
      this.currentOverlayRef = null;
    }
  }
}
