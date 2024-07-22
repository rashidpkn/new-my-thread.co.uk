!(function (e) {
  ("object" == typeof exports && "undefined" != typeof module) ||
  "function" != typeof define ||
  !define.amd
    ? e()
    : define("inert", e);
})(function () {
  "use strict";
  var e,
    t,
    n,
    i,
    o,
    r,
    s = function (e, t, n) {
      return t && a(e.prototype, t), n && a(e, n), e;
    };
  function a(e, t) {
    for (var n = 0; n < t.length; n++) {
      var i = t[n];
      (i.enumerable = i.enumerable || !1),
        (i.configurable = !0),
        "value" in i && (i.writable = !0),
        Object.defineProperty(e, i.key, i);
    }
  }
  function d(e, t) {
    if (!(e instanceof t))
      throw new TypeError("Cannot call a class as a function");
  }
  function u(e, t) {
    d(this, u),
      (this._inertManager = t),
      (this._rootElement = e),
      (this._managedNodes = new Set()),
      this._rootElement.hasAttribute("aria-hidden")
        ? (this._savedAriaHidden =
            this._rootElement.getAttribute("aria-hidden"))
        : (this._savedAriaHidden = null),
      this._rootElement.setAttribute("aria-hidden", "true"),
      this._makeSubtreeUnfocusable(this._rootElement),
      (this._observer = new MutationObserver(this._onMutation.bind(this))),
      this._observer.observe(this._rootElement, {
        attributes: !0,
        childList: !0,
        subtree: !0,
      });
  }
  function h(e, t) {
    d(this, h),
      (this._node = e),
      (this._overrodeFocusMethod = !1),
      (this._inertRoots = new Set([t])),
      (this._savedTabIndex = null),
      (this._destroyed = !1),
      this.ensureUntabbable();
  }
  function l(e) {
    if ((d(this, l), !e))
      throw new Error(
        "Missing required argument; InertManager needs to wrap a document."
      );
    (this._document = e),
      (this._managedNodes = new Map()),
      (this._inertRoots = new Map()),
      (this._observer = new MutationObserver(this._watchForInert.bind(this))),
      _(e.head || e.body || e.documentElement),
      "loading" === e.readyState
        ? e.addEventListener(
            "DOMContentLoaded",
            this._onDocumentLoaded.bind(this)
          )
        : this._onDocumentLoaded();
  }
  function c(e, t, n) {
    if (e.nodeType == Node.ELEMENT_NODE) {
      var i = e;
      if ((s = (t && t(i), i.shadowRoot))) return void c(s, t, s);
      if ("content" == i.localName) {
        for (
          var o = (s = i).getDistributedNodes ? s.getDistributedNodes() : [],
            r = 0;
          r < o.length;
          r++
        )
          c(o[r], t, n);
        return;
      }
      if ("slot" == i.localName) {
        for (
          var s,
            a = (s = i).assignedNodes ? s.assignedNodes({ flatten: !0 }) : [],
            d = 0;
          d < a.length;
          d++
        )
          c(a[d], t, n);
        return;
      }
    }
    for (var u = e.firstChild; null != u; ) c(u, t, n), (u = u.nextSibling);
  }
  function _(e) {
    var t;
    e.querySelector("style#inert-style, link#inert-style") ||
      ((t = document.createElement("style")).setAttribute("id", "inert-style"),
      (t.textContent =
        "\n[inert] {\n  pointer-events: none;\n  cursor: default;\n}\n\n[inert], [inert] * {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n"),
      e.appendChild(t));
  }
  "undefined" != typeof window &&
    ((e = Array.prototype.slice),
    (t = Element.prototype.matches || Element.prototype.msMatchesSelector),
    (n = [
      "a[href]",
      "area[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "button:not([disabled])",
      "details",
      "summary",
      "iframe",
      "object",
      "embed",
      "[contenteditable]",
    ].join(",")),
    s(u, [
      {
        key: "destructor",
        value: function () {
          this._observer.disconnect(),
            this._rootElement &&
              (null !== this._savedAriaHidden
                ? this._rootElement.setAttribute(
                    "aria-hidden",
                    this._savedAriaHidden
                  )
                : this._rootElement.removeAttribute("aria-hidden")),
            this._managedNodes.forEach(function (e) {
              this._unmanageNode(e.node);
            }, this),
            (this._observer = null),
            (this._rootElement = null),
            (this._managedNodes = null),
            (this._inertManager = null);
        },
      },
      {
        key: "_makeSubtreeUnfocusable",
        value: function (e) {
          var t = this,
            n =
              (c(e, function (e) {
                return t._visitNode(e);
              }),
              document.activeElement);
          if (!document.body.contains(e)) {
            for (var i = e, o = void 0; i; ) {
              if (i.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                o = i;
                break;
              }
              i = i.parentNode;
            }
            o && (n = o.activeElement);
          }
          e.contains(n) &&
            (n.blur(), n === document.activeElement && document.body.focus());
        },
      },
      {
        key: "_visitNode",
        value: function (e) {
          e.nodeType === Node.ELEMENT_NODE &&
            (e !== this._rootElement &&
              e.hasAttribute("inert") &&
              this._adoptInertRoot(e),
            (t.call(e, n) || e.hasAttribute("tabindex")) &&
              this._manageNode(e));
        },
      },
      {
        key: "_manageNode",
        value: function (e) {
          (e = this._inertManager.register(e, this)), this._managedNodes.add(e);
        },
      },
      {
        key: "_unmanageNode",
        value: function (e) {
          (e = this._inertManager.deregister(e, this)) &&
            this._managedNodes.delete(e);
        },
      },
      {
        key: "_unmanageSubtree",
        value: function (e) {
          var t = this;
          c(e, function (e) {
            return t._unmanageNode(e);
          });
        },
      },
      {
        key: "_adoptInertRoot",
        value: function (e) {
          var t = this._inertManager.getInertRoot(e);
          t ||
            (this._inertManager.setInert(e, !0),
            (t = this._inertManager.getInertRoot(e))),
            t.managedNodes.forEach(function (e) {
              this._manageNode(e.node);
            }, this);
        },
      },
      {
        key: "_onMutation",
        value: function (t, n) {
          t.forEach(function (t) {
            var n,
              i = t.target;
            "childList" === t.type
              ? (e.call(t.addedNodes).forEach(function (e) {
                  this._makeSubtreeUnfocusable(e);
                }, this),
                e.call(t.removedNodes).forEach(function (e) {
                  this._unmanageSubtree(e);
                }, this))
              : "attributes" === t.type &&
                ("tabindex" === t.attributeName
                  ? this._manageNode(i)
                  : i !== this._rootElement &&
                    "inert" === t.attributeName &&
                    i.hasAttribute("inert") &&
                    (this._adoptInertRoot(i),
                    (n = this._inertManager.getInertRoot(i)),
                    this._managedNodes.forEach(function (e) {
                      i.contains(e.node) && n._manageNode(e.node);
                    })));
          }, this);
        },
      },
      {
        key: "managedNodes",
        get: function () {
          return new Set(this._managedNodes);
        },
      },
      {
        key: "hasSavedAriaHidden",
        get: function () {
          return null !== this._savedAriaHidden;
        },
      },
      {
        key: "savedAriaHidden",
        set: function (e) {
          this._savedAriaHidden = e;
        },
        get: function () {
          return this._savedAriaHidden;
        },
      },
    ]),
    (i = u),
    s(h, [
      {
        key: "destructor",
        value: function () {
          var e;
          this._throwIfDestroyed(),
            this._node &&
              this._node.nodeType === Node.ELEMENT_NODE &&
              ((e = this._node),
              null !== this._savedTabIndex
                ? e.setAttribute("tabindex", this._savedTabIndex)
                : e.removeAttribute("tabindex"),
              this._overrodeFocusMethod && delete e.focus),
            (this._node = null),
            (this._inertRoots = null),
            (this._destroyed = !0);
        },
      },
      {
        key: "_throwIfDestroyed",
        value: function () {
          if (this.destroyed)
            throw new Error("Trying to access destroyed InertNode");
        },
      },
      {
        key: "ensureUntabbable",
        value: function () {
          var e;
          this.node.nodeType === Node.ELEMENT_NODE &&
            ((e = this.node),
            t.call(e, n)
              ? (-1 === e.tabIndex && this.hasSavedTabIndex) ||
                (e.hasAttribute("tabindex") &&
                  (this._savedTabIndex = e.tabIndex),
                e.setAttribute("tabindex", "-1"),
                e.nodeType === Node.ELEMENT_NODE &&
                  ((e.focus = function () {}),
                  (this._overrodeFocusMethod = !0)))
              : e.hasAttribute("tabindex") &&
                ((this._savedTabIndex = e.tabIndex),
                e.removeAttribute("tabindex")));
        },
      },
      {
        key: "addInertRoot",
        value: function (e) {
          this._throwIfDestroyed(), this._inertRoots.add(e);
        },
      },
      {
        key: "removeInertRoot",
        value: function (e) {
          this._throwIfDestroyed(),
            this._inertRoots.delete(e),
            0 === this._inertRoots.size && this.destructor();
        },
      },
      {
        key: "destroyed",
        get: function () {
          return this._destroyed;
        },
      },
      {
        key: "hasSavedTabIndex",
        get: function () {
          return null !== this._savedTabIndex;
        },
      },
      {
        key: "node",
        get: function () {
          return this._throwIfDestroyed(), this._node;
        },
      },
      {
        key: "savedTabIndex",
        set: function (e) {
          this._throwIfDestroyed(), (this._savedTabIndex = e);
        },
        get: function () {
          return this._throwIfDestroyed(), this._savedTabIndex;
        },
      },
    ]),
    (o = h),
    s(l, [
      {
        key: "setInert",
        value: function (e, t) {
          if (t) {
            if (
              !this._inertRoots.has(e) &&
              ((t = new i(e, this)),
              e.setAttribute("inert", ""),
              this._inertRoots.set(e, t),
              !this._document.body.contains(e))
            )
              for (var n = e.parentNode; n; )
                11 === n.nodeType && _(n), (n = n.parentNode);
          } else
            this._inertRoots.has(e) &&
              (this._inertRoots.get(e).destructor(),
              this._inertRoots.delete(e),
              e.removeAttribute("inert"));
        },
      },
      {
        key: "getInertRoot",
        value: function (e) {
          return this._inertRoots.get(e);
        },
      },
      {
        key: "register",
        value: function (e, t) {
          var n = this._managedNodes.get(e);
          return (
            void 0 !== n ? n.addInertRoot(t) : (n = new o(e, t)),
            this._managedNodes.set(e, n),
            n
          );
        },
      },
      {
        key: "deregister",
        value: function (e, t) {
          var n = this._managedNodes.get(e);
          return n
            ? (n.removeInertRoot(t),
              n.destroyed && this._managedNodes.delete(e),
              n)
            : null;
        },
      },
      {
        key: "_onDocumentLoaded",
        value: function () {
          e
            .call(this._document.querySelectorAll("[inert]"))
            .forEach(function (e) {
              this.setInert(e, !0);
            }, this),
            this._observer.observe(
              this._document.body || this._document.documentElement,
              { attributes: !0, subtree: !0, childList: !0 }
            );
        },
      },
      {
        key: "_watchForInert",
        value: function (n, i) {
          var o = this;
          n.forEach(function (n) {
            switch (n.type) {
              case "childList":
                e.call(n.addedNodes).forEach(function (n) {
                  var i;
                  n.nodeType === Node.ELEMENT_NODE &&
                    ((i = e.call(n.querySelectorAll("[inert]"))),
                    t.call(n, "[inert]") && i.unshift(n),
                    i.forEach(function (e) {
                      this.setInert(e, !0);
                    }, o));
                }, o);
                break;
              case "attributes":
                if ("inert" !== n.attributeName) return;
                var i = n.target,
                  r = i.hasAttribute("inert");
                o.setInert(i, r);
            }
          }, this);
        },
      },
    ]),
    (s = l),
    HTMLElement.prototype.hasOwnProperty("inert") ||
      ((r = new s(document)),
      Object.defineProperty(HTMLElement.prototype, "inert", {
        enumerable: !0,
        get: function () {
          return this.hasAttribute("inert");
        },
        set: function (e) {
          r.setInert(this, e);
        },
      })));
});
