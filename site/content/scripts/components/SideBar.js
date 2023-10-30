import { LitElement } from "lit";

export default class SideBar extends LitElement {
    // This allows us to use web component syntax without the shadow dom
    // we want this to act like a regular HTML element with external styles
    createRenderRoot() {
        return this;
    }

    breakpoint = "(max-width: 960px)";

    get overlay() {
        return document.querySelector("#site-overlay");
    }

    get search() {
        return this.querySelector("site-search");
    }

    constructor() {
        super();

        this.classList.add("site-Main-sidebar");

        this.clickHandler = this.clickHandler.bind(this);

        this.addEventListener("click", this.clickHandler);

        if (this.breakpoint) {
            window.matchMedia(this.breakpoint).addEventListener("change", () => {
                if (!window.matchMedia(this.breakpoint).matches) this.hide();
            });
        }
    }

    get isOpen() {
        return this.classList.contains("is-open");
    }

    set isOpen(state) {
        this.classList.toggle("is-open", state);
    }

    get matchesBreakpoint() {
        if (!this.breakpoint) return true;
        return Boolean(window.matchMedia(this.breakpoint).matches);
    }

    show() {
        if (!this.matchesBreakpoint) return;

        if (this.overlay) {
            this.overlay.addEventListener("click", this.hide);
            this.overlay.classList?.add("is-open");
        }

        this.isOpen = true;
    }

    hide() {
        if (this.overlay) {
            this.overlay.removeEventListener("click", this.hide);
            this.overlay.classList?.remove("is-open");
        }

        this.isOpen = false;
        if (this.search) {
            this.search.hideResults();
        }
    }

    clickHandler() {
        if (this.isOpen) this.hide();
        else this.show();
    }
}

if (!customElements.get("site-sidebar")) {
    customElements.define("site-sidebar", SideBar);
}
