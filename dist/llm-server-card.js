/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3 = globalThis, e$4 = t$3.ShadowRoot && (void 0 === t$3.ShadyCSS || t$3.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$3 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$4 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$4.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$4.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$3("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$4 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$3(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$4) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$3.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$4 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$3, defineProperty: e$3, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i3 = t2;
  switch (s2) {
    case Boolean:
      i3 = null !== t2;
      break;
    case Number:
      i3 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i3 = JSON.parse(t2);
      } catch (t3) {
        i3 = null;
      }
  }
  return i3;
} }, f$1 = (t2, s2) => !i$3(t2, s2), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ??= Symbol("metadata"), a$1.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ??= []).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b$1) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i3 = Symbol(), h2 = this.getPropertyDescriptor(t2, i3, s2);
      void 0 !== h2 && e$3(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i3) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2?.call(this);
      r2?.call(this, s3), this.requestUpdate(t2, h2, i3);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$2(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$3(t3)];
      for (const i3 of s2) this.createProperty(i3, t3[i3]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i3] of s2) this.elementProperties.set(t3, i3);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i3 = this._$Eu(t3, s2);
      void 0 !== i3 && this._$Eh.set(i3, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i3 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i3.unshift(c$2(s3));
    } else void 0 !== s2 && i3.push(c$2(s2));
    return i3;
  }
  static _$Eu(t2, s2) {
    const i3 = s2.attribute;
    return false === i3 ? void 0 : "string" == typeof i3 ? i3 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t2) => t2(this));
  }
  addController(t2) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t2), void 0 !== this.renderRoot && this.isConnected && t2.hostConnected?.();
  }
  removeController(t2) {
    this._$EO?.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i3 of s2.keys()) this.hasOwnProperty(i3) && (t2.set(i3, this[i3]), delete this[i3]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t2) => t2.hostConnected?.());
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t2) => t2.hostDisconnected?.());
  }
  attributeChangedCallback(t2, s2, i3) {
    this._$AK(t2, i3);
  }
  _$ET(t2, s2) {
    const i3 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i3);
    if (void 0 !== e2 && true === i3.reflect) {
      const h2 = (void 0 !== i3.converter?.toAttribute ? i3.converter : u$1).toAttribute(s2, i3.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    const i3 = this.constructor, e2 = i3._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i3.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== t3.converter?.fromAttribute ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? this._$Ej?.get(e2) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i3, e2 = false, h2) {
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e2 && (h2 = this[t2]), i3 ??= r2.getPropertyOptions(t2), !((i3.hasChanged ?? f$1)(h2, s2) || i3.useDefault && i3.reflect && h2 === this._$Ej?.get(t2) && !this.hasAttribute(r2._$Eu(t2, i3)))) return;
      this.C(t2, s2, i3);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i3, reflect: e2, wrapped: h2 }, r2) {
    i3 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i3 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i3] of t3) {
        const { wrapped: t4 } = i3, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i3, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), this._$EO?.forEach((t3) => t3.hostUpdate?.()), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    this._$EO?.forEach((t3) => t3.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq &&= this._$Eq.forEach((t3) => this._$ET(t3, this[t3])), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1?.({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ??= []).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2 = globalThis, i$2 = (t2) => t2, s$1 = t$2.trustedTypes, e$2 = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$1 = "?" + o$2, r$2 = `<${n$1}>`, l = document, c = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof t2?.[Symbol.iterator], f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i3, ...s2) => ({ _$litType$: t2, strings: i3, values: s2 }), b = x(1), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i3) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e$2 ? e$2.createHTML(i3) : i3;
}
const N = (t2, i3) => {
  const s2 = t2.length - 1, e2 = [];
  let n3, l2 = 2 === i3 ? "<svg>" : 3 === i3 ? "<math>" : "", c2 = v;
  for (let i4 = 0; i4 < s2; i4++) {
    const s3 = t2[i4];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s3.length && (c2.lastIndex = f2, u2 = c2.exec(s3), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i4 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$2 + x2) : s3 + o$2 + (-2 === d2 ? i4 : x2);
  }
  return [V(t2, l2 + (t2[s2] || "<?>") + (2 === i3 ? "</svg>" : 3 === i3 ? "</math>" : "")), e2];
};
class S {
  constructor({ strings: t2, _$litType$: i3 }, e2) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i3);
    if (this.el = S.createElement(f2, e2), P.currentNode = this.el.content, 2 === i3 || 3 === i3) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i4 = v2[a2++], s2 = r2.getAttribute(t3).split(o$2), e3 = /([.?@])?(.*)/.exec(i4);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$2) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$2), i4 = t3.length - 1;
          if (i4 > 0) {
            r2.textContent = s$1 ? s$1.emptyScript : "";
            for (let s2 = 0; s2 < i4; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i4], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$1) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$2, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$2.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i3) {
    const s2 = l.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i3, s2 = t2, e2) {
  if (i3 === E) return i3;
  let h2 = void 0 !== e2 ? s2._$Co?.[e2] : s2._$Cl;
  const o2 = a(i3) ? void 0 : i3._$litDirective$;
  return h2?.constructor !== o2 && (h2?._$AO?.(false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ??= [])[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i3 = M(t2, h2._$AS(t2, i3.values), h2, e2)), i3;
}
class R {
  constructor(t2, i3) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i3;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i3 }, parts: s2 } = this._$AD, e2 = (t2?.creationScope ?? l).importNode(i3, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i4;
        2 === r2.type ? i4 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i4 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i4 = new Z(h2, this, t2)), this._$AV.push(i4), r2 = s2[++n3];
      }
      o2 !== r2?.index && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e2;
  }
  p(t2) {
    let i3 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i3), i3 += s2.strings.length - 2) : s2._$AI(t2[i3])), i3++;
  }
}
class k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t2, i3, s2, e2) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i3, this._$AM = s2, this.options = e2, this._$Cv = e2?.isConnected ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i3 = this._$AM;
    return void 0 !== i3 && 11 === t2?.nodeType && (t2 = i3.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i3 = this) {
    t2 = M(this, t2, i3), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    const { values: i3, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = S.createElement(V(s2.h, s2.h[0]), this.options)), s2);
    if (this._$AH?._$AD === e2) this._$AH.p(i3);
    else {
      const t3 = new R(e2, this), s3 = t3.u(this.options);
      t3.p(i3), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i3 = C.get(t2.strings);
    return void 0 === i3 && C.set(t2.strings, i3 = new S(t2)), i3;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i3 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i3.length ? i3.push(s2 = new k(this.O(c()), this.O(c()), this, this.options)) : s2 = i3[e2], s2._$AI(h2), e2++;
    e2 < i3.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i3.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, s2) {
    for (this._$AP?.(false, true, s2); t2 !== this._$AB; ) {
      const s3 = i$2(t2).nextSibling;
      i$2(t2).remove(), t2 = s3;
    }
  }
  setConnected(t2) {
    void 0 === this._$AM && (this._$Cv = t2, this._$AP?.(t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i3, s2, e2, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i3, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = A;
  }
  _$AI(t2, i3 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i3, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i3, n3), r2 === E && (r2 = this._$AH[n3]), o2 ||= !a(r2) || r2 !== this._$AH[n3], r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i3, s2, e2, h2) {
    super(t2, i3, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i3 = this) {
    if ((t2 = M(this, t2, i3, 0) ?? A) === E) return;
    const s2 = this._$AH, e2 = t2 === A && s2 !== A || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== A && (s2 === A || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i3, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t$2.litHtmlPolyfillSupport;
B?.(S, k), (t$2.litHtmlVersions ??= []).push("3.3.3");
const D = (t2, i3, s2) => {
  const e2 = s2?.renderBefore ?? i3;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = s2?.renderBefore ?? null;
    e2._$litPart$ = h2 = new k(i3.insertBefore(c(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
let i$1 = class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t2 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t2.firstChild, t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i$1._$litElement$ = true, i$1["finalized"] = true, s.litElementHydrateSupport?.({ LitElement: i$1 });
const o$1 = s.litElementPolyfillSupport;
o$1?.({ LitElement: i$1 });
(s.litElementVersions ??= []).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1 = (t2) => (e2, o2) => {
  void 0 !== o2 ? o2.addInitializer(() => {
    customElements.define(t2, e2);
  }) : customElements.define(t2, e2);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i3 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i3);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i3, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = { ATTRIBUTE: 1 }, e$1 = (t2) => (...e2) => ({ _$litDirective$: t2, values: e2 });
class i2 {
  constructor(t2) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t2, e2, i3) {
    this._$Ct = t2, this._$AM = e2, this._$Ci = i3;
  }
  _$AS(t2, e2) {
    return this.update(t2, e2);
  }
  update(t2, e2) {
    return this.render(...e2);
  }
}
/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e = e$1(class extends i2 {
  constructor(t$12) {
    if (super(t$12), t$12.type !== t.ATTRIBUTE || "class" !== t$12.name || t$12.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t2) {
    return " " + Object.keys(t2).filter((s2) => t2[s2]).join(" ") + " ";
  }
  update(s2, [i3]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s2.strings && (this.nt = new Set(s2.strings.join(" ").split(/\s/).filter((t2) => "" !== t2)));
      for (const t2 in i3) i3[t2] && !this.nt?.has(t2) && this.st.add(t2);
      return this.render(i3);
    }
    const r2 = s2.element.classList;
    for (const t2 of this.st) t2 in i3 || (r2.remove(t2), this.st.delete(t2));
    for (const t2 in i3) {
      const s3 = !!i3[t2];
      s3 === this.st.has(t2) || this.nt?.has(t2) || (s3 ? (r2.add(t2), this.st.add(t2)) : (r2.remove(t2), this.st.delete(t2)));
    }
    return E;
  }
});
const cardStyles = i$4`
  /* === Card container === */
  ha-card {
    padding: 0;
    overflow: hidden;
    font-family: var(--paper-font-common-base, 'Roboto', sans-serif);
    background: var(--card-background-color, var(--primary-background-color, #ffffff));
  }

  /* === Header === */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
    line-height: 1;
  }

  .header-title ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color, #03a9f4);
    width: 20px;
    height: 20px;
    min-width: 20px;
    flex-shrink: 0;
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    color: var(--secondary-text-color, #757575);
  }

  .header-time {
    font-size: 0.7rem;
    color: var(--secondary-text-color, #757575);
    opacity: 0.7;
  }

  /* === Server metrics grid === */
  .server-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .server-metric-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .server-metric-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
  }

  .server-metric-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    flex-shrink: 0;
  }

  .server-metric-icon ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--secondary-text-color, #757575);
  }

  .server-metric-label {
    color: var(--secondary-text-color, #757575);
    min-width: 32px;
  }

  .server-metric-value {
    margin-left: auto;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  .server-metric-value.warning {
    color: #ff9800;
  }

  .server-metric-value.critical {
    color: #f44336;
  }

  .server-metric-track {
    height: 6px;
    background: var(--divider-color, rgba(0, 0, 0, 0.08));
    border-radius: 3px;
    overflow: hidden;
  }

  .server-metric-fill {
    height: 100%;
    background: var(--primary-color, #03a9f4);
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .server-metric-fill.warning {
    background: #ff9800;
  }

  .server-metric-fill.critical {
    background: #f44336;
  }

  /* === Services grid === */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
    padding: 12px 16px 16px;
  }

  .services-grid.compact {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 8px;
    padding: 8px 16px 12px;
  }

  /* === Service card - Mushroom style === */
  .service-card {
    position: relative;
    background: var(--card-secondary-background-color, var(--secondary-background-color, #f5f5f5));
    border-radius: 12px;
    padding: 14px;
    border-left: 4px solid var(--service-color, var(--primary-color, #03a9f4));
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.3s ease;
    animation: card-fade-in 0.3s ease-out;
  }

  @keyframes card-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .service-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  /* === Service header with icon circle === */
  .service-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    cursor: pointer;
    user-select: none;
  }

  .service-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .service-header-right ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .service-chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    min-width: 20px;
    color: var(--secondary-text-color, #757575);
    transition: transform 0.2s ease;
  }

  .service-chevron.expanded {
    transform: rotate(180deg);
  }

  /* === Service body (expand/collapse) === */
  .service-body {
    overflow: hidden;
    transition:
      max-height 0.3s ease,
      opacity 0.25s ease;
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  }

  .service-body.expanded {
    max-height: 600px;
    opacity: 1;
    pointer-events: auto;
  }

  .service-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .service-icon-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: color-mix(
      in srgb,
      var(--service-color, var(--primary-color, #03a9f4)) 15%,
      transparent
    );
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .service-icon-circle ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--service-color, var(--primary-color, #03a9f4));
    width: 20px;
    height: 20px;
  }

  .service-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
    line-height: 1.2;
  }

  .service-subtitle {
    font-size: 0.75rem;
    color: var(--secondary-text-color, #757575);
    margin-top: 2px;
  }

  /* === Status indicator === */
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 12px;
    transition:
      background 0.3s ease,
      transform 0.3s ease;
  }

  .status-indicator.flash {
    animation: status-flash 0.6s ease-out;
  }

  @keyframes status-flash {
    0% {
      transform: scale(1);
    }
    15% {
      transform: scale(1.25);
    }
    40% {
      transform: scale(0.95);
    }
    70% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .status-indicator.running {
    background: color-mix(in srgb, #4caf50 12%, transparent);
    color: #4caf50;
  }

  .status-indicator.stopped {
    background: color-mix(in srgb, #f44336 12%, transparent);
    color: #f44336;
  }

  .status-indicator.restarting {
    background: color-mix(in srgb, #ff9800 12%, transparent);
    color: #ff9800;
  }

  .status-indicator.starting {
    background: color-mix(in srgb, #03a9f4 12%, transparent);
    color: #03a9f4;
  }

  .status-indicator.unknown {
    background: color-mix(in srgb, #9e9e9e 12%, transparent);
    color: #9e9e9e;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-dot.running {
    background: #4caf50;
    animation: status-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 6px color-mix(in srgb, #4caf50 60%, transparent);
  }

  .status-dot.stopped {
    background: #f44336;
  }

  .status-dot.restarting {
    background: #ff9800;
    animation: status-pulse 1s ease-in-out infinite;
  }

  .status-dot.starting {
    background: #03a9f4;
    animation: status-pulse 1s ease-in-out infinite;
  }

  .status-dot.unknown {
    background: #9e9e9e;
  }

  @keyframes status-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.85);
    }
  }

  /* === Model badge === */
  .model-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: var(--secondary-text-color, #757575);
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 8%, transparent);
    padding: 2px 8px;
    border-radius: 8px;
    margin-top: 8px;
  }

  .model-badge ha-icon {
    width: 24px;
    height: 24px;
  }

  /* === Metrics container === */
  .metrics-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 10px 0;
  }

  /* === Performance section === */
  .perf-section {
    margin: 10px 0 0;
    padding-top: 10px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  .perf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .perf-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    padding: 6px 8px;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 6%, transparent);
    border-radius: 8px;
  }

  .perf-info.warning {
    background: color-mix(in srgb, #ff9800 12%, transparent);
  }

  .perf-info ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    min-width: 16px;
    color: var(--primary-color, #03a9f4);
    flex-shrink: 0;
  }

  .perf-info .perf-label {
    color: var(--secondary-text-color, #757575);
    font-size: 0.75rem;
  }

  .perf-info.warning ha-icon {
    color: #ff9800;
  }

  .perf-label {
    color: var(--secondary-text-color, #757575);
  }

  .perf-value {
    margin-left: auto;
    font-weight: 600;
    color: var(--primary-text-color, #212121);
  }

  .perf-bar {
    grid-column: 1 / -1;
  }

  /* === Metric row - Mushroom gauge style === */
  .metric-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
  }

  .metric-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    min-width: 16px;
    flex-shrink: 0;
  }

  .metric-icon-wrap ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    color: var(--secondary-text-color, #757575);
  }

  .metric-label {
    min-width: 36px;
    color: var(--secondary-text-color, #757575);
  }

  .metric-value {
    margin-left: auto;
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  .metric-track {
    height: 6px;
    background: var(--divider-color, rgba(0, 0, 0, 0.08));
    border-radius: 3px;
    overflow: hidden;
  }

  .metric-fill {
    height: 100%;
    border-radius: 3px;
    transition:
      width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.4s ease;
  }

  .metric-fill.normal {
    background: linear-gradient(90deg, var(--primary-color, #03a9f4), #4caf50);
  }

  .metric-fill.warning {
    background: linear-gradient(90deg, var(--primary-color, #03a9f4), #ff9800);
  }

  .metric-fill.critical {
    background: linear-gradient(90deg, #ff9800, #f44336);
  }

  /* === Info row (TPS, context) === */
  .info-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    color: var(--secondary-text-color, #757575);
    padding: 4px 0;
  }

  .info-row ha-icon {
    width: 24px;
    height: 24px;
    color: var(--primary-color, #03a9f4);
  }

  .info-value {
    font-weight: 500;
    color: var(--primary-text-color, #212121);
  }

  /* === Info grid (multiple info items) === */
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 12px;
    margin: 8px 0;
  }

  /* === Action buttons - Mushroom chip style === */
  .service-actions {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.08));
  }

  .action-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 16px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 10%, transparent);
    color: var(--primary-color, #03a9f4);
  }

  .action-chip:hover {
    background: color-mix(in srgb, var(--primary-color, #03a9f4) 20%, transparent);
    transform: scale(1.05);
  }

  .action-chip:active {
    transform: scale(0.95);
  }

  .action-chip:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  .action-chip.danger {
    background: color-mix(in srgb, #f44336 10%, transparent);
    color: #f44336;
  }

  .action-chip.danger:hover {
    background: color-mix(in srgb, #f44336 20%, transparent);
  }

  .action-chip.warning {
    background: color-mix(in srgb, #ff9800 10%, transparent);
    color: #ff9800;
  }

  .action-chip.warning:hover {
    background: color-mix(in srgb, #ff9800 20%, transparent);
  }

  /* === Uptime === */
  .service-uptime {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 0.75rem;
    color: var(--secondary-text-color, #757575);
  }

  .service-uptime ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .entity-warning {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 16px !important;
    height: 16px !important;
    color: #ff9800 !important;
    margin-left: 4px;
    flex-shrink: 0;
  }

  /* === Loading state === */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    border-top-color: var(--primary-color, #03a9f4);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* === Empty state === */
  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--secondary-text-color, #757575);
  }

  /* === Refresh button === */
  .refresh-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    color: var(--secondary-text-color, #757575);
    transition:
      color 0.2s ease,
      transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .refresh-btn ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }

  .refresh-btn:hover {
    color: var(--primary-color, #03a9f4);
  }

  .refresh-btn.spinning ha-icon {
    animation: spin 1s linear infinite;
  }

  /* === Toast notification === */
  .card-toast {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    margin: 8px 12px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 500;
    animation: toast-fade-in 0.3s ease-out;
  }

  .card-toast ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .card-toast.success {
    background: color-mix(in srgb, #4caf50 12%, transparent);
    color: #4caf50;
  }

  .card-toast.success ha-icon {
    color: #4caf50;
  }

  .card-toast.error {
    background: color-mix(in srgb, #f44336 12%, transparent);
    color: #f44336;
  }

  .card-toast.error ha-icon {
    color: #f44336;
  }

  @keyframes toast-fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const CARD_NAME = "llm-server-card";
const EDITOR_NAME = "llm-server-card-editor";
const DEFAULT_REFRESH_INTERVAL = 30;
const CARD_VERSION = "2026-08-07-15:15:06";
function getMetricColorClass(value) {
  if (value >= 90) return "critical";
  if (value >= 75) return "warning";
  return "normal";
}
function getServiceIcon(name) {
  const lower = name.toLowerCase();
  if (lower.includes("vllm") || lower.includes("llm")) return "mdi:robot";
  if (lower.includes("ollama")) return "mdi:brain";
  if (lower.includes("diffusion") || lower.includes("comfy")) return "mdi:image";
  if (lower.includes("llama")) return "mdi:lambda";
  return "mdi:server";
}
function isValidService(service) {
  return !!service && service.includes(".");
}
function parseService(service) {
  const [domain, svc] = service.split(".");
  return { domain, service: svc };
}
function formatUptime(seconds) {
  if (seconds < 0) return "Unknown";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor(seconds % 86400 / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
const translations = {
  en: {
    status: {
      running: "Running",
      stopped: "Stopped",
      starting: "Starting",
      restarting: "Restarting",
      unknown: "Unknown"
    },
    card: {
      empty: "No services configured",
      refresh: "Refresh",
      now: "now",
      seconds_ago: "{n}s ago",
      minutes_ago: "{n}m ago"
    },
    toast: {
      start: "{name}: Start",
      stop: "{name}: Stop",
      restart: "{name}: Restart",
      failed: "Failed: {name}"
    },
    action: {
      start: "Start",
      stop: "Stop",
      restart: "Restart",
      logs: "Logs"
    },
    perf: {
      running: "Running",
      waiting: "Waiting",
      tok_iter: "Gen tok/s",
      ttft: "TTFT",
      itl: "ITL"
    },
    metric: {
      gpu: "GPU",
      ram: "RAM",
      temp: "Temp"
    }
  },
  fr: {
    status: {
      running: "Actif",
      stopped: "Arrêté",
      starting: "Démarrage",
      restarting: "Redémarrage",
      unknown: "Inconnu"
    },
    card: {
      empty: "Aucun service configuré",
      refresh: "Actualiser",
      now: "maintenant",
      seconds_ago: "il y a {n}s",
      minutes_ago: "il y a {n}min"
    },
    toast: {
      start: "{name} : Démarrage",
      stop: "{name} : Arrêt",
      restart: "{name} : Redémarrage",
      failed: "Échec : {name}"
    },
    action: {
      start: "Démarrer",
      stop: "Arrêter",
      restart: "Redémarrer",
      logs: "Logs"
    },
    perf: {
      running: "En cours",
      waiting: "En attente",
      tok_iter: "Gen tok/s",
      ttft: "TTFT",
      itl: "ITL"
    },
    metric: {
      gpu: "GPU",
      ram: "Mémoire",
      temp: "Temp"
    }
  }
};
function getLocale(hassLanguage) {
  if (hassLanguage && hassLanguage.toLowerCase().startsWith("fr")) return "fr";
  return "en";
}
function formatMessage(messages, category, key, params) {
  const msg = messages[category]?.[key] ?? key;
  if (!params) return msg;
  return msg.replace(/\{(.*?)\}/g, (_2, k2) => String(params[k2] ?? `{${k2}}`));
}
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i3 = decorators.length - 1, decorator; i3 >= 0; i3--)
    if (decorator = decorators[i3])
      result = decorator(result) || result;
  return result;
};
function defaultServer() {
  return { name: "Inference Server" };
}
function defaultService(index) {
  return { name: `Service ${index}` };
}
function defaultOptions() {
  return {
    show_server_metrics: true,
    show_gpu: true,
    show_ram: true,
    show_temp: true,
    show_uptime: true,
    show_model: true,
    show_actions: true,
    show_performance: true,
    show_running: true,
    show_waiting: true,
    show_tok_iter: true,
    show_ttft: true,
    show_itl: true,
    refresh_interval: 30,
    compact: false
  };
}
function customElement(name) {
  return function(cls) {
    if (!customElements.get(name)) customElements.define(name, cls);
    return cls;
  };
}
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
let LlmServerCardEditor = class extends HTMLElement {
  /* ── Constructor ─────────────────────────────── */
  constructor() {
    super();
    this._config = { type: "" };
    this._container = null;
    this._expandedServices = /* @__PURE__ */ new Set();
    this._serviceTabs = /* @__PURE__ */ new Map();
    this._lastConfigId = 0;
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = this.styles();
    this.shadowRoot.appendChild(style);
    const container = document.createElement("div");
    container.className = "form";
    this.shadowRoot.appendChild(container);
    this._container = container;
  }
  /* ── setConfig (called by HA on every edit) ──── */
  setConfig(config) {
    this._lastConfigId++;
    const cloned = deepClone(config);
    if (!cloned.server) cloned.server = defaultServer();
    if (!Array.isArray(cloned.services) || cloned.services.length === 0) {
      cloned.services = [defaultService(1)];
      this._expandedServices.clear();
      this._expandedServices.add(0);
      this._serviceTabs.clear();
      this._serviceTabs.set(0, "basic");
    } else {
      cloned.services.forEach((_2, i3) => {
        if (!this._expandedServices.has(i3) && !this._serviceTabs.has(i3)) {
          this._expandedServices.add(i3);
          this._serviceTabs.set(i3, "basic");
        }
      });
    }
    if (!cloned.options) cloned.options = defaultOptions();
    if (!cloned.server.metrics) {
      cloned.server.metrics = {};
    }
    this._config = cloned;
    this._render();
  }
  /* ── Paul's Frontend API ─────────────────────── */
  static async getConfigElement() {
    if (!customElements.get(EDITOR_NAME)) {
      customElements.define(EDITOR_NAME, LlmServerCardEditor);
    }
    return document.createElement(EDITOR_NAME);
  }
  static getStubConfig() {
    return {
      type: `custom:${EDITOR_NAME}`,
      server: defaultServer(),
      services: [defaultService(1)],
      options: defaultOptions()
    };
  }
  /* ── Mutation helpers ────────────────────────── */
  // Mutate this._config immutably, emit config-changed.
  // HA will call setConfig again with a fresh frozen copy.
  _setOption(key, value) {
    this._config.options = { ...this._config.options, [key]: value };
    this._fireConfigChanged();
  }
  _setServer(key, value) {
    this._config.server = { ...this._config.server, [key]: value };
    this._fireConfigChanged();
  }
  _setServerMetric(key, value) {
    this._config.server.metrics = {
      ...this._config.server.metrics,
      [key]: value
    };
    this._fireConfigChanged();
  }
  _setService(idx, key, value) {
    const services = [...this._config.services];
    services[idx] = { ...services[idx], [key]: value };
    this._config.services = services;
    this._fireConfigChanged();
  }
  /* ── Rendering ───────────────────────────────── */
  _render() {
    const container = this._container;
    if (!container) return;
    const c2 = this._config;
    if (!c2 || Object.keys(c2).length === 0) {
      container.textContent = "Loading...";
      return;
    }
    container.innerHTML = "";
    container.appendChild(this._section("Server"));
    const server = c2.server || defaultServer();
    container.appendChild(
      this._makeField("Server name", server.name ?? "", (v2) => this._setServer("name", v2))
    );
    container.appendChild(
      this._makeField(
        "Server IP (optional)",
        server.ip ?? "",
        (v2) => this._setServer("ip", v2)
      )
    );
    const metrics = server.metrics || {};
    container.appendChild(this._section("Server Metrics (shared across services)", true));
    [
      ["gpu_entity", "GPU entity"],
      ["memory_entity", "Memory entity"],
      ["temperature_entity", "Temperature entity"]
    ].forEach(([key, lbl]) => {
      container.appendChild(
        this._entityField(lbl, String(metrics[key] ?? ""), (v2) => this._setServerMetric(key, v2), ["sensor"])
      );
    });
    container.appendChild(this._section("Services"));
    const services = c2.services || [];
    services.forEach((svc, idx) => {
      container.appendChild(this._renderServiceEditor(svc, idx, services.length));
    });
    container.appendChild(this._addServiceBtn());
    const opts = c2.options || defaultOptions();
    container.appendChild(this._section("Display Options"));
    container.appendChild(
      this._makeField(
        "Refresh interval (s)",
        String(opts.refresh_interval ?? 30),
        (v2) => this._setOption("refresh_interval", Number(v2) > 0 ? Number(v2) : 30)
      )
    );
    container.appendChild(this._section("Server Metrics"));
    const smDiv = document.createElement("div");
    smDiv.className = "grid";
    [
      ["show_server_metrics", "GPU / RAM / Temp"],
      ["show_gpu", "GPU"],
      ["show_ram", "RAM"],
      ["show_temp", "Temperature"]
    ].forEach(([key, label]) => {
      smDiv.appendChild(
        this._makeToggle(key, label, opts[key], (v2) => this._setOption(key, v2))
      );
    });
    container.appendChild(smDiv);
    container.appendChild(this._section("Service Display"));
    const sdDiv = document.createElement("div");
    sdDiv.className = "grid";
    [
      ["show_model", "Model"],
      ["show_uptime", "Uptime"],
      ["show_actions", "Actions"]
    ].forEach(([key, label]) => {
      sdDiv.appendChild(
        this._makeToggle(key, label, opts[key], (v2) => this._setOption(key, v2))
      );
    });
    container.appendChild(sdDiv);
    container.appendChild(this._section("Performance Metrics"));
    const pfDiv = document.createElement("div");
    pfDiv.className = "grid";
    [
      ["show_performance", "Performance"],
      ["show_running", "Running"],
      ["show_waiting", "Waiting"],
      ["show_ttft", "TTFT"],
      ["show_itl", "ITL"],
      ["show_tok_iter", "Gen tok/s"]
    ].forEach(([key, label]) => {
      pfDiv.appendChild(
        this._makeToggle(key, label, opts[key], (v2) => this._setOption(key, v2))
      );
    });
    container.appendChild(pfDiv);
    container.appendChild(this._helpBox());
  }
  /* ── Service editor ──────────────────────────── */
  _renderServiceEditor(service, index, total) {
    const expanded = this._expandedServices.has(index);
    const activeTab = this._serviceTabs.get(index) ?? "basic";
    const wrapper = document.createElement("div");
    wrapper.className = "sub-section";
    const header = document.createElement("div");
    header.className = "service-header";
    header.addEventListener("click", (e2) => {
      if (e2.target.closest(".btn-remove")) return;
      this._toggleServiceExpand(index);
      this._render();
    });
    const left = document.createElement("div");
    left.className = "service-header-left";
    const chevron = document.createElement("span");
    chevron.className = "service-chevron" + (expanded ? " open" : "");
    chevron.textContent = "▼";
    left.appendChild(chevron);
    const nameSpan = document.createElement("span");
    nameSpan.className = "service-title-text";
    nameSpan.dataset.serviceName = String(index);
    nameSpan.textContent = service.name || `Service ${index + 1}`;
    nameSpan.addEventListener("dblclick", (e2) => {
      e2.stopPropagation();
      this._editNameInline(nameSpan, service, index);
    });
    left.appendChild(nameSpan);
    header.appendChild(left);
    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "✕";
    removeBtn.disabled = total === 1;
    removeBtn.style.opacity = total === 1 ? "0.3" : "1";
    removeBtn.addEventListener("click", (e2) => {
      e2.stopPropagation();
      const services = [...this._config.services];
      services.splice(index, 1);
      this._config.services = services;
      this._expandedServices.delete(index);
      this._serviceTabs.delete(index);
      this._remapServiceState(index);
      this._fireConfigChanged();
      this._render();
    });
    header.appendChild(removeBtn);
    wrapper.appendChild(header);
    if (expanded) {
      const body = document.createElement("div");
      body.className = "service-body";
      body.appendChild(this._tabs(index, activeTab));
      let tabContent;
      switch (activeTab) {
        case "basic":
          tabContent = this._tabBasic(service, index);
          break;
        case "entities":
          tabContent = this._tabEntities(service, index);
          break;
        case "actions":
          tabContent = this._tabActions(service, index);
          break;
        default:
          tabContent = this._tabBasic(service, index);
      }
      body.appendChild(tabContent);
      wrapper.appendChild(body);
    }
    return wrapper;
  }
  _editNameInline(span, service, idx) {
    if (!span.parentElement) return;
    const parent = span.parentElement;
    parent.removeChild(span);
    const useHa = customElements.get("ha-textfield");
    if (useHa) {
      const tf = document.createElement("ha-textfield");
      tf.value = service.name || "";
      tf.setAttribute("fullwidth", "");
      tf.autofocus = true;
      const finish2 = () => {
        this._setService(idx, "name", tf.value.trim() || `Service ${idx + 1}`);
        this._render();
      };
      tf.addEventListener("change", finish2);
      tf.addEventListener("keydown", (e2) => {
        if (e2.key === "Enter") tf.blur();
        if (e2.key === "Escape") {
          tf.value = service.name || "";
          tf.blur();
        }
      });
      parent.appendChild(tf);
      requestAnimationFrame(() => tf.focus());
      return;
    }
    const input = document.createElement("input");
    input.value = service.name || "";
    input.className = "inline-edit";
    const finish = () => {
      this._setService(idx, "name", input.value.trim() || `Service ${idx + 1}`);
      this._render();
    };
    input.addEventListener("blur", finish);
    input.addEventListener("keydown", (e2) => {
      if (e2.key === "Enter") input.blur();
      if (e2.key === "Escape") {
        input.value = service.name || "";
        input.blur();
      }
    });
    parent.appendChild(input);
    input.focus();
    input.select();
  }
  _toggleServiceExpand(index) {
    if (this._expandedServices.has(index)) this._expandedServices.delete(index);
    else this._expandedServices.add(index);
  }
  _remapServiceState(removed) {
    const ne = /* @__PURE__ */ new Set();
    for (const i3 of this._expandedServices) {
      if (i3 < removed) ne.add(i3);
      else if (i3 > removed) ne.add(i3 - 1);
    }
    this._expandedServices = ne;
    const nt = /* @__PURE__ */ new Map();
    for (const [i3, tab] of this._serviceTabs) {
      if (i3 < removed) nt.set(i3, tab);
      else if (i3 > removed) nt.set(i3 - 1, tab);
    }
    this._serviceTabs = nt;
  }
  /* ── Tabs ──────────────────────────────────── */
  _tabs(index, active) {
    const tabContainer = document.createElement("div");
    tabContainer.className = "tabs";
    [
      ["basic", "Basic"],
      ["entities", "Entities"],
      ["actions", "Actions"]
    ].forEach(([key, label]) => {
      const tab = document.createElement("div");
      tab.className = "tab" + (active === key ? " active" : "");
      tab.textContent = label;
      tab.addEventListener("click", () => {
        this._serviceTabs.set(index, key);
        this._render();
      });
      tabContainer.appendChild(tab);
    });
    return tabContainer;
  }
  /* ── Tab: Basic ───────────────────────────── */
  _tabBasic(service, idx) {
    const container = document.createElement("div");
    container.appendChild(
      this._entityField("Status entity (required)", service.status_entity ?? "", (v2) => this._setService(idx, "status_entity", v2), ["sensor", "binary_sensor"])
    );
    const styleLabel = document.createElement("div");
    styleLabel.className = "label";
    styleLabel.style.cssText = "margin-top:12px;margin-bottom:6px;";
    styleLabel.textContent = "Appearance";
    container.appendChild(styleLabel);
    const styleGrid = document.createElement("div");
    styleGrid.className = "entity-grid";
    [
      ["icon", "Icon (MDI)"],
      ["color", "Color (CSS)"]
    ].forEach(([key, label]) => {
      styleGrid.appendChild(
        this._makeField(
          label,
          service[key] ?? (key === "icon" ? "mdi:server" : "#529cf6"),
          (v2) => this._setService(idx, key, v2)
        )
      );
    });
    container.appendChild(styleGrid);
    return container;
  }
  /* ── Tab: Entities ────────────────────────── */
  _tabEntities(service, idx) {
    const container = document.createElement("div");
    const hint = document.createElement("div");
    hint.className = "label";
    hint.style.marginBottom = "8px";
    hint.textContent = "Entity IDs (leave blank if not needed)";
    container.appendChild(hint);
    const perfLabel = document.createElement("div");
    perfLabel.className = "label";
    perfLabel.style.cssText = "margin-bottom:4px;margin-top:4px;";
    perfLabel.textContent = "Performance";
    container.appendChild(perfLabel);
    const perfGrid = document.createElement("div");
    perfGrid.className = "entity-grid";
    perfGrid.appendChild(
      this._entityField("vLLM metrics entity", service.metrics_entity ?? "", (v2) => this._setService(idx, "metrics_entity", v2), ["sensor"])
    );
    container.appendChild(perfGrid);
    const infoLabel = document.createElement("div");
    infoLabel.className = "label";
    infoLabel.style.cssText = "margin-bottom:4px;margin-top:8px;";
    infoLabel.textContent = "Info";
    container.appendChild(infoLabel);
    const infoGrid = document.createElement("div");
    infoGrid.className = "entity-grid";
    container.appendChild(infoGrid);
    [
      ["model_entity", "Model entity"],
      ["uptime_entity", "Uptime entity"]
    ].forEach(([key, lbl]) => {
      infoGrid.appendChild(
        this._entityField(lbl, service[key] ?? "", (v2) => this._setService(idx, key, v2), ["sensor"])
      );
    });
    return container;
  }
  /* ── Tab: Actions ─────────────────────────── */
  _tabActions(service, idx) {
    const container = document.createElement("div");
    const hint = document.createElement("div");
    hint.className = "label";
    hint.style.marginBottom = "8px";
    hint.textContent = "Service calls (HA service id) — leave blank to hide.";
    container.appendChild(hint);
    const grid = document.createElement("div");
    grid.className = "entity-grid";
    [
      ["start_service", "Start"],
      ["stop_service", "Stop"],
      ["restart_service", "Restart"],
      ["logs_service", "Logs"]
    ].forEach(([key, label]) => {
      grid.appendChild(
        this._serviceField(label, service[key] ?? "", key, (v2) => this._setService(idx, key, v2))
      );
    });
    container.appendChild(grid);
    return container;
  }
  /* ── Add service ───────────────────────────── */
  _addServiceBtn() {
    const btn = document.createElement("button");
    btn.className = "btn-add";
    btn.textContent = "+ Add Service";
    btn.addEventListener("click", () => {
      const services = [...this._config.services];
      const newIdx = services.length;
      services.push(defaultService(newIdx + 1));
      this._config.services = services;
      this._expandedServices.add(newIdx);
      this._serviceTabs.set(newIdx, "basic");
      this._fireConfigChanged();
      this._render();
    });
    return btn;
  }
  /* ── Field builders ────────────────────────── */
  _makeField(label, value, onChange, type = "text") {
    const field = document.createElement("div");
    field.className = "field";
    const haTf = customElements.get("ha-textfield");
    if (haTf) {
      const tf = document.createElement("ha-textfield");
      tf.setAttribute("label", label);
      tf.setAttribute("name", label.toLowerCase().replace(/\s+/g, "-"));
      tf.setAttribute("fullwidth", "");
      tf.value = value;
      if (type === "number") {
        tf.type = "number";
        tf.setAttribute("min", "1");
      }
      tf.addEventListener("change", () => onChange(String(tf.value ?? "")));
      field.appendChild(tf);
      return field;
    }
    const labelEl = document.createElement("label");
    labelEl.className = "label";
    labelEl.textContent = label;
    const input = document.createElement("input");
    input.type = type;
    input.className = "input-fallback";
    input.placeholder = label;
    input.value = value;
    input.addEventListener("change", () => onChange(input.value));
    field.appendChild(labelEl);
    field.appendChild(input);
    return field;
  }
  _entityField(label, value, onChange, filterEntityTypes) {
    const field = document.createElement("div");
    field.className = "field";
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this.hass;
    picker.value = value;
    picker.label = label;
    picker.setAttribute("fullwidth", "");
    if (filterEntityTypes) picker.filterEntityTypes = filterEntityTypes;
    picker.addEventListener("value-changed", () => {
      onChange(Array.isArray(picker.value) ? picker.value[0] || "" : picker.value || "");
    });
    field.appendChild(picker);
    return field;
  }
  _makeSelect(label, values, labels, current, onChange) {
    const field = document.createElement("div");
    field.className = "field";
    const labelEl = document.createElement("label");
    labelEl.className = "label";
    labelEl.textContent = label;
    const select = document.createElement("select");
    select.className = "select-fallback";
    values.forEach((val, i3) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = labels[i3];
      if (val === current) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", () => onChange(select.value));
    field.appendChild(labelEl);
    field.appendChild(select);
    return field;
  }
  _serviceOptions(action) {
    if (!this.hass?.services) return [];
    const out = [];
    const domains = Object.keys(this.hass.services);
    const keyword = action.split("_")[0];
    for (const domain of domains) {
      const methods = Object.keys(this.hass.services[domain]);
      for (const method of methods) {
        if (method.includes(keyword) || domain === keyword) {
          out.push(`${domain}.${method}`);
        }
      }
    }
    return out.sort();
  }
  _serviceField(label, value, action, onChange) {
    const opts = ["", ...this._serviceOptions(action)];
    const lbls = ["—", ...opts.slice(1)];
    return this._makeSelect(label, opts, lbls, value, onChange);
  }
  _makeToggle(key, label, checked, onChange) {
    const div = document.createElement("div");
    const lbl = document.createElement("label");
    lbl.className = "tog-label";
    const sw = document.createElement("ha-switch");
    sw.checked = !!checked;
    sw.addEventListener("change", () => onChange(sw.checked === true));
    const span = document.createElement("span");
    span.textContent = label;
    lbl.appendChild(sw);
    lbl.appendChild(span);
    div.appendChild(lbl);
    return div;
  }
  /* ── Section helpers ───────────────────────── */
  _section(title, sub = false) {
    const div = document.createElement("div");
    div.className = "section";
    if (sub) div.style.fontSize = "0.7rem";
    div.textContent = title;
    return div;
  }
  _helpBox() {
    const div = document.createElement("div");
    div.className = "help-box";
    div.innerHTML = `
      <p style="margin: 0 0 6px 0; font-weight: 600; color: var(--primary-text-color, #000);">
        ℹ️ Configuration Help
      </p>
      <p style="margin: 0 0 4px 0;"><strong>Server:</strong> Define your AI server name.</p>
      <p style="margin: 0 0 4px 0;"><strong>Server Metrics:</strong> Shared metrics (GPU, RAM, temperature) displayed once for all services.</p>
      <p style="margin: 0 0 4px 0;"><strong>Services:</strong> Add each AI service with its associated HA entities.</p>
      <p style="margin: 0 0 4px 0;"><strong>Display Options:</strong> Customize which metrics and info to show.</p>
      <p style="margin: 0; color: var(--secondary-text-color);">Entity IDs can be left blank — the card will show a placeholder when no entity is set.</p>
    `;
    return div;
  }
  _fireConfigChanged() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config: this._config }
      })
    );
  }
  /* ── CSS ───────────────────────────────────── */
  styles() {
    return `
      :host { display: block; font-family: var(--paper-font-body_-_font-family, -apple-system, BlinkMacSystemFont, sans-serif); }
      .form { padding: 8px 0; }
      .section {
        font-size: 0.75rem; font-weight: 600; color: var(--primary-color, #529cf6);
        text-transform: uppercase; letter-spacing: 0.04em; margin: 16px 0 8px 4px;
      }
      .section:first-child { margin-top: 0; }
      .field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; }
      .label {
        font-size: 0.8rem; color: var(--secondary-text-color, #757575); font-weight: 500;
        margin-left: 4px;
      }
      .input-fallback,
      .inline-edit {
        padding: 8px 12px; border-radius: 8px;
        border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 15%, transparent);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        font-size: 0.9rem; font-family: inherit; outline: none;
        transition: border-color 0.15s;
      }
      .input-fallback:focus,
      .inline-edit:focus {
        border-color: var(--primary-color, #529cf6);
      }
      .select-fallback {
        width: 100%; padding: 8px 32px 8px 12px; border-radius: 8px;
        border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 15%, transparent);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color, #000);
        font-size: 0.9rem; font-family: inherit; cursor: pointer; outline: none;
        appearance: none; -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23529cf6' stroke-width='2' fill='none'/%3E%3C/svg%3E");
        background-repeat: no-repeat; background-position: right 12px center;
        transition: border-color 0.15s;
      }
      .select-fallback:focus { border-color: var(--primary-color, #529cf6); }
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-bottom: 8px; }
      .tog-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
      ha-switch.tog-switch { --switch-unchecked-button-color: var(--primary-color, #529cf6); }
      .sub-section {
        margin: 8px 0; padding: 12px;
        border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 10%, transparent);
        border-radius: 8px;
        background: color-mix(in srgb, var(--card-background-color, #fff) 95%, var(--primary-text-color, #000) 5%);
      }
      .service-header {
        display: flex; align-items: center; justify-content: space-between; cursor: pointer;
        padding: 8px 6px;
        background: color-mix(in srgb, var(--card-background-color, #fff) 90%, var(--primary-text-color, #000) 10%);
        border-radius: 8px; border: 1px solid color-mix(in srgb, var(--primary-text-color, #000) 10%, transparent);
        margin-bottom: 4px; transition: background 0.15s;
      }
      .service-header:hover { background: color-mix(in srgb, var(--primary-color, #529cf6) 8%, var(--card-background-color, #fff) 92%); }
      .service-header-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
      .service-chevron { color: var(--primary-color, #529cf6); transition: transform 0.2s; font-size: 1.1rem; }
      .service-chevron.open { transform: rotate(180deg); }
      .service-title-text { flex: 1; font-size: 0.95rem; font-weight: 600; color: var(--primary-text-color, #000); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .service-body { padding: 8px 8px 4px; }
      .tabs { display: flex; gap: 0; margin-bottom: 10px; border-bottom: 2px solid color-mix(in srgb, var(--primary-text-color, #000) 10%, transparent); }
      .tab {
        padding: 6px 14px; font-size: 0.8rem; font-weight: 500; color: var(--secondary-text-color, #888);
        cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px;
        transition: color 0.15s, border-color 0.15s; text-transform: uppercase; letter-spacing: 0.03em;
      }
      .tab:hover { color: var(--primary-color, #529cf6); }
      .tab.active { color: var(--primary-color, #529cf6); border-bottom-color: var(--primary-color, #529cf6); }
      .btn-remove {
        background: color-mix(in srgb, #f44336 15%, transparent); border: none; color: #f44336;
        border-radius: 6px; padding: 6px 12px; font-size: 0.8rem; cursor: pointer; font-weight: 500;
      }
      .btn-remove:hover { background: color-mix(in srgb, #f44336 25%, transparent); }
      .btn-add {
        display: flex; align-items: center; gap: 6px;
        background: color-mix(in srgb, var(--primary-color, #529cf6) 12%, transparent);
        border: 1px solid var(--primary-color, #529cf6); color: var(--primary-color, #529cf6);
        border-radius: 8px; padding: 8px 16px; font-size: 0.85rem; font-weight: 500; cursor: pointer;
        margin-top: 8px; width: 100%; justify-content: center;
      }
      .btn-add:hover { background: color-mix(in srgb, var(--primary-color, #529cf6) 20%, transparent); }
      .help-box {
        margin-top: 16px; padding: 12px;
        background: color-mix(in srgb, var(--primary-color, #529cf6) 6%, transparent);
        border-radius: 8px; font-size: 0.8rem; color: var(--secondary-text-color, #757575); line-height: 1.5;
      }
      .help-box strong { color: var(--primary-text-color, #000); }
      .entity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      ha-entity-picker { min-width: 0; }
      .service-field { margin-bottom: 4px; }
      .service-field ha-combo-box {
        --mdc-typography-overline-font-size: 0.65rem;
        height: 35px;
      }
    `;
  }
};
LlmServerCardEditor = __decorateClass$1([
  customElement(EDITOR_NAME)
], LlmServerCardEditor);
if (!customElements.get(EDITOR_NAME)) {
  customElements.define(EDITOR_NAME, LlmServerCardEditor);
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i3 = decorators.length - 1, decorator; i3 >= 0; i3--)
    if (decorator = decorators[i3])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
console.log(`[llm-server-card] v${CARD_VERSION}`);
let LlmServerCard = class extends i$1 {
  constructor() {
    super(...arguments);
    this._refreshing = false;
    this._lastUpdate = Date.now();
    this._pendingStatuses = /* @__PURE__ */ new Map();
    this._expandedServices = /* @__PURE__ */ new Map();
    this._changedServices = /* @__PURE__ */ new Set();
    this._previousServiceStatuses = /* @__PURE__ */ new Map();
  }
  get _messages() {
    const lang = getLocale(this.hass?.language ?? "");
    return translations[lang] ?? translations.en;
  }
  static getConfigElement() {
    return document.createElement("llm-server-card-editor");
  }
  static getStubConfig(_hass) {
    return {
      type: `custom:${CARD_NAME}`,
      title: "AI Server",
      server: {
        name: "Inference Server"
      },
      services: [
        {
          name: "vLLM",
          status_entity: "sensor.vllm_status",
          start_service: "shell_command.vllm_start",
          stop_service: "shell_command.vllm_stop",
          restart_service: "shell_command.vllm_restart"
        }
      ]
    };
  }
  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    if (!config.server) {
      throw new Error("Server configuration is required");
    }
    if (!config.services || !Array.isArray(config.services)) {
      throw new Error("Services array is required");
    }
    this._config = {
      ...config,
      options: {
        show_server_metrics: true,
        show_gpu: true,
        show_ram: true,
        show_temp: true,
        show_uptime: true,
        show_model: true,
        show_actions: true,
        show_performance: true,
        show_running: true,
        show_waiting: true,
        show_ttft: true,
        show_itl: true,
        show_tok_iter: true,
        refresh_interval: DEFAULT_REFRESH_INTERVAL,
        compact: false,
        ...config.options
      }
    };
    this._setupRefresh();
  }
  getCardSize() {
    if (!this._config) return 1;
    return Math.max(3, this._config.services.length + 1);
  }
  render() {
    if (!this._config || !this.hass) {
      return b``;
    }
    const { server, services, options } = this._config;
    return b`
      <ha-card>
        ${this._renderHeader(server, options)}
        ${server.metrics && options.show_server_metrics !== false ? this._renderServerMetrics(server.metrics, options) : ""}
        ${this._renderServices(services, options)} ${this._toast ? this._renderToast() : ""}
      </ha-card>
    `;
  }
  _renderServerMetric(icon, label, value, fillPct, colorClass) {
    return b`
      <div class="server-metric-item">
        <div class="server-metric-header">
          <span class="server-metric-icon">
            <ha-icon icon="${icon}"></ha-icon>
          </span>
          <span class="server-metric-label">${label}</span>
          <span class="server-metric-value ${colorClass}">${value}</span>
        </div>
        <div class="server-metric-track">
          <div class="server-metric-fill ${colorClass}" style="width: ${fillPct}%"></div>
        </div>
      </div>
    `;
  }
  _renderServerMetrics(metrics, options) {
    const items = [];
    if (options.show_gpu !== false && metrics.gpu_entity) {
      const entity = this.hass?.states[metrics.gpu_entity];
      if (entity) {
        const val = parseFloat(entity.state) || 0;
        const cls = getMetricColorClass(val);
        items.push(
          this._renderServerMetric(
            "mdi:chip",
            this._messages.metric.gpu,
            `${Math.round(val)}%`,
            Math.min(100, val),
            cls
          )
        );
      }
    }
    if (options.show_ram !== false && metrics.memory_entity) {
      const entity = this.hass?.states[metrics.memory_entity];
      if (entity) {
        const val = parseFloat(entity.state) || 0;
        const cls = getMetricColorClass(val);
        items.push(
          this._renderServerMetric(
            "mdi:memory",
            this._messages.metric.ram,
            `${Math.round(val)}%`,
            Math.min(100, val),
            cls
          )
        );
      }
    }
    if (options.show_temp !== false && metrics.temperature_entity) {
      const entity = this.hass?.states[metrics.temperature_entity];
      if (entity) {
        const temp = parseFloat(entity.state) || 0;
        const pct = Math.min(100, temp / 100 * 100);
        const cls = getMetricColorClass(pct);
        items.push(
          this._renderServerMetric(
            "mdi:thermometer",
            this._messages.metric.temp,
            `${Math.round(temp)}°C`,
            pct,
            cls
          )
        );
      }
    }
    if (items.length === 0) return b``;
    return b`<div class="server-metrics-grid">${items}</div>`;
  }
  _renderHeader(server, options) {
    return b`
      <div class="card-header">
        <div class="header-title">
          <ha-icon icon="mdi:server"></ha-icon>
          <span>${server.name}</span>
        </div>
        <div class="header-meta">
          ${server.ip ? b`<span>${server.ip}</span>` : ""}
          <span class="header-time" title="${new Date(this._lastUpdate).toLocaleTimeString()}"
            >${this._formatTimeAgo()}</span
          >
          <button
            class="refresh-btn ${this._refreshing ? "spinning" : ""}"
            @click=${this._handleRefresh}
            title="${this._messages.card.refresh}"
          >
            <ha-icon icon="mdi:refresh"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }
  _formatTimeAgo() {
    const diff = Math.floor((Date.now() - this._lastUpdate) / 1e3);
    if (diff < 5) return this._messages.card.now;
    if (diff < 60) return formatMessage(this._messages, "card", "seconds_ago", { n: String(diff) });
    return formatMessage(this._messages, "card", "minutes_ago", {
      n: String(Math.floor(diff / 60))
    });
  }
  _isServiceExpanded(serviceName, compact) {
    return this._expandedServices.get(serviceName) ?? !compact;
  }
  _toggleService(serviceName) {
    const current = this._expandedServices.get(serviceName);
    this._expandedServices.set(serviceName, current === void 0 ? false : !current);
    this.requestUpdate();
  }
  _isEntityUnavailable(entity) {
    return !entity || entity.state === "unavailable" || entity.state === "unknown";
  }
  _renderServices(services, options) {
    if (!services.length) {
      return b`
        <div class="empty-state">
          <ha-icon icon="mdi:alert-circle" style="font-size: 2rem;"></ha-icon>
          <p>${this._messages.card.empty}</p>
        </div>
      `;
    }
    return b`
      <div class="services-grid ${e({ compact: !!options.compact })}">
        ${services.map((service) => this._renderServiceCard(service, options))}
      </div>
    `;
  }
  _renderServiceCard(service, options) {
    const status = this._getServiceStatus(service);
    const icon = service.icon || getServiceIcon(service.name);
    const modelEntity = service.model_entity ? this.hass?.states[service.model_entity] : void 0;
    const modelFromMetrics = service.metrics_entity ? this.hass?.states[service.metrics_entity]?.attributes?.model : void 0;
    const model = options.show_model !== false ? modelEntity?.state || modelFromMetrics : void 0;
    const expanded = this._isServiceExpanded(service.name, !!options.compact);
    return b`
      <div class="service-card" style="--service-color: ${service.color || "var(--primary-color)"}">
        <div class="service-header" @click=${() => this._toggleService(service.name)}>
          <div class="service-title">
            <div class="service-icon-circle">
              <ha-icon icon="${icon}"></ha-icon>
            </div>
            <div>
              <div class="service-name">${service.name}</div>
              ${model ? b`<div class="service-subtitle">${model}</div>` : ""}
            </div>
          </div>
          <div class="service-header-right">
            <div
              class="status-indicator ${status}${this._changedServices.has(service.name) ? " flash" : ""}"
            >
              <span class="status-dot ${status}"></span>
              <span>${this._messages.status[status] ?? status}</span>
            </div>
            <ha-icon
              class="service-chevron ${expanded ? "expanded" : ""}"
              icon="mdi:chevron-down"
            ></ha-icon>
          </div>
        </div>

        <div class="service-body ${expanded ? "expanded" : ""}">
          <div class="service-body-inner">
            ${options.show_performance !== false ? this._renderPerformance(service, status) : ""}
            ${this._renderUptime(service, options)}
            ${options.show_actions !== false ? this._renderActions(service, status) : ""}
          </div>
        </div>
      </div>
    `;
  }
  _renderPerformance(service, status) {
    if (!service.metrics_entity || !this.hass || status !== "running") return b``;
    const entity = this.hass.states[service.metrics_entity];
    if (!entity || entity.state === "unavailable" || entity.state === "unknown") return b``;
    const opts = this._config.options;
    const attrs = entity.attributes;
    const running = Number(attrs.running) || 0;
    const waiting = Number(attrs.waiting) || 0;
    const ttft = Number(attrs.ttft) || 0;
    const itl = Number(attrs.itl) || 0;
    const tokens = Number(attrs.tokens) || 0;
    const ttftPct = Math.min(100, ttft / 8e3 * 100);
    const ttftColor = getMetricColorClass(ttftPct);
    const itlPct = Math.min(100, itl / 300 * 100);
    const itlColor = getMetricColorClass(itlPct);
    const items = [];
    if (opts.show_running !== false) {
      items.push(b`
        <div class="perf-info">
          <ha-icon icon="mdi:play-circle"></ha-icon>
          <span class="perf-label">${this._messages.perf.running}</span>
          <span class="perf-value">${running}</span>
        </div>
      `);
    }
    if (opts.show_waiting !== false) {
      items.push(b`
        <div class="perf-info ${waiting > 0 ? "warning" : ""}">
          <ha-icon icon="mdi:clock-outline"></ha-icon>
          <span class="perf-label">${this._messages.perf.waiting}</span>
          <span class="perf-value">${waiting}</span>
        </div>
      `);
    }
    if (opts.show_tok_iter !== false) {
      items.push(b`
        <div class="perf-info">
          <ha-icon icon="mdi:speedometer"></ha-icon>
          <span class="perf-label">${this._messages.perf.tok_iter}</span>
          <span class="perf-value">${tokens}</span>
        </div>
      `);
    }
    if (opts.show_ttft !== false) {
      items.push(b`
        <div class="metric-row">
          <div class="metric-header">
            <span class="metric-icon-wrap">
              <ha-icon icon="mdi:lightning-bolt"></ha-icon>
            </span>
            <span class="metric-label">${this._messages.perf.ttft}</span>
            <span class="metric-value ${ttftColor}">${Math.round(ttft)}ms</span>
          </div>
          <div class="metric-track">
            <div class="metric-fill ${ttftColor}" style="width: ${ttftPct}%"></div>
          </div>
        </div>
      `);
    }
    if (opts.show_itl !== false) {
      items.push(b`
        <div class="metric-row">
          <div class="metric-header">
            <span class="metric-icon-wrap">
              <ha-icon icon="mdi:speedometer-slow"></ha-icon>
            </span>
            <span class="metric-label">${this._messages.perf.itl}</span>
            <span class="metric-value ${itlColor}">${Math.round(itl)}ms</span>
          </div>
          <div class="metric-track">
            <div class="metric-fill ${itlColor}" style="width: ${itlPct}%"></div>
          </div>
        </div>
      `);
    }
    if (items.length === 0) return b``;
    return b`<div class="perf-section"><div class="perf-grid">${items}</div></div>`;
  }
  _renderUptime(service, options) {
    if (options.show_uptime === false) return b``;
    const uptimeEntity = service.uptime_entity ? this.hass?.states[service.uptime_entity] : void 0;
    const uptimeFromMetrics = service.metrics_entity ? this.hass?.states[service.metrics_entity]?.attributes?.uptime : void 0;
    const uptimeVal = uptimeEntity?.state || uptimeFromMetrics;
    if (!uptimeVal && !uptimeEntity) return b``;
    const isUnavailable = !uptimeVal || this._isEntityUnavailable(uptimeEntity) ? uptimeFromMetrics ? false : true : false;
    const displayUptime = () => {
      if (!uptimeVal) return "—";
      const secs = Number(uptimeVal);
      if (!isNaN(secs) && secs > 0) return formatUptime(secs);
      return uptimeVal;
    };
    return b`<div class="service-uptime">
      <ha-icon icon="mdi:clock-outline"></ha-icon>
      <span>${displayUptime()}</span>
      ${isUnavailable ? b`<ha-icon
              class="entity-warning"
              icon="mdi:alert-circle-outline"
              title="Entity unavailable"
            ></ha-icon>` : ""}
    </div>`;
  }
  _renderActions(service, status) {
    const actions = [];
    if (service.start_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.start,
          "mdi:play",
          service.start_service,
          status === "running" || status === "starting" || status === "restarting",
          service
        )
      );
    }
    if (service.stop_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.stop,
          "mdi:stop",
          service.stop_service,
          status === "stopped",
          service
        )
      );
    }
    if (service.restart_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.restart,
          "mdi:restart",
          service.restart_service,
          false,
          service
        )
      );
    }
    if (service.logs_service) {
      actions.push(
        this._renderActionButton(
          this._messages.action.logs,
          "mdi:text-box",
          service.logs_service,
          false,
          service
        )
      );
    }
    if (actions.length === 0) return b``;
    return b`<div class="service-actions">${actions}</div>`;
  }
  _renderActionButton(label, icon, service, disabled, serviceConfig) {
    return b`
      <ha-icon-button
        .label="${label}"
        .disabled=${disabled}
        title="${label}"
        @click=${() => this._handleAction(label, service, serviceConfig)}
        @click.stop
      >
        <ha-icon icon="${icon}"></ha-icon>
      </ha-icon-button>
    `;
  }
  _getServiceStatus(service) {
    const pending = this._pendingStatuses.get(service.name);
    if (pending) {
      if (service.status_entity && this.hass) {
        const entity2 = this.hass.states[service.status_entity];
        if (entity2) {
          const lower2 = entity2.state.toLowerCase();
          if ((pending.status === "restarting" || pending.status === "starting") && (lower2.includes("running") || lower2 === "ready")) {
            this._clearPendingStatus(service.name);
          } else if (pending.status === "stopped" && (lower2.includes("stopped") || lower2 === "off" || lower2 === "down")) {
            this._clearPendingStatus(service.name);
          }
        }
      }
      return pending.status;
    }
    if (!service.status_entity || !this.hass) return "unknown";
    const entity = this.hass.states[service.status_entity];
    if (!entity) return "unknown";
    const lower = entity.state.toLowerCase();
    if (lower.includes("running") || lower === "on" || lower === "ready") return "running";
    if (lower.includes("stopped") || lower.includes("exited") || lower === "off" || lower === "down")
      return "stopped";
    if (lower === "starting") return "starting";
    if (lower.includes("restarting") || lower.includes("created")) return "restarting";
    return "unknown";
  }
  _setPendingStatus(serviceName, status) {
    this._clearPendingStatus(serviceName);
    const timer = window.setTimeout(() => {
      this._clearPendingStatus(serviceName);
    }, 1e4);
    this._pendingStatuses.set(serviceName, { status, timer });
    this.requestUpdate();
  }
  _clearPendingStatus(serviceName) {
    const pending = this._pendingStatuses.get(serviceName);
    if (pending) {
      clearTimeout(pending.timer);
      this._pendingStatuses.delete(serviceName);
    }
  }
  async _handleAction(action, service, serviceConfig) {
    if (!this.hass || !isValidService(service)) return;
    const { domain, service: serviceName } = parseService(service);
    let pendingStatus;
    if (action === "Start") pendingStatus = "starting";
    else if (action === "Stop") pendingStatus = "stopped";
    else if (action === "Restart") pendingStatus = "restarting";
    else return;
    this._setPendingStatus(serviceConfig.name, pendingStatus);
    try {
      await this.hass.callService(domain, serviceName);
      const key = action === "Start" ? "start" : action === "Stop" ? "stop" : "restart";
      this._showToast(
        formatMessage(this._messages, "toast", key, { name: serviceConfig.name }),
        "success"
      );
    } catch (err) {
      console.error(`Failed to call ${service}:`, err);
      this._clearPendingStatus(serviceConfig.name);
      this._showToast(
        formatMessage(this._messages, "toast", "failed", { name: serviceConfig.name }),
        "error"
      );
    }
  }
  _showToast(message, type) {
    this._toast = { message, type };
    setTimeout(() => {
      this._toast = void 0;
    }, 3e3);
  }
  _renderToast() {
    return b`
      <div class="card-toast ${this._toast.type}">
        <ha-icon
          icon="${this._toast.type === "success" ? "mdi:check-circle" : "mdi:alert-circle"}"
        ></ha-icon>
        <span>${this._toast.message}</span>
      </div>
    `;
  }
  async _handleRefresh() {
    this._refreshing = true;
    this.requestUpdate();
    await new Promise((resolve) => setTimeout(resolve, 500));
    this._refreshing = false;
    this._lastUpdate = Date.now();
    this.requestUpdate();
  }
  _setupRefresh() {
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    const interval = this._config?.options?.refresh_interval ?? DEFAULT_REFRESH_INTERVAL;
    if (interval > 0) {
      this._refreshInterval = window.setInterval(() => {
        this._handleRefresh();
      }, interval * 1e3);
    }
  }
  updated() {
    if (this._config && this.hass) {
      const changed = /* @__PURE__ */ new Set();
      for (const service of this._config.services) {
        const currentStatus = this._getServiceStatus(service);
        const prevStatus = this._previousServiceStatuses.get(service.name);
        if (prevStatus !== void 0 && prevStatus !== currentStatus) {
          changed.add(service.name);
        }
        this._previousServiceStatuses.set(service.name, currentStatus);
      }
      this._changedServices = changed;
    }
    if (this._config) {
      this._setupRefresh();
    }
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshInterval) {
      clearInterval(this._refreshInterval);
    }
    for (const [name] of this._pendingStatuses) {
      this._clearPendingStatus(name);
    }
  }
  static get styles() {
    return [
      cardStyles,
      i$4`
        /* === Overrides & card-specific === */
        .metric-detail {
          font-size: 0.7rem;
          color: var(--secondary-text-color, #757575);
          text-align: right;
          margin-top: -2px;
        }

        .metric-value-row {
          flex-direction: row;
          align-items: center;
          gap: 8px;
        }

        /* === Action buttons === */
        .service-actions ha-icon-button {
          --mdc-icon-button-size: 36px;
          color: var(--secondary-text-color, #757575);
        }

        .service-actions ha-icon-button ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .service-actions ha-icon-button:hover:not([disabled]) {
          color: var(--primary-color, #03a9f4);
        }

        .service-actions ha-icon-button[disabled] {
          opacity: 0.3;
          pointer-events: none;
        }

        /* === Toast === */
        .card-toast {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          margin: 8px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          animation: toast-fade-in 0.3s ease-out;
        }

        .card-toast.success {
          background: color-mix(in srgb, #4caf50 12%, transparent);
          color: #4caf50;
        }

        .card-toast.success ha-icon {
          color: #4caf50;
        }

        .card-toast.error {
          background: color-mix(in srgb, #f44336 12%, transparent);
          color: #f44336;
        }

        .card-toast.error ha-icon {
          color: #f44336;
        }

        .card-toast ha-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        @keyframes toast-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `
    ];
  }
};
__decorateClass([
  n2({ attribute: false })
], LlmServerCard.prototype, "hass", 2);
__decorateClass([
  n2({ type: String })
], LlmServerCard.prototype, "_title", 2);
__decorateClass([
  r()
], LlmServerCard.prototype, "_config", 2);
__decorateClass([
  r()
], LlmServerCard.prototype, "_refreshing", 2);
__decorateClass([
  r()
], LlmServerCard.prototype, "_toast", 2);
__decorateClass([
  r()
], LlmServerCard.prototype, "_lastUpdate", 2);
LlmServerCard = __decorateClass([
  t$1(CARD_NAME)
], LlmServerCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_NAME,
  name: "AI Server Card",
  description: "Manage AI inference servers with status, metrics, and actions.",
  preview: true
});
export {
  LlmServerCard
};
