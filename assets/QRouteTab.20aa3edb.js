import{ag as r,ct as n,cF as c,cG as i,cu as l,cH as b,ao as m,ap as T}from"./index.094a6fb0.js";var v=r({name:"QRouteTab",props:{...n,...c},emits:i,setup(e,{slots:t,emit:s}){const a=l({useDisableForRouterLinkProps:!1}),{renderTab:o,$tabs:u}=b(e,t,s,{exact:m(()=>e.exact),...a});return T(()=>`${e.name} | ${e.exact} | ${(a.resolvedLink.value||{}).href}`,()=>{u.verifyRouteModel()}),()=>o(a.linkTag.value,a.linkAttrs.value)}});export{v as Q};