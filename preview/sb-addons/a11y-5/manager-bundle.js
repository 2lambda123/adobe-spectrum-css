try{
var I="storybook/a11y",q=`${I}/panel`,fe="a11y",rt=`${I}/result`,nt=`${I}/request`,at=`${I}/running`,it=`${I}/error`,ot=`${I}/manual`,H={RESULT:rt,REQUEST:nt,RUNNING:at,ERROR:it,MANUAL:ot};var a=__REACT__,{Children:An,Component:lt,Fragment:$,Profiler:In,PureComponent:pe,StrictMode:kn,Suspense:Nn,__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:wn,cloneElement:W,createContext:ge,createElement:g,createFactory:Dn,createRef:he,forwardRef:ct,isValidElement:Ee,lazy:Hn,memo:Ln,useCallback:k,useContext:Re,useDebugValue:Pn,useEffect:M,useImperativeHandle:Bn,useLayoutEffect:ye,useMemo:j,useReducer:Mn,useRef:z,useState:N,version:Gn}=__REACT__;var Fn=__STORYBOOKAPI__,{ActiveTabs:Un,Consumer:Yn,ManagerContext:Vn,Provider:Kn,addons:F,combineParameters:Xn,controlOrMetaKey:qn,controlOrMetaSymbol:Qn,eventMatchesShortcut:Jn,eventToShortcut:Zn,isMacLike:ea,isShortcutTaken:ta,keyToSymbol:ra,merge:na,mockChannel:aa,optionOrAltSymbol:ia,shortcutMatchesShortcut:oa,shortcutToHumanString:la,types:Q,useAddonState:J,useArgTypes:ca,useArgs:sa,useChannel:Z,useGlobalTypes:ua,useGlobals:da,useParameter:Te,useSharedState:ma,useStoryPrepared:fa,useStorybookApi:_e,useStorybookState:ve}=__STORYBOOKAPI__;var ya=__STORYBOOKCOMPONENTS__,{A:ba,ActionBar:ee,AddonPanel:Ta,Badge:te,Bar:_a,Blockquote:va,Button:Sa,ClipboardCode:Oa,Code:xa,DL:Ca,Div:Aa,DocumentWrapper:Ia,ErrorFormatter:ka,FlexBar:Na,Form:wa,H1:Da,H2:Ha,H3:La,H4:Pa,H5:Ba,H6:Ma,HR:Ga,IconButton:Se,IconButtonSkeleton:$a,Icons:U,Img:Wa,LI:ja,Link:za,ListItem:Fa,Loader:Ua,OL:Ya,P:Va,Placeholder:Oe,Pre:Ka,ResetWrapper:Xa,ScrollArea:xe,Separator:qa,Spaced:Ce,Span:Qa,StorybookIcon:Ja,StorybookLogo:Za,Symbols:ei,SyntaxHighlighter:ti,TT:ri,TabBar:ni,TabButton:ai,TabWrapper:ii,Table:oi,Tabs:li,TabsState:ci,TooltipLinkList:Ae,TooltipMessage:si,TooltipNote:ui,UL:di,WithTooltip:Ie,WithTooltipPure:mi,Zoom:fi,codeCommon:pi,components:gi,createCopyToClipboardFunction:hi,getStoryHref:Ei,icons:Ri,interleaveSeparators:yi,nameSpaceClassNames:bi,resetComponents:Ti,withReset:_i}=__STORYBOOKCOMPONENTS__;var Ai=__STORYBOOKTHEMING__,{CacheProvider:Ii,ClassNames:ki,Global:ke,ThemeProvider:Ni,background:wi,color:Di,convert:Y,create:Hi,createCache:Li,createGlobal:Pi,createReset:Bi,css:Mi,darken:Gi,ensure:$i,ignoreSsrWarning:Wi,isPropValid:ji,jsx:zi,keyframes:Fi,lighten:Ui,styled:s,themes:V,typography:Yi,useTheme:Vi,withTheme:Ki}=__STORYBOOKTHEMING__;var eo=__REACTDOM__,{__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED:to,createPortal:ro,findDOMNode:Ne,flushSync:no,hydrate:ao,render:io,unmountComponentAtNode:oo,unstable_batchedUpdates:lo,unstable_createPortal:co,unstable_renderSubtreeIntoContainer:so,version:uo}=__REACTDOM__;var ne=function(e,r){return ne=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,t){n.__proto__=t}||function(n,t){for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(n[i]=t[i])},ne(e,r)};function st(e,r){if(typeof r!="function"&&r!==null)throw new TypeError("Class extends value "+String(r)+" is not a constructor or null");ne(e,r);function n(){this.constructor=e}e.prototype=r===null?Object.create(r):(n.prototype=r.prototype,new n)}var ae=function(){return ae=Object.assign||function(r){for(var n,t=1,i=arguments.length;t<i;t++){n=arguments[t];for(var l in n)Object.prototype.hasOwnProperty.call(n,l)&&(r[l]=n[l])}return r},ae.apply(this,arguments)};function ut(e,r){var n={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&r.indexOf(t)<0&&(n[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,t=Object.getOwnPropertySymbols(e);i<t.length;i++)r.indexOf(t[i])<0&&Object.prototype.propertyIsEnumerable.call(e,t[i])&&(n[t[i]]=e[t[i]]);return n}var K=typeof globalThis<"u"?globalThis:typeof window<"u"||typeof window<"u"?window:typeof self<"u"?self:{};function dt(e){var r=typeof e;return e!=null&&(r=="object"||r=="function")}var oe=dt,mt=typeof K=="object"&&K&&K.Object===Object&&K,ft=mt,pt=ft,gt=typeof self=="object"&&self&&self.Object===Object&&self,ht=pt||gt||Function("return this")(),Ge=ht,Et=Ge,Rt=function(){return Et.Date.now()},yt=Rt,bt=/\s/;function Tt(e){for(var r=e.length;r--&&bt.test(e.charAt(r)););return r}var _t=Tt,vt=_t,St=/^\s+/;function Ot(e){return e&&e.slice(0,vt(e)+1).replace(St,"")}var xt=Ot,Ct=Ge,At=Ct.Symbol,$e=At,we=$e,We=Object.prototype,It=We.hasOwnProperty,kt=We.toString,G=we?we.toStringTag:void 0;function Nt(e){var r=It.call(e,G),n=e[G];try{e[G]=void 0;var t=!0}catch{}var i=kt.call(e);return t&&(r?e[G]=n:delete e[G]),i}var wt=Nt,Dt=Object.prototype,Ht=Dt.toString;function Lt(e){return Ht.call(e)}var Pt=Lt,De=$e,Bt=wt,Mt=Pt,Gt="[object Null]",$t="[object Undefined]",He=De?De.toStringTag:void 0;function Wt(e){return e==null?e===void 0?$t:Gt:He&&He in Object(e)?Bt(e):Mt(e)}var jt=Wt;function zt(e){return e!=null&&typeof e=="object"}var Ft=zt,Ut=jt,Yt=Ft,Vt="[object Symbol]";function Kt(e){return typeof e=="symbol"||Yt(e)&&Ut(e)==Vt}var Xt=Kt,qt=xt,Le=oe,Qt=Xt,Pe=0/0,Jt=/^[-+]0x[0-9a-f]+$/i,Zt=/^0b[01]+$/i,er=/^0o[0-7]+$/i,tr=parseInt;function rr(e){if(typeof e=="number")return e;if(Qt(e))return Pe;if(Le(e)){var r=typeof e.valueOf=="function"?e.valueOf():e;e=Le(r)?r+"":r}if(typeof e!="string")return e===0?e:+e;e=qt(e);var n=Zt.test(e);return n||er.test(e)?tr(e.slice(2),n?2:8):Jt.test(e)?Pe:+e}var nr=rr,ar=oe,re=yt,Be=nr,ir="Expected a function",or=Math.max,lr=Math.min;function cr(e,r,n){var t,i,l,u,c,f,p=0,d=!1,m=!1,o=!0;if(typeof e!="function")throw new TypeError(ir);r=Be(r)||0,ar(n)&&(d=!!n.leading,m="maxWait"in n,l=m?or(Be(n.maxWait)||0,r):l,o="trailing"in n?!!n.trailing:o);function y(h){var v=t,S=i;return t=i=void 0,p=h,u=e.apply(S,v),u}function b(h){return p=h,c=setTimeout(R,r),d?y(h):u}function T(h){var v=h-f,S=h-p,B=r-v;return m?lr(B,l-S):B}function E(h){var v=h-f,S=h-p;return f===void 0||v>=r||v<0||m&&S>=l}function R(){var h=re();if(E(h))return _(h);c=setTimeout(R,T(h))}function _(h){return c=void 0,o&&t?y(h):(t=i=void 0,u)}function L(){c!==void 0&&clearTimeout(c),p=0,t=f=i=c=void 0}function P(){return c===void 0?u:_(re())}function D(){var h=re(),v=E(h);if(t=arguments,i=this,f=h,v){if(c===void 0)return b(f);if(m)return clearTimeout(c),c=setTimeout(R,r),y(f)}return c===void 0&&(c=setTimeout(R,r)),u}return D.cancel=L,D.flush=P,D}var je=cr,sr=je,ur=oe,dr="Expected a function";function mr(e,r,n){var t=!0,i=!0;if(typeof e!="function")throw new TypeError(dr);return ur(n)&&(t="leading"in n?!!n.leading:t,i="trailing"in n?!!n.trailing:i),sr(e,r,{leading:t,maxWait:r,trailing:i})}var fr=mr,ze=function(e,r,n,t){switch(r){case"debounce":return je(e,n,t);case"throttle":return fr(e,n,t);default:return e}},ie=function(e){return typeof e=="function"},w=function(){return typeof window>"u"},Me=function(e){return e instanceof Element||e instanceof HTMLDocument},Fe=function(e,r,n,t){return function(i){var l=i.width,u=i.height;r(function(c){return c.width===l&&c.height===u||c.width===l&&!t||c.height===u&&!n?c:(e&&ie(e)&&e(l,u),{width:l,height:u})})}},yo=function(e){st(r,e);function r(n){var t=e.call(this,n)||this;t.cancelHandler=function(){t.resizeHandler&&t.resizeHandler.cancel&&(t.resizeHandler.cancel(),t.resizeHandler=null)},t.attachObserver=function(){var p=t.props,d=p.targetRef,m=p.observerOptions;if(!w()){d&&d.current&&(t.targetRef.current=d.current);var o=t.getElement();o&&(t.observableElement&&t.observableElement===o||(t.observableElement=o,t.resizeObserver.observe(o,m)))}},t.getElement=function(){var p=t.props,d=p.querySelector,m=p.targetDomEl;if(w())return null;if(d)return document.querySelector(d);if(m&&Me(m))return m;if(t.targetRef&&Me(t.targetRef.current))return t.targetRef.current;var o=Ne(t);if(!o)return null;var y=t.getRenderType();switch(y){case"renderProp":return o;case"childFunction":return o;case"child":return o;case"childArray":return o;default:return o.parentElement}},t.createResizeHandler=function(p){var d=t.props,m=d.handleWidth,o=m===void 0?!0:m,y=d.handleHeight,b=y===void 0?!0:y,T=d.onResize;if(!(!o&&!b)){var E=Fe(T,t.setState.bind(t),o,b);p.forEach(function(R){var _=R&&R.contentRect||{},L=_.width,P=_.height,D=!t.skipOnMount&&!w();D&&E({width:L,height:P}),t.skipOnMount=!1})}},t.getRenderType=function(){var p=t.props,d=p.render,m=p.children;return ie(d)?"renderProp":ie(m)?"childFunction":Ee(m)?"child":Array.isArray(m)?"childArray":"parent"};var i=n.skipOnMount,l=n.refreshMode,u=n.refreshRate,c=u===void 0?1e3:u,f=n.refreshOptions;return t.state={width:void 0,height:void 0},t.skipOnMount=i,t.targetRef=he(),t.observableElement=null,w()||(t.resizeHandler=ze(t.createResizeHandler,l,c,f),t.resizeObserver=new window.ResizeObserver(t.resizeHandler)),t}return r.prototype.componentDidMount=function(){this.attachObserver()},r.prototype.componentDidUpdate=function(){this.attachObserver()},r.prototype.componentWillUnmount=function(){w()||(this.observableElement=null,this.resizeObserver.disconnect(),this.cancelHandler())},r.prototype.render=function(){var n=this.props,t=n.render,i=n.children,l=n.nodeType,u=l===void 0?"div":l,c=this.state,f=c.width,p=c.height,d={width:f,height:p,targetRef:this.targetRef},m=this.getRenderType(),o;switch(m){case"renderProp":return t&&t(d);case"childFunction":return o=i,o(d);case"child":if(o=i,o.type&&typeof o.type=="string"){d.targetRef;var y=ut(d,["targetRef"]);return W(o,y)}return W(o,d);case"childArray":return o=i,o.map(function(b){return!!b&&W(b,d)});default:return g(u,null)}},r}(pe);var pr=w()?M:ye;function le(e){e===void 0&&(e={});var r=e.skipOnMount,n=r===void 0?!1:r,t=e.refreshMode,i=e.refreshRate,l=i===void 0?1e3:i,u=e.refreshOptions,c=e.handleWidth,f=c===void 0?!0:c,p=e.handleHeight,d=p===void 0?!0:p,m=e.targetRef,o=e.observerOptions,y=e.onResize,b=z(n),T=z(null),E=m??T,R=z(),_=N({width:void 0,height:void 0}),L=_[0],P=_[1];return pr(function(){if(!w()){var D=Fe(y,P,f,d),h=function(S){!f&&!d||S.forEach(function(B){var me=B&&B.contentRect||{},Ze=me.width,et=me.height,tt=!b.current&&!w();tt&&D({width:Ze,height:et}),b.current=!1})};R.current=ze(h,t,l,u);var v=new window.ResizeObserver(R.current);return E.current&&v.observe(E.current,o),function(){v.disconnect();var S=R.current;S&&S.cancel&&S.cancel()}}},[t,l,u,f,d,y,o,E.current]),ae({ref:E},L)}var Oo=__STORYBOOKCOREEVENTS__,{CHANNEL_CREATED:xo,CONFIG_ERROR:Co,CURRENT_STORY_WAS_SET:Ao,DOCS_PREPARED:Io,DOCS_RENDERED:ko,FORCE_REMOUNT:No,FORCE_RE_RENDER:wo,GLOBALS_UPDATED:Do,IGNORED_EXCEPTION:Ho,NAVIGATE_URL:Lo,PLAY_FUNCTION_THREW_EXCEPTION:Po,PRELOAD_ENTRIES:Bo,PREVIEW_BUILDER_PROGRESS:Mo,PREVIEW_KEYDOWN:Go,REGISTER_SUBSCRIPTION:$o,REQUEST_WHATS_NEW_DATA:Wo,RESET_STORY_ARGS:jo,RESULT_WHATS_NEW_DATA:zo,SELECT_STORY:Fo,SET_CONFIG:Uo,SET_CURRENT_STORY:Yo,SET_GLOBALS:Vo,SET_INDEX:Ko,SET_STORIES:Xo,SET_WHATS_NEW_CACHE:qo,SHARED_STATE_CHANGED:Qo,SHARED_STATE_SET:Jo,STORIES_COLLAPSE_ALL:Zo,STORIES_EXPAND_ALL:el,STORY_ARGS_UPDATED:tl,STORY_CHANGED:Ue,STORY_ERRORED:rl,STORY_INDEX_INVALIDATED:nl,STORY_MISSING:al,STORY_PREPARED:il,STORY_RENDERED:Ye,STORY_RENDER_PHASE_CHANGED:ol,STORY_SPECIFIED:ll,STORY_THREW_EXCEPTION:cl,STORY_UNCHANGED:sl,TELEMETRY_ERROR:ul,TOGGLE_WHATS_NEW_NOTIFICATIONS:dl,UPDATE_GLOBALS:ml,UPDATE_QUERY_PARAMS:fl,UPDATE_STORY_ARGS:pl}=__STORYBOOKCOREEVENTS__;var Ve="storybook/highlight";var ce=`${Ve}/add`,gr=`${Ve}/reset`;var hr=e=>g("svg",{...e},g("defs",null,g("filter",{id:"protanopia"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0"})),g("filter",{id:"protanomaly"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.817, 0.183, 0, 0, 0 0.333, 0.667, 0, 0, 0 0, 0.125, 0.875, 0, 0 0, 0, 0, 1, 0"})),g("filter",{id:"deuteranopia"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"})),g("filter",{id:"deuteranomaly"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.8, 0.2, 0, 0, 0 0.258, 0.742, 0, 0, 0 0, 0.142, 0.858, 0, 0 0, 0, 0, 1, 0"})),g("filter",{id:"tritanopia"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.95, 0.05,  0, 0, 0 0,  0.433, 0.567, 0, 0 0,  0.475, 0.525, 0, 0 0,  0, 0, 1, 0"})),g("filter",{id:"tritanomaly"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.967, 0.033, 0, 0, 0 0, 0.733, 0.267, 0, 0 0, 0.183, 0.817, 0, 0 0, 0, 0, 1, 0"})),g("filter",{id:"achromatopsia"},g("feColorMatrix",{in:"SourceGraphic",type:"matrix",values:"0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0"})))),Er="storybook-preview-iframe",Rr=[{name:"blurred vision",percentage:22.9},{name:"deuteranomaly",percentage:2.7},{name:"deuteranopia",percentage:.56},{name:"protanomaly",percentage:.66},{name:"protanopia",percentage:.59},{name:"tritanomaly",percentage:.01},{name:"tritanopia",percentage:.016},{name:"achromatopsia",percentage:1e-4},{name:"grayscale"}],qe=e=>e?e==="blurred vision"?"blur(2px)":e==="grayscale"?"grayscale(100%)":`url('#${e}')`:"none",yr=s.div(()=>({"&, & svg":{position:"absolute",width:0,height:0}})),br=s.span({background:"linear-gradient(to right, #F44336, #FF9800, #FFEB3B, #8BC34A, #2196F3, #9C27B0)",borderRadius:"1rem",display:"block",height:"1rem",width:"1rem"},({filter:e})=>({filter:qe(e)}),({theme:e})=>({boxShadow:`${e.appBorderColor} 0 0 0 1px inset`})),Tr=s.span({display:"flex",flexDirection:"column"}),_r=s.span({textTransform:"capitalize"}),vr=s.span(({theme:e})=>({fontSize:11,color:e.textMutedColor})),Sr=(e,r)=>[...e!==null?[{id:"reset",title:"Reset color filter",onClick:()=>{r(null)},right:void 0,active:!1}]:[],...Rr.map(n=>{let t=n.percentage!==void 0?`${n.percentage}% of users`:void 0;return{id:n.name,title:a.createElement(Tr,null,a.createElement(_r,null,n.name),t&&a.createElement(vr,null,t)),onClick:()=>{r(n)},right:a.createElement(br,{filter:n.name}),active:e===n}})],Or=()=>{let[e,r]=N(null);return a.createElement(a.Fragment,null,e&&a.createElement(ke,{styles:{[`#${Er}`]:{filter:qe(e.name)}}}),a.createElement(Ie,{placement:"top",tooltip:({onHide:n})=>{let t=Sr(e,i=>{r(i),n()});return a.createElement(Ae,{links:t})},closeOnOutsideClick:!0,onDoubleClick:()=>r(null)},a.createElement(Se,{key:"filter",active:!!e,title:"Vision simulator"},a.createElement(U,{icon:"accessibility"}))),a.createElement(yr,null,a.createElement(hr,null)))},xr=s.div({padding:12,marginBottom:10}),Cr=s.p({margin:"0 0 12px"}),Ar=s.a({marginTop:12,textDecoration:"underline",color:"inherit",display:"block"}),Ir=({item:e})=>a.createElement(xr,null,a.createElement(Cr,null,e.description),a.createElement(Ar,{href:e.helpUrl,target:"_blank"},"More info...")),kr=s.div({display:"flex",flexDirection:"column",paddingBottom:4,paddingRight:4,paddingTop:4,fontWeight:400}),Nr=s.div(({elementWidth:e})=>({flexDirection:e>407?"row":"inherit",marginBottom:e>407?6:12,display:e>407?"flex":"block"})),wr=s(te)({padding:"2px 8px",marginBottom:3,minWidth:65,maxWidth:"fit-content",width:"100%",textAlign:"center"}),Dr=s.div({paddingLeft:6,paddingRight:23}),Hr=e=>e.charAt(0).toUpperCase().concat(e.slice(1)),Lr=({rule:e})=>{let{ref:r,width:n}=le({refreshMode:"debounce",handleHeight:!1,handleWidth:!0}),t=null;switch(e.impact){case"critical":t="critical";break;case"serious":t="negative";break;case"moderate":t="warning";break;case"minor":t="neutral";break}return a.createElement(Nr,{ref:r,elementWidth:n||0},a.createElement(wr,{status:t},Hr(e.impact)),a.createElement(Dr,null,e.message))},Pr=({rules:e})=>a.createElement(kr,null,e.map((r,n)=>a.createElement(Lr,{rule:r,key:n}))),Br=[Y(V.light).color.negative,Y(V.light).color.positive,Y(V.light).color.warning],Qe=ge({results:{passes:[],incomplete:[],violations:[]},setResults:()=>{},highlighted:[],toggleHighlight:()=>{},clearHighlights:()=>{},tab:0,setTab:()=>{}}),Ke={passes:[],incomplete:[],violations:[]},Mr=({active:e,...r})=>{let[n,t]=J(I,Ke),[i,l]=N(0),[u,c]=N([]),f=_e().getCurrentStoryData(),p=k((T,E)=>{c(R=>E?[...R,...T]:R.filter(_=>!T.includes(_)))},[]),d=T=>{b(H.REQUEST,T)},m=k(()=>c([]),[]),o=k(T=>{m(),l(T)},[]),y=k(()=>{l(0),t(Ke)},[]),b=Z({[Ye]:d,[Ue]:y});return M(()=>{b(ce,{elements:u,color:Br[i]})},[u,i]),M(()=>{e&&f?.type==="story"?d(f.id):m()},[e,m,b,f]),e?g(Qe.Provider,{value:{results:n,setResults:t,highlighted:u,toggleHighlight:p,clearHighlights:m,tab:i,setTab:o},...r}):null},ue=()=>Re(Qe),Gr=s.input(({disabled:e})=>({cursor:e?"not-allowed":"pointer"}));function Xe(e,r){let n=e.filter(t=>r.includes(t.target[0])).length;return n===0?1:n===e.length?0:2}var $r=({toggleId:e,elementsToHighlight:r=[]})=>{let{toggleHighlight:n,highlighted:t}=ue(),i=a.useRef(null),[l,u]=a.useState(Xe(r,t));a.useEffect(()=>{let f=Xe(r,t);i.current&&(i.current.indeterminate=f===2),u(f)},[r,t]);let c=a.useCallback(()=>{n(r.map(f=>f.target[0]),l!==0)},[r,l,n]);return a.createElement(Gr,{ref:i,id:e,type:"checkbox","aria-label":"Highlight result",disabled:!r.length,onChange:c,checked:l===0})},de=$r,Wr=s.li({fontWeight:600}),jr=s.span(({theme:e})=>({borderBottom:`1px solid ${e.appBorderColor}`,width:"100%",display:"flex",paddingBottom:6,marginBottom:6,justifyContent:"space-between"})),zr=s.span({fontWeight:"normal",alignSelf:"center",paddingRight:15,input:{margin:0,display:"block"}}),Fr=({element:e,type:r})=>{let{any:n,all:t,none:i}=e,l=[...n,...t,...i],u=`${r}-${e.target[0]}`;return a.createElement(Wr,null,a.createElement(jr,null,e.target[0],a.createElement(zr,null,a.createElement(de,{toggleId:u,elementsToHighlight:[e]}))),a.createElement(Pr,{rules:l}))},Ur=({elements:e,type:r})=>a.createElement("ol",null,e.map((n,t)=>a.createElement(Fr,{element:n,key:t,type:r}))),Yr=s.div({display:"flex",flexWrap:"wrap",margin:"12px 0"}),Vr=s.div(({theme:e})=>({margin:"0 6px",padding:5,border:`1px solid ${e.appBorderColor}`,borderRadius:e.appBorderRadius})),Kr=({tags:e})=>a.createElement(Yr,null,e.map(r=>a.createElement(Vr,{key:r},r))),Xr=s.div(({theme:e})=>({display:"flex",width:"100%",borderBottom:`1px solid ${e.appBorderColor}`,"&:hover":{background:e.background.hoverable}})),qr=s(U)(({theme:e})=>({height:10,width:10,minWidth:10,color:e.textMutedColor,marginRight:10,transition:"transform 0.1s ease-in-out",alignSelf:"center",display:"inline-flex"})),Qr=s.div(({theme:e})=>({padding:e.layoutMargin,paddingLeft:e.layoutMargin-3,lineHeight:"20px",background:"none",color:"inherit",textAlign:"left",cursor:"pointer",borderLeft:"3px solid transparent",width:"100%","&:focus":{outline:"0 none",borderLeft:`3px solid ${e.color.secondary}`}})),Jr=s.span({fontWeight:"normal",float:"right",marginRight:15,alignSelf:"center",input:{margin:0,display:"block"}}),Zr=e=>{let[r,n]=N(!1),{item:t,type:i}=e,l=`${i}-${t.id}`;return a.createElement($,null,a.createElement(Xr,null,a.createElement(Qr,{onClick:()=>n(!r),role:"button"},a.createElement(qr,{icon:"arrowdown",color:"#9DA5AB",style:{transform:`rotate(${r?0:-90}deg)`}}),t.help),a.createElement(Jr,null,a.createElement(de,{toggleId:l,elementsToHighlight:t.nodes}))),r?a.createElement($,null,a.createElement(Ir,{item:t,key:"info"}),a.createElement(Ur,{elements:t.nodes,type:i,key:"elements"}),a.createElement(Kr,{tags:t.tags,key:"tags"})):null)},se=({items:e,empty:r,type:n})=>a.createElement($,null,e&&e.length?e.map(t=>a.createElement(Zr,{item:t,key:`${n}:${t.id}`,type:n})):a.createElement(Oe,{key:"placeholder"},r)),en=s.div({width:"100%",position:"relative",minHeight:"100%"}),tn=s.label(({theme:e})=>({cursor:"pointer",userSelect:"none",color:e.color.dark})),rn=s.div(({elementWidth:e,theme:r})=>({cursor:"pointer",fontSize:13,lineHeight:"20px",padding:e>450?"10px 15px 10px 0":"10px 0px 10px 15px",height:"40px",border:"none",marginTop:e>450?-40:0,float:e>450?"right":"left",display:"flex",alignItems:"center",width:e>450?"auto":"100%",borderBottom:e>450?"none":`1px solid ${r.appBorderColor}`,input:{marginLeft:10,marginRight:0,marginTop:-1,marginBottom:0}})),nn=s.button(({theme:e})=>({textDecoration:"none",padding:"10px 15px",cursor:"pointer",fontWeight:e.typography.weight.bold,fontSize:e.typography.size.s2-1,lineHeight:1,height:40,border:"none",borderTop:"3px solid transparent",borderBottom:"3px solid transparent",background:"transparent","&:focus":{outline:"0 none",borderBottom:`3px solid ${e.color.secondary}`}}),({active:e,theme:r})=>e?{opacity:1,borderBottom:`3px solid ${r.color.secondary}`}:{}),an=s.div({}),on=s.div(({theme:e})=>({boxShadow:`${e.appBorderColor} 0 -1px 0 0 inset`,background:e.background.app,display:"flex",justifyContent:"space-between",whiteSpace:"nowrap"}));function ln(e){return e.reduce((r,n)=>r.concat(n.nodes),[])}var cn=({tabs:e})=>{let{ref:r,width:n}=le({refreshMode:"debounce",handleHeight:!1,handleWidth:!0}),{tab:t,setTab:i}=ue(),l=k(f=>{i(parseInt(f.currentTarget.getAttribute("data-index")||"",10))},[i]),u=`${e[t].type}-global-checkbox`,c="Highlight results";return g(en,{ref:r},g(on,null,g(an,null,e.map((f,p)=>g(nn,{key:p,"data-index":p,active:t===p,onClick:l},f.label)))),e[t].items.length>0?g(rn,{elementWidth:n||0},g(tn,{htmlFor:u},c),g(de,{toggleId:u,elementsToHighlight:ln(e[t].items)})):null,e[t].panel)},Je=s(U)({height:12,width:12,marginRight:4}),sn=s(Je)(({theme:e})=>({animation:`${e.animation.rotate360} 1s linear infinite;`})),un=s.span(({theme:e})=>({color:e.color.positiveText})),dn=s.span(({theme:e})=>({color:e.color.negativeText})),mn=s.span(({theme:e})=>({color:e.color.warningText})),X=s.span({display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}),fn=()=>{let{manual:e}=Te("a11y",{manual:!1}),[r,n]=N(e?"manual":"initial"),[t,i]=a.useState(void 0),{setResults:l,results:u}=ue(),{storyId:c}=ve();a.useEffect(()=>{n(e?"manual":"initial")},[e]);let f=E=>{n("ran"),l(E),setTimeout(()=>{r==="ran"&&n("ready")},900)},p=k(()=>{n("running")},[]),d=k(E=>{n("error"),i(E)},[]),m=Z({[H.RUNNING]:p,[H.RESULT]:f,[H.ERROR]:d}),o=k(()=>{n("running"),m(H.MANUAL,c)},[c]),y=j(()=>[{title:"Run test",onClick:o}],[o]),b=j(()=>[{title:r==="ready"?"Rerun tests":a.createElement(a.Fragment,null,a.createElement(Je,{icon:"check"})," Tests completed"),onClick:o}],[r,o]),T=j(()=>{let{passes:E,incomplete:R,violations:_}=u;return[{label:a.createElement(dn,null,_.length," Violations"),panel:a.createElement(se,{items:_,type:0,empty:"No accessibility violations found."}),items:_,type:0},{label:a.createElement(un,null,E.length," Passes"),panel:a.createElement(se,{items:E,type:1,empty:"No accessibility checks passed."}),items:E,type:1},{label:a.createElement(mn,null,R.length," Incomplete"),panel:a.createElement(se,{items:R,type:2,empty:"No accessibility checks incomplete."}),items:R,type:2}]},[u]);return a.createElement(a.Fragment,null,r==="initial"&&a.createElement(X,null,"Initializing..."),r==="manual"&&a.createElement(a.Fragment,null,a.createElement(X,null,"Manually run the accessibility scan."),a.createElement(ee,{key:"actionbar",actionItems:y})),r==="running"&&a.createElement(X,null,a.createElement(sn,{icon:"sync"})," Please wait while the accessibility scan is running ..."),(r==="ready"||r==="ran")&&a.createElement(a.Fragment,null,a.createElement(xe,{vertical:!0,horizontal:!0},a.createElement(cn,{key:"tabs",tabs:T})),a.createElement(ee,{key:"actionbar",actionItems:b})),r==="error"&&a.createElement(X,null,"The accessibility scan encountered an error.",a.createElement("br",null),typeof t=="string"?t:JSON.stringify(t)))},pn=()=>{let[e]=J(I),r=e?.violations?.length||0,n=e?.incomplete?.length||0,t=r+n;return a.createElement("div",null,a.createElement(Ce,{col:1},a.createElement("span",{style:{display:"inline-block",verticalAlign:"middle"}},"Accessibility"),t===0?"":a.createElement(te,{status:"neutral"},t)))};F.register(I,e=>{F.add(q,{title:"",type:Q.TOOL,match:({viewMode:r})=>r==="story",render:()=>a.createElement(Or,null)}),F.add(q,{title:pn,type:Q.PANEL,render:({active:r=!0})=>a.createElement(Mr,{active:r},a.createElement(fn,null)),paramKey:fe})});
}catch(e){ console.error("[Storybook] One of your manager-entries failed: " + import.meta.url, e); }
