import type { GameSnapshot } from "../game/types";

export class UIManager {
  private readonly levelName: HTMLElement;
  private readonly activeOrder: HTMLElement;
  private readonly scoreValue: HTMLElement;
  private readonly statusMessage: HTMLElement;

  constructor(documentRef: Document) {
    this.levelName = this.requireElement(documentRef, "#level-name");
    this.activeOrder = this.requireElement(documentRef, "#active-order");
    this.scoreValue = this.requireElement(documentRef, "#score-value");
    this.statusMessage = this.requireElement(documentRef, "#status-message");
  }

  update(snapshot: GameSnapshot): void {
    const order = snapshot.orders[0];

    this.levelName.textContent = snapshot.levelName;
    this.activeOrder.textContent = order
      ? `${order.recipeName} - ${Math.ceil(order.remainingSeconds)}s`
      : "Service complete";
    this.scoreValue.textContent = String(snapshot.score);
    this.statusMessage.textContent = snapshot.statusMessage;
  }

  private requireElement(documentRef: Document, selector: string): HTMLElement {
    const element = documentRef.querySelector<HTMLElement>(selector);

    if (!element) {
      throw new Error(`Missing HUD element: ${selector}`);
    }

    return element;
  }
}
