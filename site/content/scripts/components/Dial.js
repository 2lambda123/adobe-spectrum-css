export default class Dial {
    constructor(el) {
        if (!el) return;

        this.el = el;
        this.min = -45;
        this.max = 225;

        this.onMouseDownHandler = this.onMouseDownHandler.bind(this);
        this.onMouseUpHandler = this.onMouseUpHandler.bind(this);
        this.onMouseMoveHandler = this.onMouseMoveHandler.bind(this);

        this.el.addEventListener("mousedown", this.onMouseDownHandler);
    }

    get handle() {
        return this.el.querySelector(".spectrum-Dial-handle");
    }

    get isDisabled() {
        return this.el.classList.contains("is-disabled");
    }

    onMouseDownHandler() {
        if (this.isDisabled) return;

        this.el.addEventListener("mouseup", this.onMouseUpHandler);
        this.el.addEventListener("mousemove", this.onMouseMoveHandler);

        this.el.getRootNode()?.classList?.add("u-isGrabbing");
    }

    onMouseUpHandler() {
        this.el.removeEventListener("mouseup", this.onMouseUpHandler);
        this.el.removeEventListener("mousemove", this.onMouseMoveHandler);

        this.el.getRootNode()?.classList?.remove("u-isGrabbing");
    }

    onMouseMoveHandler({ x }) {
        const dialOffsetWidth = this.el.offsetWidth;
        const dialOffsetLeft = this.el.offsetLeft + this.el.offsetParent.offsetLeft;
        const newX = Math.max(Math.min(x - dialOffsetLeft, dialOffsetWidth), 0);
        const percent = (newX / dialOffsetWidth) * 100;

        const deg = percent * 0.01 * (this.max - this.min) + this.min;
        this.handle.style.transform = "rotate(" + deg + "deg" + ")";
    }
}
