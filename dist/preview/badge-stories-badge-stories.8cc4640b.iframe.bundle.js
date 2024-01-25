/*! For license information please see badge-stories-badge-stories.8cc4640b.iframe.bundle.js.LICENSE.txt */
(globalThis.webpackChunk_spectrum_css_preview=globalThis.webpackChunk_spectrum_css_preview||[]).push([[9608,8161],{"../components/badge/stories/badge.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>badge_stories});var lit=__webpack_require__("../node_modules/lit/index.js"),class_map=__webpack_require__("../node_modules/lit/directives/class-map.js"),if_defined=__webpack_require__("../node_modules/lit/directives/if-defined.js"),style_map=__webpack_require__("../node_modules/lit/directives/style-map.js"),when=__webpack_require__("../node_modules/lit-html/directives/when.js"),template=__webpack_require__("../components/icon/stories/template.js"),injectStylesIntoLinkTag=__webpack_require__("../node_modules/style-loader/dist/runtime/injectStylesIntoLinkTag.js"),injectStylesIntoLinkTag_default=__webpack_require__.n(injectStylesIntoLinkTag),insertBySelector=__webpack_require__("../node_modules/style-loader/dist/runtime/insertBySelector.js"),insertBySelector_default=__webpack_require__.n(insertBySelector),badge=__webpack_require__("../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[13].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[13].use[2]!../components/badge/index.css"),badge_default=__webpack_require__.n(badge),options={attributes:{"data-source":"processed"}};options.insert=insertBySelector_default().bind(null,"head");injectStylesIntoLinkTag_default()(badge_default(),options);const Template=({rootClass="spectrum-Badge",size="m",label,iconName,variant="neutral",fixed,customStyles={},customClasses=[],id,...globals})=>lit.dy`
		<div
			class=${(0,class_map.$)({[rootClass]:!0,[`${rootClass}--size${size?.toUpperCase()}`]:void 0!==size,[`${rootClass}--${variant}`]:void 0!==variant,[`${rootClass}--${fixed}`]:void 0!==fixed,...customClasses.reduce(((a,c)=>({...a,[c]:!0})),{})})}
			id=${(0,if_defined.o)(id)}
			style=${(0,if_defined.o)((0,style_map.V)(customStyles))}
		>
			${(0,when.g)(iconName,(()=>(0,template.Y)({...globals,iconName,customClasses:[...void 0===label?[`${rootClass}-icon--no-label`]:[],`${rootClass}-icon`]})))}
			${(0,when.g)(label,(()=>lit.dy`<div class="${rootClass}-label">${label}</div>`))}
		</div>
	`;var icon_stories=__webpack_require__("../components/icon/stories/icon.stories.js");const badge_stories={title:"Components/Badge",description:"A badge element displays a small amount of color-categorized metadata; ideal for getting a user's attention.",component:"Badge",argTypes:{size:{name:"Size",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Component"},options:["s","m","l","xl"],control:"select"},label:{name:"Label",type:{name:"string"},table:{type:{summary:"string"},category:"Content"},control:"text"},iconName:{...icon_stories.default?.argTypes?.iconName??{},if:!1},variant:{name:"Background color variants",type:{name:"string"},table:{type:{summary:"string"},category:"Component"},options:["neutral","accent","informative","positive","negative","gray","red","orange","yellow","chartreuse","celery","green","seafoam","cyan","blue","indigo","purple","fuchsia","magenta"],control:"select"},fixed:{name:"Fixed layout",type:{name:"string"},table:{type:{summary:"string"},category:"Advanced"},options:["none","fixed-inline-start","fixed-inline-end","fixed-block-start","fixed-block-end"],control:"select"}},args:{rootClass:"spectrum-Badge",size:"m",variant:"neutral",iconName:"Info",label:"Badge",fixed:"none"},parameters:{actions:{handles:[]},status:{type:[].includes("badge")?"migrated":void 0}}},Default=(({customStyles={},...args})=>lit.dy`
        <div style="padding: 1rem">
            ${Template({...args,iconName:void 0})}
            ${Template({...args})}
            ${Template({...args,label:void 0})}
            ${Template({...args,label:"24 days left in trial",customStyles:{"max-inline-size":"100px"}})}
        </div>
    `).bind({});Default.args={},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'({\n  customStyles = {},\n  ...args\n}) => {\n  return html`\n        <div style="padding: 1rem">\n            ${Template({\n    ...args,\n    iconName: undefined\n  })}\n            ${Template({\n    ...args\n  })}\n            ${Template({\n    ...args,\n    label: undefined\n  })}\n            ${Template({\n    ...args,\n    label: "24 days left in trial",\n    customStyles: {\n      "max-inline-size": "100px"\n    }\n  })}\n        </div>\n    `;\n}',...Default.parameters?.docs?.source}}};const __namedExportsOrder=["Default"]},"../components/icon/stories/icon.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _template__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../components/icon/stories/template.js"),_utilities_js__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../components/icon/stories/utilities.js");const __WEBPACK_DEFAULT_EXPORT__={title:"Components/Icon",description:"The icons component contains all UI icons used for components as well as the CSS for UI and workflow icons.",component:"Icon",argTypes:{express:{table:{disable:!0}},reducedMotion:{table:{disable:!0}},size:{name:"Size",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Component"},options:["s","m","l","xl","xxl"],control:"select"},setName:{name:"Icon set",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Content"},options:["ui","workflow"],control:"inline-radio"},iconName:{name:"Workflow icons",type:{name:"string"},table:{type:{summary:"string"},category:"Content"},options:_utilities_js__WEBPACK_IMPORTED_MODULE_1__.aX,control:"select",if:{arg:"setName",eq:"workflow"}},uiIconName:{name:"UI icons",type:{name:"string"},table:{type:{summary:"string"},category:"Content"},options:[..._utilities_js__WEBPACK_IMPORTED_MODULE_1__.qy.filter((c=>!["Chevron","Arrow"].includes(c))),"ArrowRight","ArrowLeft","ArrowUp","ArrowDown","ChevronRight","ChevronLeft","ChevronUp","ChevronDown"],control:"select",if:{arg:"setName",eq:"ui"}},fill:{name:"Fill color",type:{name:"string"},table:{type:{summary:"string"},category:"Advanced"},control:"color"},useRef:{table:{disable:!0}}},args:{rootClass:"spectrum-Icon",setName:"workflow",iconName:"ABC",size:"xl"},parameters:{status:{type:[].includes("icon")?"migrated":void 0}}},Default=args=>(0,_template__WEBPACK_IMPORTED_MODULE_0__.Y)({...args,iconName:args.iconName??args.uiIconName,setName:args.setName??(args.uiIconName?"ui":"workflow")});Default.args={},Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:'args => Template({\n  ...args,\n  iconName: args.iconName ?? args.uiIconName,\n  setName: args.setName ?? (args.uiIconName ? "ui" : "workflow")\n})',...Default.parameters?.docs?.source}}};const __namedExportsOrder=["Default"]},"../node_modules/lit-html/directives/when.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";function n(n,r,t){return n?r(n):null==t?void 0:t(n)}__webpack_require__.d(__webpack_exports__,{g:()=>n})},"../node_modules/lit/directives/style-map.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{V:()=>o});var lit_html=__webpack_require__("../node_modules/lit-html/lit-html.js"),directive=__webpack_require__("../node_modules/lit-html/directive.js"),n="important",i=" !"+n,o=(0,directive.XM)(class extends directive.Xe{constructor(t){var _t$strings;if(super(t),t.type!==directive.pX.ATTRIBUTE||"style"!==t.name||(null===(_t$strings=t.strings)||void 0===_t$strings?void 0:_t$strings.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce(((e,r)=>{var s=t[r];return null==s?e:e+"".concat(r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase(),":").concat(s,";")}),"")}update(e,_ref){var[r]=_ref,{style:s}=e.element;if(void 0===this.ut)return this.ut=new Set(Object.keys(r)),this.render(r);for(var _t of this.ut)null==r[_t]&&(this.ut.delete(_t),_t.includes("-")?s.removeProperty(_t):s[_t]=null);for(var _t2 in r){var _e=r[_t2];if(null!=_e){this.ut.add(_t2);var _r="string"==typeof _e&&_e.endsWith(i);_t2.includes("-")||_r?s.setProperty(_t2,_r?_e.slice(0,-11):_e,_r?n:""):s[_t2]=_e}}return lit_html.Jb}})},"../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[13].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[13].use[2]!../components/badge/index.css":(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__.p+"assets/css/components/badge/index.css"}}]);
//# sourceMappingURL=badge-stories-badge-stories.8cc4640b.iframe.bundle.js.map