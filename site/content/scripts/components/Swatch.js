export default class Swatch {
    constructor(el) {
        if (!el) return;
        this.el = el;

        this.clickHandler = this.clickHandler.bind(this);
        this.keypressHandler = this.keypressHandler.bind(this);

        this.el.addEventListener("click", this.clickHandler);
        this.el.addEventListener("keypress", this.keypressHandler);
    }

    get isDisabled() {
        return this.el.classList.contains("is-disabled");
    }

    get isSelected() {
        return this.el.classList.contains("is-selected");
    }

    clickHandler(event) {
        if (this.isDisabled) return;
        this.el.classList.toggle("is-selected", !this.isSelected);
        event.preventDefault();
    }

    keypressHandler(event) {
        if (this.isDisabled) return;
        if (event.key !== "Enter" && event.key !== " ") return;

        this.el.classList.toggle("is-selected", !this.isSelected);
        event.preventDefault();
    }
}
