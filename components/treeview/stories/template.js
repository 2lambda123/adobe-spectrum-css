import { html } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";

import { Template as Icon } from "@spectrum-css/icon/stories/template.js";
import { Template as Thumbnail } from "@spectrum-css/thumbnail/stories/template.js";

import "@spectrum-css/treeview";

export const Template = ({
    rootClass = "spectrum-TreeView",
    customClasses = [],
    size = "m",
    variant,
    isQuiet,
    items,
}) => {
    return html`
        <ul
            class=${classMap({
                [rootClass]: true,
                [`${rootClass}--size${size?.toUpperCase()}`]: typeof size !== "undefined",
                [`${rootClass}--${variant}`]: typeof variant !== "undefined",
                [`${rootClass}--quiet`]: isQuiet,
                ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
            })}
        >
            ${repeat(
                items,
                (item) => item.id,
                (item) => TreeViewItem(item),
            )}
        </ul>
    `;
};

export const TreeViewItem = ({
    rootClass = "spectrum-TreeView",
    size = "m",
    type,
    id,
    link,
    label,
    isSelected,
    isDisabled,
    isOpen,
    isDropTarget,
    icon,
    thumbnail,
    items,
    customClasses = [],
}) =>
    when(
        type === "heading",
        () =>
            html` <div class="${rootClass}-heading">
                <span class="${rootClass}-itemLabel">${label}</span>
            </div>`,
        () =>
            html` <li
                id=${id}
                class=${classMap({
                    [`${rootClass}-item`]: true,
                    "is-selected": isSelected,
                    "is-disabled": isDisabled,
                    "is-open": isOpen,
                    "is-drop-target": isDropTarget,
                    ...customClasses.reduce((a, c) => ({ ...a, [c]: true }), {}),
                })}
            >
                <a
                    href=${link}
                    target="_self"
                    class="${rootClass}-itemLink"
                    @click=${onclick ??
                    function (evt) {
                        if (isDisabled || !evt || !evt.target || typeof items === "undefined") return;
                        evt.preventDefault();
                        const closest = evt.target.closest(`.${rootClass}-item`);
                        if (!closest) return;
                        closest.classList.toggle("is-open");
                    }}
                >
                    ${when(typeof items !== "undefined", () =>
                        Icon({ size, iconName: "Chevron", customClasses: [`${rootClass}-itemIndicator`] }),
                    )}
                    ${when(icon, () => Icon({ size, iconName: icon, customClasses: [`${rootClass}-itemIcon`] }))}
                    ${when(thumbnail, () =>
                        Thumbnail({ ...thumbnail, size: "300", customClasses: [`${rootClass}-itemThumbnail`] }),
                    )}
                    <span class="${rootClass}-itemLabel">${label}</span>
                </a>
                ${when(typeof items !== "undefined", () =>
                    Template({ items, size, rootClass: "spectrum-TreeView", customClasses: ["is-opened"] }),
                )}
            </li>`,
    );
