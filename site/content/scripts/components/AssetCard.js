export default class AssetCard {
    constructor(el) {
        if (!el) return;

        this.el = el;

        this.clickHandler = this.clickHandler.bind(this);
        this.keypressHandler = this.keypressHandler.bind(this);

        this.el.addEventListener("click", this.clickHandler);
        this.el.addEventListener("keypress", this.keypressHandler);
    }

    get checkbox() {
        return this.el.querySelector(".spectrum-Checkbox-input");
    }

    set isSelected(state) {
        this.el.classList.toggle("is-selected", state);
    }

    get isSelected() {
        return this.el.classList.contains("is-selected");
    }

    clickHandler(event) {
        if (this.isDisabled) return;

        if (this.checkbox) this.checkbox.checked = !this.isSelected;
        this.isSelected = !this.isSelected;
        event.preventDefault();
    }

    keypressHandler(event) {
        if (this.isDisabled) return;
        if (event.key !== "Enter" && event.key !== " ") return;

        if (this.checkbox) this.checkbox.checked = !this.isSelected;
        this.isSelected = !this.isSelected;
        event.preventDefault();
    }
}
