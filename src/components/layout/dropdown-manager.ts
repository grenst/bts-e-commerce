type DropdownReference = {
  menu: HTMLElement;
  hide: () => void;
};

class DropdownManager {
  private static currentDropdown: DropdownReference | undefined = undefined;

  static register(menu: HTMLElement, hideCallback: () => void): void {
    this.currentDropdown = { menu, hide: hideCallback };
  }

  static closeCurrent(): void {
    if (this.currentDropdown) {
      this.currentDropdown.hide();
      this.currentDropdown = undefined;
    }
  }

  static isOpen(menu: HTMLElement): boolean {
    return this.currentDropdown?.menu === menu;
  }
}

export { DropdownManager };
