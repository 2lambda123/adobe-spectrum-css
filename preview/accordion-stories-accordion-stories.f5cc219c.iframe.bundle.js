(globalThis.webpackChunk_spectrum_css_preview=globalThis.webpackChunk_spectrum_css_preview||[]).push([[1832],{"../components/accordion/stories/accordion.stories.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>accordion_stories});var lit=__webpack_require__("../node_modules/lit/index.js"),class_map=__webpack_require__("../node_modules/lit/directives/class-map.js"),repeat=__webpack_require__("../node_modules/lit/directives/repeat.js"),if_defined=__webpack_require__("../node_modules/lit/directives/if-defined.js"),template=__webpack_require__("../components/icon/stories/template.js"),injectStylesIntoLinkTag=__webpack_require__("../node_modules/style-loader/dist/runtime/injectStylesIntoLinkTag.js"),injectStylesIntoLinkTag_default=__webpack_require__.n(injectStylesIntoLinkTag),insertBySelector=__webpack_require__("../node_modules/style-loader/dist/runtime/insertBySelector.js"),insertBySelector_default=__webpack_require__.n(insertBySelector),accordion=__webpack_require__("../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../components/accordion/index.css"),accordion_default=__webpack_require__.n(accordion),options={attributes:{"data-source":"processed"}};options.insert=insertBySelector_default().bind(null,"head");injectStylesIntoLinkTag_default()(accordion_default(),options);const accordion_stories={title:"Components/Accordion",description:"The accordion element contains a list of items that can be expanded or collapsed to reveal additional content or information associated with each item. There can be zero expanded items, exactly one expanded item, or more than one item expanded at a time, depending on the configuration. This list of items is defined by child accordion item elements.",component:"Accordion",argTypes:{items:{table:{disable:!0}},size:{name:"Size",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Component"},options:["s","m","l","xl"],control:"select"},disableAll:{name:"Disabled",type:{name:"boolean"},table:{type:{summary:"boolean"},category:"State"},control:"boolean"},density:{name:"Density",type:{name:"string",required:!0},table:{type:{summary:"string"},category:"Component"},options:["compact","regular","spacious"],control:"select"}},args:{rootClass:"spectrum-Accordion",size:"m",density:"regular"},parameters:{actions:{handles:["click .spectrum-Accordion-item"]},status:{type:["accordion","actionbar","actionbutton","actiongroup","actionmenu","alertbanner","alertdialog","assetcard","assetlist","avatar","badge","breadcrumb","button","buttongroup","calendar","card","checkbox","clearbutton","closebutton","coachindicator","coachmark","colorarea","colorhandle","colorloupe","colorslider","colorwheel","combobox","contextualhelp","datepicker","dial","divider","dropindicator","dropzone","fieldgroup","fieldlabel","floatingactionbutton","helptext","illustratedmessage","infieldbutton","inlinealert","link","logicbutton","menu","miller","modal","opacitycheckerboard","page","pagination","picker","pickerbutton","popover","progressbar","progresscircle","radio","rating","search","sidenav","slider","splitview","steplist","stepper","swatch","swatchgroup","switch","table","tabs","tag","taggroup","textfield","thumbnail","toast","tooltip","tray","treeview","typography","underlay","well"].includes("accordion")?"migrated":void 0}}},Default=(({rootClass="spectrum-Accordion",size="m",density="regular",items,id,customClasses=[],...globals})=>items&&items.size?lit.dy`
		<div
			class="${(0,class_map.$)({[rootClass]:!0,[`${rootClass}--size${size?.toUpperCase()}`]:void 0!==size,[`${rootClass}--${density}`]:void 0!==density&&"regular"!==density,...customClasses.reduce(((a,c)=>({...a,[c]:!0})),{})})}"
			id=${(0,if_defined.o)(id)}
			role="region"
		>
			${(0,repeat.r)(Array.from(items.keys()),((heading,idx)=>{const item=items.get(heading);return(({heading,content,rootClass="spectrum-Accordion-item",id,idx=0,isDisabled=!1,isOpen=!1,iconSize="m",disableAll=!1,...globals})=>lit.dy`
		<div
			class=${(0,class_map.$)({[rootClass]:!0,"is-open":isOpen,"is-disabled":isDisabled||disableAll})}
			id=${(0,if_defined.o)(id)}
			role="presentation"
			@click=${evt=>{if(isDisabled||!evt||!evt.target)return;const closest=evt.target.closest(`.${rootClass}`);closest&&closest.classList.toggle("is-open")}}
		>
			<!-- WAI-ARIA 1.1: Item header is a <button> wrapped within a <h3> element, rather than a <div> element with role="tab" -->
			<h3 class="${rootClass}Heading">
				<!-- WAI-ARIA 1.1: Item header <button> uses aria-expanded attribute to indicate expanded state. -->
				<button
					class="${rootClass}Header"
					type="button"
					?disabled=${isDisabled||disableAll}
					id="spectrum-accordion-item-${idx}-header"
					aria-controls="spectrum-accordion-item-${idx}-content"
					aria-expanded="${open?"true":"false"}"
				>
					${heading}
				</button>
				<span class="${rootClass}IconContainer">
					${(0,template.Y)({iconName:"ChevronRight",size:iconSize,customClasses:[`${rootClass}Indicator`],...globals})}
				</span>
			</h3>
			<!-- WAI-ARIA 1.1: Item content role changed from "tabpanel" to "region" -->
			<div
				class="${rootClass}Content"
				role="region"
				id="spectrum-accordion-item-${idx}-content"
				aria-labelledby="spectrum-accordion-item-${idx}-header"
			>
				${content}
			</div>
		</div>
	`)({rootClass:`${rootClass}-item`,heading,idx,iconSize:`${size}`,...item,...globals})}))}
		</div>
	`:lit.dy``).bind({});Default.args={items:new Map([["Recent",{content:"Item 1",isOpen:!0,isDisabled:!1}],["Architecture",{content:"Item 2",isOpen:!1,isDisabled:!0}],["Nature",{content:"Item 3",isOpen:!1,isDisabled:!1}],["Really Long Accordion Item According to Our Predictions",{content:"Item 4",isOpen:!1,isDisabled:!1}]])};const __namedExportsOrder=["Default"]},"../node_modules/lit/directives/repeat.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";__webpack_require__.d(__webpack_exports__,{r:()=>c});var lit_html=__webpack_require__("../node_modules/lit-html/lit-html.js"),directive=__webpack_require__("../node_modules/lit-html/directive.js"),directive_helpers=__webpack_require__("../node_modules/lit-html/directive-helpers.js"),u=(e,s,t)=>{for(var r=new Map,_l=s;_l<=t;_l++)r.set(e[_l],_l);return r},c=(0,directive.XM)(class extends directive.Xe{constructor(e){if(super(e),e.type!==directive.pX.CHILD)throw Error("repeat() can only be used in text expressions")}ct(e,s,t){var r;void 0===t?t=s:void 0!==s&&(r=s);var l=[],o=[],i=0;for(var _s of e)l[i]=r?r(_s,i):i,o[i]=t(_s,i),i++;return{values:o,keys:l}}render(e,s,t){return this.ct(e,s,t).values}update(s,_ref){var d,[t,r,c]=_ref,a=(0,directive_helpers.i9)(s),{values:p,keys:v}=this.ct(t,r,c);if(!Array.isArray(a))return this.ut=v,p;for(var y,x,h=null!==(d=this.ut)&&void 0!==d?d:this.ut=[],m=[],j=0,k=a.length-1,w=0,A=p.length-1;j<=k&&w<=A;)if(null===a[j])j++;else if(null===a[k])k--;else if(h[j]===v[w])m[w]=(0,directive_helpers.fk)(a[j],p[w]),j++,w++;else if(h[k]===v[A])m[A]=(0,directive_helpers.fk)(a[k],p[A]),k--,A--;else if(h[j]===v[A])m[A]=(0,directive_helpers.fk)(a[j],p[A]),(0,directive_helpers._Y)(s,m[A+1],a[j]),j++,A--;else if(h[k]===v[w])m[w]=(0,directive_helpers.fk)(a[k],p[w]),(0,directive_helpers._Y)(s,a[j],a[k]),k--,w++;else if(void 0===y&&(y=u(v,w,A),x=u(h,j,k)),y.has(h[j]))if(y.has(h[k])){var _e=x.get(v[w]),_t=void 0!==_e?a[_e]:null;if(null===_t){var _e2=(0,directive_helpers._Y)(s,a[j]);(0,directive_helpers.fk)(_e2,p[w]),m[w]=_e2}else m[w]=(0,directive_helpers.fk)(_t,p[w]),(0,directive_helpers._Y)(s,a[j],_t),a[_e]=null;w++}else(0,directive_helpers.ws)(a[k]),k--;else(0,directive_helpers.ws)(a[j]),j++;for(;w<=A;){var _e3=(0,directive_helpers._Y)(s,m[A+1]);(0,directive_helpers.fk)(_e3,p[w]),m[w++]=_e3}for(;j<=k;){var _e4=a[j++];null!==_e4&&(0,directive_helpers.ws)(_e4)}return this.ut=v,(0,directive_helpers.hl)(s,m),lit_html.Jb}})},"../node_modules/file-loader/dist/cjs.js??ruleSet[1].rules[12].use[1]!../node_modules/postcss-loader/dist/cjs.js??ruleSet[1].rules[12].use[2]!../components/accordion/index.css":(module,__unused_webpack_exports,__webpack_require__)=>{module.exports=__webpack_require__.p+"assets/css/components/accordion/index.css"}}]);
//# sourceMappingURL=accordion-stories-accordion-stories.f5cc219c.iframe.bundle.js.map