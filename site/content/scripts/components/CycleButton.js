export default class CycleButton {
    constructor(el) {
        if (!el) return;

        this.el = el;

        this.clickHandler = this.clickHandler.bind(this);

        this.el.addEventListener("click", this.clickHandler);
    }

    get icons() {
        return [...this.el.querySelectorAll(".spectrum-Icon")];
    }

    get selectedIcon() {
        return this.icons.find((icon) => icon.classList.contains("is-selected"));
    }

    clickHandler(event) {
        if (!this.el || !this.selectedIcon) return;

        const selectedIndex = this.icons.indexOf(this.selectedIcon);
        this.selectedIcon.classList.toggle("is-selected", false);

        const newIndex = selectedIndex + 1 < this.icons.length ? selectedIndex + 1 : 0;
        this.icons[newIndex].classList.toggle("is-selected", true);

        event.preventDefault();
    }
}
