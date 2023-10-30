export default class Stepper {
    constructor(el) {
        if (!el) return;
        this.el = el;

        this.focusinHandler = this.focusinHandler.bind(this);
        this.focusoutHandler = this.focusoutHandler.bind(this);

        this.el.addEventListener("focusin", this.focusinHandler);
        this.el.addEventListener("focusout", this.focusoutHandler);
    }

    set isSelected(state) {
        this.el.classList.toggle("is-selected", state);
    }

    get isSelected() {
        return this.el.classList.contains("is-selected");
    }

    set focus(state) {
        if (this.el.classList.contains("focus-ring") || !state) {
            this.el.classList?.toggle("is-keyboardFocused", state);
        } else if (!this.el.classList.contains("focus-ring") || !state) {
            this.el.classList?.toggle("is-focused", state);
        }
    }

    get focus() {
        return (
            this.el.classList.contains("focus-ring") ||
            this.el.classList.contains("is-keyboardFocused") ||
            this.el.classList.contains("is-focused")
        );
    }
}
