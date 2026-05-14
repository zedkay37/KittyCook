import type { LevelOption } from "../data/levels";

type LevelMenuOptions = {
  levels: LevelOption[];
  onStart: (level: LevelOption) => void;
};

export class LevelMenu {
  private readonly menu: HTMLElement;
  private readonly levelList: HTMLElement;
  private readonly selectedName: HTMLElement;
  private readonly selectedDescription: HTMLElement;
  private readonly startButton: HTMLButtonElement;
  private readonly changeButton: HTMLButtonElement;
  private selectedLevel: LevelOption;

  constructor(
    private readonly documentRef: Document,
    private readonly options: LevelMenuOptions,
  ) {
    this.menu = this.requireElement("#level-menu");
    this.levelList = this.requireElement("#level-list");
    this.selectedName = this.requireElement("#selected-level-name");
    this.selectedDescription = this.requireElement("#selected-level-description");
    this.startButton = this.requireButton("#start-level");
    this.changeButton = this.requireButton("#change-level");
    this.selectedLevel = options.levels[0];

    this.renderLevels();
    this.syncSelectedLevel();

    this.startButton.addEventListener("click", () => this.startSelectedLevel());
    this.changeButton.addEventListener("click", () => this.open());
  }

  open(): void {
    this.menu.classList.remove("is-hidden");
    this.documentRef.body.classList.add("is-menu-open");
  }

  close(): void {
    this.menu.classList.add("is-hidden");
    this.documentRef.body.classList.remove("is-menu-open");
  }

  getSelectedLevel(): LevelOption {
    return this.selectedLevel;
  }

  private renderLevels(): void {
    this.levelList.replaceChildren();

    for (const level of this.options.levels) {
      const button = this.documentRef.createElement("button");
      button.className = "level-card";
      button.type = "button";
      button.dataset.levelId = level.id;
      button.innerHTML = `
        <span class="level-card__mood">${level.mood}</span>
        <strong>${level.name}</strong>
        <span>${level.description}</span>
      `;
      button.addEventListener("click", () => {
        this.selectedLevel = level;
        this.syncSelectedLevel();
      });
      this.levelList.append(button);
    }
  }

  private syncSelectedLevel(): void {
    this.selectedName.textContent = this.selectedLevel.name;
    this.selectedDescription.textContent = this.selectedLevel.description;

    for (const card of this.levelList.querySelectorAll<HTMLButtonElement>(".level-card")) {
      card.classList.toggle("is-selected", card.dataset.levelId === this.selectedLevel.id);
    }
  }

  private startSelectedLevel(): void {
    this.options.onStart(this.selectedLevel);
    this.close();
  }

  private requireElement<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = this.documentRef.querySelector<T>(selector);

    if (!element) {
      throw new Error(`Élément de menu introuvable : ${selector}`);
    }

    return element;
  }

  private requireButton(selector: string): HTMLButtonElement {
    return this.requireElement<HTMLButtonElement>(selector);
  }
}
