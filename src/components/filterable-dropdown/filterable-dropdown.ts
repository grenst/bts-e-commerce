import { Country } from '../../data/countries';
import './filterable-dropdown.scss';

export class FilterableDropdown {
  private readonly element: HTMLDivElement;
  private readonly input: HTMLInputElement;
  private readonly dropdownList: HTMLUListElement;
  private readonly items: Country[];
  private selectedItem: Country | undefined;
  private isOpen: boolean = false;

  constructor(
    items: Country[],
    private readonly onSelect: (item: Country | undefined) => void
  ) {
    this.items = items;

    this.element = document.createElement('div');
    this.element.classList.add('filterable-dropdown');

    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = 'Select a country';
    this.input.addEventListener('input', this.handleInput.bind(this));
    this.input.addEventListener('focus', this.showDropdown.bind(this));
    this.input.addEventListener('click', this.showDropdown.bind(this)); // Show on click as well

    this.dropdownList = document.createElement('ul');
    this.dropdownList.classList.add('dropdown-list');

    this.element.append(this.input);
    this.element.append(this.dropdownList);

    document.addEventListener('click', this.handleClickOutside.bind(this));

    this.renderItems(this.items);
  }

  private handleInput(): void {
    const filterText = this.input.value.toLowerCase();
    const filteredItems = this.items.filter((item) =>
      item.displayName.toLowerCase().includes(filterText)
    );
    this.renderItems(filteredItems);
    this.showDropdown(); // Keep dropdown open while typing
  }

  private renderItems(itemsToRender: Country[]): void {
    this.dropdownList.innerHTML = '';
    if (itemsToRender.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No matches found';
      li.classList.add('no-match');
      this.dropdownList.append(li);
    } else {
      const fragment = document.createDocumentFragment();
      for (const item of itemsToRender) {
        const li = document.createElement('li');
        li.textContent = item.displayName;
        li.dataset.value = item.code;
        li.addEventListener('click', () => this.selectItem(item));
        fragment.append(li);
      }
      this.dropdownList.append(fragment);
    }
  }

  private selectItem(item: Country): void {
    this.selectedItem = item;
    this.input.value = item.displayName;
    this.hideDropdown();
    this.onSelect(this.selectedItem);
  }

  private showDropdown(): void {
    if (!this.isOpen) {
      this.dropdownList.style.display = 'block';
      this.isOpen = true;
      // Re-filter based on current input value when opening
      const filterText = this.input.value.toLowerCase();
      const filteredItems = this.items.filter((country) =>
        country.displayName.toLowerCase().includes(filterText)
      );
      this.renderItems(filteredItems);
    }
  }

  private hideDropdown(): void {
    if (this.isOpen) {
      this.dropdownList.style.display = 'none';
      this.isOpen = false;
    }
  }

  private handleClickOutside(event: MouseEvent): void {
    if (
      !(event.target instanceof Node) ||
      !this.element.contains(event.target)
    ) {
      this.hideDropdown();
    }
  }

  public getElement(): HTMLDivElement {
    return this.element;
  }

  public getSelectedValue(): string | undefined {
    return this.selectedItem?.code;
  }

  public setSelectedValue(countryCode: string | undefined): void {
    const country = this.items.find((c) => c.code === countryCode);
    if (country) {
      this.selectItem(country);
    } else {
      this.input.value = '';
      this.selectedItem = undefined;
      this.onSelect(this.selectedItem);
    }
  }
}
