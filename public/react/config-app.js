var Sf = { exports: {} }, Ru = {};
var Mr;
function fh() {
  if (Mr) return Ru;
  Mr = 1;
  var y = /* @__PURE__ */ Symbol.for("react.transitional.element"), x = /* @__PURE__ */ Symbol.for("react.fragment");
  function _(r, Y, q) {
    var Q = null;
    if (q !== void 0 && (Q = "" + q), Y.key !== void 0 && (Q = "" + Y.key), "key" in Y) {
      q = {};
      for (var ll in Y)
        ll !== "key" && (q[ll] = Y[ll]);
    } else q = Y;
    return Y = q.ref, {
      $$typeof: y,
      type: r,
      key: Q,
      ref: Y !== void 0 ? Y : null,
      props: q
    };
  }
  return Ru.Fragment = x, Ru.jsx = _, Ru.jsxs = _, Ru;
}
var Or;
function sh() {
  return Or || (Or = 1, Sf.exports = fh()), Sf.exports;
}
var b = sh(), pf = { exports: {} }, K = {};
var Ur;
function oh() {
  if (Ur) return K;
  Ur = 1;
  var y = /* @__PURE__ */ Symbol.for("react.transitional.element"), x = /* @__PURE__ */ Symbol.for("react.portal"), _ = /* @__PURE__ */ Symbol.for("react.fragment"), r = /* @__PURE__ */ Symbol.for("react.strict_mode"), Y = /* @__PURE__ */ Symbol.for("react.profiler"), q = /* @__PURE__ */ Symbol.for("react.consumer"), Q = /* @__PURE__ */ Symbol.for("react.context"), ll = /* @__PURE__ */ Symbol.for("react.forward_ref"), U = /* @__PURE__ */ Symbol.for("react.suspense"), T = /* @__PURE__ */ Symbol.for("react.memo"), J = /* @__PURE__ */ Symbol.for("react.lazy"), D = /* @__PURE__ */ Symbol.for("react.activity"), fl = Symbol.iterator;
  function ul(o) {
    return o === null || typeof o != "object" ? null : (o = fl && o[fl] || o["@@iterator"], typeof o == "function" ? o : null);
  }
  var _l = {
    isMounted: function() {
      return !1;
    },
    enqueueForceUpdate: function() {
    },
    enqueueReplaceState: function() {
    },
    enqueueSetState: function() {
    }
  }, sl = Object.assign, Cl = {};
  function dl(o, A, O) {
    this.props = o, this.context = A, this.refs = Cl, this.updater = O || _l;
  }
  dl.prototype.isReactComponent = {}, dl.prototype.setState = function(o, A) {
    if (typeof o != "object" && typeof o != "function" && o != null)
      throw Error(
        "takes an object of state variables to update or a function which returns an object of state variables."
      );
    this.updater.enqueueSetState(this, o, A, "setState");
  }, dl.prototype.forceUpdate = function(o) {
    this.updater.enqueueForceUpdate(this, o, "forceUpdate");
  };
  function ft() {
  }
  ft.prototype = dl.prototype;
  function pl(o, A, O) {
    this.props = o, this.context = A, this.refs = Cl, this.updater = O || _l;
  }
  var Zl = pl.prototype = new ft();
  Zl.constructor = pl, sl(Zl, dl.prototype), Zl.isPureReactComponent = !0;
  var St = Array.isArray;
  function Vl() {
  }
  var F = { H: null, A: null, T: null, S: null }, Kl = Object.prototype.hasOwnProperty;
  function st(o, A, O) {
    var R = O.ref;
    return {
      $$typeof: y,
      type: o,
      key: A,
      ref: R !== void 0 ? R : null,
      props: O
    };
  }
  function Lt(o, A) {
    return st(o.type, A, o.props);
  }
  function pt(o) {
    return typeof o == "object" && o !== null && o.$$typeof === y;
  }
  function Gl(o) {
    var A = { "=": "=0", ":": "=2" };
    return "$" + o.replace(/[=:]/g, function(O) {
      return A[O];
    });
  }
  var Rl = /\/+/g;
  function zt(o, A) {
    return typeof o == "object" && o !== null && o.key != null ? Gl("" + o.key) : A.toString(36);
  }
  function vl(o) {
    switch (o.status) {
      case "fulfilled":
        return o.value;
      case "rejected":
        throw o.reason;
      default:
        switch (typeof o.status == "string" ? o.then(Vl, Vl) : (o.status = "pending", o.then(
          function(A) {
            o.status === "pending" && (o.status = "fulfilled", o.value = A);
          },
          function(A) {
            o.status === "pending" && (o.status = "rejected", o.reason = A);
          }
        )), o.status) {
          case "fulfilled":
            return o.value;
          case "rejected":
            throw o.reason;
        }
    }
    throw o;
  }
  function p(o, A, O, R, Z) {
    var V = typeof o;
    (V === "undefined" || V === "boolean") && (o = null);
    var nl = !1;
    if (o === null) nl = !0;
    else
      switch (V) {
        case "bigint":
        case "string":
        case "number":
          nl = !0;
          break;
        case "object":
          switch (o.$$typeof) {
            case y:
            case x:
              nl = !0;
              break;
            case J:
              return nl = o._init, p(
                nl(o._payload),
                A,
                O,
                R,
                Z
              );
          }
      }
    if (nl)
      return Z = Z(o), nl = R === "" ? "." + zt(o, 0) : R, St(Z) ? (O = "", nl != null && (O = nl.replace(Rl, "$&/") + "/"), p(Z, A, O, "", function(Ht) {
        return Ht;
      })) : Z != null && (pt(Z) && (Z = Lt(
        Z,
        O + (Z.key == null || o && o.key === Z.key ? "" : ("" + Z.key).replace(
          Rl,
          "$&/"
        ) + "/") + nl
      )), A.push(Z)), 1;
    nl = 0;
    var Jl = R === "" ? "." : R + ":";
    if (St(o))
      for (var Ml = 0; Ml < o.length; Ml++)
        R = o[Ml], V = Jl + zt(R, Ml), nl += p(
          R,
          A,
          O,
          V,
          Z
        );
    else if (Ml = ul(o), typeof Ml == "function")
      for (o = Ml.call(o), Ml = 0; !(R = o.next()).done; )
        R = R.value, V = Jl + zt(R, Ml++), nl += p(
          R,
          A,
          O,
          V,
          Z
        );
    else if (V === "object") {
      if (typeof o.then == "function")
        return p(
          vl(o),
          A,
          O,
          R,
          Z
        );
      throw A = String(o), Error(
        "Objects are not valid as a React child (found: " + (A === "[object Object]" ? "object with keys {" + Object.keys(o).join(", ") + "}" : A) + "). If you meant to render a collection of children, use an array instead."
      );
    }
    return nl;
  }
  function M(o, A, O) {
    if (o == null) return o;
    var R = [], Z = 0;
    return p(o, R, "", "", function(V) {
      return A.call(O, V, Z++);
    }), R;
  }
  function j(o) {
    if (o._status === -1) {
      var A = o._result;
      A = A(), A.then(
        function(O) {
          (o._status === 0 || o._status === -1) && (o._status = 1, o._result = O);
        },
        function(O) {
          (o._status === 0 || o._status === -1) && (o._status = 2, o._result = O);
        }
      ), o._status === -1 && (o._status = 0, o._result = A);
    }
    if (o._status === 1) return o._result.default;
    throw o._result;
  }
  var k = typeof reportError == "function" ? reportError : function(o) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var A = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof o == "object" && o !== null && typeof o.message == "string" ? String(o.message) : String(o),
        error: o
      });
      if (!window.dispatchEvent(A)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", o);
      return;
    }
    console.error(o);
  }, ml = {
    map: M,
    forEach: function(o, A, O) {
      M(
        o,
        function() {
          A.apply(this, arguments);
        },
        O
      );
    },
    count: function(o) {
      var A = 0;
      return M(o, function() {
        A++;
      }), A;
    },
    toArray: function(o) {
      return M(o, function(A) {
        return A;
      }) || [];
    },
    only: function(o) {
      if (!pt(o))
        throw Error(
          "React.Children.only expected to receive a single React element child."
        );
      return o;
    }
  };
  return K.Activity = D, K.Children = ml, K.Component = dl, K.Fragment = _, K.Profiler = Y, K.PureComponent = pl, K.StrictMode = r, K.Suspense = U, K.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = F, K.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(o) {
      return F.H.useMemoCache(o);
    }
  }, K.cache = function(o) {
    return function() {
      return o.apply(null, arguments);
    };
  }, K.cacheSignal = function() {
    return null;
  }, K.cloneElement = function(o, A, O) {
    if (o == null)
      throw Error(
        "The argument must be a React element, but you passed " + o + "."
      );
    var R = sl({}, o.props), Z = o.key;
    if (A != null)
      for (V in A.key !== void 0 && (Z = "" + A.key), A)
        !Kl.call(A, V) || V === "key" || V === "__self" || V === "__source" || V === "ref" && A.ref === void 0 || (R[V] = A[V]);
    var V = arguments.length - 2;
    if (V === 1) R.children = O;
    else if (1 < V) {
      for (var nl = Array(V), Jl = 0; Jl < V; Jl++)
        nl[Jl] = arguments[Jl + 2];
      R.children = nl;
    }
    return st(o.type, Z, R);
  }, K.createContext = function(o) {
    return o = {
      $$typeof: Q,
      _currentValue: o,
      _currentValue2: o,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    }, o.Provider = o, o.Consumer = {
      $$typeof: q,
      _context: o
    }, o;
  }, K.createElement = function(o, A, O) {
    var R, Z = {}, V = null;
    if (A != null)
      for (R in A.key !== void 0 && (V = "" + A.key), A)
        Kl.call(A, R) && R !== "key" && R !== "__self" && R !== "__source" && (Z[R] = A[R]);
    var nl = arguments.length - 2;
    if (nl === 1) Z.children = O;
    else if (1 < nl) {
      for (var Jl = Array(nl), Ml = 0; Ml < nl; Ml++)
        Jl[Ml] = arguments[Ml + 2];
      Z.children = Jl;
    }
    if (o && o.defaultProps)
      for (R in nl = o.defaultProps, nl)
        Z[R] === void 0 && (Z[R] = nl[R]);
    return st(o, V, Z);
  }, K.createRef = function() {
    return { current: null };
  }, K.forwardRef = function(o) {
    return { $$typeof: ll, render: o };
  }, K.isValidElement = pt, K.lazy = function(o) {
    return {
      $$typeof: J,
      _payload: { _status: -1, _result: o },
      _init: j
    };
  }, K.memo = function(o, A) {
    return {
      $$typeof: T,
      type: o,
      compare: A === void 0 ? null : A
    };
  }, K.startTransition = function(o) {
    var A = F.T, O = {};
    F.T = O;
    try {
      var R = o(), Z = F.S;
      Z !== null && Z(O, R), typeof R == "object" && R !== null && typeof R.then == "function" && R.then(Vl, k);
    } catch (V) {
      k(V);
    } finally {
      A !== null && O.types !== null && (A.types = O.types), F.T = A;
    }
  }, K.unstable_useCacheRefresh = function() {
    return F.H.useCacheRefresh();
  }, K.use = function(o) {
    return F.H.use(o);
  }, K.useActionState = function(o, A, O) {
    return F.H.useActionState(o, A, O);
  }, K.useCallback = function(o, A) {
    return F.H.useCallback(o, A);
  }, K.useContext = function(o) {
    return F.H.useContext(o);
  }, K.useDebugValue = function() {
  }, K.useDeferredValue = function(o, A) {
    return F.H.useDeferredValue(o, A);
  }, K.useEffect = function(o, A) {
    return F.H.useEffect(o, A);
  }, K.useEffectEvent = function(o) {
    return F.H.useEffectEvent(o);
  }, K.useId = function() {
    return F.H.useId();
  }, K.useImperativeHandle = function(o, A, O) {
    return F.H.useImperativeHandle(o, A, O);
  }, K.useInsertionEffect = function(o, A) {
    return F.H.useInsertionEffect(o, A);
  }, K.useLayoutEffect = function(o, A) {
    return F.H.useLayoutEffect(o, A);
  }, K.useMemo = function(o, A) {
    return F.H.useMemo(o, A);
  }, K.useOptimistic = function(o, A) {
    return F.H.useOptimistic(o, A);
  }, K.useReducer = function(o, A, O) {
    return F.H.useReducer(o, A, O);
  }, K.useRef = function(o) {
    return F.H.useRef(o);
  }, K.useState = function(o) {
    return F.H.useState(o);
  }, K.useSyncExternalStore = function(o, A, O) {
    return F.H.useSyncExternalStore(
      o,
      A,
      O
    );
  }, K.useTransition = function() {
    return F.H.useTransition();
  }, K.version = "19.2.4", K;
}
var Dr;
function Mf() {
  return Dr || (Dr = 1, pf.exports = oh()), pf.exports;
}
var X = Mf(), zf = { exports: {} }, Hu = {}, Tf = { exports: {} }, xf = {};
var jr;
function rh() {
  return jr || (jr = 1, (function(y) {
    function x(p, M) {
      var j = p.length;
      p.push(M);
      l: for (; 0 < j; ) {
        var k = j - 1 >>> 1, ml = p[k];
        if (0 < Y(ml, M))
          p[k] = M, p[j] = ml, j = k;
        else break l;
      }
    }
    function _(p) {
      return p.length === 0 ? null : p[0];
    }
    function r(p) {
      if (p.length === 0) return null;
      var M = p[0], j = p.pop();
      if (j !== M) {
        p[0] = j;
        l: for (var k = 0, ml = p.length, o = ml >>> 1; k < o; ) {
          var A = 2 * (k + 1) - 1, O = p[A], R = A + 1, Z = p[R];
          if (0 > Y(O, j))
            R < ml && 0 > Y(Z, O) ? (p[k] = Z, p[R] = j, k = R) : (p[k] = O, p[A] = j, k = A);
          else if (R < ml && 0 > Y(Z, j))
            p[k] = Z, p[R] = j, k = R;
          else break l;
        }
      }
      return M;
    }
    function Y(p, M) {
      var j = p.sortIndex - M.sortIndex;
      return j !== 0 ? j : p.id - M.id;
    }
    if (y.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
      var q = performance;
      y.unstable_now = function() {
        return q.now();
      };
    } else {
      var Q = Date, ll = Q.now();
      y.unstable_now = function() {
        return Q.now() - ll;
      };
    }
    var U = [], T = [], J = 1, D = null, fl = 3, ul = !1, _l = !1, sl = !1, Cl = !1, dl = typeof setTimeout == "function" ? setTimeout : null, ft = typeof clearTimeout == "function" ? clearTimeout : null, pl = typeof setImmediate < "u" ? setImmediate : null;
    function Zl(p) {
      for (var M = _(T); M !== null; ) {
        if (M.callback === null) r(T);
        else if (M.startTime <= p)
          r(T), M.sortIndex = M.expirationTime, x(U, M);
        else break;
        M = _(T);
      }
    }
    function St(p) {
      if (sl = !1, Zl(p), !_l)
        if (_(U) !== null)
          _l = !0, Vl || (Vl = !0, Gl());
        else {
          var M = _(T);
          M !== null && vl(St, M.startTime - p);
        }
    }
    var Vl = !1, F = -1, Kl = 5, st = -1;
    function Lt() {
      return Cl ? !0 : !(y.unstable_now() - st < Kl);
    }
    function pt() {
      if (Cl = !1, Vl) {
        var p = y.unstable_now();
        st = p;
        var M = !0;
        try {
          l: {
            _l = !1, sl && (sl = !1, ft(F), F = -1), ul = !0;
            var j = fl;
            try {
              t: {
                for (Zl(p), D = _(U); D !== null && !(D.expirationTime > p && Lt()); ) {
                  var k = D.callback;
                  if (typeof k == "function") {
                    D.callback = null, fl = D.priorityLevel;
                    var ml = k(
                      D.expirationTime <= p
                    );
                    if (p = y.unstable_now(), typeof ml == "function") {
                      D.callback = ml, Zl(p), M = !0;
                      break t;
                    }
                    D === _(U) && r(U), Zl(p);
                  } else r(U);
                  D = _(U);
                }
                if (D !== null) M = !0;
                else {
                  var o = _(T);
                  o !== null && vl(
                    St,
                    o.startTime - p
                  ), M = !1;
                }
              }
              break l;
            } finally {
              D = null, fl = j, ul = !1;
            }
            M = void 0;
          }
        } finally {
          M ? Gl() : Vl = !1;
        }
      }
    }
    var Gl;
    if (typeof pl == "function")
      Gl = function() {
        pl(pt);
      };
    else if (typeof MessageChannel < "u") {
      var Rl = new MessageChannel(), zt = Rl.port2;
      Rl.port1.onmessage = pt, Gl = function() {
        zt.postMessage(null);
      };
    } else
      Gl = function() {
        dl(pt, 0);
      };
    function vl(p, M) {
      F = dl(function() {
        p(y.unstable_now());
      }, M);
    }
    y.unstable_IdlePriority = 5, y.unstable_ImmediatePriority = 1, y.unstable_LowPriority = 4, y.unstable_NormalPriority = 3, y.unstable_Profiling = null, y.unstable_UserBlockingPriority = 2, y.unstable_cancelCallback = function(p) {
      p.callback = null;
    }, y.unstable_forceFrameRate = function(p) {
      0 > p || 125 < p ? console.error(
        "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
      ) : Kl = 0 < p ? Math.floor(1e3 / p) : 5;
    }, y.unstable_getCurrentPriorityLevel = function() {
      return fl;
    }, y.unstable_next = function(p) {
      switch (fl) {
        case 1:
        case 2:
        case 3:
          var M = 3;
          break;
        default:
          M = fl;
      }
      var j = fl;
      fl = M;
      try {
        return p();
      } finally {
        fl = j;
      }
    }, y.unstable_requestPaint = function() {
      Cl = !0;
    }, y.unstable_runWithPriority = function(p, M) {
      switch (p) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          p = 3;
      }
      var j = fl;
      fl = p;
      try {
        return M();
      } finally {
        fl = j;
      }
    }, y.unstable_scheduleCallback = function(p, M, j) {
      var k = y.unstable_now();
      switch (typeof j == "object" && j !== null ? (j = j.delay, j = typeof j == "number" && 0 < j ? k + j : k) : j = k, p) {
        case 1:
          var ml = -1;
          break;
        case 2:
          ml = 250;
          break;
        case 5:
          ml = 1073741823;
          break;
        case 4:
          ml = 1e4;
          break;
        default:
          ml = 5e3;
      }
      return ml = j + ml, p = {
        id: J++,
        callback: M,
        priorityLevel: p,
        startTime: j,
        expirationTime: ml,
        sortIndex: -1
      }, j > k ? (p.sortIndex = j, x(T, p), _(U) === null && p === _(T) && (sl ? (ft(F), F = -1) : sl = !0, vl(St, j - k))) : (p.sortIndex = ml, x(U, p), _l || ul || (_l = !0, Vl || (Vl = !0, Gl()))), p;
    }, y.unstable_shouldYield = Lt, y.unstable_wrapCallback = function(p) {
      var M = fl;
      return function() {
        var j = fl;
        fl = M;
        try {
          return p.apply(this, arguments);
        } finally {
          fl = j;
        }
      };
    };
  })(xf)), xf;
}
var Cr;
function dh() {
  return Cr || (Cr = 1, Tf.exports = rh()), Tf.exports;
}
var Ef = { exports: {} }, Pl = {};
var Rr;
function mh() {
  if (Rr) return Pl;
  Rr = 1;
  var y = Mf();
  function x(U) {
    var T = "https://react.dev/errors/" + U;
    if (1 < arguments.length) {
      T += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var J = 2; J < arguments.length; J++)
        T += "&args[]=" + encodeURIComponent(arguments[J]);
    }
    return "Minified React error #" + U + "; visit " + T + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function _() {
  }
  var r = {
    d: {
      f: _,
      r: function() {
        throw Error(x(522));
      },
      D: _,
      C: _,
      L: _,
      m: _,
      X: _,
      S: _,
      M: _
    },
    p: 0,
    findDOMNode: null
  }, Y = /* @__PURE__ */ Symbol.for("react.portal");
  function q(U, T, J) {
    var D = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: Y,
      key: D == null ? null : "" + D,
      children: U,
      containerInfo: T,
      implementation: J
    };
  }
  var Q = y.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function ll(U, T) {
    if (U === "font") return "";
    if (typeof T == "string")
      return T === "use-credentials" ? T : "";
  }
  return Pl.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = r, Pl.createPortal = function(U, T) {
    var J = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!T || T.nodeType !== 1 && T.nodeType !== 9 && T.nodeType !== 11)
      throw Error(x(299));
    return q(U, T, null, J);
  }, Pl.flushSync = function(U) {
    var T = Q.T, J = r.p;
    try {
      if (Q.T = null, r.p = 2, U) return U();
    } finally {
      Q.T = T, r.p = J, r.d.f();
    }
  }, Pl.preconnect = function(U, T) {
    typeof U == "string" && (T ? (T = T.crossOrigin, T = typeof T == "string" ? T === "use-credentials" ? T : "" : void 0) : T = null, r.d.C(U, T));
  }, Pl.prefetchDNS = function(U) {
    typeof U == "string" && r.d.D(U);
  }, Pl.preinit = function(U, T) {
    if (typeof U == "string" && T && typeof T.as == "string") {
      var J = T.as, D = ll(J, T.crossOrigin), fl = typeof T.integrity == "string" ? T.integrity : void 0, ul = typeof T.fetchPriority == "string" ? T.fetchPriority : void 0;
      J === "style" ? r.d.S(
        U,
        typeof T.precedence == "string" ? T.precedence : void 0,
        {
          crossOrigin: D,
          integrity: fl,
          fetchPriority: ul
        }
      ) : J === "script" && r.d.X(U, {
        crossOrigin: D,
        integrity: fl,
        fetchPriority: ul,
        nonce: typeof T.nonce == "string" ? T.nonce : void 0
      });
    }
  }, Pl.preinitModule = function(U, T) {
    if (typeof U == "string")
      if (typeof T == "object" && T !== null) {
        if (T.as == null || T.as === "script") {
          var J = ll(
            T.as,
            T.crossOrigin
          );
          r.d.M(U, {
            crossOrigin: J,
            integrity: typeof T.integrity == "string" ? T.integrity : void 0,
            nonce: typeof T.nonce == "string" ? T.nonce : void 0
          });
        }
      } else T == null && r.d.M(U);
  }, Pl.preload = function(U, T) {
    if (typeof U == "string" && typeof T == "object" && T !== null && typeof T.as == "string") {
      var J = T.as, D = ll(J, T.crossOrigin);
      r.d.L(U, J, {
        crossOrigin: D,
        integrity: typeof T.integrity == "string" ? T.integrity : void 0,
        nonce: typeof T.nonce == "string" ? T.nonce : void 0,
        type: typeof T.type == "string" ? T.type : void 0,
        fetchPriority: typeof T.fetchPriority == "string" ? T.fetchPriority : void 0,
        referrerPolicy: typeof T.referrerPolicy == "string" ? T.referrerPolicy : void 0,
        imageSrcSet: typeof T.imageSrcSet == "string" ? T.imageSrcSet : void 0,
        imageSizes: typeof T.imageSizes == "string" ? T.imageSizes : void 0,
        media: typeof T.media == "string" ? T.media : void 0
      });
    }
  }, Pl.preloadModule = function(U, T) {
    if (typeof U == "string")
      if (T) {
        var J = ll(T.as, T.crossOrigin);
        r.d.m(U, {
          as: typeof T.as == "string" && T.as !== "script" ? T.as : void 0,
          crossOrigin: J,
          integrity: typeof T.integrity == "string" ? T.integrity : void 0
        });
      } else r.d.m(U);
  }, Pl.requestFormReset = function(U) {
    r.d.r(U);
  }, Pl.unstable_batchedUpdates = function(U, T) {
    return U(T);
  }, Pl.useFormState = function(U, T, J) {
    return Q.H.useFormState(U, T, J);
  }, Pl.useFormStatus = function() {
    return Q.H.useHostTransitionStatus();
  }, Pl.version = "19.2.4", Pl;
}
var Hr;
function hh() {
  if (Hr) return Ef.exports;
  Hr = 1;
  function y() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(y);
      } catch (x) {
        console.error(x);
      }
  }
  return y(), Ef.exports = mh(), Ef.exports;
}
var Br;
function yh() {
  if (Br) return Hu;
  Br = 1;
  var y = dh(), x = Mf(), _ = hh();
  function r(l) {
    var t = "https://react.dev/errors/" + l;
    if (1 < arguments.length) {
      t += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var e = 2; e < arguments.length; e++)
        t += "&args[]=" + encodeURIComponent(arguments[e]);
    }
    return "Minified React error #" + l + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function Y(l) {
    return !(!l || l.nodeType !== 1 && l.nodeType !== 9 && l.nodeType !== 11);
  }
  function q(l) {
    var t = l, e = l;
    if (l.alternate) for (; t.return; ) t = t.return;
    else {
      l = t;
      do
        t = l, (t.flags & 4098) !== 0 && (e = t.return), l = t.return;
      while (l);
    }
    return t.tag === 3 ? e : null;
  }
  function Q(l) {
    if (l.tag === 13) {
      var t = l.memoizedState;
      if (t === null && (l = l.alternate, l !== null && (t = l.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function ll(l) {
    if (l.tag === 31) {
      var t = l.memoizedState;
      if (t === null && (l = l.alternate, l !== null && (t = l.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function U(l) {
    if (q(l) !== l)
      throw Error(r(188));
  }
  function T(l) {
    var t = l.alternate;
    if (!t) {
      if (t = q(l), t === null) throw Error(r(188));
      return t !== l ? null : l;
    }
    for (var e = l, a = t; ; ) {
      var u = e.return;
      if (u === null) break;
      var n = u.alternate;
      if (n === null) {
        if (a = u.return, a !== null) {
          e = a;
          continue;
        }
        break;
      }
      if (u.child === n.child) {
        for (n = u.child; n; ) {
          if (n === e) return U(u), l;
          if (n === a) return U(u), t;
          n = n.sibling;
        }
        throw Error(r(188));
      }
      if (e.return !== a.return) e = u, a = n;
      else {
        for (var i = !1, c = u.child; c; ) {
          if (c === e) {
            i = !0, e = u, a = n;
            break;
          }
          if (c === a) {
            i = !0, a = u, e = n;
            break;
          }
          c = c.sibling;
        }
        if (!i) {
          for (c = n.child; c; ) {
            if (c === e) {
              i = !0, e = n, a = u;
              break;
            }
            if (c === a) {
              i = !0, a = n, e = u;
              break;
            }
            c = c.sibling;
          }
          if (!i) throw Error(r(189));
        }
      }
      if (e.alternate !== a) throw Error(r(190));
    }
    if (e.tag !== 3) throw Error(r(188));
    return e.stateNode.current === e ? l : t;
  }
  function J(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l;
    for (l = l.child; l !== null; ) {
      if (t = J(l), t !== null) return t;
      l = l.sibling;
    }
    return null;
  }
  var D = Object.assign, fl = /* @__PURE__ */ Symbol.for("react.element"), ul = /* @__PURE__ */ Symbol.for("react.transitional.element"), _l = /* @__PURE__ */ Symbol.for("react.portal"), sl = /* @__PURE__ */ Symbol.for("react.fragment"), Cl = /* @__PURE__ */ Symbol.for("react.strict_mode"), dl = /* @__PURE__ */ Symbol.for("react.profiler"), ft = /* @__PURE__ */ Symbol.for("react.consumer"), pl = /* @__PURE__ */ Symbol.for("react.context"), Zl = /* @__PURE__ */ Symbol.for("react.forward_ref"), St = /* @__PURE__ */ Symbol.for("react.suspense"), Vl = /* @__PURE__ */ Symbol.for("react.suspense_list"), F = /* @__PURE__ */ Symbol.for("react.memo"), Kl = /* @__PURE__ */ Symbol.for("react.lazy"), st = /* @__PURE__ */ Symbol.for("react.activity"), Lt = /* @__PURE__ */ Symbol.for("react.memo_cache_sentinel"), pt = Symbol.iterator;
  function Gl(l) {
    return l === null || typeof l != "object" ? null : (l = pt && l[pt] || l["@@iterator"], typeof l == "function" ? l : null);
  }
  var Rl = /* @__PURE__ */ Symbol.for("react.client.reference");
  function zt(l) {
    if (l == null) return null;
    if (typeof l == "function")
      return l.$$typeof === Rl ? null : l.displayName || l.name || null;
    if (typeof l == "string") return l;
    switch (l) {
      case sl:
        return "Fragment";
      case dl:
        return "Profiler";
      case Cl:
        return "StrictMode";
      case St:
        return "Suspense";
      case Vl:
        return "SuspenseList";
      case st:
        return "Activity";
    }
    if (typeof l == "object")
      switch (l.$$typeof) {
        case _l:
          return "Portal";
        case pl:
          return l.displayName || "Context";
        case ft:
          return (l._context.displayName || "Context") + ".Consumer";
        case Zl:
          var t = l.render;
          return l = l.displayName, l || (l = t.displayName || t.name || "", l = l !== "" ? "ForwardRef(" + l + ")" : "ForwardRef"), l;
        case F:
          return t = l.displayName || null, t !== null ? t : zt(l.type) || "Memo";
        case Kl:
          t = l._payload, l = l._init;
          try {
            return zt(l(t));
          } catch {
          }
      }
    return null;
  }
  var vl = Array.isArray, p = x.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, M = _.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, j = {
    pending: !1,
    data: null,
    method: null,
    action: null
  }, k = [], ml = -1;
  function o(l) {
    return { current: l };
  }
  function A(l) {
    0 > ml || (l.current = k[ml], k[ml] = null, ml--);
  }
  function O(l, t) {
    ml++, k[ml] = l.current, l.current = t;
  }
  var R = o(null), Z = o(null), V = o(null), nl = o(null);
  function Jl(l, t) {
    switch (O(V, t), O(Z, l), O(R, null), t.nodeType) {
      case 9:
      case 11:
        l = (l = t.documentElement) && (l = l.namespaceURI) ? F0(l) : 0;
        break;
      default:
        if (l = t.tagName, t = t.namespaceURI)
          t = F0(t), l = I0(t, l);
        else
          switch (l) {
            case "svg":
              l = 1;
              break;
            case "math":
              l = 2;
              break;
            default:
              l = 0;
          }
    }
    A(R), O(R, l);
  }
  function Ml() {
    A(R), A(Z), A(V);
  }
  function Ht(l) {
    l.memoizedState !== null && O(nl, l);
    var t = R.current, e = I0(t, l.type);
    t !== e && (O(Z, l), O(R, e));
  }
  function Fe(l) {
    Z.current === l && (A(R), A(Z)), nl.current === l && (A(nl), Uu._currentValue = j);
  }
  var La, Yu;
  function Xt(l) {
    if (La === void 0)
      try {
        throw Error();
      } catch (e) {
        var t = e.stack.trim().match(/\n( *(at )?)/);
        La = t && t[1] || "", Yu = -1 < e.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + La + l + Yu;
  }
  var Ie = !1;
  function Qt(l, t) {
    if (!l || Ie) return "";
    Ie = !0;
    var e = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      var a = {
        DetermineComponentFrameRoot: function() {
          try {
            if (t) {
              var E = function() {
                throw Error();
              };
              if (Object.defineProperty(E.prototype, "props", {
                set: function() {
                  throw Error();
                }
              }), typeof Reflect == "object" && Reflect.construct) {
                try {
                  Reflect.construct(E, []);
                } catch (g) {
                  var v = g;
                }
                Reflect.construct(l, [], E);
              } else {
                try {
                  E.call();
                } catch (g) {
                  v = g;
                }
                l.call(E.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (g) {
                v = g;
              }
              (E = l()) && typeof E.catch == "function" && E.catch(function() {
              });
            }
          } catch (g) {
            if (g && v && typeof g.stack == "string")
              return [g.stack, v.stack];
          }
          return [null, null];
        }
      };
      a.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var u = Object.getOwnPropertyDescriptor(
        a.DetermineComponentFrameRoot,
        "name"
      );
      u && u.configurable && Object.defineProperty(
        a.DetermineComponentFrameRoot,
        "name",
        { value: "DetermineComponentFrameRoot" }
      );
      var n = a.DetermineComponentFrameRoot(), i = n[0], c = n[1];
      if (i && c) {
        var f = i.split(`
`), h = c.split(`
`);
        for (u = a = 0; a < f.length && !f[a].includes("DetermineComponentFrameRoot"); )
          a++;
        for (; u < h.length && !h[u].includes(
          "DetermineComponentFrameRoot"
        ); )
          u++;
        if (a === f.length || u === h.length)
          for (a = f.length - 1, u = h.length - 1; 1 <= a && 0 <= u && f[a] !== h[u]; )
            u--;
        for (; 1 <= a && 0 <= u; a--, u--)
          if (f[a] !== h[u]) {
            if (a !== 1 || u !== 1)
              do
                if (a--, u--, 0 > u || f[a] !== h[u]) {
                  var S = `
` + f[a].replace(" at new ", " at ");
                  return l.displayName && S.includes("<anonymous>") && (S = S.replace("<anonymous>", l.displayName)), S;
                }
              while (1 <= a && 0 <= u);
            break;
          }
      }
    } finally {
      Ie = !1, Error.prepareStackTrace = e;
    }
    return (e = l ? l.displayName || l.name : "") ? Xt(e) : "";
  }
  function ni(l, t) {
    switch (l.tag) {
      case 26:
      case 27:
      case 5:
        return Xt(l.type);
      case 16:
        return Xt("Lazy");
      case 13:
        return l.child !== t && t !== null ? Xt("Suspense Fallback") : Xt("Suspense");
      case 19:
        return Xt("SuspenseList");
      case 0:
      case 15:
        return Qt(l.type, !1);
      case 11:
        return Qt(l.type.render, !1);
      case 1:
        return Qt(l.type, !0);
      case 31:
        return Xt("Activity");
      default:
        return "";
    }
  }
  function N(l) {
    try {
      var t = "", e = null;
      do
        t += ni(l, e), e = l, l = l.return;
      while (l);
      return t;
    } catch (a) {
      return `
Error generating stack: ` + a.message + `
` + a.stack;
    }
  }
  var H = Object.prototype.hasOwnProperty, w = y.unstable_scheduleCallback, zl = y.unstable_cancelCallback, ol = y.unstable_shouldYield, Il = y.unstable_requestPaint, Al = y.unstable_now, Gu = y.unstable_getCurrentPriorityLevel, Xa = y.unstable_ImmediatePriority, Of = y.unstable_UserBlockingPriority, Lu = y.unstable_NormalPriority, Zr = y.unstable_LowPriority, Uf = y.unstable_IdlePriority, Vr = y.log, Kr = y.unstable_setDisableYieldValue, Qa = null, ot = null;
  function fe(l) {
    if (typeof Vr == "function" && Kr(l), ot && typeof ot.setStrictMode == "function")
      try {
        ot.setStrictMode(Qa, l);
      } catch {
      }
  }
  var rt = Math.clz32 ? Math.clz32 : $r, Jr = Math.log, wr = Math.LN2;
  function $r(l) {
    return l >>>= 0, l === 0 ? 32 : 31 - (Jr(l) / wr | 0) | 0;
  }
  var Xu = 256, Qu = 262144, Zu = 4194304;
  function Ce(l) {
    var t = l & 42;
    if (t !== 0) return t;
    switch (l & -l) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
        return l & 261888;
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return l & 3932160;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return l & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return l;
    }
  }
  function Vu(l, t, e) {
    var a = l.pendingLanes;
    if (a === 0) return 0;
    var u = 0, n = l.suspendedLanes, i = l.pingedLanes;
    l = l.warmLanes;
    var c = a & 134217727;
    return c !== 0 ? (a = c & ~n, a !== 0 ? u = Ce(a) : (i &= c, i !== 0 ? u = Ce(i) : e || (e = c & ~l, e !== 0 && (u = Ce(e))))) : (c = a & ~n, c !== 0 ? u = Ce(c) : i !== 0 ? u = Ce(i) : e || (e = a & ~l, e !== 0 && (u = Ce(e)))), u === 0 ? 0 : t !== 0 && t !== u && (t & n) === 0 && (n = u & -u, e = t & -t, n >= e || n === 32 && (e & 4194048) !== 0) ? t : u;
  }
  function Za(l, t) {
    return (l.pendingLanes & ~(l.suspendedLanes & ~l.pingedLanes) & t) === 0;
  }
  function Wr(l, t) {
    switch (l) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return t + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function Df() {
    var l = Zu;
    return Zu <<= 1, (Zu & 62914560) === 0 && (Zu = 4194304), l;
  }
  function ii(l) {
    for (var t = [], e = 0; 31 > e; e++) t.push(l);
    return t;
  }
  function Va(l, t) {
    l.pendingLanes |= t, t !== 268435456 && (l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0);
  }
  function kr(l, t, e, a, u, n) {
    var i = l.pendingLanes;
    l.pendingLanes = e, l.suspendedLanes = 0, l.pingedLanes = 0, l.warmLanes = 0, l.expiredLanes &= e, l.entangledLanes &= e, l.errorRecoveryDisabledLanes &= e, l.shellSuspendCounter = 0;
    var c = l.entanglements, f = l.expirationTimes, h = l.hiddenUpdates;
    for (e = i & ~e; 0 < e; ) {
      var S = 31 - rt(e), E = 1 << S;
      c[S] = 0, f[S] = -1;
      var v = h[S];
      if (v !== null)
        for (h[S] = null, S = 0; S < v.length; S++) {
          var g = v[S];
          g !== null && (g.lane &= -536870913);
        }
      e &= ~E;
    }
    a !== 0 && jf(l, a, 0), n !== 0 && u === 0 && l.tag !== 0 && (l.suspendedLanes |= n & ~(i & ~t));
  }
  function jf(l, t, e) {
    l.pendingLanes |= t, l.suspendedLanes &= ~t;
    var a = 31 - rt(t);
    l.entangledLanes |= t, l.entanglements[a] = l.entanglements[a] | 1073741824 | e & 261930;
  }
  function Cf(l, t) {
    var e = l.entangledLanes |= t;
    for (l = l.entanglements; e; ) {
      var a = 31 - rt(e), u = 1 << a;
      u & t | l[a] & t && (l[a] |= t), e &= ~u;
    }
  }
  function Rf(l, t) {
    var e = t & -t;
    return e = (e & 42) !== 0 ? 1 : ci(e), (e & (l.suspendedLanes | t)) !== 0 ? 0 : e;
  }
  function ci(l) {
    switch (l) {
      case 2:
        l = 1;
        break;
      case 8:
        l = 4;
        break;
      case 32:
        l = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        l = 128;
        break;
      case 268435456:
        l = 134217728;
        break;
      default:
        l = 0;
    }
    return l;
  }
  function fi(l) {
    return l &= -l, 2 < l ? 8 < l ? (l & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function Hf() {
    var l = M.p;
    return l !== 0 ? l : (l = window.event, l === void 0 ? 32 : zr(l.type));
  }
  function Bf(l, t) {
    var e = M.p;
    try {
      return M.p = l, t();
    } finally {
      M.p = e;
    }
  }
  var se = Math.random().toString(36).slice(2), wl = "__reactFiber$" + se, tt = "__reactProps$" + se, Pe = "__reactContainer$" + se, si = "__reactEvents$" + se, Fr = "__reactListeners$" + se, Ir = "__reactHandles$" + se, qf = "__reactResources$" + se, Ka = "__reactMarker$" + se;
  function oi(l) {
    delete l[wl], delete l[tt], delete l[si], delete l[Fr], delete l[Ir];
  }
  function la(l) {
    var t = l[wl];
    if (t) return t;
    for (var e = l.parentNode; e; ) {
      if (t = e[Pe] || e[wl]) {
        if (e = t.alternate, t.child !== null || e !== null && e.child !== null)
          for (l = nr(l); l !== null; ) {
            if (e = l[wl]) return e;
            l = nr(l);
          }
        return t;
      }
      l = e, e = l.parentNode;
    }
    return null;
  }
  function ta(l) {
    if (l = l[wl] || l[Pe]) {
      var t = l.tag;
      if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
        return l;
    }
    return null;
  }
  function Ja(l) {
    var t = l.tag;
    if (t === 5 || t === 26 || t === 27 || t === 6) return l.stateNode;
    throw Error(r(33));
  }
  function ea(l) {
    var t = l[qf];
    return t || (t = l[qf] = { hoistableStyles: /* @__PURE__ */ new Map(), hoistableScripts: /* @__PURE__ */ new Map() }), t;
  }
  function Xl(l) {
    l[Ka] = !0;
  }
  var Yf = /* @__PURE__ */ new Set(), Gf = {};
  function Re(l, t) {
    aa(l, t), aa(l + "Capture", t);
  }
  function aa(l, t) {
    for (Gf[l] = t, l = 0; l < t.length; l++)
      Yf.add(t[l]);
  }
  var Pr = RegExp(
    "^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"
  ), Lf = {}, Xf = {};
  function ld(l) {
    return H.call(Xf, l) ? !0 : H.call(Lf, l) ? !1 : Pr.test(l) ? Xf[l] = !0 : (Lf[l] = !0, !1);
  }
  function Ku(l, t, e) {
    if (ld(t))
      if (e === null) l.removeAttribute(t);
      else {
        switch (typeof e) {
          case "undefined":
          case "function":
          case "symbol":
            l.removeAttribute(t);
            return;
          case "boolean":
            var a = t.toLowerCase().slice(0, 5);
            if (a !== "data-" && a !== "aria-") {
              l.removeAttribute(t);
              return;
            }
        }
        l.setAttribute(t, "" + e);
      }
  }
  function Ju(l, t, e) {
    if (e === null) l.removeAttribute(t);
    else {
      switch (typeof e) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(t);
          return;
      }
      l.setAttribute(t, "" + e);
    }
  }
  function Zt(l, t, e, a) {
    if (a === null) l.removeAttribute(e);
    else {
      switch (typeof a) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          l.removeAttribute(e);
          return;
      }
      l.setAttributeNS(t, e, "" + a);
    }
  }
  function Tt(l) {
    switch (typeof l) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return l;
      case "object":
        return l;
      default:
        return "";
    }
  }
  function Qf(l) {
    var t = l.type;
    return (l = l.nodeName) && l.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function td(l, t, e) {
    var a = Object.getOwnPropertyDescriptor(
      l.constructor.prototype,
      t
    );
    if (!l.hasOwnProperty(t) && typeof a < "u" && typeof a.get == "function" && typeof a.set == "function") {
      var u = a.get, n = a.set;
      return Object.defineProperty(l, t, {
        configurable: !0,
        get: function() {
          return u.call(this);
        },
        set: function(i) {
          e = "" + i, n.call(this, i);
        }
      }), Object.defineProperty(l, t, {
        enumerable: a.enumerable
      }), {
        getValue: function() {
          return e;
        },
        setValue: function(i) {
          e = "" + i;
        },
        stopTracking: function() {
          l._valueTracker = null, delete l[t];
        }
      };
    }
  }
  function ri(l) {
    if (!l._valueTracker) {
      var t = Qf(l) ? "checked" : "value";
      l._valueTracker = td(
        l,
        t,
        "" + l[t]
      );
    }
  }
  function Zf(l) {
    if (!l) return !1;
    var t = l._valueTracker;
    if (!t) return !0;
    var e = t.getValue(), a = "";
    return l && (a = Qf(l) ? l.checked ? "true" : "false" : l.value), l = a, l !== e ? (t.setValue(l), !0) : !1;
  }
  function wu(l) {
    if (l = l || (typeof document < "u" ? document : void 0), typeof l > "u") return null;
    try {
      return l.activeElement || l.body;
    } catch {
      return l.body;
    }
  }
  var ed = /[\n"\\]/g;
  function xt(l) {
    return l.replace(
      ed,
      function(t) {
        return "\\" + t.charCodeAt(0).toString(16) + " ";
      }
    );
  }
  function di(l, t, e, a, u, n, i, c) {
    l.name = "", i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" ? l.type = i : l.removeAttribute("type"), t != null ? i === "number" ? (t === 0 && l.value === "" || l.value != t) && (l.value = "" + Tt(t)) : l.value !== "" + Tt(t) && (l.value = "" + Tt(t)) : i !== "submit" && i !== "reset" || l.removeAttribute("value"), t != null ? mi(l, i, Tt(t)) : e != null ? mi(l, i, Tt(e)) : a != null && l.removeAttribute("value"), u == null && n != null && (l.defaultChecked = !!n), u != null && (l.checked = u && typeof u != "function" && typeof u != "symbol"), c != null && typeof c != "function" && typeof c != "symbol" && typeof c != "boolean" ? l.name = "" + Tt(c) : l.removeAttribute("name");
  }
  function Vf(l, t, e, a, u, n, i, c) {
    if (n != null && typeof n != "function" && typeof n != "symbol" && typeof n != "boolean" && (l.type = n), t != null || e != null) {
      if (!(n !== "submit" && n !== "reset" || t != null)) {
        ri(l);
        return;
      }
      e = e != null ? "" + Tt(e) : "", t = t != null ? "" + Tt(t) : e, c || t === l.value || (l.value = t), l.defaultValue = t;
    }
    a = a ?? u, a = typeof a != "function" && typeof a != "symbol" && !!a, l.checked = c ? l.checked : !!a, l.defaultChecked = !!a, i != null && typeof i != "function" && typeof i != "symbol" && typeof i != "boolean" && (l.name = i), ri(l);
  }
  function mi(l, t, e) {
    t === "number" && wu(l.ownerDocument) === l || l.defaultValue === "" + e || (l.defaultValue = "" + e);
  }
  function ua(l, t, e, a) {
    if (l = l.options, t) {
      t = {};
      for (var u = 0; u < e.length; u++)
        t["$" + e[u]] = !0;
      for (e = 0; e < l.length; e++)
        u = t.hasOwnProperty("$" + l[e].value), l[e].selected !== u && (l[e].selected = u), u && a && (l[e].defaultSelected = !0);
    } else {
      for (e = "" + Tt(e), t = null, u = 0; u < l.length; u++) {
        if (l[u].value === e) {
          l[u].selected = !0, a && (l[u].defaultSelected = !0);
          return;
        }
        t !== null || l[u].disabled || (t = l[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function Kf(l, t, e) {
    if (t != null && (t = "" + Tt(t), t !== l.value && (l.value = t), e == null)) {
      l.defaultValue !== t && (l.defaultValue = t);
      return;
    }
    l.defaultValue = e != null ? "" + Tt(e) : "";
  }
  function Jf(l, t, e, a) {
    if (t == null) {
      if (a != null) {
        if (e != null) throw Error(r(92));
        if (vl(a)) {
          if (1 < a.length) throw Error(r(93));
          a = a[0];
        }
        e = a;
      }
      e == null && (e = ""), t = e;
    }
    e = Tt(t), l.defaultValue = e, a = l.textContent, a === e && a !== "" && a !== null && (l.value = a), ri(l);
  }
  function na(l, t) {
    if (t) {
      var e = l.firstChild;
      if (e && e === l.lastChild && e.nodeType === 3) {
        e.nodeValue = t;
        return;
      }
    }
    l.textContent = t;
  }
  var ad = new Set(
    "animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(
      " "
    )
  );
  function wf(l, t, e) {
    var a = t.indexOf("--") === 0;
    e == null || typeof e == "boolean" || e === "" ? a ? l.setProperty(t, "") : t === "float" ? l.cssFloat = "" : l[t] = "" : a ? l.setProperty(t, e) : typeof e != "number" || e === 0 || ad.has(t) ? t === "float" ? l.cssFloat = e : l[t] = ("" + e).trim() : l[t] = e + "px";
  }
  function $f(l, t, e) {
    if (t != null && typeof t != "object")
      throw Error(r(62));
    if (l = l.style, e != null) {
      for (var a in e)
        !e.hasOwnProperty(a) || t != null && t.hasOwnProperty(a) || (a.indexOf("--") === 0 ? l.setProperty(a, "") : a === "float" ? l.cssFloat = "" : l[a] = "");
      for (var u in t)
        a = t[u], t.hasOwnProperty(u) && e[u] !== a && wf(l, u, a);
    } else
      for (var n in t)
        t.hasOwnProperty(n) && wf(l, n, t[n]);
  }
  function hi(l) {
    if (l.indexOf("-") === -1) return !1;
    switch (l) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var ud = /* @__PURE__ */ new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]), nd = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function $u(l) {
    return nd.test("" + l) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : l;
  }
  function Vt() {
  }
  var yi = null;
  function vi(l) {
    return l = l.target || l.srcElement || window, l.correspondingUseElement && (l = l.correspondingUseElement), l.nodeType === 3 ? l.parentNode : l;
  }
  var ia = null, ca = null;
  function Wf(l) {
    var t = ta(l);
    if (t && (l = t.stateNode)) {
      var e = l[tt] || null;
      l: switch (l = t.stateNode, t.type) {
        case "input":
          if (di(
            l,
            e.value,
            e.defaultValue,
            e.defaultValue,
            e.checked,
            e.defaultChecked,
            e.type,
            e.name
          ), t = e.name, e.type === "radio" && t != null) {
            for (e = l; e.parentNode; ) e = e.parentNode;
            for (e = e.querySelectorAll(
              'input[name="' + xt(
                "" + t
              ) + '"][type="radio"]'
            ), t = 0; t < e.length; t++) {
              var a = e[t];
              if (a !== l && a.form === l.form) {
                var u = a[tt] || null;
                if (!u) throw Error(r(90));
                di(
                  a,
                  u.value,
                  u.defaultValue,
                  u.defaultValue,
                  u.checked,
                  u.defaultChecked,
                  u.type,
                  u.name
                );
              }
            }
            for (t = 0; t < e.length; t++)
              a = e[t], a.form === l.form && Zf(a);
          }
          break l;
        case "textarea":
          Kf(l, e.value, e.defaultValue);
          break l;
        case "select":
          t = e.value, t != null && ua(l, !!e.multiple, t, !1);
      }
    }
  }
  var gi = !1;
  function kf(l, t, e) {
    if (gi) return l(t, e);
    gi = !0;
    try {
      var a = l(t);
      return a;
    } finally {
      if (gi = !1, (ia !== null || ca !== null) && (Bn(), ia && (t = ia, l = ca, ca = ia = null, Wf(t), l)))
        for (t = 0; t < l.length; t++) Wf(l[t]);
    }
  }
  function wa(l, t) {
    var e = l.stateNode;
    if (e === null) return null;
    var a = e[tt] || null;
    if (a === null) return null;
    e = a[t];
    l: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (a = !a.disabled) || (l = l.type, a = !(l === "button" || l === "input" || l === "select" || l === "textarea")), l = !a;
        break l;
      default:
        l = !1;
    }
    if (l) return null;
    if (e && typeof e != "function")
      throw Error(
        r(231, t, typeof e)
      );
    return e;
  }
  var Kt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), bi = !1;
  if (Kt)
    try {
      var $a = {};
      Object.defineProperty($a, "passive", {
        get: function() {
          bi = !0;
        }
      }), window.addEventListener("test", $a, $a), window.removeEventListener("test", $a, $a);
    } catch {
      bi = !1;
    }
  var oe = null, Si = null, Wu = null;
  function Ff() {
    if (Wu) return Wu;
    var l, t = Si, e = t.length, a, u = "value" in oe ? oe.value : oe.textContent, n = u.length;
    for (l = 0; l < e && t[l] === u[l]; l++) ;
    var i = e - l;
    for (a = 1; a <= i && t[e - a] === u[n - a]; a++) ;
    return Wu = u.slice(l, 1 < a ? 1 - a : void 0);
  }
  function ku(l) {
    var t = l.keyCode;
    return "charCode" in l ? (l = l.charCode, l === 0 && t === 13 && (l = 13)) : l = t, l === 10 && (l = 13), 32 <= l || l === 13 ? l : 0;
  }
  function Fu() {
    return !0;
  }
  function If() {
    return !1;
  }
  function et(l) {
    function t(e, a, u, n, i) {
      this._reactName = e, this._targetInst = u, this.type = a, this.nativeEvent = n, this.target = i, this.currentTarget = null;
      for (var c in l)
        l.hasOwnProperty(c) && (e = l[c], this[c] = e ? e(n) : n[c]);
      return this.isDefaultPrevented = (n.defaultPrevented != null ? n.defaultPrevented : n.returnValue === !1) ? Fu : If, this.isPropagationStopped = If, this;
    }
    return D(t.prototype, {
      preventDefault: function() {
        this.defaultPrevented = !0;
        var e = this.nativeEvent;
        e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Fu);
      },
      stopPropagation: function() {
        var e = this.nativeEvent;
        e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Fu);
      },
      persist: function() {
      },
      isPersistent: Fu
    }), t;
  }
  var He = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(l) {
      return l.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  }, Iu = et(He), Wa = D({}, He, { view: 0, detail: 0 }), id = et(Wa), pi, zi, ka, Pu = D({}, Wa, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: xi,
    button: 0,
    buttons: 0,
    relatedTarget: function(l) {
      return l.relatedTarget === void 0 ? l.fromElement === l.srcElement ? l.toElement : l.fromElement : l.relatedTarget;
    },
    movementX: function(l) {
      return "movementX" in l ? l.movementX : (l !== ka && (ka && l.type === "mousemove" ? (pi = l.screenX - ka.screenX, zi = l.screenY - ka.screenY) : zi = pi = 0, ka = l), pi);
    },
    movementY: function(l) {
      return "movementY" in l ? l.movementY : zi;
    }
  }), Pf = et(Pu), cd = D({}, Pu, { dataTransfer: 0 }), fd = et(cd), sd = D({}, Wa, { relatedTarget: 0 }), Ti = et(sd), od = D({}, He, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), rd = et(od), dd = D({}, He, {
    clipboardData: function(l) {
      return "clipboardData" in l ? l.clipboardData : window.clipboardData;
    }
  }), md = et(dd), hd = D({}, He, { data: 0 }), ls = et(hd), yd = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, vd = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, gd = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function bd(l) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(l) : (l = gd[l]) ? !!t[l] : !1;
  }
  function xi() {
    return bd;
  }
  var Sd = D({}, Wa, {
    key: function(l) {
      if (l.key) {
        var t = yd[l.key] || l.key;
        if (t !== "Unidentified") return t;
      }
      return l.type === "keypress" ? (l = ku(l), l === 13 ? "Enter" : String.fromCharCode(l)) : l.type === "keydown" || l.type === "keyup" ? vd[l.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: xi,
    charCode: function(l) {
      return l.type === "keypress" ? ku(l) : 0;
    },
    keyCode: function(l) {
      return l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
    },
    which: function(l) {
      return l.type === "keypress" ? ku(l) : l.type === "keydown" || l.type === "keyup" ? l.keyCode : 0;
    }
  }), pd = et(Sd), zd = D({}, Pu, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  }), ts = et(zd), Td = D({}, Wa, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: xi
  }), xd = et(Td), Ed = D({}, He, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  }), Ad = et(Ed), Nd = D({}, Pu, {
    deltaX: function(l) {
      return "deltaX" in l ? l.deltaX : "wheelDeltaX" in l ? -l.wheelDeltaX : 0;
    },
    deltaY: function(l) {
      return "deltaY" in l ? l.deltaY : "wheelDeltaY" in l ? -l.wheelDeltaY : "wheelDelta" in l ? -l.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), _d = et(Nd), Md = D({}, He, {
    newState: 0,
    oldState: 0
  }), Od = et(Md), Ud = [9, 13, 27, 32], Ei = Kt && "CompositionEvent" in window, Fa = null;
  Kt && "documentMode" in document && (Fa = document.documentMode);
  var Dd = Kt && "TextEvent" in window && !Fa, es = Kt && (!Ei || Fa && 8 < Fa && 11 >= Fa), as = " ", us = !1;
  function ns(l, t) {
    switch (l) {
      case "keyup":
        return Ud.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function is(l) {
    return l = l.detail, typeof l == "object" && "data" in l ? l.data : null;
  }
  var fa = !1;
  function jd(l, t) {
    switch (l) {
      case "compositionend":
        return is(t);
      case "keypress":
        return t.which !== 32 ? null : (us = !0, as);
      case "textInput":
        return l = t.data, l === as && us ? null : l;
      default:
        return null;
    }
  }
  function Cd(l, t) {
    if (fa)
      return l === "compositionend" || !Ei && ns(l, t) ? (l = Ff(), Wu = Si = oe = null, fa = !1, l) : null;
    switch (l) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length)
            return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return es && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Rd = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0
  };
  function cs(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return t === "input" ? !!Rd[l.type] : t === "textarea";
  }
  function fs(l, t, e, a) {
    ia ? ca ? ca.push(a) : ca = [a] : ia = a, t = Zn(t, "onChange"), 0 < t.length && (e = new Iu(
      "onChange",
      "change",
      null,
      e,
      a
    ), l.push({ event: e, listeners: t }));
  }
  var Ia = null, Pa = null;
  function Hd(l) {
    K0(l, 0);
  }
  function ln(l) {
    var t = Ja(l);
    if (Zf(t)) return l;
  }
  function ss(l, t) {
    if (l === "change") return t;
  }
  var os = !1;
  if (Kt) {
    var Ai;
    if (Kt) {
      var Ni = "oninput" in document;
      if (!Ni) {
        var rs = document.createElement("div");
        rs.setAttribute("oninput", "return;"), Ni = typeof rs.oninput == "function";
      }
      Ai = Ni;
    } else Ai = !1;
    os = Ai && (!document.documentMode || 9 < document.documentMode);
  }
  function ds() {
    Ia && (Ia.detachEvent("onpropertychange", ms), Pa = Ia = null);
  }
  function ms(l) {
    if (l.propertyName === "value" && ln(Pa)) {
      var t = [];
      fs(
        t,
        Pa,
        l,
        vi(l)
      ), kf(Hd, t);
    }
  }
  function Bd(l, t, e) {
    l === "focusin" ? (ds(), Ia = t, Pa = e, Ia.attachEvent("onpropertychange", ms)) : l === "focusout" && ds();
  }
  function qd(l) {
    if (l === "selectionchange" || l === "keyup" || l === "keydown")
      return ln(Pa);
  }
  function Yd(l, t) {
    if (l === "click") return ln(t);
  }
  function Gd(l, t) {
    if (l === "input" || l === "change")
      return ln(t);
  }
  function Ld(l, t) {
    return l === t && (l !== 0 || 1 / l === 1 / t) || l !== l && t !== t;
  }
  var dt = typeof Object.is == "function" ? Object.is : Ld;
  function lu(l, t) {
    if (dt(l, t)) return !0;
    if (typeof l != "object" || l === null || typeof t != "object" || t === null)
      return !1;
    var e = Object.keys(l), a = Object.keys(t);
    if (e.length !== a.length) return !1;
    for (a = 0; a < e.length; a++) {
      var u = e[a];
      if (!H.call(t, u) || !dt(l[u], t[u]))
        return !1;
    }
    return !0;
  }
  function hs(l) {
    for (; l && l.firstChild; ) l = l.firstChild;
    return l;
  }
  function ys(l, t) {
    var e = hs(l);
    l = 0;
    for (var a; e; ) {
      if (e.nodeType === 3) {
        if (a = l + e.textContent.length, l <= t && a >= t)
          return { node: e, offset: t - l };
        l = a;
      }
      l: {
        for (; e; ) {
          if (e.nextSibling) {
            e = e.nextSibling;
            break l;
          }
          e = e.parentNode;
        }
        e = void 0;
      }
      e = hs(e);
    }
  }
  function vs(l, t) {
    return l && t ? l === t ? !0 : l && l.nodeType === 3 ? !1 : t && t.nodeType === 3 ? vs(l, t.parentNode) : "contains" in l ? l.contains(t) : l.compareDocumentPosition ? !!(l.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function gs(l) {
    l = l != null && l.ownerDocument != null && l.ownerDocument.defaultView != null ? l.ownerDocument.defaultView : window;
    for (var t = wu(l.document); t instanceof l.HTMLIFrameElement; ) {
      try {
        var e = typeof t.contentWindow.location.href == "string";
      } catch {
        e = !1;
      }
      if (e) l = t.contentWindow;
      else break;
      t = wu(l.document);
    }
    return t;
  }
  function _i(l) {
    var t = l && l.nodeName && l.nodeName.toLowerCase();
    return t && (t === "input" && (l.type === "text" || l.type === "search" || l.type === "tel" || l.type === "url" || l.type === "password") || t === "textarea" || l.contentEditable === "true");
  }
  var Xd = Kt && "documentMode" in document && 11 >= document.documentMode, sa = null, Mi = null, tu = null, Oi = !1;
  function bs(l, t, e) {
    var a = e.window === e ? e.document : e.nodeType === 9 ? e : e.ownerDocument;
    Oi || sa == null || sa !== wu(a) || (a = sa, "selectionStart" in a && _i(a) ? a = { start: a.selectionStart, end: a.selectionEnd } : (a = (a.ownerDocument && a.ownerDocument.defaultView || window).getSelection(), a = {
      anchorNode: a.anchorNode,
      anchorOffset: a.anchorOffset,
      focusNode: a.focusNode,
      focusOffset: a.focusOffset
    }), tu && lu(tu, a) || (tu = a, a = Zn(Mi, "onSelect"), 0 < a.length && (t = new Iu(
      "onSelect",
      "select",
      null,
      t,
      e
    ), l.push({ event: t, listeners: a }), t.target = sa)));
  }
  function Be(l, t) {
    var e = {};
    return e[l.toLowerCase()] = t.toLowerCase(), e["Webkit" + l] = "webkit" + t, e["Moz" + l] = "moz" + t, e;
  }
  var oa = {
    animationend: Be("Animation", "AnimationEnd"),
    animationiteration: Be("Animation", "AnimationIteration"),
    animationstart: Be("Animation", "AnimationStart"),
    transitionrun: Be("Transition", "TransitionRun"),
    transitionstart: Be("Transition", "TransitionStart"),
    transitioncancel: Be("Transition", "TransitionCancel"),
    transitionend: Be("Transition", "TransitionEnd")
  }, Ui = {}, Ss = {};
  Kt && (Ss = document.createElement("div").style, "AnimationEvent" in window || (delete oa.animationend.animation, delete oa.animationiteration.animation, delete oa.animationstart.animation), "TransitionEvent" in window || delete oa.transitionend.transition);
  function qe(l) {
    if (Ui[l]) return Ui[l];
    if (!oa[l]) return l;
    var t = oa[l], e;
    for (e in t)
      if (t.hasOwnProperty(e) && e in Ss)
        return Ui[l] = t[e];
    return l;
  }
  var ps = qe("animationend"), zs = qe("animationiteration"), Ts = qe("animationstart"), Qd = qe("transitionrun"), Zd = qe("transitionstart"), Vd = qe("transitioncancel"), xs = qe("transitionend"), Es = /* @__PURE__ */ new Map(), Di = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
    " "
  );
  Di.push("scrollEnd");
  function jt(l, t) {
    Es.set(l, t), Re(t, [l]);
  }
  var tn = typeof reportError == "function" ? reportError : function(l) {
    if (typeof window == "object" && typeof window.ErrorEvent == "function") {
      var t = new window.ErrorEvent("error", {
        bubbles: !0,
        cancelable: !0,
        message: typeof l == "object" && l !== null && typeof l.message == "string" ? String(l.message) : String(l),
        error: l
      });
      if (!window.dispatchEvent(t)) return;
    } else if (typeof process == "object" && typeof process.emit == "function") {
      process.emit("uncaughtException", l);
      return;
    }
    console.error(l);
  }, Et = [], ra = 0, ji = 0;
  function en() {
    for (var l = ra, t = ji = ra = 0; t < l; ) {
      var e = Et[t];
      Et[t++] = null;
      var a = Et[t];
      Et[t++] = null;
      var u = Et[t];
      Et[t++] = null;
      var n = Et[t];
      if (Et[t++] = null, a !== null && u !== null) {
        var i = a.pending;
        i === null ? u.next = u : (u.next = i.next, i.next = u), a.pending = u;
      }
      n !== 0 && As(e, u, n);
    }
  }
  function an(l, t, e, a) {
    Et[ra++] = l, Et[ra++] = t, Et[ra++] = e, Et[ra++] = a, ji |= a, l.lanes |= a, l = l.alternate, l !== null && (l.lanes |= a);
  }
  function Ci(l, t, e, a) {
    return an(l, t, e, a), un(l);
  }
  function Ye(l, t) {
    return an(l, null, null, t), un(l);
  }
  function As(l, t, e) {
    l.lanes |= e;
    var a = l.alternate;
    a !== null && (a.lanes |= e);
    for (var u = !1, n = l.return; n !== null; )
      n.childLanes |= e, a = n.alternate, a !== null && (a.childLanes |= e), n.tag === 22 && (l = n.stateNode, l === null || l._visibility & 1 || (u = !0)), l = n, n = n.return;
    return l.tag === 3 ? (n = l.stateNode, u && t !== null && (u = 31 - rt(e), l = n.hiddenUpdates, a = l[u], a === null ? l[u] = [t] : a.push(t), t.lane = e | 536870912), n) : null;
  }
  function un(l) {
    if (50 < xu)
      throw xu = 0, Qc = null, Error(r(185));
    for (var t = l.return; t !== null; )
      l = t, t = l.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var da = {};
  function Kd(l, t, e, a) {
    this.tag = l, this.key = e, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = a, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function mt(l, t, e, a) {
    return new Kd(l, t, e, a);
  }
  function Ri(l) {
    return l = l.prototype, !(!l || !l.isReactComponent);
  }
  function Jt(l, t) {
    var e = l.alternate;
    return e === null ? (e = mt(
      l.tag,
      t,
      l.key,
      l.mode
    ), e.elementType = l.elementType, e.type = l.type, e.stateNode = l.stateNode, e.alternate = l, l.alternate = e) : (e.pendingProps = t, e.type = l.type, e.flags = 0, e.subtreeFlags = 0, e.deletions = null), e.flags = l.flags & 65011712, e.childLanes = l.childLanes, e.lanes = l.lanes, e.child = l.child, e.memoizedProps = l.memoizedProps, e.memoizedState = l.memoizedState, e.updateQueue = l.updateQueue, t = l.dependencies, e.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, e.sibling = l.sibling, e.index = l.index, e.ref = l.ref, e.refCleanup = l.refCleanup, e;
  }
  function Ns(l, t) {
    l.flags &= 65011714;
    var e = l.alternate;
    return e === null ? (l.childLanes = 0, l.lanes = t, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = e.childLanes, l.lanes = e.lanes, l.child = e.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = e.memoizedProps, l.memoizedState = e.memoizedState, l.updateQueue = e.updateQueue, l.type = e.type, t = e.dependencies, l.dependencies = t === null ? null : {
      lanes: t.lanes,
      firstContext: t.firstContext
    }), l;
  }
  function nn(l, t, e, a, u, n) {
    var i = 0;
    if (a = l, typeof l == "function") Ri(l) && (i = 1);
    else if (typeof l == "string")
      i = km(
        l,
        e,
        R.current
      ) ? 26 : l === "html" || l === "head" || l === "body" ? 27 : 5;
    else
      l: switch (l) {
        case st:
          return l = mt(31, e, t, u), l.elementType = st, l.lanes = n, l;
        case sl:
          return Ge(e.children, u, n, t);
        case Cl:
          i = 8, u |= 24;
          break;
        case dl:
          return l = mt(12, e, t, u | 2), l.elementType = dl, l.lanes = n, l;
        case St:
          return l = mt(13, e, t, u), l.elementType = St, l.lanes = n, l;
        case Vl:
          return l = mt(19, e, t, u), l.elementType = Vl, l.lanes = n, l;
        default:
          if (typeof l == "object" && l !== null)
            switch (l.$$typeof) {
              case pl:
                i = 10;
                break l;
              case ft:
                i = 9;
                break l;
              case Zl:
                i = 11;
                break l;
              case F:
                i = 14;
                break l;
              case Kl:
                i = 16, a = null;
                break l;
            }
          i = 29, e = Error(
            r(130, l === null ? "null" : typeof l, "")
          ), a = null;
      }
    return t = mt(i, e, t, u), t.elementType = l, t.type = a, t.lanes = n, t;
  }
  function Ge(l, t, e, a) {
    return l = mt(7, l, a, t), l.lanes = e, l;
  }
  function Hi(l, t, e) {
    return l = mt(6, l, null, t), l.lanes = e, l;
  }
  function _s(l) {
    var t = mt(18, null, null, 0);
    return t.stateNode = l, t;
  }
  function Bi(l, t, e) {
    return t = mt(
      4,
      l.children !== null ? l.children : [],
      l.key,
      t
    ), t.lanes = e, t.stateNode = {
      containerInfo: l.containerInfo,
      pendingChildren: null,
      implementation: l.implementation
    }, t;
  }
  var Ms = /* @__PURE__ */ new WeakMap();
  function At(l, t) {
    if (typeof l == "object" && l !== null) {
      var e = Ms.get(l);
      return e !== void 0 ? e : (t = {
        value: l,
        source: t,
        stack: N(t)
      }, Ms.set(l, t), t);
    }
    return {
      value: l,
      source: t,
      stack: N(t)
    };
  }
  var ma = [], ha = 0, cn = null, eu = 0, Nt = [], _t = 0, re = null, Bt = 1, qt = "";
  function wt(l, t) {
    ma[ha++] = eu, ma[ha++] = cn, cn = l, eu = t;
  }
  function Os(l, t, e) {
    Nt[_t++] = Bt, Nt[_t++] = qt, Nt[_t++] = re, re = l;
    var a = Bt;
    l = qt;
    var u = 32 - rt(a) - 1;
    a &= ~(1 << u), e += 1;
    var n = 32 - rt(t) + u;
    if (30 < n) {
      var i = u - u % 5;
      n = (a & (1 << i) - 1).toString(32), a >>= i, u -= i, Bt = 1 << 32 - rt(t) + u | e << u | a, qt = n + l;
    } else
      Bt = 1 << n | e << u | a, qt = l;
  }
  function qi(l) {
    l.return !== null && (wt(l, 1), Os(l, 1, 0));
  }
  function Yi(l) {
    for (; l === cn; )
      cn = ma[--ha], ma[ha] = null, eu = ma[--ha], ma[ha] = null;
    for (; l === re; )
      re = Nt[--_t], Nt[_t] = null, qt = Nt[--_t], Nt[_t] = null, Bt = Nt[--_t], Nt[_t] = null;
  }
  function Us(l, t) {
    Nt[_t++] = Bt, Nt[_t++] = qt, Nt[_t++] = re, Bt = t.id, qt = t.overflow, re = l;
  }
  var $l = null, xl = null, al = !1, de = null, Mt = !1, Gi = Error(r(519));
  function me(l) {
    var t = Error(
      r(
        418,
        1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML",
        ""
      )
    );
    throw au(At(t, l)), Gi;
  }
  function Ds(l) {
    var t = l.stateNode, e = l.type, a = l.memoizedProps;
    switch (t[wl] = l, t[tt] = a, e) {
      case "dialog":
        P("cancel", t), P("close", t);
        break;
      case "iframe":
      case "object":
      case "embed":
        P("load", t);
        break;
      case "video":
      case "audio":
        for (e = 0; e < Au.length; e++)
          P(Au[e], t);
        break;
      case "source":
        P("error", t);
        break;
      case "img":
      case "image":
      case "link":
        P("error", t), P("load", t);
        break;
      case "details":
        P("toggle", t);
        break;
      case "input":
        P("invalid", t), Vf(
          t,
          a.value,
          a.defaultValue,
          a.checked,
          a.defaultChecked,
          a.type,
          a.name,
          !0
        );
        break;
      case "select":
        P("invalid", t);
        break;
      case "textarea":
        P("invalid", t), Jf(t, a.value, a.defaultValue, a.children);
    }
    e = a.children, typeof e != "string" && typeof e != "number" && typeof e != "bigint" || t.textContent === "" + e || a.suppressHydrationWarning === !0 || W0(t.textContent, e) ? (a.popover != null && (P("beforetoggle", t), P("toggle", t)), a.onScroll != null && P("scroll", t), a.onScrollEnd != null && P("scrollend", t), a.onClick != null && (t.onclick = Vt), t = !0) : t = !1, t || me(l, !0);
  }
  function js(l) {
    for ($l = l.return; $l; )
      switch ($l.tag) {
        case 5:
        case 31:
        case 13:
          Mt = !1;
          return;
        case 27:
        case 3:
          Mt = !0;
          return;
        default:
          $l = $l.return;
      }
  }
  function ya(l) {
    if (l !== $l) return !1;
    if (!al) return js(l), al = !0, !1;
    var t = l.tag, e;
    if ((e = t !== 3 && t !== 27) && ((e = t === 5) && (e = l.type, e = !(e !== "form" && e !== "button") || af(l.type, l.memoizedProps)), e = !e), e && xl && me(l), js(l), t === 13) {
      if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(r(317));
      xl = ur(l);
    } else if (t === 31) {
      if (l = l.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(r(317));
      xl = ur(l);
    } else
      t === 27 ? (t = xl, _e(l.type) ? (l = sf, sf = null, xl = l) : xl = t) : xl = $l ? Ut(l.stateNode.nextSibling) : null;
    return !0;
  }
  function Le() {
    xl = $l = null, al = !1;
  }
  function Li() {
    var l = de;
    return l !== null && (it === null ? it = l : it.push.apply(
      it,
      l
    ), de = null), l;
  }
  function au(l) {
    de === null ? de = [l] : de.push(l);
  }
  var Xi = o(null), Xe = null, $t = null;
  function he(l, t, e) {
    O(Xi, t._currentValue), t._currentValue = e;
  }
  function Wt(l) {
    l._currentValue = Xi.current, A(Xi);
  }
  function Qi(l, t, e) {
    for (; l !== null; ) {
      var a = l.alternate;
      if ((l.childLanes & t) !== t ? (l.childLanes |= t, a !== null && (a.childLanes |= t)) : a !== null && (a.childLanes & t) !== t && (a.childLanes |= t), l === e) break;
      l = l.return;
    }
  }
  function Zi(l, t, e, a) {
    var u = l.child;
    for (u !== null && (u.return = l); u !== null; ) {
      var n = u.dependencies;
      if (n !== null) {
        var i = u.child;
        n = n.firstContext;
        l: for (; n !== null; ) {
          var c = n;
          n = u;
          for (var f = 0; f < t.length; f++)
            if (c.context === t[f]) {
              n.lanes |= e, c = n.alternate, c !== null && (c.lanes |= e), Qi(
                n.return,
                e,
                l
              ), a || (i = null);
              break l;
            }
          n = c.next;
        }
      } else if (u.tag === 18) {
        if (i = u.return, i === null) throw Error(r(341));
        i.lanes |= e, n = i.alternate, n !== null && (n.lanes |= e), Qi(i, e, l), i = null;
      } else i = u.child;
      if (i !== null) i.return = u;
      else
        for (i = u; i !== null; ) {
          if (i === l) {
            i = null;
            break;
          }
          if (u = i.sibling, u !== null) {
            u.return = i.return, i = u;
            break;
          }
          i = i.return;
        }
      u = i;
    }
  }
  function va(l, t, e, a) {
    l = null;
    for (var u = t, n = !1; u !== null; ) {
      if (!n) {
        if ((u.flags & 524288) !== 0) n = !0;
        else if ((u.flags & 262144) !== 0) break;
      }
      if (u.tag === 10) {
        var i = u.alternate;
        if (i === null) throw Error(r(387));
        if (i = i.memoizedProps, i !== null) {
          var c = u.type;
          dt(u.pendingProps.value, i.value) || (l !== null ? l.push(c) : l = [c]);
        }
      } else if (u === nl.current) {
        if (i = u.alternate, i === null) throw Error(r(387));
        i.memoizedState.memoizedState !== u.memoizedState.memoizedState && (l !== null ? l.push(Uu) : l = [Uu]);
      }
      u = u.return;
    }
    l !== null && Zi(
      t,
      l,
      e,
      a
    ), t.flags |= 262144;
  }
  function fn(l) {
    for (l = l.firstContext; l !== null; ) {
      if (!dt(
        l.context._currentValue,
        l.memoizedValue
      ))
        return !0;
      l = l.next;
    }
    return !1;
  }
  function Qe(l) {
    Xe = l, $t = null, l = l.dependencies, l !== null && (l.firstContext = null);
  }
  function Wl(l) {
    return Cs(Xe, l);
  }
  function sn(l, t) {
    return Xe === null && Qe(l), Cs(l, t);
  }
  function Cs(l, t) {
    var e = t._currentValue;
    if (t = { context: t, memoizedValue: e, next: null }, $t === null) {
      if (l === null) throw Error(r(308));
      $t = t, l.dependencies = { lanes: 0, firstContext: t }, l.flags |= 524288;
    } else $t = $t.next = t;
    return e;
  }
  var Jd = typeof AbortController < "u" ? AbortController : function() {
    var l = [], t = this.signal = {
      aborted: !1,
      addEventListener: function(e, a) {
        l.push(a);
      }
    };
    this.abort = function() {
      t.aborted = !0, l.forEach(function(e) {
        return e();
      });
    };
  }, wd = y.unstable_scheduleCallback, $d = y.unstable_NormalPriority, Hl = {
    $$typeof: pl,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function Vi() {
    return {
      controller: new Jd(),
      data: /* @__PURE__ */ new Map(),
      refCount: 0
    };
  }
  function uu(l) {
    l.refCount--, l.refCount === 0 && wd($d, function() {
      l.controller.abort();
    });
  }
  var nu = null, Ki = 0, ga = 0, ba = null;
  function Wd(l, t) {
    if (nu === null) {
      var e = nu = [];
      Ki = 0, ga = $c(), ba = {
        status: "pending",
        value: void 0,
        then: function(a) {
          e.push(a);
        }
      };
    }
    return Ki++, t.then(Rs, Rs), t;
  }
  function Rs() {
    if (--Ki === 0 && nu !== null) {
      ba !== null && (ba.status = "fulfilled");
      var l = nu;
      nu = null, ga = 0, ba = null;
      for (var t = 0; t < l.length; t++) (0, l[t])();
    }
  }
  function kd(l, t) {
    var e = [], a = {
      status: "pending",
      value: null,
      reason: null,
      then: function(u) {
        e.push(u);
      }
    };
    return l.then(
      function() {
        a.status = "fulfilled", a.value = t;
        for (var u = 0; u < e.length; u++) (0, e[u])(t);
      },
      function(u) {
        for (a.status = "rejected", a.reason = u, u = 0; u < e.length; u++)
          (0, e[u])(void 0);
      }
    ), a;
  }
  var Hs = p.S;
  p.S = function(l, t) {
    S0 = Al(), typeof t == "object" && t !== null && typeof t.then == "function" && Wd(l, t), Hs !== null && Hs(l, t);
  };
  var Ze = o(null);
  function Ji() {
    var l = Ze.current;
    return l !== null ? l : Tl.pooledCache;
  }
  function on(l, t) {
    t === null ? O(Ze, Ze.current) : O(Ze, t.pool);
  }
  function Bs() {
    var l = Ji();
    return l === null ? null : { parent: Hl._currentValue, pool: l };
  }
  var Sa = Error(r(460)), wi = Error(r(474)), rn = Error(r(542)), dn = { then: function() {
  } };
  function qs(l) {
    return l = l.status, l === "fulfilled" || l === "rejected";
  }
  function Ys(l, t, e) {
    switch (e = l[e], e === void 0 ? l.push(t) : e !== t && (t.then(Vt, Vt), t = e), t.status) {
      case "fulfilled":
        return t.value;
      case "rejected":
        throw l = t.reason, Ls(l), l;
      default:
        if (typeof t.status == "string") t.then(Vt, Vt);
        else {
          if (l = Tl, l !== null && 100 < l.shellSuspendCounter)
            throw Error(r(482));
          l = t, l.status = "pending", l.then(
            function(a) {
              if (t.status === "pending") {
                var u = t;
                u.status = "fulfilled", u.value = a;
              }
            },
            function(a) {
              if (t.status === "pending") {
                var u = t;
                u.status = "rejected", u.reason = a;
              }
            }
          );
        }
        switch (t.status) {
          case "fulfilled":
            return t.value;
          case "rejected":
            throw l = t.reason, Ls(l), l;
        }
        throw Ke = t, Sa;
    }
  }
  function Ve(l) {
    try {
      var t = l._init;
      return t(l._payload);
    } catch (e) {
      throw e !== null && typeof e == "object" && typeof e.then == "function" ? (Ke = e, Sa) : e;
    }
  }
  var Ke = null;
  function Gs() {
    if (Ke === null) throw Error(r(459));
    var l = Ke;
    return Ke = null, l;
  }
  function Ls(l) {
    if (l === Sa || l === rn)
      throw Error(r(483));
  }
  var pa = null, iu = 0;
  function mn(l) {
    var t = iu;
    return iu += 1, pa === null && (pa = []), Ys(pa, l, t);
  }
  function cu(l, t) {
    t = t.props.ref, l.ref = t !== void 0 ? t : null;
  }
  function hn(l, t) {
    throw t.$$typeof === fl ? Error(r(525)) : (l = Object.prototype.toString.call(t), Error(
      r(
        31,
        l === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : l
      )
    ));
  }
  function Xs(l) {
    function t(d, s) {
      if (l) {
        var m = d.deletions;
        m === null ? (d.deletions = [s], d.flags |= 16) : m.push(s);
      }
    }
    function e(d, s) {
      if (!l) return null;
      for (; s !== null; )
        t(d, s), s = s.sibling;
      return null;
    }
    function a(d) {
      for (var s = /* @__PURE__ */ new Map(); d !== null; )
        d.key !== null ? s.set(d.key, d) : s.set(d.index, d), d = d.sibling;
      return s;
    }
    function u(d, s) {
      return d = Jt(d, s), d.index = 0, d.sibling = null, d;
    }
    function n(d, s, m) {
      return d.index = m, l ? (m = d.alternate, m !== null ? (m = m.index, m < s ? (d.flags |= 67108866, s) : m) : (d.flags |= 67108866, s)) : (d.flags |= 1048576, s);
    }
    function i(d) {
      return l && d.alternate === null && (d.flags |= 67108866), d;
    }
    function c(d, s, m, z) {
      return s === null || s.tag !== 6 ? (s = Hi(m, d.mode, z), s.return = d, s) : (s = u(s, m), s.return = d, s);
    }
    function f(d, s, m, z) {
      var G = m.type;
      return G === sl ? S(
        d,
        s,
        m.props.children,
        z,
        m.key
      ) : s !== null && (s.elementType === G || typeof G == "object" && G !== null && G.$$typeof === Kl && Ve(G) === s.type) ? (s = u(s, m.props), cu(s, m), s.return = d, s) : (s = nn(
        m.type,
        m.key,
        m.props,
        null,
        d.mode,
        z
      ), cu(s, m), s.return = d, s);
    }
    function h(d, s, m, z) {
      return s === null || s.tag !== 4 || s.stateNode.containerInfo !== m.containerInfo || s.stateNode.implementation !== m.implementation ? (s = Bi(m, d.mode, z), s.return = d, s) : (s = u(s, m.children || []), s.return = d, s);
    }
    function S(d, s, m, z, G) {
      return s === null || s.tag !== 7 ? (s = Ge(
        m,
        d.mode,
        z,
        G
      ), s.return = d, s) : (s = u(s, m), s.return = d, s);
    }
    function E(d, s, m) {
      if (typeof s == "string" && s !== "" || typeof s == "number" || typeof s == "bigint")
        return s = Hi(
          "" + s,
          d.mode,
          m
        ), s.return = d, s;
      if (typeof s == "object" && s !== null) {
        switch (s.$$typeof) {
          case ul:
            return m = nn(
              s.type,
              s.key,
              s.props,
              null,
              d.mode,
              m
            ), cu(m, s), m.return = d, m;
          case _l:
            return s = Bi(
              s,
              d.mode,
              m
            ), s.return = d, s;
          case Kl:
            return s = Ve(s), E(d, s, m);
        }
        if (vl(s) || Gl(s))
          return s = Ge(
            s,
            d.mode,
            m,
            null
          ), s.return = d, s;
        if (typeof s.then == "function")
          return E(d, mn(s), m);
        if (s.$$typeof === pl)
          return E(
            d,
            sn(d, s),
            m
          );
        hn(d, s);
      }
      return null;
    }
    function v(d, s, m, z) {
      var G = s !== null ? s.key : null;
      if (typeof m == "string" && m !== "" || typeof m == "number" || typeof m == "bigint")
        return G !== null ? null : c(d, s, "" + m, z);
      if (typeof m == "object" && m !== null) {
        switch (m.$$typeof) {
          case ul:
            return m.key === G ? f(d, s, m, z) : null;
          case _l:
            return m.key === G ? h(d, s, m, z) : null;
          case Kl:
            return m = Ve(m), v(d, s, m, z);
        }
        if (vl(m) || Gl(m))
          return G !== null ? null : S(d, s, m, z, null);
        if (typeof m.then == "function")
          return v(
            d,
            s,
            mn(m),
            z
          );
        if (m.$$typeof === pl)
          return v(
            d,
            s,
            sn(d, m),
            z
          );
        hn(d, m);
      }
      return null;
    }
    function g(d, s, m, z, G) {
      if (typeof z == "string" && z !== "" || typeof z == "number" || typeof z == "bigint")
        return d = d.get(m) || null, c(s, d, "" + z, G);
      if (typeof z == "object" && z !== null) {
        switch (z.$$typeof) {
          case ul:
            return d = d.get(
              z.key === null ? m : z.key
            ) || null, f(s, d, z, G);
          case _l:
            return d = d.get(
              z.key === null ? m : z.key
            ) || null, h(s, d, z, G);
          case Kl:
            return z = Ve(z), g(
              d,
              s,
              m,
              z,
              G
            );
        }
        if (vl(z) || Gl(z))
          return d = d.get(m) || null, S(s, d, z, G, null);
        if (typeof z.then == "function")
          return g(
            d,
            s,
            m,
            mn(z),
            G
          );
        if (z.$$typeof === pl)
          return g(
            d,
            s,
            m,
            sn(s, z),
            G
          );
        hn(s, z);
      }
      return null;
    }
    function C(d, s, m, z) {
      for (var G = null, il = null, B = s, W = s = 0, el = null; B !== null && W < m.length; W++) {
        B.index > W ? (el = B, B = null) : el = B.sibling;
        var cl = v(
          d,
          B,
          m[W],
          z
        );
        if (cl === null) {
          B === null && (B = el);
          break;
        }
        l && B && cl.alternate === null && t(d, B), s = n(cl, s, W), il === null ? G = cl : il.sibling = cl, il = cl, B = el;
      }
      if (W === m.length)
        return e(d, B), al && wt(d, W), G;
      if (B === null) {
        for (; W < m.length; W++)
          B = E(d, m[W], z), B !== null && (s = n(
            B,
            s,
            W
          ), il === null ? G = B : il.sibling = B, il = B);
        return al && wt(d, W), G;
      }
      for (B = a(B); W < m.length; W++)
        el = g(
          B,
          d,
          W,
          m[W],
          z
        ), el !== null && (l && el.alternate !== null && B.delete(
          el.key === null ? W : el.key
        ), s = n(
          el,
          s,
          W
        ), il === null ? G = el : il.sibling = el, il = el);
      return l && B.forEach(function(je) {
        return t(d, je);
      }), al && wt(d, W), G;
    }
    function L(d, s, m, z) {
      if (m == null) throw Error(r(151));
      for (var G = null, il = null, B = s, W = s = 0, el = null, cl = m.next(); B !== null && !cl.done; W++, cl = m.next()) {
        B.index > W ? (el = B, B = null) : el = B.sibling;
        var je = v(d, B, cl.value, z);
        if (je === null) {
          B === null && (B = el);
          break;
        }
        l && B && je.alternate === null && t(d, B), s = n(je, s, W), il === null ? G = je : il.sibling = je, il = je, B = el;
      }
      if (cl.done)
        return e(d, B), al && wt(d, W), G;
      if (B === null) {
        for (; !cl.done; W++, cl = m.next())
          cl = E(d, cl.value, z), cl !== null && (s = n(cl, s, W), il === null ? G = cl : il.sibling = cl, il = cl);
        return al && wt(d, W), G;
      }
      for (B = a(B); !cl.done; W++, cl = m.next())
        cl = g(B, d, W, cl.value, z), cl !== null && (l && cl.alternate !== null && B.delete(cl.key === null ? W : cl.key), s = n(cl, s, W), il === null ? G = cl : il.sibling = cl, il = cl);
      return l && B.forEach(function(ch) {
        return t(d, ch);
      }), al && wt(d, W), G;
    }
    function Sl(d, s, m, z) {
      if (typeof m == "object" && m !== null && m.type === sl && m.key === null && (m = m.props.children), typeof m == "object" && m !== null) {
        switch (m.$$typeof) {
          case ul:
            l: {
              for (var G = m.key; s !== null; ) {
                if (s.key === G) {
                  if (G = m.type, G === sl) {
                    if (s.tag === 7) {
                      e(
                        d,
                        s.sibling
                      ), z = u(
                        s,
                        m.props.children
                      ), z.return = d, d = z;
                      break l;
                    }
                  } else if (s.elementType === G || typeof G == "object" && G !== null && G.$$typeof === Kl && Ve(G) === s.type) {
                    e(
                      d,
                      s.sibling
                    ), z = u(s, m.props), cu(z, m), z.return = d, d = z;
                    break l;
                  }
                  e(d, s);
                  break;
                } else t(d, s);
                s = s.sibling;
              }
              m.type === sl ? (z = Ge(
                m.props.children,
                d.mode,
                z,
                m.key
              ), z.return = d, d = z) : (z = nn(
                m.type,
                m.key,
                m.props,
                null,
                d.mode,
                z
              ), cu(z, m), z.return = d, d = z);
            }
            return i(d);
          case _l:
            l: {
              for (G = m.key; s !== null; ) {
                if (s.key === G)
                  if (s.tag === 4 && s.stateNode.containerInfo === m.containerInfo && s.stateNode.implementation === m.implementation) {
                    e(
                      d,
                      s.sibling
                    ), z = u(s, m.children || []), z.return = d, d = z;
                    break l;
                  } else {
                    e(d, s);
                    break;
                  }
                else t(d, s);
                s = s.sibling;
              }
              z = Bi(m, d.mode, z), z.return = d, d = z;
            }
            return i(d);
          case Kl:
            return m = Ve(m), Sl(
              d,
              s,
              m,
              z
            );
        }
        if (vl(m))
          return C(
            d,
            s,
            m,
            z
          );
        if (Gl(m)) {
          if (G = Gl(m), typeof G != "function") throw Error(r(150));
          return m = G.call(m), L(
            d,
            s,
            m,
            z
          );
        }
        if (typeof m.then == "function")
          return Sl(
            d,
            s,
            mn(m),
            z
          );
        if (m.$$typeof === pl)
          return Sl(
            d,
            s,
            sn(d, m),
            z
          );
        hn(d, m);
      }
      return typeof m == "string" && m !== "" || typeof m == "number" || typeof m == "bigint" ? (m = "" + m, s !== null && s.tag === 6 ? (e(d, s.sibling), z = u(s, m), z.return = d, d = z) : (e(d, s), z = Hi(m, d.mode, z), z.return = d, d = z), i(d)) : e(d, s);
    }
    return function(d, s, m, z) {
      try {
        iu = 0;
        var G = Sl(
          d,
          s,
          m,
          z
        );
        return pa = null, G;
      } catch (B) {
        if (B === Sa || B === rn) throw B;
        var il = mt(29, B, null, d.mode);
        return il.lanes = z, il.return = d, il;
      }
    };
  }
  var Je = Xs(!0), Qs = Xs(!1), ye = !1;
  function $i(l) {
    l.updateQueue = {
      baseState: l.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function Wi(l, t) {
    l = l.updateQueue, t.updateQueue === l && (t.updateQueue = {
      baseState: l.baseState,
      firstBaseUpdate: l.firstBaseUpdate,
      lastBaseUpdate: l.lastBaseUpdate,
      shared: l.shared,
      callbacks: null
    });
  }
  function ve(l) {
    return { lane: l, tag: 0, payload: null, callback: null, next: null };
  }
  function ge(l, t, e) {
    var a = l.updateQueue;
    if (a === null) return null;
    if (a = a.shared, (rl & 2) !== 0) {
      var u = a.pending;
      return u === null ? t.next = t : (t.next = u.next, u.next = t), a.pending = t, t = un(l), As(l, null, e), t;
    }
    return an(l, a, t, e), un(l);
  }
  function fu(l, t, e) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (e & 4194048) !== 0)) {
      var a = t.lanes;
      a &= l.pendingLanes, e |= a, t.lanes = e, Cf(l, e);
    }
  }
  function ki(l, t) {
    var e = l.updateQueue, a = l.alternate;
    if (a !== null && (a = a.updateQueue, e === a)) {
      var u = null, n = null;
      if (e = e.firstBaseUpdate, e !== null) {
        do {
          var i = {
            lane: e.lane,
            tag: e.tag,
            payload: e.payload,
            callback: null,
            next: null
          };
          n === null ? u = n = i : n = n.next = i, e = e.next;
        } while (e !== null);
        n === null ? u = n = t : n = n.next = t;
      } else u = n = t;
      e = {
        baseState: a.baseState,
        firstBaseUpdate: u,
        lastBaseUpdate: n,
        shared: a.shared,
        callbacks: a.callbacks
      }, l.updateQueue = e;
      return;
    }
    l = e.lastBaseUpdate, l === null ? e.firstBaseUpdate = t : l.next = t, e.lastBaseUpdate = t;
  }
  var Fi = !1;
  function su() {
    if (Fi) {
      var l = ba;
      if (l !== null) throw l;
    }
  }
  function ou(l, t, e, a) {
    Fi = !1;
    var u = l.updateQueue;
    ye = !1;
    var n = u.firstBaseUpdate, i = u.lastBaseUpdate, c = u.shared.pending;
    if (c !== null) {
      u.shared.pending = null;
      var f = c, h = f.next;
      f.next = null, i === null ? n = h : i.next = h, i = f;
      var S = l.alternate;
      S !== null && (S = S.updateQueue, c = S.lastBaseUpdate, c !== i && (c === null ? S.firstBaseUpdate = h : c.next = h, S.lastBaseUpdate = f));
    }
    if (n !== null) {
      var E = u.baseState;
      i = 0, S = h = f = null, c = n;
      do {
        var v = c.lane & -536870913, g = v !== c.lane;
        if (g ? (tl & v) === v : (a & v) === v) {
          v !== 0 && v === ga && (Fi = !0), S !== null && (S = S.next = {
            lane: 0,
            tag: c.tag,
            payload: c.payload,
            callback: null,
            next: null
          });
          l: {
            var C = l, L = c;
            v = t;
            var Sl = e;
            switch (L.tag) {
              case 1:
                if (C = L.payload, typeof C == "function") {
                  E = C.call(Sl, E, v);
                  break l;
                }
                E = C;
                break l;
              case 3:
                C.flags = C.flags & -65537 | 128;
              case 0:
                if (C = L.payload, v = typeof C == "function" ? C.call(Sl, E, v) : C, v == null) break l;
                E = D({}, E, v);
                break l;
              case 2:
                ye = !0;
            }
          }
          v = c.callback, v !== null && (l.flags |= 64, g && (l.flags |= 8192), g = u.callbacks, g === null ? u.callbacks = [v] : g.push(v));
        } else
          g = {
            lane: v,
            tag: c.tag,
            payload: c.payload,
            callback: c.callback,
            next: null
          }, S === null ? (h = S = g, f = E) : S = S.next = g, i |= v;
        if (c = c.next, c === null) {
          if (c = u.shared.pending, c === null)
            break;
          g = c, c = g.next, g.next = null, u.lastBaseUpdate = g, u.shared.pending = null;
        }
      } while (!0);
      S === null && (f = E), u.baseState = f, u.firstBaseUpdate = h, u.lastBaseUpdate = S, n === null && (u.shared.lanes = 0), Te |= i, l.lanes = i, l.memoizedState = E;
    }
  }
  function Zs(l, t) {
    if (typeof l != "function")
      throw Error(r(191, l));
    l.call(t);
  }
  function Vs(l, t) {
    var e = l.callbacks;
    if (e !== null)
      for (l.callbacks = null, l = 0; l < e.length; l++)
        Zs(e[l], t);
  }
  var za = o(null), yn = o(0);
  function Ks(l, t) {
    l = ue, O(yn, l), O(za, t), ue = l | t.baseLanes;
  }
  function Ii() {
    O(yn, ue), O(za, za.current);
  }
  function Pi() {
    ue = yn.current, A(za), A(yn);
  }
  var ht = o(null), Ot = null;
  function be(l) {
    var t = l.alternate;
    O(Dl, Dl.current & 1), O(ht, l), Ot === null && (t === null || za.current !== null || t.memoizedState !== null) && (Ot = l);
  }
  function lc(l) {
    O(Dl, Dl.current), O(ht, l), Ot === null && (Ot = l);
  }
  function Js(l) {
    l.tag === 22 ? (O(Dl, Dl.current), O(ht, l), Ot === null && (Ot = l)) : Se();
  }
  function Se() {
    O(Dl, Dl.current), O(ht, ht.current);
  }
  function yt(l) {
    A(ht), Ot === l && (Ot = null), A(Dl);
  }
  var Dl = o(0);
  function vn(l) {
    for (var t = l; t !== null; ) {
      if (t.tag === 13) {
        var e = t.memoizedState;
        if (e !== null && (e = e.dehydrated, e === null || cf(e) || ff(e)))
          return t;
      } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === l) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === l) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var kt = 0, $ = null, gl = null, Bl = null, gn = !1, Ta = !1, we = !1, bn = 0, ru = 0, xa = null, Fd = 0;
  function Ol() {
    throw Error(r(321));
  }
  function tc(l, t) {
    if (t === null) return !1;
    for (var e = 0; e < t.length && e < l.length; e++)
      if (!dt(l[e], t[e])) return !1;
    return !0;
  }
  function ec(l, t, e, a, u, n) {
    return kt = n, $ = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, p.H = l === null || l.memoizedState === null ? Uo : gc, we = !1, n = e(a, u), we = !1, Ta && (n = $s(
      t,
      e,
      a,
      u
    )), ws(l), n;
  }
  function ws(l) {
    p.H = hu;
    var t = gl !== null && gl.next !== null;
    if (kt = 0, Bl = gl = $ = null, gn = !1, ru = 0, xa = null, t) throw Error(r(300));
    l === null || ql || (l = l.dependencies, l !== null && fn(l) && (ql = !0));
  }
  function $s(l, t, e, a) {
    $ = l;
    var u = 0;
    do {
      if (Ta && (xa = null), ru = 0, Ta = !1, 25 <= u) throw Error(r(301));
      if (u += 1, Bl = gl = null, l.updateQueue != null) {
        var n = l.updateQueue;
        n.lastEffect = null, n.events = null, n.stores = null, n.memoCache != null && (n.memoCache.index = 0);
      }
      p.H = Do, n = t(e, a);
    } while (Ta);
    return n;
  }
  function Id() {
    var l = p.H, t = l.useState()[0];
    return t = typeof t.then == "function" ? du(t) : t, l = l.useState()[0], (gl !== null ? gl.memoizedState : null) !== l && ($.flags |= 1024), t;
  }
  function ac() {
    var l = bn !== 0;
    return bn = 0, l;
  }
  function uc(l, t, e) {
    t.updateQueue = l.updateQueue, t.flags &= -2053, l.lanes &= ~e;
  }
  function nc(l) {
    if (gn) {
      for (l = l.memoizedState; l !== null; ) {
        var t = l.queue;
        t !== null && (t.pending = null), l = l.next;
      }
      gn = !1;
    }
    kt = 0, Bl = gl = $ = null, Ta = !1, ru = bn = 0, xa = null;
  }
  function lt() {
    var l = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    return Bl === null ? $.memoizedState = Bl = l : Bl = Bl.next = l, Bl;
  }
  function jl() {
    if (gl === null) {
      var l = $.alternate;
      l = l !== null ? l.memoizedState : null;
    } else l = gl.next;
    var t = Bl === null ? $.memoizedState : Bl.next;
    if (t !== null)
      Bl = t, gl = l;
    else {
      if (l === null)
        throw $.alternate === null ? Error(r(467)) : Error(r(310));
      gl = l, l = {
        memoizedState: gl.memoizedState,
        baseState: gl.baseState,
        baseQueue: gl.baseQueue,
        queue: gl.queue,
        next: null
      }, Bl === null ? $.memoizedState = Bl = l : Bl = Bl.next = l;
    }
    return Bl;
  }
  function Sn() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function du(l) {
    var t = ru;
    return ru += 1, xa === null && (xa = []), l = Ys(xa, l, t), t = $, (Bl === null ? t.memoizedState : Bl.next) === null && (t = t.alternate, p.H = t === null || t.memoizedState === null ? Uo : gc), l;
  }
  function pn(l) {
    if (l !== null && typeof l == "object") {
      if (typeof l.then == "function") return du(l);
      if (l.$$typeof === pl) return Wl(l);
    }
    throw Error(r(438, String(l)));
  }
  function ic(l) {
    var t = null, e = $.updateQueue;
    if (e !== null && (t = e.memoCache), t == null) {
      var a = $.alternate;
      a !== null && (a = a.updateQueue, a !== null && (a = a.memoCache, a != null && (t = {
        data: a.data.map(function(u) {
          return u.slice();
        }),
        index: 0
      })));
    }
    if (t == null && (t = { data: [], index: 0 }), e === null && (e = Sn(), $.updateQueue = e), e.memoCache = t, e = t.data[t.index], e === void 0)
      for (e = t.data[t.index] = Array(l), a = 0; a < l; a++)
        e[a] = Lt;
    return t.index++, e;
  }
  function Ft(l, t) {
    return typeof t == "function" ? t(l) : t;
  }
  function zn(l) {
    var t = jl();
    return cc(t, gl, l);
  }
  function cc(l, t, e) {
    var a = l.queue;
    if (a === null) throw Error(r(311));
    a.lastRenderedReducer = e;
    var u = l.baseQueue, n = a.pending;
    if (n !== null) {
      if (u !== null) {
        var i = u.next;
        u.next = n.next, n.next = i;
      }
      t.baseQueue = u = n, a.pending = null;
    }
    if (n = l.baseState, u === null) l.memoizedState = n;
    else {
      t = u.next;
      var c = i = null, f = null, h = t, S = !1;
      do {
        var E = h.lane & -536870913;
        if (E !== h.lane ? (tl & E) === E : (kt & E) === E) {
          var v = h.revertLane;
          if (v === 0)
            f !== null && (f = f.next = {
              lane: 0,
              revertLane: 0,
              gesture: null,
              action: h.action,
              hasEagerState: h.hasEagerState,
              eagerState: h.eagerState,
              next: null
            }), E === ga && (S = !0);
          else if ((kt & v) === v) {
            h = h.next, v === ga && (S = !0);
            continue;
          } else
            E = {
              lane: 0,
              revertLane: h.revertLane,
              gesture: null,
              action: h.action,
              hasEagerState: h.hasEagerState,
              eagerState: h.eagerState,
              next: null
            }, f === null ? (c = f = E, i = n) : f = f.next = E, $.lanes |= v, Te |= v;
          E = h.action, we && e(n, E), n = h.hasEagerState ? h.eagerState : e(n, E);
        } else
          v = {
            lane: E,
            revertLane: h.revertLane,
            gesture: h.gesture,
            action: h.action,
            hasEagerState: h.hasEagerState,
            eagerState: h.eagerState,
            next: null
          }, f === null ? (c = f = v, i = n) : f = f.next = v, $.lanes |= E, Te |= E;
        h = h.next;
      } while (h !== null && h !== t);
      if (f === null ? i = n : f.next = c, !dt(n, l.memoizedState) && (ql = !0, S && (e = ba, e !== null)))
        throw e;
      l.memoizedState = n, l.baseState = i, l.baseQueue = f, a.lastRenderedState = n;
    }
    return u === null && (a.lanes = 0), [l.memoizedState, a.dispatch];
  }
  function fc(l) {
    var t = jl(), e = t.queue;
    if (e === null) throw Error(r(311));
    e.lastRenderedReducer = l;
    var a = e.dispatch, u = e.pending, n = t.memoizedState;
    if (u !== null) {
      e.pending = null;
      var i = u = u.next;
      do
        n = l(n, i.action), i = i.next;
      while (i !== u);
      dt(n, t.memoizedState) || (ql = !0), t.memoizedState = n, t.baseQueue === null && (t.baseState = n), e.lastRenderedState = n;
    }
    return [n, a];
  }
  function Ws(l, t, e) {
    var a = $, u = jl(), n = al;
    if (n) {
      if (e === void 0) throw Error(r(407));
      e = e();
    } else e = t();
    var i = !dt(
      (gl || u).memoizedState,
      e
    );
    if (i && (u.memoizedState = e, ql = !0), u = u.queue, rc(Is.bind(null, a, u, l), [
      l
    ]), u.getSnapshot !== t || i || Bl !== null && Bl.memoizedState.tag & 1) {
      if (a.flags |= 2048, Ea(
        9,
        { destroy: void 0 },
        Fs.bind(
          null,
          a,
          u,
          e,
          t
        ),
        null
      ), Tl === null) throw Error(r(349));
      n || (kt & 127) !== 0 || ks(a, t, e);
    }
    return e;
  }
  function ks(l, t, e) {
    l.flags |= 16384, l = { getSnapshot: t, value: e }, t = $.updateQueue, t === null ? (t = Sn(), $.updateQueue = t, t.stores = [l]) : (e = t.stores, e === null ? t.stores = [l] : e.push(l));
  }
  function Fs(l, t, e, a) {
    t.value = e, t.getSnapshot = a, Ps(t) && lo(l);
  }
  function Is(l, t, e) {
    return e(function() {
      Ps(t) && lo(l);
    });
  }
  function Ps(l) {
    var t = l.getSnapshot;
    l = l.value;
    try {
      var e = t();
      return !dt(l, e);
    } catch {
      return !0;
    }
  }
  function lo(l) {
    var t = Ye(l, 2);
    t !== null && ct(t, l, 2);
  }
  function sc(l) {
    var t = lt();
    if (typeof l == "function") {
      var e = l;
      if (l = e(), we) {
        fe(!0);
        try {
          e();
        } finally {
          fe(!1);
        }
      }
    }
    return t.memoizedState = t.baseState = l, t.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Ft,
      lastRenderedState: l
    }, t;
  }
  function to(l, t, e, a) {
    return l.baseState = e, cc(
      l,
      gl,
      typeof a == "function" ? a : Ft
    );
  }
  function Pd(l, t, e, a, u) {
    if (En(l)) throw Error(r(485));
    if (l = t.action, l !== null) {
      var n = {
        payload: u,
        action: l,
        next: null,
        isTransition: !0,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(i) {
          n.listeners.push(i);
        }
      };
      p.T !== null ? e(!0) : n.isTransition = !1, a(n), e = t.pending, e === null ? (n.next = t.pending = n, eo(t, n)) : (n.next = e.next, t.pending = e.next = n);
    }
  }
  function eo(l, t) {
    var e = t.action, a = t.payload, u = l.state;
    if (t.isTransition) {
      var n = p.T, i = {};
      p.T = i;
      try {
        var c = e(u, a), f = p.S;
        f !== null && f(i, c), ao(l, t, c);
      } catch (h) {
        oc(l, t, h);
      } finally {
        n !== null && i.types !== null && (n.types = i.types), p.T = n;
      }
    } else
      try {
        n = e(u, a), ao(l, t, n);
      } catch (h) {
        oc(l, t, h);
      }
  }
  function ao(l, t, e) {
    e !== null && typeof e == "object" && typeof e.then == "function" ? e.then(
      function(a) {
        uo(l, t, a);
      },
      function(a) {
        return oc(l, t, a);
      }
    ) : uo(l, t, e);
  }
  function uo(l, t, e) {
    t.status = "fulfilled", t.value = e, no(t), l.state = e, t = l.pending, t !== null && (e = t.next, e === t ? l.pending = null : (e = e.next, t.next = e, eo(l, e)));
  }
  function oc(l, t, e) {
    var a = l.pending;
    if (l.pending = null, a !== null) {
      a = a.next;
      do
        t.status = "rejected", t.reason = e, no(t), t = t.next;
      while (t !== a);
    }
    l.action = null;
  }
  function no(l) {
    l = l.listeners;
    for (var t = 0; t < l.length; t++) (0, l[t])();
  }
  function io(l, t) {
    return t;
  }
  function co(l, t) {
    if (al) {
      var e = Tl.formState;
      if (e !== null) {
        l: {
          var a = $;
          if (al) {
            if (xl) {
              t: {
                for (var u = xl, n = Mt; u.nodeType !== 8; ) {
                  if (!n) {
                    u = null;
                    break t;
                  }
                  if (u = Ut(
                    u.nextSibling
                  ), u === null) {
                    u = null;
                    break t;
                  }
                }
                n = u.data, u = n === "F!" || n === "F" ? u : null;
              }
              if (u) {
                xl = Ut(
                  u.nextSibling
                ), a = u.data === "F!";
                break l;
              }
            }
            me(a);
          }
          a = !1;
        }
        a && (t = e[0]);
      }
    }
    return e = lt(), e.memoizedState = e.baseState = t, a = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: io,
      lastRenderedState: t
    }, e.queue = a, e = _o.bind(
      null,
      $,
      a
    ), a.dispatch = e, a = sc(!1), n = vc.bind(
      null,
      $,
      !1,
      a.queue
    ), a = lt(), u = {
      state: t,
      dispatch: null,
      action: l,
      pending: null
    }, a.queue = u, e = Pd.bind(
      null,
      $,
      u,
      n,
      e
    ), u.dispatch = e, a.memoizedState = l, [t, e, !1];
  }
  function fo(l) {
    var t = jl();
    return so(t, gl, l);
  }
  function so(l, t, e) {
    if (t = cc(
      l,
      t,
      io
    )[0], l = zn(Ft)[0], typeof t == "object" && t !== null && typeof t.then == "function")
      try {
        var a = du(t);
      } catch (i) {
        throw i === Sa ? rn : i;
      }
    else a = t;
    t = jl();
    var u = t.queue, n = u.dispatch;
    return e !== t.memoizedState && ($.flags |= 2048, Ea(
      9,
      { destroy: void 0 },
      lm.bind(null, u, e),
      null
    )), [a, n, l];
  }
  function lm(l, t) {
    l.action = t;
  }
  function oo(l) {
    var t = jl(), e = gl;
    if (e !== null)
      return so(t, e, l);
    jl(), t = t.memoizedState, e = jl();
    var a = e.queue.dispatch;
    return e.memoizedState = l, [t, a, !1];
  }
  function Ea(l, t, e, a) {
    return l = { tag: l, create: e, deps: a, inst: t, next: null }, t = $.updateQueue, t === null && (t = Sn(), $.updateQueue = t), e = t.lastEffect, e === null ? t.lastEffect = l.next = l : (a = e.next, e.next = l, l.next = a, t.lastEffect = l), l;
  }
  function ro() {
    return jl().memoizedState;
  }
  function Tn(l, t, e, a) {
    var u = lt();
    $.flags |= l, u.memoizedState = Ea(
      1 | t,
      { destroy: void 0 },
      e,
      a === void 0 ? null : a
    );
  }
  function xn(l, t, e, a) {
    var u = jl();
    a = a === void 0 ? null : a;
    var n = u.memoizedState.inst;
    gl !== null && a !== null && tc(a, gl.memoizedState.deps) ? u.memoizedState = Ea(t, n, e, a) : ($.flags |= l, u.memoizedState = Ea(
      1 | t,
      n,
      e,
      a
    ));
  }
  function mo(l, t) {
    Tn(8390656, 8, l, t);
  }
  function rc(l, t) {
    xn(2048, 8, l, t);
  }
  function tm(l) {
    $.flags |= 4;
    var t = $.updateQueue;
    if (t === null)
      t = Sn(), $.updateQueue = t, t.events = [l];
    else {
      var e = t.events;
      e === null ? t.events = [l] : e.push(l);
    }
  }
  function ho(l) {
    var t = jl().memoizedState;
    return tm({ ref: t, nextImpl: l }), function() {
      if ((rl & 2) !== 0) throw Error(r(440));
      return t.impl.apply(void 0, arguments);
    };
  }
  function yo(l, t) {
    return xn(4, 2, l, t);
  }
  function vo(l, t) {
    return xn(4, 4, l, t);
  }
  function go(l, t) {
    if (typeof t == "function") {
      l = l();
      var e = t(l);
      return function() {
        typeof e == "function" ? e() : t(null);
      };
    }
    if (t != null)
      return l = l(), t.current = l, function() {
        t.current = null;
      };
  }
  function bo(l, t, e) {
    e = e != null ? e.concat([l]) : null, xn(4, 4, go.bind(null, t, l), e);
  }
  function dc() {
  }
  function So(l, t) {
    var e = jl();
    t = t === void 0 ? null : t;
    var a = e.memoizedState;
    return t !== null && tc(t, a[1]) ? a[0] : (e.memoizedState = [l, t], l);
  }
  function po(l, t) {
    var e = jl();
    t = t === void 0 ? null : t;
    var a = e.memoizedState;
    if (t !== null && tc(t, a[1]))
      return a[0];
    if (a = l(), we) {
      fe(!0);
      try {
        l();
      } finally {
        fe(!1);
      }
    }
    return e.memoizedState = [a, t], a;
  }
  function mc(l, t, e) {
    return e === void 0 || (kt & 1073741824) !== 0 && (tl & 261930) === 0 ? l.memoizedState = t : (l.memoizedState = e, l = z0(), $.lanes |= l, Te |= l, e);
  }
  function zo(l, t, e, a) {
    return dt(e, t) ? e : za.current !== null ? (l = mc(l, e, a), dt(l, t) || (ql = !0), l) : (kt & 42) === 0 || (kt & 1073741824) !== 0 && (tl & 261930) === 0 ? (ql = !0, l.memoizedState = e) : (l = z0(), $.lanes |= l, Te |= l, t);
  }
  function To(l, t, e, a, u) {
    var n = M.p;
    M.p = n !== 0 && 8 > n ? n : 8;
    var i = p.T, c = {};
    p.T = c, vc(l, !1, t, e);
    try {
      var f = u(), h = p.S;
      if (h !== null && h(c, f), f !== null && typeof f == "object" && typeof f.then == "function") {
        var S = kd(
          f,
          a
        );
        mu(
          l,
          t,
          S,
          bt(l)
        );
      } else
        mu(
          l,
          t,
          a,
          bt(l)
        );
    } catch (E) {
      mu(
        l,
        t,
        { then: function() {
        }, status: "rejected", reason: E },
        bt()
      );
    } finally {
      M.p = n, i !== null && c.types !== null && (i.types = c.types), p.T = i;
    }
  }
  function em() {
  }
  function hc(l, t, e, a) {
    if (l.tag !== 5) throw Error(r(476));
    var u = xo(l).queue;
    To(
      l,
      u,
      t,
      j,
      e === null ? em : function() {
        return Eo(l), e(a);
      }
    );
  }
  function xo(l) {
    var t = l.memoizedState;
    if (t !== null) return t;
    t = {
      memoizedState: j,
      baseState: j,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Ft,
        lastRenderedState: j
      },
      next: null
    };
    var e = {};
    return t.next = {
      memoizedState: e,
      baseState: e,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: Ft,
        lastRenderedState: e
      },
      next: null
    }, l.memoizedState = t, l = l.alternate, l !== null && (l.memoizedState = t), t;
  }
  function Eo(l) {
    var t = xo(l);
    t.next === null && (t = l.alternate.memoizedState), mu(
      l,
      t.next.queue,
      {},
      bt()
    );
  }
  function yc() {
    return Wl(Uu);
  }
  function Ao() {
    return jl().memoizedState;
  }
  function No() {
    return jl().memoizedState;
  }
  function am(l) {
    for (var t = l.return; t !== null; ) {
      switch (t.tag) {
        case 24:
        case 3:
          var e = bt();
          l = ve(e);
          var a = ge(t, l, e);
          a !== null && (ct(a, t, e), fu(a, t, e)), t = { cache: Vi() }, l.payload = t;
          return;
      }
      t = t.return;
    }
  }
  function um(l, t, e) {
    var a = bt();
    e = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: e,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, En(l) ? Mo(t, e) : (e = Ci(l, t, e, a), e !== null && (ct(e, l, a), Oo(e, t, a)));
  }
  function _o(l, t, e) {
    var a = bt();
    mu(l, t, e, a);
  }
  function mu(l, t, e, a) {
    var u = {
      lane: a,
      revertLane: 0,
      gesture: null,
      action: e,
      hasEagerState: !1,
      eagerState: null,
      next: null
    };
    if (En(l)) Mo(t, u);
    else {
      var n = l.alternate;
      if (l.lanes === 0 && (n === null || n.lanes === 0) && (n = t.lastRenderedReducer, n !== null))
        try {
          var i = t.lastRenderedState, c = n(i, e);
          if (u.hasEagerState = !0, u.eagerState = c, dt(c, i))
            return an(l, t, u, 0), Tl === null && en(), !1;
        } catch {
        }
      if (e = Ci(l, t, u, a), e !== null)
        return ct(e, l, a), Oo(e, t, a), !0;
    }
    return !1;
  }
  function vc(l, t, e, a) {
    if (a = {
      lane: 2,
      revertLane: $c(),
      gesture: null,
      action: a,
      hasEagerState: !1,
      eagerState: null,
      next: null
    }, En(l)) {
      if (t) throw Error(r(479));
    } else
      t = Ci(
        l,
        e,
        a,
        2
      ), t !== null && ct(t, l, 2);
  }
  function En(l) {
    var t = l.alternate;
    return l === $ || t !== null && t === $;
  }
  function Mo(l, t) {
    Ta = gn = !0;
    var e = l.pending;
    e === null ? t.next = t : (t.next = e.next, e.next = t), l.pending = t;
  }
  function Oo(l, t, e) {
    if ((e & 4194048) !== 0) {
      var a = t.lanes;
      a &= l.pendingLanes, e |= a, t.lanes = e, Cf(l, e);
    }
  }
  var hu = {
    readContext: Wl,
    use: pn,
    useCallback: Ol,
    useContext: Ol,
    useEffect: Ol,
    useImperativeHandle: Ol,
    useLayoutEffect: Ol,
    useInsertionEffect: Ol,
    useMemo: Ol,
    useReducer: Ol,
    useRef: Ol,
    useState: Ol,
    useDebugValue: Ol,
    useDeferredValue: Ol,
    useTransition: Ol,
    useSyncExternalStore: Ol,
    useId: Ol,
    useHostTransitionStatus: Ol,
    useFormState: Ol,
    useActionState: Ol,
    useOptimistic: Ol,
    useMemoCache: Ol,
    useCacheRefresh: Ol
  };
  hu.useEffectEvent = Ol;
  var Uo = {
    readContext: Wl,
    use: pn,
    useCallback: function(l, t) {
      return lt().memoizedState = [
        l,
        t === void 0 ? null : t
      ], l;
    },
    useContext: Wl,
    useEffect: mo,
    useImperativeHandle: function(l, t, e) {
      e = e != null ? e.concat([l]) : null, Tn(
        4194308,
        4,
        go.bind(null, t, l),
        e
      );
    },
    useLayoutEffect: function(l, t) {
      return Tn(4194308, 4, l, t);
    },
    useInsertionEffect: function(l, t) {
      Tn(4, 2, l, t);
    },
    useMemo: function(l, t) {
      var e = lt();
      t = t === void 0 ? null : t;
      var a = l();
      if (we) {
        fe(!0);
        try {
          l();
        } finally {
          fe(!1);
        }
      }
      return e.memoizedState = [a, t], a;
    },
    useReducer: function(l, t, e) {
      var a = lt();
      if (e !== void 0) {
        var u = e(t);
        if (we) {
          fe(!0);
          try {
            e(t);
          } finally {
            fe(!1);
          }
        }
      } else u = t;
      return a.memoizedState = a.baseState = u, l = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: l,
        lastRenderedState: u
      }, a.queue = l, l = l.dispatch = um.bind(
        null,
        $,
        l
      ), [a.memoizedState, l];
    },
    useRef: function(l) {
      var t = lt();
      return l = { current: l }, t.memoizedState = l;
    },
    useState: function(l) {
      l = sc(l);
      var t = l.queue, e = _o.bind(null, $, t);
      return t.dispatch = e, [l.memoizedState, e];
    },
    useDebugValue: dc,
    useDeferredValue: function(l, t) {
      var e = lt();
      return mc(e, l, t);
    },
    useTransition: function() {
      var l = sc(!1);
      return l = To.bind(
        null,
        $,
        l.queue,
        !0,
        !1
      ), lt().memoizedState = l, [!1, l];
    },
    useSyncExternalStore: function(l, t, e) {
      var a = $, u = lt();
      if (al) {
        if (e === void 0)
          throw Error(r(407));
        e = e();
      } else {
        if (e = t(), Tl === null)
          throw Error(r(349));
        (tl & 127) !== 0 || ks(a, t, e);
      }
      u.memoizedState = e;
      var n = { value: e, getSnapshot: t };
      return u.queue = n, mo(Is.bind(null, a, n, l), [
        l
      ]), a.flags |= 2048, Ea(
        9,
        { destroy: void 0 },
        Fs.bind(
          null,
          a,
          n,
          e,
          t
        ),
        null
      ), e;
    },
    useId: function() {
      var l = lt(), t = Tl.identifierPrefix;
      if (al) {
        var e = qt, a = Bt;
        e = (a & ~(1 << 32 - rt(a) - 1)).toString(32) + e, t = "_" + t + "R_" + e, e = bn++, 0 < e && (t += "H" + e.toString(32)), t += "_";
      } else
        e = Fd++, t = "_" + t + "r_" + e.toString(32) + "_";
      return l.memoizedState = t;
    },
    useHostTransitionStatus: yc,
    useFormState: co,
    useActionState: co,
    useOptimistic: function(l) {
      var t = lt();
      t.memoizedState = t.baseState = l;
      var e = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      return t.queue = e, t = vc.bind(
        null,
        $,
        !0,
        e
      ), e.dispatch = t, [l, t];
    },
    useMemoCache: ic,
    useCacheRefresh: function() {
      return lt().memoizedState = am.bind(
        null,
        $
      );
    },
    useEffectEvent: function(l) {
      var t = lt(), e = { impl: l };
      return t.memoizedState = e, function() {
        if ((rl & 2) !== 0)
          throw Error(r(440));
        return e.impl.apply(void 0, arguments);
      };
    }
  }, gc = {
    readContext: Wl,
    use: pn,
    useCallback: So,
    useContext: Wl,
    useEffect: rc,
    useImperativeHandle: bo,
    useInsertionEffect: yo,
    useLayoutEffect: vo,
    useMemo: po,
    useReducer: zn,
    useRef: ro,
    useState: function() {
      return zn(Ft);
    },
    useDebugValue: dc,
    useDeferredValue: function(l, t) {
      var e = jl();
      return zo(
        e,
        gl.memoizedState,
        l,
        t
      );
    },
    useTransition: function() {
      var l = zn(Ft)[0], t = jl().memoizedState;
      return [
        typeof l == "boolean" ? l : du(l),
        t
      ];
    },
    useSyncExternalStore: Ws,
    useId: Ao,
    useHostTransitionStatus: yc,
    useFormState: fo,
    useActionState: fo,
    useOptimistic: function(l, t) {
      var e = jl();
      return to(e, gl, l, t);
    },
    useMemoCache: ic,
    useCacheRefresh: No
  };
  gc.useEffectEvent = ho;
  var Do = {
    readContext: Wl,
    use: pn,
    useCallback: So,
    useContext: Wl,
    useEffect: rc,
    useImperativeHandle: bo,
    useInsertionEffect: yo,
    useLayoutEffect: vo,
    useMemo: po,
    useReducer: fc,
    useRef: ro,
    useState: function() {
      return fc(Ft);
    },
    useDebugValue: dc,
    useDeferredValue: function(l, t) {
      var e = jl();
      return gl === null ? mc(e, l, t) : zo(
        e,
        gl.memoizedState,
        l,
        t
      );
    },
    useTransition: function() {
      var l = fc(Ft)[0], t = jl().memoizedState;
      return [
        typeof l == "boolean" ? l : du(l),
        t
      ];
    },
    useSyncExternalStore: Ws,
    useId: Ao,
    useHostTransitionStatus: yc,
    useFormState: oo,
    useActionState: oo,
    useOptimistic: function(l, t) {
      var e = jl();
      return gl !== null ? to(e, gl, l, t) : (e.baseState = l, [l, e.queue.dispatch]);
    },
    useMemoCache: ic,
    useCacheRefresh: No
  };
  Do.useEffectEvent = ho;
  function bc(l, t, e, a) {
    t = l.memoizedState, e = e(a, t), e = e == null ? t : D({}, t, e), l.memoizedState = e, l.lanes === 0 && (l.updateQueue.baseState = e);
  }
  var Sc = {
    enqueueSetState: function(l, t, e) {
      l = l._reactInternals;
      var a = bt(), u = ve(a);
      u.payload = t, e != null && (u.callback = e), t = ge(l, u, a), t !== null && (ct(t, l, a), fu(t, l, a));
    },
    enqueueReplaceState: function(l, t, e) {
      l = l._reactInternals;
      var a = bt(), u = ve(a);
      u.tag = 1, u.payload = t, e != null && (u.callback = e), t = ge(l, u, a), t !== null && (ct(t, l, a), fu(t, l, a));
    },
    enqueueForceUpdate: function(l, t) {
      l = l._reactInternals;
      var e = bt(), a = ve(e);
      a.tag = 2, t != null && (a.callback = t), t = ge(l, a, e), t !== null && (ct(t, l, e), fu(t, l, e));
    }
  };
  function jo(l, t, e, a, u, n, i) {
    return l = l.stateNode, typeof l.shouldComponentUpdate == "function" ? l.shouldComponentUpdate(a, n, i) : t.prototype && t.prototype.isPureReactComponent ? !lu(e, a) || !lu(u, n) : !0;
  }
  function Co(l, t, e, a) {
    l = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(e, a), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(e, a), t.state !== l && Sc.enqueueReplaceState(t, t.state, null);
  }
  function $e(l, t) {
    var e = t;
    if ("ref" in t) {
      e = {};
      for (var a in t)
        a !== "ref" && (e[a] = t[a]);
    }
    if (l = l.defaultProps) {
      e === t && (e = D({}, e));
      for (var u in l)
        e[u] === void 0 && (e[u] = l[u]);
    }
    return e;
  }
  function Ro(l) {
    tn(l);
  }
  function Ho(l) {
    console.error(l);
  }
  function Bo(l) {
    tn(l);
  }
  function An(l, t) {
    try {
      var e = l.onUncaughtError;
      e(t.value, { componentStack: t.stack });
    } catch (a) {
      setTimeout(function() {
        throw a;
      });
    }
  }
  function qo(l, t, e) {
    try {
      var a = l.onCaughtError;
      a(e.value, {
        componentStack: e.stack,
        errorBoundary: t.tag === 1 ? t.stateNode : null
      });
    } catch (u) {
      setTimeout(function() {
        throw u;
      });
    }
  }
  function pc(l, t, e) {
    return e = ve(e), e.tag = 3, e.payload = { element: null }, e.callback = function() {
      An(l, t);
    }, e;
  }
  function Yo(l) {
    return l = ve(l), l.tag = 3, l;
  }
  function Go(l, t, e, a) {
    var u = e.type.getDerivedStateFromError;
    if (typeof u == "function") {
      var n = a.value;
      l.payload = function() {
        return u(n);
      }, l.callback = function() {
        qo(t, e, a);
      };
    }
    var i = e.stateNode;
    i !== null && typeof i.componentDidCatch == "function" && (l.callback = function() {
      qo(t, e, a), typeof u != "function" && (xe === null ? xe = /* @__PURE__ */ new Set([this]) : xe.add(this));
      var c = a.stack;
      this.componentDidCatch(a.value, {
        componentStack: c !== null ? c : ""
      });
    });
  }
  function nm(l, t, e, a, u) {
    if (e.flags |= 32768, a !== null && typeof a == "object" && typeof a.then == "function") {
      if (t = e.alternate, t !== null && va(
        t,
        e,
        u,
        !0
      ), e = ht.current, e !== null) {
        switch (e.tag) {
          case 31:
          case 13:
            return Ot === null ? qn() : e.alternate === null && Ul === 0 && (Ul = 3), e.flags &= -257, e.flags |= 65536, e.lanes = u, a === dn ? e.flags |= 16384 : (t = e.updateQueue, t === null ? e.updateQueue = /* @__PURE__ */ new Set([a]) : t.add(a), Kc(l, a, u)), !1;
          case 22:
            return e.flags |= 65536, a === dn ? e.flags |= 16384 : (t = e.updateQueue, t === null ? (t = {
              transitions: null,
              markerInstances: null,
              retryQueue: /* @__PURE__ */ new Set([a])
            }, e.updateQueue = t) : (e = t.retryQueue, e === null ? t.retryQueue = /* @__PURE__ */ new Set([a]) : e.add(a)), Kc(l, a, u)), !1;
        }
        throw Error(r(435, e.tag));
      }
      return Kc(l, a, u), qn(), !1;
    }
    if (al)
      return t = ht.current, t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256), t.flags |= 65536, t.lanes = u, a !== Gi && (l = Error(r(422), { cause: a }), au(At(l, e)))) : (a !== Gi && (t = Error(r(423), {
        cause: a
      }), au(
        At(t, e)
      )), l = l.current.alternate, l.flags |= 65536, u &= -u, l.lanes |= u, a = At(a, e), u = pc(
        l.stateNode,
        a,
        u
      ), ki(l, u), Ul !== 4 && (Ul = 2)), !1;
    var n = Error(r(520), { cause: a });
    if (n = At(n, e), Tu === null ? Tu = [n] : Tu.push(n), Ul !== 4 && (Ul = 2), t === null) return !0;
    a = At(a, e), e = t;
    do {
      switch (e.tag) {
        case 3:
          return e.flags |= 65536, l = u & -u, e.lanes |= l, l = pc(e.stateNode, a, l), ki(e, l), !1;
        case 1:
          if (t = e.type, n = e.stateNode, (e.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || n !== null && typeof n.componentDidCatch == "function" && (xe === null || !xe.has(n))))
            return e.flags |= 65536, u &= -u, e.lanes |= u, u = Yo(u), Go(
              u,
              l,
              e,
              a
            ), ki(e, u), !1;
      }
      e = e.return;
    } while (e !== null);
    return !1;
  }
  var zc = Error(r(461)), ql = !1;
  function kl(l, t, e, a) {
    t.child = l === null ? Qs(t, null, e, a) : Je(
      t,
      l.child,
      e,
      a
    );
  }
  function Lo(l, t, e, a, u) {
    e = e.render;
    var n = t.ref;
    if ("ref" in a) {
      var i = {};
      for (var c in a)
        c !== "ref" && (i[c] = a[c]);
    } else i = a;
    return Qe(t), a = ec(
      l,
      t,
      e,
      i,
      n,
      u
    ), c = ac(), l !== null && !ql ? (uc(l, t, u), It(l, t, u)) : (al && c && qi(t), t.flags |= 1, kl(l, t, a, u), t.child);
  }
  function Xo(l, t, e, a, u) {
    if (l === null) {
      var n = e.type;
      return typeof n == "function" && !Ri(n) && n.defaultProps === void 0 && e.compare === null ? (t.tag = 15, t.type = n, Qo(
        l,
        t,
        n,
        a,
        u
      )) : (l = nn(
        e.type,
        null,
        a,
        t,
        t.mode,
        u
      ), l.ref = t.ref, l.return = t, t.child = l);
    }
    if (n = l.child, !Oc(l, u)) {
      var i = n.memoizedProps;
      if (e = e.compare, e = e !== null ? e : lu, e(i, a) && l.ref === t.ref)
        return It(l, t, u);
    }
    return t.flags |= 1, l = Jt(n, a), l.ref = t.ref, l.return = t, t.child = l;
  }
  function Qo(l, t, e, a, u) {
    if (l !== null) {
      var n = l.memoizedProps;
      if (lu(n, a) && l.ref === t.ref)
        if (ql = !1, t.pendingProps = a = n, Oc(l, u))
          (l.flags & 131072) !== 0 && (ql = !0);
        else
          return t.lanes = l.lanes, It(l, t, u);
    }
    return Tc(
      l,
      t,
      e,
      a,
      u
    );
  }
  function Zo(l, t, e, a) {
    var u = a.children, n = l !== null ? l.memoizedState : null;
    if (l === null && t.stateNode === null && (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), a.mode === "hidden") {
      if ((t.flags & 128) !== 0) {
        if (n = n !== null ? n.baseLanes | e : e, l !== null) {
          for (a = t.child = l.child, u = 0; a !== null; )
            u = u | a.lanes | a.childLanes, a = a.sibling;
          a = u & ~n;
        } else a = 0, t.child = null;
        return Vo(
          l,
          t,
          n,
          e,
          a
        );
      }
      if ((e & 536870912) !== 0)
        t.memoizedState = { baseLanes: 0, cachePool: null }, l !== null && on(
          t,
          n !== null ? n.cachePool : null
        ), n !== null ? Ks(t, n) : Ii(), Js(t);
      else
        return a = t.lanes = 536870912, Vo(
          l,
          t,
          n !== null ? n.baseLanes | e : e,
          e,
          a
        );
    } else
      n !== null ? (on(t, n.cachePool), Ks(t, n), Se(), t.memoizedState = null) : (l !== null && on(t, null), Ii(), Se());
    return kl(l, t, u, e), t.child;
  }
  function yu(l, t) {
    return l !== null && l.tag === 22 || t.stateNode !== null || (t.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    }), t.sibling;
  }
  function Vo(l, t, e, a, u) {
    var n = Ji();
    return n = n === null ? null : { parent: Hl._currentValue, pool: n }, t.memoizedState = {
      baseLanes: e,
      cachePool: n
    }, l !== null && on(t, null), Ii(), Js(t), l !== null && va(l, t, a, !0), t.childLanes = u, null;
  }
  function Nn(l, t) {
    return t = Mn(
      { mode: t.mode, children: t.children },
      l.mode
    ), t.ref = l.ref, l.child = t, t.return = l, t;
  }
  function Ko(l, t, e) {
    return Je(t, l.child, null, e), l = Nn(t, t.pendingProps), l.flags |= 2, yt(t), t.memoizedState = null, l;
  }
  function im(l, t, e) {
    var a = t.pendingProps, u = (t.flags & 128) !== 0;
    if (t.flags &= -129, l === null) {
      if (al) {
        if (a.mode === "hidden")
          return l = Nn(t, a), t.lanes = 536870912, yu(null, l);
        if (lc(t), (l = xl) ? (l = ar(
          l,
          Mt
        ), l = l !== null && l.data === "&" ? l : null, l !== null && (t.memoizedState = {
          dehydrated: l,
          treeContext: re !== null ? { id: Bt, overflow: qt } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, e = _s(l), e.return = t, t.child = e, $l = t, xl = null)) : l = null, l === null) throw me(t);
        return t.lanes = 536870912, null;
      }
      return Nn(t, a);
    }
    var n = l.memoizedState;
    if (n !== null) {
      var i = n.dehydrated;
      if (lc(t), u)
        if (t.flags & 256)
          t.flags &= -257, t = Ko(
            l,
            t,
            e
          );
        else if (t.memoizedState !== null)
          t.child = l.child, t.flags |= 128, t = null;
        else throw Error(r(558));
      else if (ql || va(l, t, e, !1), u = (e & l.childLanes) !== 0, ql || u) {
        if (a = Tl, a !== null && (i = Rf(a, e), i !== 0 && i !== n.retryLane))
          throw n.retryLane = i, Ye(l, i), ct(a, l, i), zc;
        qn(), t = Ko(
          l,
          t,
          e
        );
      } else
        l = n.treeContext, xl = Ut(i.nextSibling), $l = t, al = !0, de = null, Mt = !1, l !== null && Us(t, l), t = Nn(t, a), t.flags |= 4096;
      return t;
    }
    return l = Jt(l.child, {
      mode: a.mode,
      children: a.children
    }), l.ref = t.ref, t.child = l, l.return = t, l;
  }
  function _n(l, t) {
    var e = t.ref;
    if (e === null)
      l !== null && l.ref !== null && (t.flags |= 4194816);
    else {
      if (typeof e != "function" && typeof e != "object")
        throw Error(r(284));
      (l === null || l.ref !== e) && (t.flags |= 4194816);
    }
  }
  function Tc(l, t, e, a, u) {
    return Qe(t), e = ec(
      l,
      t,
      e,
      a,
      void 0,
      u
    ), a = ac(), l !== null && !ql ? (uc(l, t, u), It(l, t, u)) : (al && a && qi(t), t.flags |= 1, kl(l, t, e, u), t.child);
  }
  function Jo(l, t, e, a, u, n) {
    return Qe(t), t.updateQueue = null, e = $s(
      t,
      a,
      e,
      u
    ), ws(l), a = ac(), l !== null && !ql ? (uc(l, t, n), It(l, t, n)) : (al && a && qi(t), t.flags |= 1, kl(l, t, e, n), t.child);
  }
  function wo(l, t, e, a, u) {
    if (Qe(t), t.stateNode === null) {
      var n = da, i = e.contextType;
      typeof i == "object" && i !== null && (n = Wl(i)), n = new e(a, n), t.memoizedState = n.state !== null && n.state !== void 0 ? n.state : null, n.updater = Sc, t.stateNode = n, n._reactInternals = t, n = t.stateNode, n.props = a, n.state = t.memoizedState, n.refs = {}, $i(t), i = e.contextType, n.context = typeof i == "object" && i !== null ? Wl(i) : da, n.state = t.memoizedState, i = e.getDerivedStateFromProps, typeof i == "function" && (bc(
        t,
        e,
        i,
        a
      ), n.state = t.memoizedState), typeof e.getDerivedStateFromProps == "function" || typeof n.getSnapshotBeforeUpdate == "function" || typeof n.UNSAFE_componentWillMount != "function" && typeof n.componentWillMount != "function" || (i = n.state, typeof n.componentWillMount == "function" && n.componentWillMount(), typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount(), i !== n.state && Sc.enqueueReplaceState(n, n.state, null), ou(t, a, n, u), su(), n.state = t.memoizedState), typeof n.componentDidMount == "function" && (t.flags |= 4194308), a = !0;
    } else if (l === null) {
      n = t.stateNode;
      var c = t.memoizedProps, f = $e(e, c);
      n.props = f;
      var h = n.context, S = e.contextType;
      i = da, typeof S == "object" && S !== null && (i = Wl(S));
      var E = e.getDerivedStateFromProps;
      S = typeof E == "function" || typeof n.getSnapshotBeforeUpdate == "function", c = t.pendingProps !== c, S || typeof n.UNSAFE_componentWillReceiveProps != "function" && typeof n.componentWillReceiveProps != "function" || (c || h !== i) && Co(
        t,
        n,
        a,
        i
      ), ye = !1;
      var v = t.memoizedState;
      n.state = v, ou(t, a, n, u), su(), h = t.memoizedState, c || v !== h || ye ? (typeof E == "function" && (bc(
        t,
        e,
        E,
        a
      ), h = t.memoizedState), (f = ye || jo(
        t,
        e,
        f,
        a,
        v,
        h,
        i
      )) ? (S || typeof n.UNSAFE_componentWillMount != "function" && typeof n.componentWillMount != "function" || (typeof n.componentWillMount == "function" && n.componentWillMount(), typeof n.UNSAFE_componentWillMount == "function" && n.UNSAFE_componentWillMount()), typeof n.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = a, t.memoizedState = h), n.props = a, n.state = h, n.context = i, a = f) : (typeof n.componentDidMount == "function" && (t.flags |= 4194308), a = !1);
    } else {
      n = t.stateNode, Wi(l, t), i = t.memoizedProps, S = $e(e, i), n.props = S, E = t.pendingProps, v = n.context, h = e.contextType, f = da, typeof h == "object" && h !== null && (f = Wl(h)), c = e.getDerivedStateFromProps, (h = typeof c == "function" || typeof n.getSnapshotBeforeUpdate == "function") || typeof n.UNSAFE_componentWillReceiveProps != "function" && typeof n.componentWillReceiveProps != "function" || (i !== E || v !== f) && Co(
        t,
        n,
        a,
        f
      ), ye = !1, v = t.memoizedState, n.state = v, ou(t, a, n, u), su();
      var g = t.memoizedState;
      i !== E || v !== g || ye || l !== null && l.dependencies !== null && fn(l.dependencies) ? (typeof c == "function" && (bc(
        t,
        e,
        c,
        a
      ), g = t.memoizedState), (S = ye || jo(
        t,
        e,
        S,
        a,
        v,
        g,
        f
      ) || l !== null && l.dependencies !== null && fn(l.dependencies)) ? (h || typeof n.UNSAFE_componentWillUpdate != "function" && typeof n.componentWillUpdate != "function" || (typeof n.componentWillUpdate == "function" && n.componentWillUpdate(a, g, f), typeof n.UNSAFE_componentWillUpdate == "function" && n.UNSAFE_componentWillUpdate(
        a,
        g,
        f
      )), typeof n.componentDidUpdate == "function" && (t.flags |= 4), typeof n.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof n.componentDidUpdate != "function" || i === l.memoizedProps && v === l.memoizedState || (t.flags |= 4), typeof n.getSnapshotBeforeUpdate != "function" || i === l.memoizedProps && v === l.memoizedState || (t.flags |= 1024), t.memoizedProps = a, t.memoizedState = g), n.props = a, n.state = g, n.context = f, a = S) : (typeof n.componentDidUpdate != "function" || i === l.memoizedProps && v === l.memoizedState || (t.flags |= 4), typeof n.getSnapshotBeforeUpdate != "function" || i === l.memoizedProps && v === l.memoizedState || (t.flags |= 1024), a = !1);
    }
    return n = a, _n(l, t), a = (t.flags & 128) !== 0, n || a ? (n = t.stateNode, e = a && typeof e.getDerivedStateFromError != "function" ? null : n.render(), t.flags |= 1, l !== null && a ? (t.child = Je(
      t,
      l.child,
      null,
      u
    ), t.child = Je(
      t,
      null,
      e,
      u
    )) : kl(l, t, e, u), t.memoizedState = n.state, l = t.child) : l = It(
      l,
      t,
      u
    ), l;
  }
  function $o(l, t, e, a) {
    return Le(), t.flags |= 256, kl(l, t, e, a), t.child;
  }
  var xc = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function Ec(l) {
    return { baseLanes: l, cachePool: Bs() };
  }
  function Ac(l, t, e) {
    return l = l !== null ? l.childLanes & ~e : 0, t && (l |= gt), l;
  }
  function Wo(l, t, e) {
    var a = t.pendingProps, u = !1, n = (t.flags & 128) !== 0, i;
    if ((i = n) || (i = l !== null && l.memoizedState === null ? !1 : (Dl.current & 2) !== 0), i && (u = !0, t.flags &= -129), i = (t.flags & 32) !== 0, t.flags &= -33, l === null) {
      if (al) {
        if (u ? be(t) : Se(), (l = xl) ? (l = ar(
          l,
          Mt
        ), l = l !== null && l.data !== "&" ? l : null, l !== null && (t.memoizedState = {
          dehydrated: l,
          treeContext: re !== null ? { id: Bt, overflow: qt } : null,
          retryLane: 536870912,
          hydrationErrors: null
        }, e = _s(l), e.return = t, t.child = e, $l = t, xl = null)) : l = null, l === null) throw me(t);
        return ff(l) ? t.lanes = 32 : t.lanes = 536870912, null;
      }
      var c = a.children;
      return a = a.fallback, u ? (Se(), u = t.mode, c = Mn(
        { mode: "hidden", children: c },
        u
      ), a = Ge(
        a,
        u,
        e,
        null
      ), c.return = t, a.return = t, c.sibling = a, t.child = c, a = t.child, a.memoizedState = Ec(e), a.childLanes = Ac(
        l,
        i,
        e
      ), t.memoizedState = xc, yu(null, a)) : (be(t), Nc(t, c));
    }
    var f = l.memoizedState;
    if (f !== null && (c = f.dehydrated, c !== null)) {
      if (n)
        t.flags & 256 ? (be(t), t.flags &= -257, t = _c(
          l,
          t,
          e
        )) : t.memoizedState !== null ? (Se(), t.child = l.child, t.flags |= 128, t = null) : (Se(), c = a.fallback, u = t.mode, a = Mn(
          { mode: "visible", children: a.children },
          u
        ), c = Ge(
          c,
          u,
          e,
          null
        ), c.flags |= 2, a.return = t, c.return = t, a.sibling = c, t.child = a, Je(
          t,
          l.child,
          null,
          e
        ), a = t.child, a.memoizedState = Ec(e), a.childLanes = Ac(
          l,
          i,
          e
        ), t.memoizedState = xc, t = yu(null, a));
      else if (be(t), ff(c)) {
        if (i = c.nextSibling && c.nextSibling.dataset, i) var h = i.dgst;
        i = h, a = Error(r(419)), a.stack = "", a.digest = i, au({ value: a, source: null, stack: null }), t = _c(
          l,
          t,
          e
        );
      } else if (ql || va(l, t, e, !1), i = (e & l.childLanes) !== 0, ql || i) {
        if (i = Tl, i !== null && (a = Rf(i, e), a !== 0 && a !== f.retryLane))
          throw f.retryLane = a, Ye(l, a), ct(i, l, a), zc;
        cf(c) || qn(), t = _c(
          l,
          t,
          e
        );
      } else
        cf(c) ? (t.flags |= 192, t.child = l.child, t = null) : (l = f.treeContext, xl = Ut(
          c.nextSibling
        ), $l = t, al = !0, de = null, Mt = !1, l !== null && Us(t, l), t = Nc(
          t,
          a.children
        ), t.flags |= 4096);
      return t;
    }
    return u ? (Se(), c = a.fallback, u = t.mode, f = l.child, h = f.sibling, a = Jt(f, {
      mode: "hidden",
      children: a.children
    }), a.subtreeFlags = f.subtreeFlags & 65011712, h !== null ? c = Jt(
      h,
      c
    ) : (c = Ge(
      c,
      u,
      e,
      null
    ), c.flags |= 2), c.return = t, a.return = t, a.sibling = c, t.child = a, yu(null, a), a = t.child, c = l.child.memoizedState, c === null ? c = Ec(e) : (u = c.cachePool, u !== null ? (f = Hl._currentValue, u = u.parent !== f ? { parent: f, pool: f } : u) : u = Bs(), c = {
      baseLanes: c.baseLanes | e,
      cachePool: u
    }), a.memoizedState = c, a.childLanes = Ac(
      l,
      i,
      e
    ), t.memoizedState = xc, yu(l.child, a)) : (be(t), e = l.child, l = e.sibling, e = Jt(e, {
      mode: "visible",
      children: a.children
    }), e.return = t, e.sibling = null, l !== null && (i = t.deletions, i === null ? (t.deletions = [l], t.flags |= 16) : i.push(l)), t.child = e, t.memoizedState = null, e);
  }
  function Nc(l, t) {
    return t = Mn(
      { mode: "visible", children: t },
      l.mode
    ), t.return = l, l.child = t;
  }
  function Mn(l, t) {
    return l = mt(22, l, null, t), l.lanes = 0, l;
  }
  function _c(l, t, e) {
    return Je(t, l.child, null, e), l = Nc(
      t,
      t.pendingProps.children
    ), l.flags |= 2, t.memoizedState = null, l;
  }
  function ko(l, t, e) {
    l.lanes |= t;
    var a = l.alternate;
    a !== null && (a.lanes |= t), Qi(l.return, t, e);
  }
  function Mc(l, t, e, a, u, n) {
    var i = l.memoizedState;
    i === null ? l.memoizedState = {
      isBackwards: t,
      rendering: null,
      renderingStartTime: 0,
      last: a,
      tail: e,
      tailMode: u,
      treeForkCount: n
    } : (i.isBackwards = t, i.rendering = null, i.renderingStartTime = 0, i.last = a, i.tail = e, i.tailMode = u, i.treeForkCount = n);
  }
  function Fo(l, t, e) {
    var a = t.pendingProps, u = a.revealOrder, n = a.tail;
    a = a.children;
    var i = Dl.current, c = (i & 2) !== 0;
    if (c ? (i = i & 1 | 2, t.flags |= 128) : i &= 1, O(Dl, i), kl(l, t, a, e), a = al ? eu : 0, !c && l !== null && (l.flags & 128) !== 0)
      l: for (l = t.child; l !== null; ) {
        if (l.tag === 13)
          l.memoizedState !== null && ko(l, e, t);
        else if (l.tag === 19)
          ko(l, e, t);
        else if (l.child !== null) {
          l.child.return = l, l = l.child;
          continue;
        }
        if (l === t) break l;
        for (; l.sibling === null; ) {
          if (l.return === null || l.return === t)
            break l;
          l = l.return;
        }
        l.sibling.return = l.return, l = l.sibling;
      }
    switch (u) {
      case "forwards":
        for (e = t.child, u = null; e !== null; )
          l = e.alternate, l !== null && vn(l) === null && (u = e), e = e.sibling;
        e = u, e === null ? (u = t.child, t.child = null) : (u = e.sibling, e.sibling = null), Mc(
          t,
          !1,
          u,
          e,
          n,
          a
        );
        break;
      case "backwards":
      case "unstable_legacy-backwards":
        for (e = null, u = t.child, t.child = null; u !== null; ) {
          if (l = u.alternate, l !== null && vn(l) === null) {
            t.child = u;
            break;
          }
          l = u.sibling, u.sibling = e, e = u, u = l;
        }
        Mc(
          t,
          !0,
          e,
          null,
          n,
          a
        );
        break;
      case "together":
        Mc(
          t,
          !1,
          null,
          null,
          void 0,
          a
        );
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function It(l, t, e) {
    if (l !== null && (t.dependencies = l.dependencies), Te |= t.lanes, (e & t.childLanes) === 0)
      if (l !== null) {
        if (va(
          l,
          t,
          e,
          !1
        ), (e & t.childLanes) === 0)
          return null;
      } else return null;
    if (l !== null && t.child !== l.child)
      throw Error(r(153));
    if (t.child !== null) {
      for (l = t.child, e = Jt(l, l.pendingProps), t.child = e, e.return = t; l.sibling !== null; )
        l = l.sibling, e = e.sibling = Jt(l, l.pendingProps), e.return = t;
      e.sibling = null;
    }
    return t.child;
  }
  function Oc(l, t) {
    return (l.lanes & t) !== 0 ? !0 : (l = l.dependencies, !!(l !== null && fn(l)));
  }
  function cm(l, t, e) {
    switch (t.tag) {
      case 3:
        Jl(t, t.stateNode.containerInfo), he(t, Hl, l.memoizedState.cache), Le();
        break;
      case 27:
      case 5:
        Ht(t);
        break;
      case 4:
        Jl(t, t.stateNode.containerInfo);
        break;
      case 10:
        he(
          t,
          t.type,
          t.memoizedProps.value
        );
        break;
      case 31:
        if (t.memoizedState !== null)
          return t.flags |= 128, lc(t), null;
        break;
      case 13:
        var a = t.memoizedState;
        if (a !== null)
          return a.dehydrated !== null ? (be(t), t.flags |= 128, null) : (e & t.child.childLanes) !== 0 ? Wo(l, t, e) : (be(t), l = It(
            l,
            t,
            e
          ), l !== null ? l.sibling : null);
        be(t);
        break;
      case 19:
        var u = (l.flags & 128) !== 0;
        if (a = (e & t.childLanes) !== 0, a || (va(
          l,
          t,
          e,
          !1
        ), a = (e & t.childLanes) !== 0), u) {
          if (a)
            return Fo(
              l,
              t,
              e
            );
          t.flags |= 128;
        }
        if (u = t.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), O(Dl, Dl.current), a) break;
        return null;
      case 22:
        return t.lanes = 0, Zo(
          l,
          t,
          e,
          t.pendingProps
        );
      case 24:
        he(t, Hl, l.memoizedState.cache);
    }
    return It(l, t, e);
  }
  function Io(l, t, e) {
    if (l !== null)
      if (l.memoizedProps !== t.pendingProps)
        ql = !0;
      else {
        if (!Oc(l, e) && (t.flags & 128) === 0)
          return ql = !1, cm(
            l,
            t,
            e
          );
        ql = (l.flags & 131072) !== 0;
      }
    else
      ql = !1, al && (t.flags & 1048576) !== 0 && Os(t, eu, t.index);
    switch (t.lanes = 0, t.tag) {
      case 16:
        l: {
          var a = t.pendingProps;
          if (l = Ve(t.elementType), t.type = l, typeof l == "function")
            Ri(l) ? (a = $e(l, a), t.tag = 1, t = wo(
              null,
              t,
              l,
              a,
              e
            )) : (t.tag = 0, t = Tc(
              null,
              t,
              l,
              a,
              e
            ));
          else {
            if (l != null) {
              var u = l.$$typeof;
              if (u === Zl) {
                t.tag = 11, t = Lo(
                  null,
                  t,
                  l,
                  a,
                  e
                );
                break l;
              } else if (u === F) {
                t.tag = 14, t = Xo(
                  null,
                  t,
                  l,
                  a,
                  e
                );
                break l;
              }
            }
            throw t = zt(l) || l, Error(r(306, t, ""));
          }
        }
        return t;
      case 0:
        return Tc(
          l,
          t,
          t.type,
          t.pendingProps,
          e
        );
      case 1:
        return a = t.type, u = $e(
          a,
          t.pendingProps
        ), wo(
          l,
          t,
          a,
          u,
          e
        );
      case 3:
        l: {
          if (Jl(
            t,
            t.stateNode.containerInfo
          ), l === null) throw Error(r(387));
          a = t.pendingProps;
          var n = t.memoizedState;
          u = n.element, Wi(l, t), ou(t, a, null, e);
          var i = t.memoizedState;
          if (a = i.cache, he(t, Hl, a), a !== n.cache && Zi(
            t,
            [Hl],
            e,
            !0
          ), su(), a = i.element, n.isDehydrated)
            if (n = {
              element: a,
              isDehydrated: !1,
              cache: i.cache
            }, t.updateQueue.baseState = n, t.memoizedState = n, t.flags & 256) {
              t = $o(
                l,
                t,
                a,
                e
              );
              break l;
            } else if (a !== u) {
              u = At(
                Error(r(424)),
                t
              ), au(u), t = $o(
                l,
                t,
                a,
                e
              );
              break l;
            } else
              for (l = t.stateNode.containerInfo, l.nodeType === 9 ? l = l.body : l = l.nodeName === "HTML" ? l.ownerDocument.body : l, xl = Ut(l.firstChild), $l = t, al = !0, de = null, Mt = !0, e = Qs(
                t,
                null,
                a,
                e
              ), t.child = e; e; )
                e.flags = e.flags & -3 | 4096, e = e.sibling;
          else {
            if (Le(), a === u) {
              t = It(
                l,
                t,
                e
              );
              break l;
            }
            kl(l, t, a, e);
          }
          t = t.child;
        }
        return t;
      case 26:
        return _n(l, t), l === null ? (e = sr(
          t.type,
          null,
          t.pendingProps,
          null
        )) ? t.memoizedState = e : al || (e = t.type, l = t.pendingProps, a = Vn(
          V.current
        ).createElement(e), a[wl] = t, a[tt] = l, Fl(a, e, l), Xl(a), t.stateNode = a) : t.memoizedState = sr(
          t.type,
          l.memoizedProps,
          t.pendingProps,
          l.memoizedState
        ), null;
      case 27:
        return Ht(t), l === null && al && (a = t.stateNode = ir(
          t.type,
          t.pendingProps,
          V.current
        ), $l = t, Mt = !0, u = xl, _e(t.type) ? (sf = u, xl = Ut(a.firstChild)) : xl = u), kl(
          l,
          t,
          t.pendingProps.children,
          e
        ), _n(l, t), l === null && (t.flags |= 4194304), t.child;
      case 5:
        return l === null && al && ((u = a = xl) && (a = qm(
          a,
          t.type,
          t.pendingProps,
          Mt
        ), a !== null ? (t.stateNode = a, $l = t, xl = Ut(a.firstChild), Mt = !1, u = !0) : u = !1), u || me(t)), Ht(t), u = t.type, n = t.pendingProps, i = l !== null ? l.memoizedProps : null, a = n.children, af(u, n) ? a = null : i !== null && af(u, i) && (t.flags |= 32), t.memoizedState !== null && (u = ec(
          l,
          t,
          Id,
          null,
          null,
          e
        ), Uu._currentValue = u), _n(l, t), kl(l, t, a, e), t.child;
      case 6:
        return l === null && al && ((l = e = xl) && (e = Ym(
          e,
          t.pendingProps,
          Mt
        ), e !== null ? (t.stateNode = e, $l = t, xl = null, l = !0) : l = !1), l || me(t)), null;
      case 13:
        return Wo(l, t, e);
      case 4:
        return Jl(
          t,
          t.stateNode.containerInfo
        ), a = t.pendingProps, l === null ? t.child = Je(
          t,
          null,
          a,
          e
        ) : kl(l, t, a, e), t.child;
      case 11:
        return Lo(
          l,
          t,
          t.type,
          t.pendingProps,
          e
        );
      case 7:
        return kl(
          l,
          t,
          t.pendingProps,
          e
        ), t.child;
      case 8:
        return kl(
          l,
          t,
          t.pendingProps.children,
          e
        ), t.child;
      case 12:
        return kl(
          l,
          t,
          t.pendingProps.children,
          e
        ), t.child;
      case 10:
        return a = t.pendingProps, he(t, t.type, a.value), kl(l, t, a.children, e), t.child;
      case 9:
        return u = t.type._context, a = t.pendingProps.children, Qe(t), u = Wl(u), a = a(u), t.flags |= 1, kl(l, t, a, e), t.child;
      case 14:
        return Xo(
          l,
          t,
          t.type,
          t.pendingProps,
          e
        );
      case 15:
        return Qo(
          l,
          t,
          t.type,
          t.pendingProps,
          e
        );
      case 19:
        return Fo(l, t, e);
      case 31:
        return im(l, t, e);
      case 22:
        return Zo(
          l,
          t,
          e,
          t.pendingProps
        );
      case 24:
        return Qe(t), a = Wl(Hl), l === null ? (u = Ji(), u === null && (u = Tl, n = Vi(), u.pooledCache = n, n.refCount++, n !== null && (u.pooledCacheLanes |= e), u = n), t.memoizedState = { parent: a, cache: u }, $i(t), he(t, Hl, u)) : ((l.lanes & e) !== 0 && (Wi(l, t), ou(t, null, null, e), su()), u = l.memoizedState, n = t.memoizedState, u.parent !== a ? (u = { parent: a, cache: a }, t.memoizedState = u, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = u), he(t, Hl, a)) : (a = n.cache, he(t, Hl, a), a !== u.cache && Zi(
          t,
          [Hl],
          e,
          !0
        ))), kl(
          l,
          t,
          t.pendingProps.children,
          e
        ), t.child;
      case 29:
        throw t.pendingProps;
    }
    throw Error(r(156, t.tag));
  }
  function Pt(l) {
    l.flags |= 4;
  }
  function Uc(l, t, e, a, u) {
    if ((t = (l.mode & 32) !== 0) && (t = !1), t) {
      if (l.flags |= 16777216, (u & 335544128) === u)
        if (l.stateNode.complete) l.flags |= 8192;
        else if (A0()) l.flags |= 8192;
        else
          throw Ke = dn, wi;
    } else l.flags &= -16777217;
  }
  function Po(l, t) {
    if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
      l.flags &= -16777217;
    else if (l.flags |= 16777216, !hr(t))
      if (A0()) l.flags |= 8192;
      else
        throw Ke = dn, wi;
  }
  function On(l, t) {
    t !== null && (l.flags |= 4), l.flags & 16384 && (t = l.tag !== 22 ? Df() : 536870912, l.lanes |= t, Ma |= t);
  }
  function vu(l, t) {
    if (!al)
      switch (l.tailMode) {
        case "hidden":
          t = l.tail;
          for (var e = null; t !== null; )
            t.alternate !== null && (e = t), t = t.sibling;
          e === null ? l.tail = null : e.sibling = null;
          break;
        case "collapsed":
          e = l.tail;
          for (var a = null; e !== null; )
            e.alternate !== null && (a = e), e = e.sibling;
          a === null ? t || l.tail === null ? l.tail = null : l.tail.sibling = null : a.sibling = null;
      }
  }
  function El(l) {
    var t = l.alternate !== null && l.alternate.child === l.child, e = 0, a = 0;
    if (t)
      for (var u = l.child; u !== null; )
        e |= u.lanes | u.childLanes, a |= u.subtreeFlags & 65011712, a |= u.flags & 65011712, u.return = l, u = u.sibling;
    else
      for (u = l.child; u !== null; )
        e |= u.lanes | u.childLanes, a |= u.subtreeFlags, a |= u.flags, u.return = l, u = u.sibling;
    return l.subtreeFlags |= a, l.childLanes = e, t;
  }
  function fm(l, t, e) {
    var a = t.pendingProps;
    switch (Yi(t), t.tag) {
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return El(t), null;
      case 1:
        return El(t), null;
      case 3:
        return e = t.stateNode, a = null, l !== null && (a = l.memoizedState.cache), t.memoizedState.cache !== a && (t.flags |= 2048), Wt(Hl), Ml(), e.pendingContext && (e.context = e.pendingContext, e.pendingContext = null), (l === null || l.child === null) && (ya(t) ? Pt(t) : l === null || l.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Li())), El(t), null;
      case 26:
        var u = t.type, n = t.memoizedState;
        return l === null ? (Pt(t), n !== null ? (El(t), Po(t, n)) : (El(t), Uc(
          t,
          u,
          null,
          a,
          e
        ))) : n ? n !== l.memoizedState ? (Pt(t), El(t), Po(t, n)) : (El(t), t.flags &= -16777217) : (l = l.memoizedProps, l !== a && Pt(t), El(t), Uc(
          t,
          u,
          l,
          a,
          e
        )), null;
      case 27:
        if (Fe(t), e = V.current, u = t.type, l !== null && t.stateNode != null)
          l.memoizedProps !== a && Pt(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(r(166));
            return El(t), null;
          }
          l = R.current, ya(t) ? Ds(t) : (l = ir(u, a, e), t.stateNode = l, Pt(t));
        }
        return El(t), null;
      case 5:
        if (Fe(t), u = t.type, l !== null && t.stateNode != null)
          l.memoizedProps !== a && Pt(t);
        else {
          if (!a) {
            if (t.stateNode === null)
              throw Error(r(166));
            return El(t), null;
          }
          if (n = R.current, ya(t))
            Ds(t);
          else {
            var i = Vn(
              V.current
            );
            switch (n) {
              case 1:
                n = i.createElementNS(
                  "http://www.w3.org/2000/svg",
                  u
                );
                break;
              case 2:
                n = i.createElementNS(
                  "http://www.w3.org/1998/Math/MathML",
                  u
                );
                break;
              default:
                switch (u) {
                  case "svg":
                    n = i.createElementNS(
                      "http://www.w3.org/2000/svg",
                      u
                    );
                    break;
                  case "math":
                    n = i.createElementNS(
                      "http://www.w3.org/1998/Math/MathML",
                      u
                    );
                    break;
                  case "script":
                    n = i.createElement("div"), n.innerHTML = "<script><\/script>", n = n.removeChild(
                      n.firstChild
                    );
                    break;
                  case "select":
                    n = typeof a.is == "string" ? i.createElement("select", {
                      is: a.is
                    }) : i.createElement("select"), a.multiple ? n.multiple = !0 : a.size && (n.size = a.size);
                    break;
                  default:
                    n = typeof a.is == "string" ? i.createElement(u, { is: a.is }) : i.createElement(u);
                }
            }
            n[wl] = t, n[tt] = a;
            l: for (i = t.child; i !== null; ) {
              if (i.tag === 5 || i.tag === 6)
                n.appendChild(i.stateNode);
              else if (i.tag !== 4 && i.tag !== 27 && i.child !== null) {
                i.child.return = i, i = i.child;
                continue;
              }
              if (i === t) break l;
              for (; i.sibling === null; ) {
                if (i.return === null || i.return === t)
                  break l;
                i = i.return;
              }
              i.sibling.return = i.return, i = i.sibling;
            }
            t.stateNode = n;
            l: switch (Fl(n, u, a), u) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                a = !!a.autoFocus;
                break l;
              case "img":
                a = !0;
                break l;
              default:
                a = !1;
            }
            a && Pt(t);
          }
        }
        return El(t), Uc(
          t,
          t.type,
          l === null ? null : l.memoizedProps,
          t.pendingProps,
          e
        ), null;
      case 6:
        if (l && t.stateNode != null)
          l.memoizedProps !== a && Pt(t);
        else {
          if (typeof a != "string" && t.stateNode === null)
            throw Error(r(166));
          if (l = V.current, ya(t)) {
            if (l = t.stateNode, e = t.memoizedProps, a = null, u = $l, u !== null)
              switch (u.tag) {
                case 27:
                case 5:
                  a = u.memoizedProps;
              }
            l[wl] = t, l = !!(l.nodeValue === e || a !== null && a.suppressHydrationWarning === !0 || W0(l.nodeValue, e)), l || me(t, !0);
          } else
            l = Vn(l).createTextNode(
              a
            ), l[wl] = t, t.stateNode = l;
        }
        return El(t), null;
      case 31:
        if (e = t.memoizedState, l === null || l.memoizedState !== null) {
          if (a = ya(t), e !== null) {
            if (l === null) {
              if (!a) throw Error(r(318));
              if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(r(557));
              l[wl] = t;
            } else
              Le(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            El(t), l = !1;
          } else
            e = Li(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = e), l = !0;
          if (!l)
            return t.flags & 256 ? (yt(t), t) : (yt(t), null);
          if ((t.flags & 128) !== 0)
            throw Error(r(558));
        }
        return El(t), null;
      case 13:
        if (a = t.memoizedState, l === null || l.memoizedState !== null && l.memoizedState.dehydrated !== null) {
          if (u = ya(t), a !== null && a.dehydrated !== null) {
            if (l === null) {
              if (!u) throw Error(r(318));
              if (u = t.memoizedState, u = u !== null ? u.dehydrated : null, !u) throw Error(r(317));
              u[wl] = t;
            } else
              Le(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            El(t), u = !1;
          } else
            u = Li(), l !== null && l.memoizedState !== null && (l.memoizedState.hydrationErrors = u), u = !0;
          if (!u)
            return t.flags & 256 ? (yt(t), t) : (yt(t), null);
        }
        return yt(t), (t.flags & 128) !== 0 ? (t.lanes = e, t) : (e = a !== null, l = l !== null && l.memoizedState !== null, e && (a = t.child, u = null, a.alternate !== null && a.alternate.memoizedState !== null && a.alternate.memoizedState.cachePool !== null && (u = a.alternate.memoizedState.cachePool.pool), n = null, a.memoizedState !== null && a.memoizedState.cachePool !== null && (n = a.memoizedState.cachePool.pool), n !== u && (a.flags |= 2048)), e !== l && e && (t.child.flags |= 8192), On(t, t.updateQueue), El(t), null);
      case 4:
        return Ml(), l === null && Ic(t.stateNode.containerInfo), El(t), null;
      case 10:
        return Wt(t.type), El(t), null;
      case 19:
        if (A(Dl), a = t.memoizedState, a === null) return El(t), null;
        if (u = (t.flags & 128) !== 0, n = a.rendering, n === null)
          if (u) vu(a, !1);
          else {
            if (Ul !== 0 || l !== null && (l.flags & 128) !== 0)
              for (l = t.child; l !== null; ) {
                if (n = vn(l), n !== null) {
                  for (t.flags |= 128, vu(a, !1), l = n.updateQueue, t.updateQueue = l, On(t, l), t.subtreeFlags = 0, l = e, e = t.child; e !== null; )
                    Ns(e, l), e = e.sibling;
                  return O(
                    Dl,
                    Dl.current & 1 | 2
                  ), al && wt(t, a.treeForkCount), t.child;
                }
                l = l.sibling;
              }
            a.tail !== null && Al() > Rn && (t.flags |= 128, u = !0, vu(a, !1), t.lanes = 4194304);
          }
        else {
          if (!u)
            if (l = vn(n), l !== null) {
              if (t.flags |= 128, u = !0, l = l.updateQueue, t.updateQueue = l, On(t, l), vu(a, !0), a.tail === null && a.tailMode === "hidden" && !n.alternate && !al)
                return El(t), null;
            } else
              2 * Al() - a.renderingStartTime > Rn && e !== 536870912 && (t.flags |= 128, u = !0, vu(a, !1), t.lanes = 4194304);
          a.isBackwards ? (n.sibling = t.child, t.child = n) : (l = a.last, l !== null ? l.sibling = n : t.child = n, a.last = n);
        }
        return a.tail !== null ? (l = a.tail, a.rendering = l, a.tail = l.sibling, a.renderingStartTime = Al(), l.sibling = null, e = Dl.current, O(
          Dl,
          u ? e & 1 | 2 : e & 1
        ), al && wt(t, a.treeForkCount), l) : (El(t), null);
      case 22:
      case 23:
        return yt(t), Pi(), a = t.memoizedState !== null, l !== null ? l.memoizedState !== null !== a && (t.flags |= 8192) : a && (t.flags |= 8192), a ? (e & 536870912) !== 0 && (t.flags & 128) === 0 && (El(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : El(t), e = t.updateQueue, e !== null && On(t, e.retryQueue), e = null, l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (e = l.memoizedState.cachePool.pool), a = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (a = t.memoizedState.cachePool.pool), a !== e && (t.flags |= 2048), l !== null && A(Ze), null;
      case 24:
        return e = null, l !== null && (e = l.memoizedState.cache), t.memoizedState.cache !== e && (t.flags |= 2048), Wt(Hl), El(t), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(r(156, t.tag));
  }
  function sm(l, t) {
    switch (Yi(t), t.tag) {
      case 1:
        return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 3:
        return Wt(Hl), Ml(), l = t.flags, (l & 65536) !== 0 && (l & 128) === 0 ? (t.flags = l & -65537 | 128, t) : null;
      case 26:
      case 27:
      case 5:
        return Fe(t), null;
      case 31:
        if (t.memoizedState !== null) {
          if (yt(t), t.alternate === null)
            throw Error(r(340));
          Le();
        }
        return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 13:
        if (yt(t), l = t.memoizedState, l !== null && l.dehydrated !== null) {
          if (t.alternate === null)
            throw Error(r(340));
          Le();
        }
        return l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 19:
        return A(Dl), null;
      case 4:
        return Ml(), null;
      case 10:
        return Wt(t.type), null;
      case 22:
      case 23:
        return yt(t), Pi(), l !== null && A(Ze), l = t.flags, l & 65536 ? (t.flags = l & -65537 | 128, t) : null;
      case 24:
        return Wt(Hl), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function l0(l, t) {
    switch (Yi(t), t.tag) {
      case 3:
        Wt(Hl), Ml();
        break;
      case 26:
      case 27:
      case 5:
        Fe(t);
        break;
      case 4:
        Ml();
        break;
      case 31:
        t.memoizedState !== null && yt(t);
        break;
      case 13:
        yt(t);
        break;
      case 19:
        A(Dl);
        break;
      case 10:
        Wt(t.type);
        break;
      case 22:
      case 23:
        yt(t), Pi(), l !== null && A(Ze);
        break;
      case 24:
        Wt(Hl);
    }
  }
  function gu(l, t) {
    try {
      var e = t.updateQueue, a = e !== null ? e.lastEffect : null;
      if (a !== null) {
        var u = a.next;
        e = u;
        do {
          if ((e.tag & l) === l) {
            a = void 0;
            var n = e.create, i = e.inst;
            a = n(), i.destroy = a;
          }
          e = e.next;
        } while (e !== u);
      }
    } catch (c) {
      yl(t, t.return, c);
    }
  }
  function pe(l, t, e) {
    try {
      var a = t.updateQueue, u = a !== null ? a.lastEffect : null;
      if (u !== null) {
        var n = u.next;
        a = n;
        do {
          if ((a.tag & l) === l) {
            var i = a.inst, c = i.destroy;
            if (c !== void 0) {
              i.destroy = void 0, u = t;
              var f = e, h = c;
              try {
                h();
              } catch (S) {
                yl(
                  u,
                  f,
                  S
                );
              }
            }
          }
          a = a.next;
        } while (a !== n);
      }
    } catch (S) {
      yl(t, t.return, S);
    }
  }
  function t0(l) {
    var t = l.updateQueue;
    if (t !== null) {
      var e = l.stateNode;
      try {
        Vs(t, e);
      } catch (a) {
        yl(l, l.return, a);
      }
    }
  }
  function e0(l, t, e) {
    e.props = $e(
      l.type,
      l.memoizedProps
    ), e.state = l.memoizedState;
    try {
      e.componentWillUnmount();
    } catch (a) {
      yl(l, t, a);
    }
  }
  function bu(l, t) {
    try {
      var e = l.ref;
      if (e !== null) {
        switch (l.tag) {
          case 26:
          case 27:
          case 5:
            var a = l.stateNode;
            break;
          case 30:
            a = l.stateNode;
            break;
          default:
            a = l.stateNode;
        }
        typeof e == "function" ? l.refCleanup = e(a) : e.current = a;
      }
    } catch (u) {
      yl(l, t, u);
    }
  }
  function Yt(l, t) {
    var e = l.ref, a = l.refCleanup;
    if (e !== null)
      if (typeof a == "function")
        try {
          a();
        } catch (u) {
          yl(l, t, u);
        } finally {
          l.refCleanup = null, l = l.alternate, l != null && (l.refCleanup = null);
        }
      else if (typeof e == "function")
        try {
          e(null);
        } catch (u) {
          yl(l, t, u);
        }
      else e.current = null;
  }
  function a0(l) {
    var t = l.type, e = l.memoizedProps, a = l.stateNode;
    try {
      l: switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          e.autoFocus && a.focus();
          break l;
        case "img":
          e.src ? a.src = e.src : e.srcSet && (a.srcset = e.srcSet);
      }
    } catch (u) {
      yl(l, l.return, u);
    }
  }
  function Dc(l, t, e) {
    try {
      var a = l.stateNode;
      Dm(a, l.type, e, t), a[tt] = t;
    } catch (u) {
      yl(l, l.return, u);
    }
  }
  function u0(l) {
    return l.tag === 5 || l.tag === 3 || l.tag === 26 || l.tag === 27 && _e(l.type) || l.tag === 4;
  }
  function jc(l) {
    l: for (; ; ) {
      for (; l.sibling === null; ) {
        if (l.return === null || u0(l.return)) return null;
        l = l.return;
      }
      for (l.sibling.return = l.return, l = l.sibling; l.tag !== 5 && l.tag !== 6 && l.tag !== 18; ) {
        if (l.tag === 27 && _e(l.type) || l.flags & 2 || l.child === null || l.tag === 4) continue l;
        l.child.return = l, l = l.child;
      }
      if (!(l.flags & 2)) return l.stateNode;
    }
  }
  function Cc(l, t, e) {
    var a = l.tag;
    if (a === 5 || a === 6)
      l = l.stateNode, t ? (e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e).insertBefore(l, t) : (t = e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, t.appendChild(l), e = e._reactRootContainer, e != null || t.onclick !== null || (t.onclick = Vt));
    else if (a !== 4 && (a === 27 && _e(l.type) && (e = l.stateNode, t = null), l = l.child, l !== null))
      for (Cc(l, t, e), l = l.sibling; l !== null; )
        Cc(l, t, e), l = l.sibling;
  }
  function Un(l, t, e) {
    var a = l.tag;
    if (a === 5 || a === 6)
      l = l.stateNode, t ? e.insertBefore(l, t) : e.appendChild(l);
    else if (a !== 4 && (a === 27 && _e(l.type) && (e = l.stateNode), l = l.child, l !== null))
      for (Un(l, t, e), l = l.sibling; l !== null; )
        Un(l, t, e), l = l.sibling;
  }
  function n0(l) {
    var t = l.stateNode, e = l.memoizedProps;
    try {
      for (var a = l.type, u = t.attributes; u.length; )
        t.removeAttributeNode(u[0]);
      Fl(t, a, e), t[wl] = l, t[tt] = e;
    } catch (n) {
      yl(l, l.return, n);
    }
  }
  var le = !1, Yl = !1, Rc = !1, i0 = typeof WeakSet == "function" ? WeakSet : Set, Ql = null;
  function om(l, t) {
    if (l = l.containerInfo, tf = Fn, l = gs(l), _i(l)) {
      if ("selectionStart" in l)
        var e = {
          start: l.selectionStart,
          end: l.selectionEnd
        };
      else
        l: {
          e = (e = l.ownerDocument) && e.defaultView || window;
          var a = e.getSelection && e.getSelection();
          if (a && a.rangeCount !== 0) {
            e = a.anchorNode;
            var u = a.anchorOffset, n = a.focusNode;
            a = a.focusOffset;
            try {
              e.nodeType, n.nodeType;
            } catch {
              e = null;
              break l;
            }
            var i = 0, c = -1, f = -1, h = 0, S = 0, E = l, v = null;
            t: for (; ; ) {
              for (var g; E !== e || u !== 0 && E.nodeType !== 3 || (c = i + u), E !== n || a !== 0 && E.nodeType !== 3 || (f = i + a), E.nodeType === 3 && (i += E.nodeValue.length), (g = E.firstChild) !== null; )
                v = E, E = g;
              for (; ; ) {
                if (E === l) break t;
                if (v === e && ++h === u && (c = i), v === n && ++S === a && (f = i), (g = E.nextSibling) !== null) break;
                E = v, v = E.parentNode;
              }
              E = g;
            }
            e = c === -1 || f === -1 ? null : { start: c, end: f };
          } else e = null;
        }
      e = e || { start: 0, end: 0 };
    } else e = null;
    for (ef = { focusedElem: l, selectionRange: e }, Fn = !1, Ql = t; Ql !== null; )
      if (t = Ql, l = t.child, (t.subtreeFlags & 1028) !== 0 && l !== null)
        l.return = t, Ql = l;
      else
        for (; Ql !== null; ) {
          switch (t = Ql, n = t.alternate, l = t.flags, t.tag) {
            case 0:
              if ((l & 4) !== 0 && (l = t.updateQueue, l = l !== null ? l.events : null, l !== null))
                for (e = 0; e < l.length; e++)
                  u = l[e], u.ref.impl = u.nextImpl;
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((l & 1024) !== 0 && n !== null) {
                l = void 0, e = t, u = n.memoizedProps, n = n.memoizedState, a = e.stateNode;
                try {
                  var C = $e(
                    e.type,
                    u
                  );
                  l = a.getSnapshotBeforeUpdate(
                    C,
                    n
                  ), a.__reactInternalSnapshotBeforeUpdate = l;
                } catch (L) {
                  yl(
                    e,
                    e.return,
                    L
                  );
                }
              }
              break;
            case 3:
              if ((l & 1024) !== 0) {
                if (l = t.stateNode.containerInfo, e = l.nodeType, e === 9)
                  nf(l);
                else if (e === 1)
                  switch (l.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      nf(l);
                      break;
                    default:
                      l.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((l & 1024) !== 0) throw Error(r(163));
          }
          if (l = t.sibling, l !== null) {
            l.return = t.return, Ql = l;
            break;
          }
          Ql = t.return;
        }
  }
  function c0(l, t, e) {
    var a = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 15:
        ee(l, e), a & 4 && gu(5, e);
        break;
      case 1:
        if (ee(l, e), a & 4)
          if (l = e.stateNode, t === null)
            try {
              l.componentDidMount();
            } catch (i) {
              yl(e, e.return, i);
            }
          else {
            var u = $e(
              e.type,
              t.memoizedProps
            );
            t = t.memoizedState;
            try {
              l.componentDidUpdate(
                u,
                t,
                l.__reactInternalSnapshotBeforeUpdate
              );
            } catch (i) {
              yl(
                e,
                e.return,
                i
              );
            }
          }
        a & 64 && t0(e), a & 512 && bu(e, e.return);
        break;
      case 3:
        if (ee(l, e), a & 64 && (l = e.updateQueue, l !== null)) {
          if (t = null, e.child !== null)
            switch (e.child.tag) {
              case 27:
              case 5:
                t = e.child.stateNode;
                break;
              case 1:
                t = e.child.stateNode;
            }
          try {
            Vs(l, t);
          } catch (i) {
            yl(e, e.return, i);
          }
        }
        break;
      case 27:
        t === null && a & 4 && n0(e);
      case 26:
      case 5:
        ee(l, e), t === null && a & 4 && a0(e), a & 512 && bu(e, e.return);
        break;
      case 12:
        ee(l, e);
        break;
      case 31:
        ee(l, e), a & 4 && o0(l, e);
        break;
      case 13:
        ee(l, e), a & 4 && r0(l, e), a & 64 && (l = e.memoizedState, l !== null && (l = l.dehydrated, l !== null && (e = Sm.bind(
          null,
          e
        ), Gm(l, e))));
        break;
      case 22:
        if (a = e.memoizedState !== null || le, !a) {
          t = t !== null && t.memoizedState !== null || Yl, u = le;
          var n = Yl;
          le = a, (Yl = t) && !n ? ae(
            l,
            e,
            (e.subtreeFlags & 8772) !== 0
          ) : ee(l, e), le = u, Yl = n;
        }
        break;
      case 30:
        break;
      default:
        ee(l, e);
    }
  }
  function f0(l) {
    var t = l.alternate;
    t !== null && (l.alternate = null, f0(t)), l.child = null, l.deletions = null, l.sibling = null, l.tag === 5 && (t = l.stateNode, t !== null && oi(t)), l.stateNode = null, l.return = null, l.dependencies = null, l.memoizedProps = null, l.memoizedState = null, l.pendingProps = null, l.stateNode = null, l.updateQueue = null;
  }
  var Nl = null, at = !1;
  function te(l, t, e) {
    for (e = e.child; e !== null; )
      s0(l, t, e), e = e.sibling;
  }
  function s0(l, t, e) {
    if (ot && typeof ot.onCommitFiberUnmount == "function")
      try {
        ot.onCommitFiberUnmount(Qa, e);
      } catch {
      }
    switch (e.tag) {
      case 26:
        Yl || Yt(e, t), te(
          l,
          t,
          e
        ), e.memoizedState ? e.memoizedState.count-- : e.stateNode && (e = e.stateNode, e.parentNode.removeChild(e));
        break;
      case 27:
        Yl || Yt(e, t);
        var a = Nl, u = at;
        _e(e.type) && (Nl = e.stateNode, at = !1), te(
          l,
          t,
          e
        ), _u(e.stateNode), Nl = a, at = u;
        break;
      case 5:
        Yl || Yt(e, t);
      case 6:
        if (a = Nl, u = at, Nl = null, te(
          l,
          t,
          e
        ), Nl = a, at = u, Nl !== null)
          if (at)
            try {
              (Nl.nodeType === 9 ? Nl.body : Nl.nodeName === "HTML" ? Nl.ownerDocument.body : Nl).removeChild(e.stateNode);
            } catch (n) {
              yl(
                e,
                t,
                n
              );
            }
          else
            try {
              Nl.removeChild(e.stateNode);
            } catch (n) {
              yl(
                e,
                t,
                n
              );
            }
        break;
      case 18:
        Nl !== null && (at ? (l = Nl, tr(
          l.nodeType === 9 ? l.body : l.nodeName === "HTML" ? l.ownerDocument.body : l,
          e.stateNode
        ), Ba(l)) : tr(Nl, e.stateNode));
        break;
      case 4:
        a = Nl, u = at, Nl = e.stateNode.containerInfo, at = !0, te(
          l,
          t,
          e
        ), Nl = a, at = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        pe(2, e, t), Yl || pe(4, e, t), te(
          l,
          t,
          e
        );
        break;
      case 1:
        Yl || (Yt(e, t), a = e.stateNode, typeof a.componentWillUnmount == "function" && e0(
          e,
          t,
          a
        )), te(
          l,
          t,
          e
        );
        break;
      case 21:
        te(
          l,
          t,
          e
        );
        break;
      case 22:
        Yl = (a = Yl) || e.memoizedState !== null, te(
          l,
          t,
          e
        ), Yl = a;
        break;
      default:
        te(
          l,
          t,
          e
        );
    }
  }
  function o0(l, t) {
    if (t.memoizedState === null && (l = t.alternate, l !== null && (l = l.memoizedState, l !== null))) {
      l = l.dehydrated;
      try {
        Ba(l);
      } catch (e) {
        yl(t, t.return, e);
      }
    }
  }
  function r0(l, t) {
    if (t.memoizedState === null && (l = t.alternate, l !== null && (l = l.memoizedState, l !== null && (l = l.dehydrated, l !== null))))
      try {
        Ba(l);
      } catch (e) {
        yl(t, t.return, e);
      }
  }
  function rm(l) {
    switch (l.tag) {
      case 31:
      case 13:
      case 19:
        var t = l.stateNode;
        return t === null && (t = l.stateNode = new i0()), t;
      case 22:
        return l = l.stateNode, t = l._retryCache, t === null && (t = l._retryCache = new i0()), t;
      default:
        throw Error(r(435, l.tag));
    }
  }
  function Dn(l, t) {
    var e = rm(l);
    t.forEach(function(a) {
      if (!e.has(a)) {
        e.add(a);
        var u = pm.bind(null, l, a);
        a.then(u, u);
      }
    });
  }
  function ut(l, t) {
    var e = t.deletions;
    if (e !== null)
      for (var a = 0; a < e.length; a++) {
        var u = e[a], n = l, i = t, c = i;
        l: for (; c !== null; ) {
          switch (c.tag) {
            case 27:
              if (_e(c.type)) {
                Nl = c.stateNode, at = !1;
                break l;
              }
              break;
            case 5:
              Nl = c.stateNode, at = !1;
              break l;
            case 3:
            case 4:
              Nl = c.stateNode.containerInfo, at = !0;
              break l;
          }
          c = c.return;
        }
        if (Nl === null) throw Error(r(160));
        s0(n, i, u), Nl = null, at = !1, n = u.alternate, n !== null && (n.return = null), u.return = null;
      }
    if (t.subtreeFlags & 13886)
      for (t = t.child; t !== null; )
        d0(t, l), t = t.sibling;
  }
  var Ct = null;
  function d0(l, t) {
    var e = l.alternate, a = l.flags;
    switch (l.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        ut(t, l), nt(l), a & 4 && (pe(3, l, l.return), gu(3, l), pe(5, l, l.return));
        break;
      case 1:
        ut(t, l), nt(l), a & 512 && (Yl || e === null || Yt(e, e.return)), a & 64 && le && (l = l.updateQueue, l !== null && (a = l.callbacks, a !== null && (e = l.shared.hiddenCallbacks, l.shared.hiddenCallbacks = e === null ? a : e.concat(a))));
        break;
      case 26:
        var u = Ct;
        if (ut(t, l), nt(l), a & 512 && (Yl || e === null || Yt(e, e.return)), a & 4) {
          var n = e !== null ? e.memoizedState : null;
          if (a = l.memoizedState, e === null)
            if (a === null)
              if (l.stateNode === null) {
                l: {
                  a = l.type, e = l.memoizedProps, u = u.ownerDocument || u;
                  t: switch (a) {
                    case "title":
                      n = u.getElementsByTagName("title")[0], (!n || n[Ka] || n[wl] || n.namespaceURI === "http://www.w3.org/2000/svg" || n.hasAttribute("itemprop")) && (n = u.createElement(a), u.head.insertBefore(
                        n,
                        u.querySelector("head > title")
                      )), Fl(n, a, e), n[wl] = l, Xl(n), a = n;
                      break l;
                    case "link":
                      var i = dr(
                        "link",
                        "href",
                        u
                      ).get(a + (e.href || ""));
                      if (i) {
                        for (var c = 0; c < i.length; c++)
                          if (n = i[c], n.getAttribute("href") === (e.href == null || e.href === "" ? null : e.href) && n.getAttribute("rel") === (e.rel == null ? null : e.rel) && n.getAttribute("title") === (e.title == null ? null : e.title) && n.getAttribute("crossorigin") === (e.crossOrigin == null ? null : e.crossOrigin)) {
                            i.splice(c, 1);
                            break t;
                          }
                      }
                      n = u.createElement(a), Fl(n, a, e), u.head.appendChild(n);
                      break;
                    case "meta":
                      if (i = dr(
                        "meta",
                        "content",
                        u
                      ).get(a + (e.content || ""))) {
                        for (c = 0; c < i.length; c++)
                          if (n = i[c], n.getAttribute("content") === (e.content == null ? null : "" + e.content) && n.getAttribute("name") === (e.name == null ? null : e.name) && n.getAttribute("property") === (e.property == null ? null : e.property) && n.getAttribute("http-equiv") === (e.httpEquiv == null ? null : e.httpEquiv) && n.getAttribute("charset") === (e.charSet == null ? null : e.charSet)) {
                            i.splice(c, 1);
                            break t;
                          }
                      }
                      n = u.createElement(a), Fl(n, a, e), u.head.appendChild(n);
                      break;
                    default:
                      throw Error(r(468, a));
                  }
                  n[wl] = l, Xl(n), a = n;
                }
                l.stateNode = a;
              } else
                mr(
                  u,
                  l.type,
                  l.stateNode
                );
            else
              l.stateNode = rr(
                u,
                a,
                l.memoizedProps
              );
          else
            n !== a ? (n === null ? e.stateNode !== null && (e = e.stateNode, e.parentNode.removeChild(e)) : n.count--, a === null ? mr(
              u,
              l.type,
              l.stateNode
            ) : rr(
              u,
              a,
              l.memoizedProps
            )) : a === null && l.stateNode !== null && Dc(
              l,
              l.memoizedProps,
              e.memoizedProps
            );
        }
        break;
      case 27:
        ut(t, l), nt(l), a & 512 && (Yl || e === null || Yt(e, e.return)), e !== null && a & 4 && Dc(
          l,
          l.memoizedProps,
          e.memoizedProps
        );
        break;
      case 5:
        if (ut(t, l), nt(l), a & 512 && (Yl || e === null || Yt(e, e.return)), l.flags & 32) {
          u = l.stateNode;
          try {
            na(u, "");
          } catch (C) {
            yl(l, l.return, C);
          }
        }
        a & 4 && l.stateNode != null && (u = l.memoizedProps, Dc(
          l,
          u,
          e !== null ? e.memoizedProps : u
        )), a & 1024 && (Rc = !0);
        break;
      case 6:
        if (ut(t, l), nt(l), a & 4) {
          if (l.stateNode === null)
            throw Error(r(162));
          a = l.memoizedProps, e = l.stateNode;
          try {
            e.nodeValue = a;
          } catch (C) {
            yl(l, l.return, C);
          }
        }
        break;
      case 3:
        if (wn = null, u = Ct, Ct = Kn(t.containerInfo), ut(t, l), Ct = u, nt(l), a & 4 && e !== null && e.memoizedState.isDehydrated)
          try {
            Ba(t.containerInfo);
          } catch (C) {
            yl(l, l.return, C);
          }
        Rc && (Rc = !1, m0(l));
        break;
      case 4:
        a = Ct, Ct = Kn(
          l.stateNode.containerInfo
        ), ut(t, l), nt(l), Ct = a;
        break;
      case 12:
        ut(t, l), nt(l);
        break;
      case 31:
        ut(t, l), nt(l), a & 4 && (a = l.updateQueue, a !== null && (l.updateQueue = null, Dn(l, a)));
        break;
      case 13:
        ut(t, l), nt(l), l.child.flags & 8192 && l.memoizedState !== null != (e !== null && e.memoizedState !== null) && (Cn = Al()), a & 4 && (a = l.updateQueue, a !== null && (l.updateQueue = null, Dn(l, a)));
        break;
      case 22:
        u = l.memoizedState !== null;
        var f = e !== null && e.memoizedState !== null, h = le, S = Yl;
        if (le = h || u, Yl = S || f, ut(t, l), Yl = S, le = h, nt(l), a & 8192)
          l: for (t = l.stateNode, t._visibility = u ? t._visibility & -2 : t._visibility | 1, u && (e === null || f || le || Yl || We(l)), e = null, t = l; ; ) {
            if (t.tag === 5 || t.tag === 26) {
              if (e === null) {
                f = e = t;
                try {
                  if (n = f.stateNode, u)
                    i = n.style, typeof i.setProperty == "function" ? i.setProperty("display", "none", "important") : i.display = "none";
                  else {
                    c = f.stateNode;
                    var E = f.memoizedProps.style, v = E != null && E.hasOwnProperty("display") ? E.display : null;
                    c.style.display = v == null || typeof v == "boolean" ? "" : ("" + v).trim();
                  }
                } catch (C) {
                  yl(f, f.return, C);
                }
              }
            } else if (t.tag === 6) {
              if (e === null) {
                f = t;
                try {
                  f.stateNode.nodeValue = u ? "" : f.memoizedProps;
                } catch (C) {
                  yl(f, f.return, C);
                }
              }
            } else if (t.tag === 18) {
              if (e === null) {
                f = t;
                try {
                  var g = f.stateNode;
                  u ? er(g, !0) : er(f.stateNode, !1);
                } catch (C) {
                  yl(f, f.return, C);
                }
              }
            } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === l) && t.child !== null) {
              t.child.return = t, t = t.child;
              continue;
            }
            if (t === l) break l;
            for (; t.sibling === null; ) {
              if (t.return === null || t.return === l) break l;
              e === t && (e = null), t = t.return;
            }
            e === t && (e = null), t.sibling.return = t.return, t = t.sibling;
          }
        a & 4 && (a = l.updateQueue, a !== null && (e = a.retryQueue, e !== null && (a.retryQueue = null, Dn(l, e))));
        break;
      case 19:
        ut(t, l), nt(l), a & 4 && (a = l.updateQueue, a !== null && (l.updateQueue = null, Dn(l, a)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        ut(t, l), nt(l);
    }
  }
  function nt(l) {
    var t = l.flags;
    if (t & 2) {
      try {
        for (var e, a = l.return; a !== null; ) {
          if (u0(a)) {
            e = a;
            break;
          }
          a = a.return;
        }
        if (e == null) throw Error(r(160));
        switch (e.tag) {
          case 27:
            var u = e.stateNode, n = jc(l);
            Un(l, n, u);
            break;
          case 5:
            var i = e.stateNode;
            e.flags & 32 && (na(i, ""), e.flags &= -33);
            var c = jc(l);
            Un(l, c, i);
            break;
          case 3:
          case 4:
            var f = e.stateNode.containerInfo, h = jc(l);
            Cc(
              l,
              h,
              f
            );
            break;
          default:
            throw Error(r(161));
        }
      } catch (S) {
        yl(l, l.return, S);
      }
      l.flags &= -3;
    }
    t & 4096 && (l.flags &= -4097);
  }
  function m0(l) {
    if (l.subtreeFlags & 1024)
      for (l = l.child; l !== null; ) {
        var t = l;
        m0(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), l = l.sibling;
      }
  }
  function ee(l, t) {
    if (t.subtreeFlags & 8772)
      for (t = t.child; t !== null; )
        c0(l, t.alternate, t), t = t.sibling;
  }
  function We(l) {
    for (l = l.child; l !== null; ) {
      var t = l;
      switch (t.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          pe(4, t, t.return), We(t);
          break;
        case 1:
          Yt(t, t.return);
          var e = t.stateNode;
          typeof e.componentWillUnmount == "function" && e0(
            t,
            t.return,
            e
          ), We(t);
          break;
        case 27:
          _u(t.stateNode);
        case 26:
        case 5:
          Yt(t, t.return), We(t);
          break;
        case 22:
          t.memoizedState === null && We(t);
          break;
        case 30:
          We(t);
          break;
        default:
          We(t);
      }
      l = l.sibling;
    }
  }
  function ae(l, t, e) {
    for (e = e && (t.subtreeFlags & 8772) !== 0, t = t.child; t !== null; ) {
      var a = t.alternate, u = l, n = t, i = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          ae(
            u,
            n,
            e
          ), gu(4, n);
          break;
        case 1:
          if (ae(
            u,
            n,
            e
          ), a = n, u = a.stateNode, typeof u.componentDidMount == "function")
            try {
              u.componentDidMount();
            } catch (h) {
              yl(a, a.return, h);
            }
          if (a = n, u = a.updateQueue, u !== null) {
            var c = a.stateNode;
            try {
              var f = u.shared.hiddenCallbacks;
              if (f !== null)
                for (u.shared.hiddenCallbacks = null, u = 0; u < f.length; u++)
                  Zs(f[u], c);
            } catch (h) {
              yl(a, a.return, h);
            }
          }
          e && i & 64 && t0(n), bu(n, n.return);
          break;
        case 27:
          n0(n);
        case 26:
        case 5:
          ae(
            u,
            n,
            e
          ), e && a === null && i & 4 && a0(n), bu(n, n.return);
          break;
        case 12:
          ae(
            u,
            n,
            e
          );
          break;
        case 31:
          ae(
            u,
            n,
            e
          ), e && i & 4 && o0(u, n);
          break;
        case 13:
          ae(
            u,
            n,
            e
          ), e && i & 4 && r0(u, n);
          break;
        case 22:
          n.memoizedState === null && ae(
            u,
            n,
            e
          ), bu(n, n.return);
          break;
        case 30:
          break;
        default:
          ae(
            u,
            n,
            e
          );
      }
      t = t.sibling;
    }
  }
  function Hc(l, t) {
    var e = null;
    l !== null && l.memoizedState !== null && l.memoizedState.cachePool !== null && (e = l.memoizedState.cachePool.pool), l = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool), l !== e && (l != null && l.refCount++, e != null && uu(e));
  }
  function Bc(l, t) {
    l = null, t.alternate !== null && (l = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== l && (t.refCount++, l != null && uu(l));
  }
  function Rt(l, t, e, a) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; )
        h0(
          l,
          t,
          e,
          a
        ), t = t.sibling;
  }
  function h0(l, t, e, a) {
    var u = t.flags;
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
        Rt(
          l,
          t,
          e,
          a
        ), u & 2048 && gu(9, t);
        break;
      case 1:
        Rt(
          l,
          t,
          e,
          a
        );
        break;
      case 3:
        Rt(
          l,
          t,
          e,
          a
        ), u & 2048 && (l = null, t.alternate !== null && (l = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== l && (t.refCount++, l != null && uu(l)));
        break;
      case 12:
        if (u & 2048) {
          Rt(
            l,
            t,
            e,
            a
          ), l = t.stateNode;
          try {
            var n = t.memoizedProps, i = n.id, c = n.onPostCommit;
            typeof c == "function" && c(
              i,
              t.alternate === null ? "mount" : "update",
              l.passiveEffectDuration,
              -0
            );
          } catch (f) {
            yl(t, t.return, f);
          }
        } else
          Rt(
            l,
            t,
            e,
            a
          );
        break;
      case 31:
        Rt(
          l,
          t,
          e,
          a
        );
        break;
      case 13:
        Rt(
          l,
          t,
          e,
          a
        );
        break;
      case 23:
        break;
      case 22:
        n = t.stateNode, i = t.alternate, t.memoizedState !== null ? n._visibility & 2 ? Rt(
          l,
          t,
          e,
          a
        ) : Su(l, t) : n._visibility & 2 ? Rt(
          l,
          t,
          e,
          a
        ) : (n._visibility |= 2, Aa(
          l,
          t,
          e,
          a,
          (t.subtreeFlags & 10256) !== 0 || !1
        )), u & 2048 && Hc(i, t);
        break;
      case 24:
        Rt(
          l,
          t,
          e,
          a
        ), u & 2048 && Bc(t.alternate, t);
        break;
      default:
        Rt(
          l,
          t,
          e,
          a
        );
    }
  }
  function Aa(l, t, e, a, u) {
    for (u = u && ((t.subtreeFlags & 10256) !== 0 || !1), t = t.child; t !== null; ) {
      var n = l, i = t, c = e, f = a, h = i.flags;
      switch (i.tag) {
        case 0:
        case 11:
        case 15:
          Aa(
            n,
            i,
            c,
            f,
            u
          ), gu(8, i);
          break;
        case 23:
          break;
        case 22:
          var S = i.stateNode;
          i.memoizedState !== null ? S._visibility & 2 ? Aa(
            n,
            i,
            c,
            f,
            u
          ) : Su(
            n,
            i
          ) : (S._visibility |= 2, Aa(
            n,
            i,
            c,
            f,
            u
          )), u && h & 2048 && Hc(
            i.alternate,
            i
          );
          break;
        case 24:
          Aa(
            n,
            i,
            c,
            f,
            u
          ), u && h & 2048 && Bc(i.alternate, i);
          break;
        default:
          Aa(
            n,
            i,
            c,
            f,
            u
          );
      }
      t = t.sibling;
    }
  }
  function Su(l, t) {
    if (t.subtreeFlags & 10256)
      for (t = t.child; t !== null; ) {
        var e = l, a = t, u = a.flags;
        switch (a.tag) {
          case 22:
            Su(e, a), u & 2048 && Hc(
              a.alternate,
              a
            );
            break;
          case 24:
            Su(e, a), u & 2048 && Bc(a.alternate, a);
            break;
          default:
            Su(e, a);
        }
        t = t.sibling;
      }
  }
  var pu = 8192;
  function Na(l, t, e) {
    if (l.subtreeFlags & pu)
      for (l = l.child; l !== null; )
        y0(
          l,
          t,
          e
        ), l = l.sibling;
  }
  function y0(l, t, e) {
    switch (l.tag) {
      case 26:
        Na(
          l,
          t,
          e
        ), l.flags & pu && l.memoizedState !== null && Fm(
          e,
          Ct,
          l.memoizedState,
          l.memoizedProps
        );
        break;
      case 5:
        Na(
          l,
          t,
          e
        );
        break;
      case 3:
      case 4:
        var a = Ct;
        Ct = Kn(l.stateNode.containerInfo), Na(
          l,
          t,
          e
        ), Ct = a;
        break;
      case 22:
        l.memoizedState === null && (a = l.alternate, a !== null && a.memoizedState !== null ? (a = pu, pu = 16777216, Na(
          l,
          t,
          e
        ), pu = a) : Na(
          l,
          t,
          e
        ));
        break;
      default:
        Na(
          l,
          t,
          e
        );
    }
  }
  function v0(l) {
    var t = l.alternate;
    if (t !== null && (l = t.child, l !== null)) {
      t.child = null;
      do
        t = l.sibling, l.sibling = null, l = t;
      while (l !== null);
    }
  }
  function zu(l) {
    var t = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (t !== null)
        for (var e = 0; e < t.length; e++) {
          var a = t[e];
          Ql = a, b0(
            a,
            l
          );
        }
      v0(l);
    }
    if (l.subtreeFlags & 10256)
      for (l = l.child; l !== null; )
        g0(l), l = l.sibling;
  }
  function g0(l) {
    switch (l.tag) {
      case 0:
      case 11:
      case 15:
        zu(l), l.flags & 2048 && pe(9, l, l.return);
        break;
      case 3:
        zu(l);
        break;
      case 12:
        zu(l);
        break;
      case 22:
        var t = l.stateNode;
        l.memoizedState !== null && t._visibility & 2 && (l.return === null || l.return.tag !== 13) ? (t._visibility &= -3, jn(l)) : zu(l);
        break;
      default:
        zu(l);
    }
  }
  function jn(l) {
    var t = l.deletions;
    if ((l.flags & 16) !== 0) {
      if (t !== null)
        for (var e = 0; e < t.length; e++) {
          var a = t[e];
          Ql = a, b0(
            a,
            l
          );
        }
      v0(l);
    }
    for (l = l.child; l !== null; ) {
      switch (t = l, t.tag) {
        case 0:
        case 11:
        case 15:
          pe(8, t, t.return), jn(t);
          break;
        case 22:
          e = t.stateNode, e._visibility & 2 && (e._visibility &= -3, jn(t));
          break;
        default:
          jn(t);
      }
      l = l.sibling;
    }
  }
  function b0(l, t) {
    for (; Ql !== null; ) {
      var e = Ql;
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          pe(8, e, t);
          break;
        case 23:
        case 22:
          if (e.memoizedState !== null && e.memoizedState.cachePool !== null) {
            var a = e.memoizedState.cachePool.pool;
            a != null && a.refCount++;
          }
          break;
        case 24:
          uu(e.memoizedState.cache);
      }
      if (a = e.child, a !== null) a.return = e, Ql = a;
      else
        l: for (e = l; Ql !== null; ) {
          a = Ql;
          var u = a.sibling, n = a.return;
          if (f0(a), a === e) {
            Ql = null;
            break l;
          }
          if (u !== null) {
            u.return = n, Ql = u;
            break l;
          }
          Ql = n;
        }
    }
  }
  var dm = {
    getCacheForType: function(l) {
      var t = Wl(Hl), e = t.data.get(l);
      return e === void 0 && (e = l(), t.data.set(l, e)), e;
    },
    cacheSignal: function() {
      return Wl(Hl).controller.signal;
    }
  }, mm = typeof WeakMap == "function" ? WeakMap : Map, rl = 0, Tl = null, I = null, tl = 0, hl = 0, vt = null, ze = !1, _a = !1, qc = !1, ue = 0, Ul = 0, Te = 0, ke = 0, Yc = 0, gt = 0, Ma = 0, Tu = null, it = null, Gc = !1, Cn = 0, S0 = 0, Rn = 1 / 0, Hn = null, xe = null, Ll = 0, Ee = null, Oa = null, ne = 0, Lc = 0, Xc = null, p0 = null, xu = 0, Qc = null;
  function bt() {
    return (rl & 2) !== 0 && tl !== 0 ? tl & -tl : p.T !== null ? $c() : Hf();
  }
  function z0() {
    if (gt === 0)
      if ((tl & 536870912) === 0 || al) {
        var l = Qu;
        Qu <<= 1, (Qu & 3932160) === 0 && (Qu = 262144), gt = l;
      } else gt = 536870912;
    return l = ht.current, l !== null && (l.flags |= 32), gt;
  }
  function ct(l, t, e) {
    (l === Tl && (hl === 2 || hl === 9) || l.cancelPendingCommit !== null) && (Ua(l, 0), Ae(
      l,
      tl,
      gt,
      !1
    )), Va(l, e), ((rl & 2) === 0 || l !== Tl) && (l === Tl && ((rl & 2) === 0 && (ke |= e), Ul === 4 && Ae(
      l,
      tl,
      gt,
      !1
    )), Gt(l));
  }
  function T0(l, t, e) {
    if ((rl & 6) !== 0) throw Error(r(327));
    var a = !e && (t & 127) === 0 && (t & l.expiredLanes) === 0 || Za(l, t), u = a ? vm(l, t) : Vc(l, t, !0), n = a;
    do {
      if (u === 0) {
        _a && !a && Ae(l, t, 0, !1);
        break;
      } else {
        if (e = l.current.alternate, n && !hm(e)) {
          u = Vc(l, t, !1), n = !1;
          continue;
        }
        if (u === 2) {
          if (n = t, l.errorRecoveryDisabledLanes & n)
            var i = 0;
          else
            i = l.pendingLanes & -536870913, i = i !== 0 ? i : i & 536870912 ? 536870912 : 0;
          if (i !== 0) {
            t = i;
            l: {
              var c = l;
              u = Tu;
              var f = c.current.memoizedState.isDehydrated;
              if (f && (Ua(c, i).flags |= 256), i = Vc(
                c,
                i,
                !1
              ), i !== 2) {
                if (qc && !f) {
                  c.errorRecoveryDisabledLanes |= n, ke |= n, u = 4;
                  break l;
                }
                n = it, it = u, n !== null && (it === null ? it = n : it.push.apply(
                  it,
                  n
                ));
              }
              u = i;
            }
            if (n = !1, u !== 2) continue;
          }
        }
        if (u === 1) {
          Ua(l, 0), Ae(l, t, 0, !0);
          break;
        }
        l: {
          switch (a = l, n = u, n) {
            case 0:
            case 1:
              throw Error(r(345));
            case 4:
              if ((t & 4194048) !== t) break;
            case 6:
              Ae(
                a,
                t,
                gt,
                !ze
              );
              break l;
            case 2:
              it = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(r(329));
          }
          if ((t & 62914560) === t && (u = Cn + 300 - Al(), 10 < u)) {
            if (Ae(
              a,
              t,
              gt,
              !ze
            ), Vu(a, 0, !0) !== 0) break l;
            ne = t, a.timeoutHandle = P0(
              x0.bind(
                null,
                a,
                e,
                it,
                Hn,
                Gc,
                t,
                gt,
                ke,
                Ma,
                ze,
                n,
                "Throttled",
                -0,
                0
              ),
              u
            );
            break l;
          }
          x0(
            a,
            e,
            it,
            Hn,
            Gc,
            t,
            gt,
            ke,
            Ma,
            ze,
            n,
            null,
            -0,
            0
          );
        }
      }
      break;
    } while (!0);
    Gt(l);
  }
  function x0(l, t, e, a, u, n, i, c, f, h, S, E, v, g) {
    if (l.timeoutHandle = -1, E = t.subtreeFlags, E & 8192 || (E & 16785408) === 16785408) {
      E = {
        stylesheets: null,
        count: 0,
        imgCount: 0,
        imgBytes: 0,
        suspenseyImages: [],
        waitingForImages: !0,
        waitingForViewTransition: !1,
        unsuspend: Vt
      }, y0(
        t,
        n,
        E
      );
      var C = (n & 62914560) === n ? Cn - Al() : (n & 4194048) === n ? S0 - Al() : 0;
      if (C = Im(
        E,
        C
      ), C !== null) {
        ne = n, l.cancelPendingCommit = C(
          D0.bind(
            null,
            l,
            t,
            n,
            e,
            a,
            u,
            i,
            c,
            f,
            S,
            E,
            null,
            v,
            g
          )
        ), Ae(l, n, i, !h);
        return;
      }
    }
    D0(
      l,
      t,
      n,
      e,
      a,
      u,
      i,
      c,
      f
    );
  }
  function hm(l) {
    for (var t = l; ; ) {
      var e = t.tag;
      if ((e === 0 || e === 11 || e === 15) && t.flags & 16384 && (e = t.updateQueue, e !== null && (e = e.stores, e !== null)))
        for (var a = 0; a < e.length; a++) {
          var u = e[a], n = u.getSnapshot;
          u = u.value;
          try {
            if (!dt(n(), u)) return !1;
          } catch {
            return !1;
          }
        }
      if (e = t.child, t.subtreeFlags & 16384 && e !== null)
        e.return = t, t = e;
      else {
        if (t === l) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === l) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function Ae(l, t, e, a) {
    t &= ~Yc, t &= ~ke, l.suspendedLanes |= t, l.pingedLanes &= ~t, a && (l.warmLanes |= t), a = l.expirationTimes;
    for (var u = t; 0 < u; ) {
      var n = 31 - rt(u), i = 1 << n;
      a[n] = -1, u &= ~i;
    }
    e !== 0 && jf(l, e, t);
  }
  function Bn() {
    return (rl & 6) === 0 ? (Eu(0), !1) : !0;
  }
  function Zc() {
    if (I !== null) {
      if (hl === 0)
        var l = I.return;
      else
        l = I, $t = Xe = null, nc(l), pa = null, iu = 0, l = I;
      for (; l !== null; )
        l0(l.alternate, l), l = l.return;
      I = null;
    }
  }
  function Ua(l, t) {
    var e = l.timeoutHandle;
    e !== -1 && (l.timeoutHandle = -1, Rm(e)), e = l.cancelPendingCommit, e !== null && (l.cancelPendingCommit = null, e()), ne = 0, Zc(), Tl = l, I = e = Jt(l.current, null), tl = t, hl = 0, vt = null, ze = !1, _a = Za(l, t), qc = !1, Ma = gt = Yc = ke = Te = Ul = 0, it = Tu = null, Gc = !1, (t & 8) !== 0 && (t |= t & 32);
    var a = l.entangledLanes;
    if (a !== 0)
      for (l = l.entanglements, a &= t; 0 < a; ) {
        var u = 31 - rt(a), n = 1 << u;
        t |= l[u], a &= ~n;
      }
    return ue = t, en(), e;
  }
  function E0(l, t) {
    $ = null, p.H = hu, t === Sa || t === rn ? (t = Gs(), hl = 3) : t === wi ? (t = Gs(), hl = 4) : hl = t === zc ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1, vt = t, I === null && (Ul = 1, An(
      l,
      At(t, l.current)
    ));
  }
  function A0() {
    var l = ht.current;
    return l === null ? !0 : (tl & 4194048) === tl ? Ot === null : (tl & 62914560) === tl || (tl & 536870912) !== 0 ? l === Ot : !1;
  }
  function N0() {
    var l = p.H;
    return p.H = hu, l === null ? hu : l;
  }
  function _0() {
    var l = p.A;
    return p.A = dm, l;
  }
  function qn() {
    Ul = 4, ze || (tl & 4194048) !== tl && ht.current !== null || (_a = !0), (Te & 134217727) === 0 && (ke & 134217727) === 0 || Tl === null || Ae(
      Tl,
      tl,
      gt,
      !1
    );
  }
  function Vc(l, t, e) {
    var a = rl;
    rl |= 2;
    var u = N0(), n = _0();
    (Tl !== l || tl !== t) && (Hn = null, Ua(l, t)), t = !1;
    var i = Ul;
    l: do
      try {
        if (hl !== 0 && I !== null) {
          var c = I, f = vt;
          switch (hl) {
            case 8:
              Zc(), i = 6;
              break l;
            case 3:
            case 2:
            case 9:
            case 6:
              ht.current === null && (t = !0);
              var h = hl;
              if (hl = 0, vt = null, Da(l, c, f, h), e && _a) {
                i = 0;
                break l;
              }
              break;
            default:
              h = hl, hl = 0, vt = null, Da(l, c, f, h);
          }
        }
        ym(), i = Ul;
        break;
      } catch (S) {
        E0(l, S);
      }
    while (!0);
    return t && l.shellSuspendCounter++, $t = Xe = null, rl = a, p.H = u, p.A = n, I === null && (Tl = null, tl = 0, en()), i;
  }
  function ym() {
    for (; I !== null; ) M0(I);
  }
  function vm(l, t) {
    var e = rl;
    rl |= 2;
    var a = N0(), u = _0();
    Tl !== l || tl !== t ? (Hn = null, Rn = Al() + 500, Ua(l, t)) : _a = Za(
      l,
      t
    );
    l: do
      try {
        if (hl !== 0 && I !== null) {
          t = I;
          var n = vt;
          t: switch (hl) {
            case 1:
              hl = 0, vt = null, Da(l, t, n, 1);
              break;
            case 2:
            case 9:
              if (qs(n)) {
                hl = 0, vt = null, O0(t);
                break;
              }
              t = function() {
                hl !== 2 && hl !== 9 || Tl !== l || (hl = 7), Gt(l);
              }, n.then(t, t);
              break l;
            case 3:
              hl = 7;
              break l;
            case 4:
              hl = 5;
              break l;
            case 7:
              qs(n) ? (hl = 0, vt = null, O0(t)) : (hl = 0, vt = null, Da(l, t, n, 7));
              break;
            case 5:
              var i = null;
              switch (I.tag) {
                case 26:
                  i = I.memoizedState;
                case 5:
                case 27:
                  var c = I;
                  if (i ? hr(i) : c.stateNode.complete) {
                    hl = 0, vt = null;
                    var f = c.sibling;
                    if (f !== null) I = f;
                    else {
                      var h = c.return;
                      h !== null ? (I = h, Yn(h)) : I = null;
                    }
                    break t;
                  }
              }
              hl = 0, vt = null, Da(l, t, n, 5);
              break;
            case 6:
              hl = 0, vt = null, Da(l, t, n, 6);
              break;
            case 8:
              Zc(), Ul = 6;
              break l;
            default:
              throw Error(r(462));
          }
        }
        gm();
        break;
      } catch (S) {
        E0(l, S);
      }
    while (!0);
    return $t = Xe = null, p.H = a, p.A = u, rl = e, I !== null ? 0 : (Tl = null, tl = 0, en(), Ul);
  }
  function gm() {
    for (; I !== null && !ol(); )
      M0(I);
  }
  function M0(l) {
    var t = Io(l.alternate, l, ue);
    l.memoizedProps = l.pendingProps, t === null ? Yn(l) : I = t;
  }
  function O0(l) {
    var t = l, e = t.alternate;
    switch (t.tag) {
      case 15:
      case 0:
        t = Jo(
          e,
          t,
          t.pendingProps,
          t.type,
          void 0,
          tl
        );
        break;
      case 11:
        t = Jo(
          e,
          t,
          t.pendingProps,
          t.type.render,
          t.ref,
          tl
        );
        break;
      case 5:
        nc(t);
      default:
        l0(e, t), t = I = Ns(t, ue), t = Io(e, t, ue);
    }
    l.memoizedProps = l.pendingProps, t === null ? Yn(l) : I = t;
  }
  function Da(l, t, e, a) {
    $t = Xe = null, nc(t), pa = null, iu = 0;
    var u = t.return;
    try {
      if (nm(
        l,
        u,
        t,
        e,
        tl
      )) {
        Ul = 1, An(
          l,
          At(e, l.current)
        ), I = null;
        return;
      }
    } catch (n) {
      if (u !== null) throw I = u, n;
      Ul = 1, An(
        l,
        At(e, l.current)
      ), I = null;
      return;
    }
    t.flags & 32768 ? (al || a === 1 ? l = !0 : _a || (tl & 536870912) !== 0 ? l = !1 : (ze = l = !0, (a === 2 || a === 9 || a === 3 || a === 6) && (a = ht.current, a !== null && a.tag === 13 && (a.flags |= 16384))), U0(t, l)) : Yn(t);
  }
  function Yn(l) {
    var t = l;
    do {
      if ((t.flags & 32768) !== 0) {
        U0(
          t,
          ze
        );
        return;
      }
      l = t.return;
      var e = fm(
        t.alternate,
        t,
        ue
      );
      if (e !== null) {
        I = e;
        return;
      }
      if (t = t.sibling, t !== null) {
        I = t;
        return;
      }
      I = t = l;
    } while (t !== null);
    Ul === 0 && (Ul = 5);
  }
  function U0(l, t) {
    do {
      var e = sm(l.alternate, l);
      if (e !== null) {
        e.flags &= 32767, I = e;
        return;
      }
      if (e = l.return, e !== null && (e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null), !t && (l = l.sibling, l !== null)) {
        I = l;
        return;
      }
      I = l = e;
    } while (l !== null);
    Ul = 6, I = null;
  }
  function D0(l, t, e, a, u, n, i, c, f) {
    l.cancelPendingCommit = null;
    do
      Gn();
    while (Ll !== 0);
    if ((rl & 6) !== 0) throw Error(r(327));
    if (t !== null) {
      if (t === l.current) throw Error(r(177));
      if (n = t.lanes | t.childLanes, n |= ji, kr(
        l,
        e,
        n,
        i,
        c,
        f
      ), l === Tl && (I = Tl = null, tl = 0), Oa = t, Ee = l, ne = e, Lc = n, Xc = u, p0 = a, (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (l.callbackNode = null, l.callbackPriority = 0, zm(Lu, function() {
        return B0(), null;
      })) : (l.callbackNode = null, l.callbackPriority = 0), a = (t.flags & 13878) !== 0, (t.subtreeFlags & 13878) !== 0 || a) {
        a = p.T, p.T = null, u = M.p, M.p = 2, i = rl, rl |= 4;
        try {
          om(l, t, e);
        } finally {
          rl = i, M.p = u, p.T = a;
        }
      }
      Ll = 1, j0(), C0(), R0();
    }
  }
  function j0() {
    if (Ll === 1) {
      Ll = 0;
      var l = Ee, t = Oa, e = (t.flags & 13878) !== 0;
      if ((t.subtreeFlags & 13878) !== 0 || e) {
        e = p.T, p.T = null;
        var a = M.p;
        M.p = 2;
        var u = rl;
        rl |= 4;
        try {
          d0(t, l);
          var n = ef, i = gs(l.containerInfo), c = n.focusedElem, f = n.selectionRange;
          if (i !== c && c && c.ownerDocument && vs(
            c.ownerDocument.documentElement,
            c
          )) {
            if (f !== null && _i(c)) {
              var h = f.start, S = f.end;
              if (S === void 0 && (S = h), "selectionStart" in c)
                c.selectionStart = h, c.selectionEnd = Math.min(
                  S,
                  c.value.length
                );
              else {
                var E = c.ownerDocument || document, v = E && E.defaultView || window;
                if (v.getSelection) {
                  var g = v.getSelection(), C = c.textContent.length, L = Math.min(f.start, C), Sl = f.end === void 0 ? L : Math.min(f.end, C);
                  !g.extend && L > Sl && (i = Sl, Sl = L, L = i);
                  var d = ys(
                    c,
                    L
                  ), s = ys(
                    c,
                    Sl
                  );
                  if (d && s && (g.rangeCount !== 1 || g.anchorNode !== d.node || g.anchorOffset !== d.offset || g.focusNode !== s.node || g.focusOffset !== s.offset)) {
                    var m = E.createRange();
                    m.setStart(d.node, d.offset), g.removeAllRanges(), L > Sl ? (g.addRange(m), g.extend(s.node, s.offset)) : (m.setEnd(s.node, s.offset), g.addRange(m));
                  }
                }
              }
            }
            for (E = [], g = c; g = g.parentNode; )
              g.nodeType === 1 && E.push({
                element: g,
                left: g.scrollLeft,
                top: g.scrollTop
              });
            for (typeof c.focus == "function" && c.focus(), c = 0; c < E.length; c++) {
              var z = E[c];
              z.element.scrollLeft = z.left, z.element.scrollTop = z.top;
            }
          }
          Fn = !!tf, ef = tf = null;
        } finally {
          rl = u, M.p = a, p.T = e;
        }
      }
      l.current = t, Ll = 2;
    }
  }
  function C0() {
    if (Ll === 2) {
      Ll = 0;
      var l = Ee, t = Oa, e = (t.flags & 8772) !== 0;
      if ((t.subtreeFlags & 8772) !== 0 || e) {
        e = p.T, p.T = null;
        var a = M.p;
        M.p = 2;
        var u = rl;
        rl |= 4;
        try {
          c0(l, t.alternate, t);
        } finally {
          rl = u, M.p = a, p.T = e;
        }
      }
      Ll = 3;
    }
  }
  function R0() {
    if (Ll === 4 || Ll === 3) {
      Ll = 0, Il();
      var l = Ee, t = Oa, e = ne, a = p0;
      (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? Ll = 5 : (Ll = 0, Oa = Ee = null, H0(l, l.pendingLanes));
      var u = l.pendingLanes;
      if (u === 0 && (xe = null), fi(e), t = t.stateNode, ot && typeof ot.onCommitFiberRoot == "function")
        try {
          ot.onCommitFiberRoot(
            Qa,
            t,
            void 0,
            (t.current.flags & 128) === 128
          );
        } catch {
        }
      if (a !== null) {
        t = p.T, u = M.p, M.p = 2, p.T = null;
        try {
          for (var n = l.onRecoverableError, i = 0; i < a.length; i++) {
            var c = a[i];
            n(c.value, {
              componentStack: c.stack
            });
          }
        } finally {
          p.T = t, M.p = u;
        }
      }
      (ne & 3) !== 0 && Gn(), Gt(l), u = l.pendingLanes, (e & 261930) !== 0 && (u & 42) !== 0 ? l === Qc ? xu++ : (xu = 0, Qc = l) : xu = 0, Eu(0);
    }
  }
  function H0(l, t) {
    (l.pooledCacheLanes &= t) === 0 && (t = l.pooledCache, t != null && (l.pooledCache = null, uu(t)));
  }
  function Gn() {
    return j0(), C0(), R0(), B0();
  }
  function B0() {
    if (Ll !== 5) return !1;
    var l = Ee, t = Lc;
    Lc = 0;
    var e = fi(ne), a = p.T, u = M.p;
    try {
      M.p = 32 > e ? 32 : e, p.T = null, e = Xc, Xc = null;
      var n = Ee, i = ne;
      if (Ll = 0, Oa = Ee = null, ne = 0, (rl & 6) !== 0) throw Error(r(331));
      var c = rl;
      if (rl |= 4, g0(n.current), h0(
        n,
        n.current,
        i,
        e
      ), rl = c, Eu(0, !1), ot && typeof ot.onPostCommitFiberRoot == "function")
        try {
          ot.onPostCommitFiberRoot(Qa, n);
        } catch {
        }
      return !0;
    } finally {
      M.p = u, p.T = a, H0(l, t);
    }
  }
  function q0(l, t, e) {
    t = At(e, t), t = pc(l.stateNode, t, 2), l = ge(l, t, 2), l !== null && (Va(l, 2), Gt(l));
  }
  function yl(l, t, e) {
    if (l.tag === 3)
      q0(l, l, e);
    else
      for (; t !== null; ) {
        if (t.tag === 3) {
          q0(
            t,
            l,
            e
          );
          break;
        } else if (t.tag === 1) {
          var a = t.stateNode;
          if (typeof t.type.getDerivedStateFromError == "function" || typeof a.componentDidCatch == "function" && (xe === null || !xe.has(a))) {
            l = At(e, l), e = Yo(2), a = ge(t, e, 2), a !== null && (Go(
              e,
              a,
              t,
              l
            ), Va(a, 2), Gt(a));
            break;
          }
        }
        t = t.return;
      }
  }
  function Kc(l, t, e) {
    var a = l.pingCache;
    if (a === null) {
      a = l.pingCache = new mm();
      var u = /* @__PURE__ */ new Set();
      a.set(t, u);
    } else
      u = a.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), a.set(t, u));
    u.has(e) || (qc = !0, u.add(e), l = bm.bind(null, l, t, e), t.then(l, l));
  }
  function bm(l, t, e) {
    var a = l.pingCache;
    a !== null && a.delete(t), l.pingedLanes |= l.suspendedLanes & e, l.warmLanes &= ~e, Tl === l && (tl & e) === e && (Ul === 4 || Ul === 3 && (tl & 62914560) === tl && 300 > Al() - Cn ? (rl & 2) === 0 && Ua(l, 0) : Yc |= e, Ma === tl && (Ma = 0)), Gt(l);
  }
  function Y0(l, t) {
    t === 0 && (t = Df()), l = Ye(l, t), l !== null && (Va(l, t), Gt(l));
  }
  function Sm(l) {
    var t = l.memoizedState, e = 0;
    t !== null && (e = t.retryLane), Y0(l, e);
  }
  function pm(l, t) {
    var e = 0;
    switch (l.tag) {
      case 31:
      case 13:
        var a = l.stateNode, u = l.memoizedState;
        u !== null && (e = u.retryLane);
        break;
      case 19:
        a = l.stateNode;
        break;
      case 22:
        a = l.stateNode._retryCache;
        break;
      default:
        throw Error(r(314));
    }
    a !== null && a.delete(t), Y0(l, e);
  }
  function zm(l, t) {
    return w(l, t);
  }
  var Ln = null, ja = null, Jc = !1, Xn = !1, wc = !1, Ne = 0;
  function Gt(l) {
    l !== ja && l.next === null && (ja === null ? Ln = ja = l : ja = ja.next = l), Xn = !0, Jc || (Jc = !0, xm());
  }
  function Eu(l, t) {
    if (!wc && Xn) {
      wc = !0;
      do
        for (var e = !1, a = Ln; a !== null; ) {
          if (l !== 0) {
            var u = a.pendingLanes;
            if (u === 0) var n = 0;
            else {
              var i = a.suspendedLanes, c = a.pingedLanes;
              n = (1 << 31 - rt(42 | l) + 1) - 1, n &= u & ~(i & ~c), n = n & 201326741 ? n & 201326741 | 1 : n ? n | 2 : 0;
            }
            n !== 0 && (e = !0, Q0(a, n));
          } else
            n = tl, n = Vu(
              a,
              a === Tl ? n : 0,
              a.cancelPendingCommit !== null || a.timeoutHandle !== -1
            ), (n & 3) === 0 || Za(a, n) || (e = !0, Q0(a, n));
          a = a.next;
        }
      while (e);
      wc = !1;
    }
  }
  function Tm() {
    G0();
  }
  function G0() {
    Xn = Jc = !1;
    var l = 0;
    Ne !== 0 && Cm() && (l = Ne);
    for (var t = Al(), e = null, a = Ln; a !== null; ) {
      var u = a.next, n = L0(a, t);
      n === 0 ? (a.next = null, e === null ? Ln = u : e.next = u, u === null && (ja = e)) : (e = a, (l !== 0 || (n & 3) !== 0) && (Xn = !0)), a = u;
    }
    Ll !== 0 && Ll !== 5 || Eu(l), Ne !== 0 && (Ne = 0);
  }
  function L0(l, t) {
    for (var e = l.suspendedLanes, a = l.pingedLanes, u = l.expirationTimes, n = l.pendingLanes & -62914561; 0 < n; ) {
      var i = 31 - rt(n), c = 1 << i, f = u[i];
      f === -1 ? ((c & e) === 0 || (c & a) !== 0) && (u[i] = Wr(c, t)) : f <= t && (l.expiredLanes |= c), n &= ~c;
    }
    if (t = Tl, e = tl, e = Vu(
      l,
      l === t ? e : 0,
      l.cancelPendingCommit !== null || l.timeoutHandle !== -1
    ), a = l.callbackNode, e === 0 || l === t && (hl === 2 || hl === 9) || l.cancelPendingCommit !== null)
      return a !== null && a !== null && zl(a), l.callbackNode = null, l.callbackPriority = 0;
    if ((e & 3) === 0 || Za(l, e)) {
      if (t = e & -e, t === l.callbackPriority) return t;
      switch (a !== null && zl(a), fi(e)) {
        case 2:
        case 8:
          e = Of;
          break;
        case 32:
          e = Lu;
          break;
        case 268435456:
          e = Uf;
          break;
        default:
          e = Lu;
      }
      return a = X0.bind(null, l), e = w(e, a), l.callbackPriority = t, l.callbackNode = e, t;
    }
    return a !== null && a !== null && zl(a), l.callbackPriority = 2, l.callbackNode = null, 2;
  }
  function X0(l, t) {
    if (Ll !== 0 && Ll !== 5)
      return l.callbackNode = null, l.callbackPriority = 0, null;
    var e = l.callbackNode;
    if (Gn() && l.callbackNode !== e)
      return null;
    var a = tl;
    return a = Vu(
      l,
      l === Tl ? a : 0,
      l.cancelPendingCommit !== null || l.timeoutHandle !== -1
    ), a === 0 ? null : (T0(l, a, t), L0(l, Al()), l.callbackNode != null && l.callbackNode === e ? X0.bind(null, l) : null);
  }
  function Q0(l, t) {
    if (Gn()) return null;
    T0(l, t, !0);
  }
  function xm() {
    Hm(function() {
      (rl & 6) !== 0 ? w(
        Xa,
        Tm
      ) : G0();
    });
  }
  function $c() {
    if (Ne === 0) {
      var l = ga;
      l === 0 && (l = Xu, Xu <<= 1, (Xu & 261888) === 0 && (Xu = 256)), Ne = l;
    }
    return Ne;
  }
  function Z0(l) {
    return l == null || typeof l == "symbol" || typeof l == "boolean" ? null : typeof l == "function" ? l : $u("" + l);
  }
  function V0(l, t) {
    var e = t.ownerDocument.createElement("input");
    return e.name = t.name, e.value = t.value, l.id && e.setAttribute("form", l.id), t.parentNode.insertBefore(e, t), l = new FormData(l), e.parentNode.removeChild(e), l;
  }
  function Em(l, t, e, a, u) {
    if (t === "submit" && e && e.stateNode === u) {
      var n = Z0(
        (u[tt] || null).action
      ), i = a.submitter;
      i && (t = (t = i[tt] || null) ? Z0(t.formAction) : i.getAttribute("formAction"), t !== null && (n = t, i = null));
      var c = new Iu(
        "action",
        "action",
        null,
        a,
        u
      );
      l.push({
        event: c,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (a.defaultPrevented) {
                if (Ne !== 0) {
                  var f = i ? V0(u, i) : new FormData(u);
                  hc(
                    e,
                    {
                      pending: !0,
                      data: f,
                      method: u.method,
                      action: n
                    },
                    null,
                    f
                  );
                }
              } else
                typeof n == "function" && (c.preventDefault(), f = i ? V0(u, i) : new FormData(u), hc(
                  e,
                  {
                    pending: !0,
                    data: f,
                    method: u.method,
                    action: n
                  },
                  n,
                  f
                ));
            },
            currentTarget: u
          }
        ]
      });
    }
  }
  for (var Wc = 0; Wc < Di.length; Wc++) {
    var kc = Di[Wc], Am = kc.toLowerCase(), Nm = kc[0].toUpperCase() + kc.slice(1);
    jt(
      Am,
      "on" + Nm
    );
  }
  jt(ps, "onAnimationEnd"), jt(zs, "onAnimationIteration"), jt(Ts, "onAnimationStart"), jt("dblclick", "onDoubleClick"), jt("focusin", "onFocus"), jt("focusout", "onBlur"), jt(Qd, "onTransitionRun"), jt(Zd, "onTransitionStart"), jt(Vd, "onTransitionCancel"), jt(xs, "onTransitionEnd"), aa("onMouseEnter", ["mouseout", "mouseover"]), aa("onMouseLeave", ["mouseout", "mouseover"]), aa("onPointerEnter", ["pointerout", "pointerover"]), aa("onPointerLeave", ["pointerout", "pointerover"]), Re(
    "onChange",
    "change click focusin focusout input keydown keyup selectionchange".split(" ")
  ), Re(
    "onSelect",
    "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
      " "
    )
  ), Re("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]), Re(
    "onCompositionEnd",
    "compositionend focusout keydown keypress keyup mousedown".split(" ")
  ), Re(
    "onCompositionStart",
    "compositionstart focusout keydown keypress keyup mousedown".split(" ")
  ), Re(
    "onCompositionUpdate",
    "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
  );
  var Au = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
    " "
  ), _m = new Set(
    "beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Au)
  );
  function K0(l, t) {
    t = (t & 4) !== 0;
    for (var e = 0; e < l.length; e++) {
      var a = l[e], u = a.event;
      a = a.listeners;
      l: {
        var n = void 0;
        if (t)
          for (var i = a.length - 1; 0 <= i; i--) {
            var c = a[i], f = c.instance, h = c.currentTarget;
            if (c = c.listener, f !== n && u.isPropagationStopped())
              break l;
            n = c, u.currentTarget = h;
            try {
              n(u);
            } catch (S) {
              tn(S);
            }
            u.currentTarget = null, n = f;
          }
        else
          for (i = 0; i < a.length; i++) {
            if (c = a[i], f = c.instance, h = c.currentTarget, c = c.listener, f !== n && u.isPropagationStopped())
              break l;
            n = c, u.currentTarget = h;
            try {
              n(u);
            } catch (S) {
              tn(S);
            }
            u.currentTarget = null, n = f;
          }
      }
    }
  }
  function P(l, t) {
    var e = t[si];
    e === void 0 && (e = t[si] = /* @__PURE__ */ new Set());
    var a = l + "__bubble";
    e.has(a) || (J0(t, l, 2, !1), e.add(a));
  }
  function Fc(l, t, e) {
    var a = 0;
    t && (a |= 4), J0(
      e,
      l,
      a,
      t
    );
  }
  var Qn = "_reactListening" + Math.random().toString(36).slice(2);
  function Ic(l) {
    if (!l[Qn]) {
      l[Qn] = !0, Yf.forEach(function(e) {
        e !== "selectionchange" && (_m.has(e) || Fc(e, !1, l), Fc(e, !0, l));
      });
      var t = l.nodeType === 9 ? l : l.ownerDocument;
      t === null || t[Qn] || (t[Qn] = !0, Fc("selectionchange", !1, t));
    }
  }
  function J0(l, t, e, a) {
    switch (zr(t)) {
      case 2:
        var u = th;
        break;
      case 8:
        u = eh;
        break;
      default:
        u = hf;
    }
    e = u.bind(
      null,
      t,
      e,
      l
    ), u = void 0, !bi || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (u = !0), a ? u !== void 0 ? l.addEventListener(t, e, {
      capture: !0,
      passive: u
    }) : l.addEventListener(t, e, !0) : u !== void 0 ? l.addEventListener(t, e, {
      passive: u
    }) : l.addEventListener(t, e, !1);
  }
  function Pc(l, t, e, a, u) {
    var n = a;
    if ((t & 1) === 0 && (t & 2) === 0 && a !== null)
      l: for (; ; ) {
        if (a === null) return;
        var i = a.tag;
        if (i === 3 || i === 4) {
          var c = a.stateNode.containerInfo;
          if (c === u) break;
          if (i === 4)
            for (i = a.return; i !== null; ) {
              var f = i.tag;
              if ((f === 3 || f === 4) && i.stateNode.containerInfo === u)
                return;
              i = i.return;
            }
          for (; c !== null; ) {
            if (i = la(c), i === null) return;
            if (f = i.tag, f === 5 || f === 6 || f === 26 || f === 27) {
              a = n = i;
              continue l;
            }
            c = c.parentNode;
          }
        }
        a = a.return;
      }
    kf(function() {
      var h = n, S = vi(e), E = [];
      l: {
        var v = Es.get(l);
        if (v !== void 0) {
          var g = Iu, C = l;
          switch (l) {
            case "keypress":
              if (ku(e) === 0) break l;
            case "keydown":
            case "keyup":
              g = pd;
              break;
            case "focusin":
              C = "focus", g = Ti;
              break;
            case "focusout":
              C = "blur", g = Ti;
              break;
            case "beforeblur":
            case "afterblur":
              g = Ti;
              break;
            case "click":
              if (e.button === 2) break l;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              g = Pf;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              g = fd;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              g = xd;
              break;
            case ps:
            case zs:
            case Ts:
              g = rd;
              break;
            case xs:
              g = Ad;
              break;
            case "scroll":
            case "scrollend":
              g = id;
              break;
            case "wheel":
              g = _d;
              break;
            case "copy":
            case "cut":
            case "paste":
              g = md;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              g = ts;
              break;
            case "toggle":
            case "beforetoggle":
              g = Od;
          }
          var L = (t & 4) !== 0, Sl = !L && (l === "scroll" || l === "scrollend"), d = L ? v !== null ? v + "Capture" : null : v;
          L = [];
          for (var s = h, m; s !== null; ) {
            var z = s;
            if (m = z.stateNode, z = z.tag, z !== 5 && z !== 26 && z !== 27 || m === null || d === null || (z = wa(s, d), z != null && L.push(
              Nu(s, z, m)
            )), Sl) break;
            s = s.return;
          }
          0 < L.length && (v = new g(
            v,
            C,
            null,
            e,
            S
          ), E.push({ event: v, listeners: L }));
        }
      }
      if ((t & 7) === 0) {
        l: {
          if (v = l === "mouseover" || l === "pointerover", g = l === "mouseout" || l === "pointerout", v && e !== yi && (C = e.relatedTarget || e.fromElement) && (la(C) || C[Pe]))
            break l;
          if ((g || v) && (v = S.window === S ? S : (v = S.ownerDocument) ? v.defaultView || v.parentWindow : window, g ? (C = e.relatedTarget || e.toElement, g = h, C = C ? la(C) : null, C !== null && (Sl = q(C), L = C.tag, C !== Sl || L !== 5 && L !== 27 && L !== 6) && (C = null)) : (g = null, C = h), g !== C)) {
            if (L = Pf, z = "onMouseLeave", d = "onMouseEnter", s = "mouse", (l === "pointerout" || l === "pointerover") && (L = ts, z = "onPointerLeave", d = "onPointerEnter", s = "pointer"), Sl = g == null ? v : Ja(g), m = C == null ? v : Ja(C), v = new L(
              z,
              s + "leave",
              g,
              e,
              S
            ), v.target = Sl, v.relatedTarget = m, z = null, la(S) === h && (L = new L(
              d,
              s + "enter",
              C,
              e,
              S
            ), L.target = m, L.relatedTarget = Sl, z = L), Sl = z, g && C)
              t: {
                for (L = Mm, d = g, s = C, m = 0, z = d; z; z = L(z))
                  m++;
                z = 0;
                for (var G = s; G; G = L(G))
                  z++;
                for (; 0 < m - z; )
                  d = L(d), m--;
                for (; 0 < z - m; )
                  s = L(s), z--;
                for (; m--; ) {
                  if (d === s || s !== null && d === s.alternate) {
                    L = d;
                    break t;
                  }
                  d = L(d), s = L(s);
                }
                L = null;
              }
            else L = null;
            g !== null && w0(
              E,
              v,
              g,
              L,
              !1
            ), C !== null && Sl !== null && w0(
              E,
              Sl,
              C,
              L,
              !0
            );
          }
        }
        l: {
          if (v = h ? Ja(h) : window, g = v.nodeName && v.nodeName.toLowerCase(), g === "select" || g === "input" && v.type === "file")
            var il = ss;
          else if (cs(v))
            if (os)
              il = Gd;
            else {
              il = qd;
              var B = Bd;
            }
          else
            g = v.nodeName, !g || g.toLowerCase() !== "input" || v.type !== "checkbox" && v.type !== "radio" ? h && hi(h.elementType) && (il = ss) : il = Yd;
          if (il && (il = il(l, h))) {
            fs(
              E,
              il,
              e,
              S
            );
            break l;
          }
          B && B(l, v, h), l === "focusout" && h && v.type === "number" && h.memoizedProps.value != null && mi(v, "number", v.value);
        }
        switch (B = h ? Ja(h) : window, l) {
          case "focusin":
            (cs(B) || B.contentEditable === "true") && (sa = B, Mi = h, tu = null);
            break;
          case "focusout":
            tu = Mi = sa = null;
            break;
          case "mousedown":
            Oi = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            Oi = !1, bs(E, e, S);
            break;
          case "selectionchange":
            if (Xd) break;
          case "keydown":
          case "keyup":
            bs(E, e, S);
        }
        var W;
        if (Ei)
          l: {
            switch (l) {
              case "compositionstart":
                var el = "onCompositionStart";
                break l;
              case "compositionend":
                el = "onCompositionEnd";
                break l;
              case "compositionupdate":
                el = "onCompositionUpdate";
                break l;
            }
            el = void 0;
          }
        else
          fa ? ns(l, e) && (el = "onCompositionEnd") : l === "keydown" && e.keyCode === 229 && (el = "onCompositionStart");
        el && (es && e.locale !== "ko" && (fa || el !== "onCompositionStart" ? el === "onCompositionEnd" && fa && (W = Ff()) : (oe = S, Si = "value" in oe ? oe.value : oe.textContent, fa = !0)), B = Zn(h, el), 0 < B.length && (el = new ls(
          el,
          l,
          null,
          e,
          S
        ), E.push({ event: el, listeners: B }), W ? el.data = W : (W = is(e), W !== null && (el.data = W)))), (W = Dd ? jd(l, e) : Cd(l, e)) && (el = Zn(h, "onBeforeInput"), 0 < el.length && (B = new ls(
          "onBeforeInput",
          "beforeinput",
          null,
          e,
          S
        ), E.push({
          event: B,
          listeners: el
        }), B.data = W)), Em(
          E,
          l,
          h,
          e,
          S
        );
      }
      K0(E, t);
    });
  }
  function Nu(l, t, e) {
    return {
      instance: l,
      listener: t,
      currentTarget: e
    };
  }
  function Zn(l, t) {
    for (var e = t + "Capture", a = []; l !== null; ) {
      var u = l, n = u.stateNode;
      if (u = u.tag, u !== 5 && u !== 26 && u !== 27 || n === null || (u = wa(l, e), u != null && a.unshift(
        Nu(l, u, n)
      ), u = wa(l, t), u != null && a.push(
        Nu(l, u, n)
      )), l.tag === 3) return a;
      l = l.return;
    }
    return [];
  }
  function Mm(l) {
    if (l === null) return null;
    do
      l = l.return;
    while (l && l.tag !== 5 && l.tag !== 27);
    return l || null;
  }
  function w0(l, t, e, a, u) {
    for (var n = t._reactName, i = []; e !== null && e !== a; ) {
      var c = e, f = c.alternate, h = c.stateNode;
      if (c = c.tag, f !== null && f === a) break;
      c !== 5 && c !== 26 && c !== 27 || h === null || (f = h, u ? (h = wa(e, n), h != null && i.unshift(
        Nu(e, h, f)
      )) : u || (h = wa(e, n), h != null && i.push(
        Nu(e, h, f)
      ))), e = e.return;
    }
    i.length !== 0 && l.push({ event: t, listeners: i });
  }
  var Om = /\r\n?/g, Um = /\u0000|\uFFFD/g;
  function $0(l) {
    return (typeof l == "string" ? l : "" + l).replace(Om, `
`).replace(Um, "");
  }
  function W0(l, t) {
    return t = $0(t), $0(l) === t;
  }
  function bl(l, t, e, a, u, n) {
    switch (e) {
      case "children":
        typeof a == "string" ? t === "body" || t === "textarea" && a === "" || na(l, a) : (typeof a == "number" || typeof a == "bigint") && t !== "body" && na(l, "" + a);
        break;
      case "className":
        Ju(l, "class", a);
        break;
      case "tabIndex":
        Ju(l, "tabindex", a);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        Ju(l, e, a);
        break;
      case "style":
        $f(l, a, n);
        break;
      case "data":
        if (t !== "object") {
          Ju(l, "data", a);
          break;
        }
      case "src":
      case "href":
        if (a === "" && (t !== "a" || e !== "href")) {
          l.removeAttribute(e);
          break;
        }
        if (a == null || typeof a == "function" || typeof a == "symbol" || typeof a == "boolean") {
          l.removeAttribute(e);
          break;
        }
        a = $u("" + a), l.setAttribute(e, a);
        break;
      case "action":
      case "formAction":
        if (typeof a == "function") {
          l.setAttribute(
            e,
            "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')"
          );
          break;
        } else
          typeof n == "function" && (e === "formAction" ? (t !== "input" && bl(l, t, "name", u.name, u, null), bl(
            l,
            t,
            "formEncType",
            u.formEncType,
            u,
            null
          ), bl(
            l,
            t,
            "formMethod",
            u.formMethod,
            u,
            null
          ), bl(
            l,
            t,
            "formTarget",
            u.formTarget,
            u,
            null
          )) : (bl(l, t, "encType", u.encType, u, null), bl(l, t, "method", u.method, u, null), bl(l, t, "target", u.target, u, null)));
        if (a == null || typeof a == "symbol" || typeof a == "boolean") {
          l.removeAttribute(e);
          break;
        }
        a = $u("" + a), l.setAttribute(e, a);
        break;
      case "onClick":
        a != null && (l.onclick = Vt);
        break;
      case "onScroll":
        a != null && P("scroll", l);
        break;
      case "onScrollEnd":
        a != null && P("scrollend", l);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(r(61));
          if (e = a.__html, e != null) {
            if (u.children != null) throw Error(r(60));
            l.innerHTML = e;
          }
        }
        break;
      case "multiple":
        l.multiple = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "muted":
        l.muted = a && typeof a != "function" && typeof a != "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (a == null || typeof a == "function" || typeof a == "boolean" || typeof a == "symbol") {
          l.removeAttribute("xlink:href");
          break;
        }
        e = $u("" + a), l.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "xlink:href",
          e
        );
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        a != null && typeof a != "function" && typeof a != "symbol" ? l.setAttribute(e, "" + a) : l.removeAttribute(e);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        a && typeof a != "function" && typeof a != "symbol" ? l.setAttribute(e, "") : l.removeAttribute(e);
        break;
      case "capture":
      case "download":
        a === !0 ? l.setAttribute(e, "") : a !== !1 && a != null && typeof a != "function" && typeof a != "symbol" ? l.setAttribute(e, a) : l.removeAttribute(e);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        a != null && typeof a != "function" && typeof a != "symbol" && !isNaN(a) && 1 <= a ? l.setAttribute(e, a) : l.removeAttribute(e);
        break;
      case "rowSpan":
      case "start":
        a == null || typeof a == "function" || typeof a == "symbol" || isNaN(a) ? l.removeAttribute(e) : l.setAttribute(e, a);
        break;
      case "popover":
        P("beforetoggle", l), P("toggle", l), Ku(l, "popover", a);
        break;
      case "xlinkActuate":
        Zt(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:actuate",
          a
        );
        break;
      case "xlinkArcrole":
        Zt(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:arcrole",
          a
        );
        break;
      case "xlinkRole":
        Zt(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:role",
          a
        );
        break;
      case "xlinkShow":
        Zt(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:show",
          a
        );
        break;
      case "xlinkTitle":
        Zt(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:title",
          a
        );
        break;
      case "xlinkType":
        Zt(
          l,
          "http://www.w3.org/1999/xlink",
          "xlink:type",
          a
        );
        break;
      case "xmlBase":
        Zt(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:base",
          a
        );
        break;
      case "xmlLang":
        Zt(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:lang",
          a
        );
        break;
      case "xmlSpace":
        Zt(
          l,
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          a
        );
        break;
      case "is":
        Ku(l, "is", a);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        (!(2 < e.length) || e[0] !== "o" && e[0] !== "O" || e[1] !== "n" && e[1] !== "N") && (e = ud.get(e) || e, Ku(l, e, a));
    }
  }
  function lf(l, t, e, a, u, n) {
    switch (e) {
      case "style":
        $f(l, a, n);
        break;
      case "dangerouslySetInnerHTML":
        if (a != null) {
          if (typeof a != "object" || !("__html" in a))
            throw Error(r(61));
          if (e = a.__html, e != null) {
            if (u.children != null) throw Error(r(60));
            l.innerHTML = e;
          }
        }
        break;
      case "children":
        typeof a == "string" ? na(l, a) : (typeof a == "number" || typeof a == "bigint") && na(l, "" + a);
        break;
      case "onScroll":
        a != null && P("scroll", l);
        break;
      case "onScrollEnd":
        a != null && P("scrollend", l);
        break;
      case "onClick":
        a != null && (l.onclick = Vt);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!Gf.hasOwnProperty(e))
          l: {
            if (e[0] === "o" && e[1] === "n" && (u = e.endsWith("Capture"), t = e.slice(2, u ? e.length - 7 : void 0), n = l[tt] || null, n = n != null ? n[e] : null, typeof n == "function" && l.removeEventListener(t, n, u), typeof a == "function")) {
              typeof n != "function" && n !== null && (e in l ? l[e] = null : l.hasAttribute(e) && l.removeAttribute(e)), l.addEventListener(t, a, u);
              break l;
            }
            e in l ? l[e] = a : a === !0 ? l.setAttribute(e, "") : Ku(l, e, a);
          }
    }
  }
  function Fl(l, t, e) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        P("error", l), P("load", l);
        var a = !1, u = !1, n;
        for (n in e)
          if (e.hasOwnProperty(n)) {
            var i = e[n];
            if (i != null)
              switch (n) {
                case "src":
                  a = !0;
                  break;
                case "srcSet":
                  u = !0;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(r(137, t));
                default:
                  bl(l, t, n, i, e, null);
              }
          }
        u && bl(l, t, "srcSet", e.srcSet, e, null), a && bl(l, t, "src", e.src, e, null);
        return;
      case "input":
        P("invalid", l);
        var c = n = i = u = null, f = null, h = null;
        for (a in e)
          if (e.hasOwnProperty(a)) {
            var S = e[a];
            if (S != null)
              switch (a) {
                case "name":
                  u = S;
                  break;
                case "type":
                  i = S;
                  break;
                case "checked":
                  f = S;
                  break;
                case "defaultChecked":
                  h = S;
                  break;
                case "value":
                  n = S;
                  break;
                case "defaultValue":
                  c = S;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (S != null)
                    throw Error(r(137, t));
                  break;
                default:
                  bl(l, t, a, S, e, null);
              }
          }
        Vf(
          l,
          n,
          c,
          f,
          h,
          i,
          u,
          !1
        );
        return;
      case "select":
        P("invalid", l), a = i = n = null;
        for (u in e)
          if (e.hasOwnProperty(u) && (c = e[u], c != null))
            switch (u) {
              case "value":
                n = c;
                break;
              case "defaultValue":
                i = c;
                break;
              case "multiple":
                a = c;
              default:
                bl(l, t, u, c, e, null);
            }
        t = n, e = i, l.multiple = !!a, t != null ? ua(l, !!a, t, !1) : e != null && ua(l, !!a, e, !0);
        return;
      case "textarea":
        P("invalid", l), n = u = a = null;
        for (i in e)
          if (e.hasOwnProperty(i) && (c = e[i], c != null))
            switch (i) {
              case "value":
                a = c;
                break;
              case "defaultValue":
                u = c;
                break;
              case "children":
                n = c;
                break;
              case "dangerouslySetInnerHTML":
                if (c != null) throw Error(r(91));
                break;
              default:
                bl(l, t, i, c, e, null);
            }
        Jf(l, a, u, n);
        return;
      case "option":
        for (f in e)
          e.hasOwnProperty(f) && (a = e[f], a != null) && (f === "selected" ? l.selected = a && typeof a != "function" && typeof a != "symbol" : bl(l, t, f, a, e, null));
        return;
      case "dialog":
        P("beforetoggle", l), P("toggle", l), P("cancel", l), P("close", l);
        break;
      case "iframe":
      case "object":
        P("load", l);
        break;
      case "video":
      case "audio":
        for (a = 0; a < Au.length; a++)
          P(Au[a], l);
        break;
      case "image":
        P("error", l), P("load", l);
        break;
      case "details":
        P("toggle", l);
        break;
      case "embed":
      case "source":
      case "link":
        P("error", l), P("load", l);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (h in e)
          if (e.hasOwnProperty(h) && (a = e[h], a != null))
            switch (h) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(r(137, t));
              default:
                bl(l, t, h, a, e, null);
            }
        return;
      default:
        if (hi(t)) {
          for (S in e)
            e.hasOwnProperty(S) && (a = e[S], a !== void 0 && lf(
              l,
              t,
              S,
              a,
              e,
              void 0
            ));
          return;
        }
    }
    for (c in e)
      e.hasOwnProperty(c) && (a = e[c], a != null && bl(l, t, c, a, e, null));
  }
  function Dm(l, t, e, a) {
    switch (t) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var u = null, n = null, i = null, c = null, f = null, h = null, S = null;
        for (g in e) {
          var E = e[g];
          if (e.hasOwnProperty(g) && E != null)
            switch (g) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                f = E;
              default:
                a.hasOwnProperty(g) || bl(l, t, g, null, a, E);
            }
        }
        for (var v in a) {
          var g = a[v];
          if (E = e[v], a.hasOwnProperty(v) && (g != null || E != null))
            switch (v) {
              case "type":
                n = g;
                break;
              case "name":
                u = g;
                break;
              case "checked":
                h = g;
                break;
              case "defaultChecked":
                S = g;
                break;
              case "value":
                i = g;
                break;
              case "defaultValue":
                c = g;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (g != null)
                  throw Error(r(137, t));
                break;
              default:
                g !== E && bl(
                  l,
                  t,
                  v,
                  g,
                  a,
                  E
                );
            }
        }
        di(
          l,
          i,
          c,
          f,
          h,
          S,
          n,
          u
        );
        return;
      case "select":
        g = i = c = v = null;
        for (n in e)
          if (f = e[n], e.hasOwnProperty(n) && f != null)
            switch (n) {
              case "value":
                break;
              case "multiple":
                g = f;
              default:
                a.hasOwnProperty(n) || bl(
                  l,
                  t,
                  n,
                  null,
                  a,
                  f
                );
            }
        for (u in a)
          if (n = a[u], f = e[u], a.hasOwnProperty(u) && (n != null || f != null))
            switch (u) {
              case "value":
                v = n;
                break;
              case "defaultValue":
                c = n;
                break;
              case "multiple":
                i = n;
              default:
                n !== f && bl(
                  l,
                  t,
                  u,
                  n,
                  a,
                  f
                );
            }
        t = c, e = i, a = g, v != null ? ua(l, !!e, v, !1) : !!a != !!e && (t != null ? ua(l, !!e, t, !0) : ua(l, !!e, e ? [] : "", !1));
        return;
      case "textarea":
        g = v = null;
        for (c in e)
          if (u = e[c], e.hasOwnProperty(c) && u != null && !a.hasOwnProperty(c))
            switch (c) {
              case "value":
                break;
              case "children":
                break;
              default:
                bl(l, t, c, null, a, u);
            }
        for (i in a)
          if (u = a[i], n = e[i], a.hasOwnProperty(i) && (u != null || n != null))
            switch (i) {
              case "value":
                v = u;
                break;
              case "defaultValue":
                g = u;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (u != null) throw Error(r(91));
                break;
              default:
                u !== n && bl(l, t, i, u, a, n);
            }
        Kf(l, v, g);
        return;
      case "option":
        for (var C in e)
          v = e[C], e.hasOwnProperty(C) && v != null && !a.hasOwnProperty(C) && (C === "selected" ? l.selected = !1 : bl(
            l,
            t,
            C,
            null,
            a,
            v
          ));
        for (f in a)
          v = a[f], g = e[f], a.hasOwnProperty(f) && v !== g && (v != null || g != null) && (f === "selected" ? l.selected = v && typeof v != "function" && typeof v != "symbol" : bl(
            l,
            t,
            f,
            v,
            a,
            g
          ));
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var L in e)
          v = e[L], e.hasOwnProperty(L) && v != null && !a.hasOwnProperty(L) && bl(l, t, L, null, a, v);
        for (h in a)
          if (v = a[h], g = e[h], a.hasOwnProperty(h) && v !== g && (v != null || g != null))
            switch (h) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (v != null)
                  throw Error(r(137, t));
                break;
              default:
                bl(
                  l,
                  t,
                  h,
                  v,
                  a,
                  g
                );
            }
        return;
      default:
        if (hi(t)) {
          for (var Sl in e)
            v = e[Sl], e.hasOwnProperty(Sl) && v !== void 0 && !a.hasOwnProperty(Sl) && lf(
              l,
              t,
              Sl,
              void 0,
              a,
              v
            );
          for (S in a)
            v = a[S], g = e[S], !a.hasOwnProperty(S) || v === g || v === void 0 && g === void 0 || lf(
              l,
              t,
              S,
              v,
              a,
              g
            );
          return;
        }
    }
    for (var d in e)
      v = e[d], e.hasOwnProperty(d) && v != null && !a.hasOwnProperty(d) && bl(l, t, d, null, a, v);
    for (E in a)
      v = a[E], g = e[E], !a.hasOwnProperty(E) || v === g || v == null && g == null || bl(l, t, E, v, a, g);
  }
  function k0(l) {
    switch (l) {
      case "css":
      case "script":
      case "font":
      case "img":
      case "image":
      case "input":
      case "link":
        return !0;
      default:
        return !1;
    }
  }
  function jm() {
    if (typeof performance.getEntriesByType == "function") {
      for (var l = 0, t = 0, e = performance.getEntriesByType("resource"), a = 0; a < e.length; a++) {
        var u = e[a], n = u.transferSize, i = u.initiatorType, c = u.duration;
        if (n && c && k0(i)) {
          for (i = 0, c = u.responseEnd, a += 1; a < e.length; a++) {
            var f = e[a], h = f.startTime;
            if (h > c) break;
            var S = f.transferSize, E = f.initiatorType;
            S && k0(E) && (f = f.responseEnd, i += S * (f < c ? 1 : (c - h) / (f - h)));
          }
          if (--a, t += 8 * (n + i) / (u.duration / 1e3), l++, 10 < l) break;
        }
      }
      if (0 < l) return t / l / 1e6;
    }
    return navigator.connection && (l = navigator.connection.downlink, typeof l == "number") ? l : 5;
  }
  var tf = null, ef = null;
  function Vn(l) {
    return l.nodeType === 9 ? l : l.ownerDocument;
  }
  function F0(l) {
    switch (l) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function I0(l, t) {
    if (l === 0)
      switch (t) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return l === 1 && t === "foreignObject" ? 0 : l;
  }
  function af(l, t) {
    return l === "textarea" || l === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var uf = null;
  function Cm() {
    var l = window.event;
    return l && l.type === "popstate" ? l === uf ? !1 : (uf = l, !0) : (uf = null, !1);
  }
  var P0 = typeof setTimeout == "function" ? setTimeout : void 0, Rm = typeof clearTimeout == "function" ? clearTimeout : void 0, lr = typeof Promise == "function" ? Promise : void 0, Hm = typeof queueMicrotask == "function" ? queueMicrotask : typeof lr < "u" ? function(l) {
    return lr.resolve(null).then(l).catch(Bm);
  } : P0;
  function Bm(l) {
    setTimeout(function() {
      throw l;
    });
  }
  function _e(l) {
    return l === "head";
  }
  function tr(l, t) {
    var e = t, a = 0;
    do {
      var u = e.nextSibling;
      if (l.removeChild(e), u && u.nodeType === 8)
        if (e = u.data, e === "/$" || e === "/&") {
          if (a === 0) {
            l.removeChild(u), Ba(t);
            return;
          }
          a--;
        } else if (e === "$" || e === "$?" || e === "$~" || e === "$!" || e === "&")
          a++;
        else if (e === "html")
          _u(l.ownerDocument.documentElement);
        else if (e === "head") {
          e = l.ownerDocument.head, _u(e);
          for (var n = e.firstChild; n; ) {
            var i = n.nextSibling, c = n.nodeName;
            n[Ka] || c === "SCRIPT" || c === "STYLE" || c === "LINK" && n.rel.toLowerCase() === "stylesheet" || e.removeChild(n), n = i;
          }
        } else
          e === "body" && _u(l.ownerDocument.body);
      e = u;
    } while (e);
    Ba(t);
  }
  function er(l, t) {
    var e = l;
    l = 0;
    do {
      var a = e.nextSibling;
      if (e.nodeType === 1 ? t ? (e._stashedDisplay = e.style.display, e.style.display = "none") : (e.style.display = e._stashedDisplay || "", e.getAttribute("style") === "" && e.removeAttribute("style")) : e.nodeType === 3 && (t ? (e._stashedText = e.nodeValue, e.nodeValue = "") : e.nodeValue = e._stashedText || ""), a && a.nodeType === 8)
        if (e = a.data, e === "/$") {
          if (l === 0) break;
          l--;
        } else
          e !== "$" && e !== "$?" && e !== "$~" && e !== "$!" || l++;
      e = a;
    } while (e);
  }
  function nf(l) {
    var t = l.firstChild;
    for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
      var e = t;
      switch (t = t.nextSibling, e.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          nf(e), oi(e);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (e.rel.toLowerCase() === "stylesheet") continue;
      }
      l.removeChild(e);
    }
  }
  function qm(l, t, e, a) {
    for (; l.nodeType === 1; ) {
      var u = e;
      if (l.nodeName.toLowerCase() !== t.toLowerCase()) {
        if (!a && (l.nodeName !== "INPUT" || l.type !== "hidden"))
          break;
      } else if (a) {
        if (!l[Ka])
          switch (t) {
            case "meta":
              if (!l.hasAttribute("itemprop")) break;
              return l;
            case "link":
              if (n = l.getAttribute("rel"), n === "stylesheet" && l.hasAttribute("data-precedence"))
                break;
              if (n !== u.rel || l.getAttribute("href") !== (u.href == null || u.href === "" ? null : u.href) || l.getAttribute("crossorigin") !== (u.crossOrigin == null ? null : u.crossOrigin) || l.getAttribute("title") !== (u.title == null ? null : u.title))
                break;
              return l;
            case "style":
              if (l.hasAttribute("data-precedence")) break;
              return l;
            case "script":
              if (n = l.getAttribute("src"), (n !== (u.src == null ? null : u.src) || l.getAttribute("type") !== (u.type == null ? null : u.type) || l.getAttribute("crossorigin") !== (u.crossOrigin == null ? null : u.crossOrigin)) && n && l.hasAttribute("async") && !l.hasAttribute("itemprop"))
                break;
              return l;
            default:
              return l;
          }
      } else if (t === "input" && l.type === "hidden") {
        var n = u.name == null ? null : "" + u.name;
        if (u.type === "hidden" && l.getAttribute("name") === n)
          return l;
      } else return l;
      if (l = Ut(l.nextSibling), l === null) break;
    }
    return null;
  }
  function Ym(l, t, e) {
    if (t === "") return null;
    for (; l.nodeType !== 3; )
      if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !e || (l = Ut(l.nextSibling), l === null)) return null;
    return l;
  }
  function ar(l, t) {
    for (; l.nodeType !== 8; )
      if ((l.nodeType !== 1 || l.nodeName !== "INPUT" || l.type !== "hidden") && !t || (l = Ut(l.nextSibling), l === null)) return null;
    return l;
  }
  function cf(l) {
    return l.data === "$?" || l.data === "$~";
  }
  function ff(l) {
    return l.data === "$!" || l.data === "$?" && l.ownerDocument.readyState !== "loading";
  }
  function Gm(l, t) {
    var e = l.ownerDocument;
    if (l.data === "$~") l._reactRetry = t;
    else if (l.data !== "$?" || e.readyState !== "loading")
      t();
    else {
      var a = function() {
        t(), e.removeEventListener("DOMContentLoaded", a);
      };
      e.addEventListener("DOMContentLoaded", a), l._reactRetry = a;
    }
  }
  function Ut(l) {
    for (; l != null; l = l.nextSibling) {
      var t = l.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = l.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
          break;
        if (t === "/$" || t === "/&") return null;
      }
    }
    return l;
  }
  var sf = null;
  function ur(l) {
    l = l.nextSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var e = l.data;
        if (e === "/$" || e === "/&") {
          if (t === 0)
            return Ut(l.nextSibling);
          t--;
        } else
          e !== "$" && e !== "$!" && e !== "$?" && e !== "$~" && e !== "&" || t++;
      }
      l = l.nextSibling;
    }
    return null;
  }
  function nr(l) {
    l = l.previousSibling;
    for (var t = 0; l; ) {
      if (l.nodeType === 8) {
        var e = l.data;
        if (e === "$" || e === "$!" || e === "$?" || e === "$~" || e === "&") {
          if (t === 0) return l;
          t--;
        } else e !== "/$" && e !== "/&" || t++;
      }
      l = l.previousSibling;
    }
    return null;
  }
  function ir(l, t, e) {
    switch (t = Vn(e), l) {
      case "html":
        if (l = t.documentElement, !l) throw Error(r(452));
        return l;
      case "head":
        if (l = t.head, !l) throw Error(r(453));
        return l;
      case "body":
        if (l = t.body, !l) throw Error(r(454));
        return l;
      default:
        throw Error(r(451));
    }
  }
  function _u(l) {
    for (var t = l.attributes; t.length; )
      l.removeAttributeNode(t[0]);
    oi(l);
  }
  var Dt = /* @__PURE__ */ new Map(), cr = /* @__PURE__ */ new Set();
  function Kn(l) {
    return typeof l.getRootNode == "function" ? l.getRootNode() : l.nodeType === 9 ? l : l.ownerDocument;
  }
  var ie = M.d;
  M.d = {
    f: Lm,
    r: Xm,
    D: Qm,
    C: Zm,
    L: Vm,
    m: Km,
    X: wm,
    S: Jm,
    M: $m
  };
  function Lm() {
    var l = ie.f(), t = Bn();
    return l || t;
  }
  function Xm(l) {
    var t = ta(l);
    t !== null && t.tag === 5 && t.type === "form" ? Eo(t) : ie.r(l);
  }
  var Ca = typeof document > "u" ? null : document;
  function fr(l, t, e) {
    var a = Ca;
    if (a && typeof t == "string" && t) {
      var u = xt(t);
      u = 'link[rel="' + l + '"][href="' + u + '"]', typeof e == "string" && (u += '[crossorigin="' + e + '"]'), cr.has(u) || (cr.add(u), l = { rel: l, crossOrigin: e, href: t }, a.querySelector(u) === null && (t = a.createElement("link"), Fl(t, "link", l), Xl(t), a.head.appendChild(t)));
    }
  }
  function Qm(l) {
    ie.D(l), fr("dns-prefetch", l, null);
  }
  function Zm(l, t) {
    ie.C(l, t), fr("preconnect", l, t);
  }
  function Vm(l, t, e) {
    ie.L(l, t, e);
    var a = Ca;
    if (a && l && t) {
      var u = 'link[rel="preload"][as="' + xt(t) + '"]';
      t === "image" && e && e.imageSrcSet ? (u += '[imagesrcset="' + xt(
        e.imageSrcSet
      ) + '"]', typeof e.imageSizes == "string" && (u += '[imagesizes="' + xt(
        e.imageSizes
      ) + '"]')) : u += '[href="' + xt(l) + '"]';
      var n = u;
      switch (t) {
        case "style":
          n = Ra(l);
          break;
        case "script":
          n = Ha(l);
      }
      Dt.has(n) || (l = D(
        {
          rel: "preload",
          href: t === "image" && e && e.imageSrcSet ? void 0 : l,
          as: t
        },
        e
      ), Dt.set(n, l), a.querySelector(u) !== null || t === "style" && a.querySelector(Mu(n)) || t === "script" && a.querySelector(Ou(n)) || (t = a.createElement("link"), Fl(t, "link", l), Xl(t), a.head.appendChild(t)));
    }
  }
  function Km(l, t) {
    ie.m(l, t);
    var e = Ca;
    if (e && l) {
      var a = t && typeof t.as == "string" ? t.as : "script", u = 'link[rel="modulepreload"][as="' + xt(a) + '"][href="' + xt(l) + '"]', n = u;
      switch (a) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          n = Ha(l);
      }
      if (!Dt.has(n) && (l = D({ rel: "modulepreload", href: l }, t), Dt.set(n, l), e.querySelector(u) === null)) {
        switch (a) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (e.querySelector(Ou(n)))
              return;
        }
        a = e.createElement("link"), Fl(a, "link", l), Xl(a), e.head.appendChild(a);
      }
    }
  }
  function Jm(l, t, e) {
    ie.S(l, t, e);
    var a = Ca;
    if (a && l) {
      var u = ea(a).hoistableStyles, n = Ra(l);
      t = t || "default";
      var i = u.get(n);
      if (!i) {
        var c = { loading: 0, preload: null };
        if (i = a.querySelector(
          Mu(n)
        ))
          c.loading = 5;
        else {
          l = D(
            { rel: "stylesheet", href: l, "data-precedence": t },
            e
          ), (e = Dt.get(n)) && of(l, e);
          var f = i = a.createElement("link");
          Xl(f), Fl(f, "link", l), f._p = new Promise(function(h, S) {
            f.onload = h, f.onerror = S;
          }), f.addEventListener("load", function() {
            c.loading |= 1;
          }), f.addEventListener("error", function() {
            c.loading |= 2;
          }), c.loading |= 4, Jn(i, t, a);
        }
        i = {
          type: "stylesheet",
          instance: i,
          count: 1,
          state: c
        }, u.set(n, i);
      }
    }
  }
  function wm(l, t) {
    ie.X(l, t);
    var e = Ca;
    if (e && l) {
      var a = ea(e).hoistableScripts, u = Ha(l), n = a.get(u);
      n || (n = e.querySelector(Ou(u)), n || (l = D({ src: l, async: !0 }, t), (t = Dt.get(u)) && rf(l, t), n = e.createElement("script"), Xl(n), Fl(n, "link", l), e.head.appendChild(n)), n = {
        type: "script",
        instance: n,
        count: 1,
        state: null
      }, a.set(u, n));
    }
  }
  function $m(l, t) {
    ie.M(l, t);
    var e = Ca;
    if (e && l) {
      var a = ea(e).hoistableScripts, u = Ha(l), n = a.get(u);
      n || (n = e.querySelector(Ou(u)), n || (l = D({ src: l, async: !0, type: "module" }, t), (t = Dt.get(u)) && rf(l, t), n = e.createElement("script"), Xl(n), Fl(n, "link", l), e.head.appendChild(n)), n = {
        type: "script",
        instance: n,
        count: 1,
        state: null
      }, a.set(u, n));
    }
  }
  function sr(l, t, e, a) {
    var u = (u = V.current) ? Kn(u) : null;
    if (!u) throw Error(r(446));
    switch (l) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof e.precedence == "string" && typeof e.href == "string" ? (t = Ra(e.href), e = ea(
          u
        ).hoistableStyles, a = e.get(t), a || (a = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, e.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (e.rel === "stylesheet" && typeof e.href == "string" && typeof e.precedence == "string") {
          l = Ra(e.href);
          var n = ea(
            u
          ).hoistableStyles, i = n.get(l);
          if (i || (u = u.ownerDocument || u, i = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, n.set(l, i), (n = u.querySelector(
            Mu(l)
          )) && !n._p && (i.instance = n, i.state.loading = 5), Dt.has(l) || (e = {
            rel: "preload",
            as: "style",
            href: e.href,
            crossOrigin: e.crossOrigin,
            integrity: e.integrity,
            media: e.media,
            hrefLang: e.hrefLang,
            referrerPolicy: e.referrerPolicy
          }, Dt.set(l, e), n || Wm(
            u,
            l,
            e,
            i.state
          ))), t && a === null)
            throw Error(r(528, ""));
          return i;
        }
        if (t && a !== null)
          throw Error(r(529, ""));
        return null;
      case "script":
        return t = e.async, e = e.src, typeof e == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ha(e), e = ea(
          u
        ).hoistableScripts, a = e.get(t), a || (a = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, e.set(t, a)), a) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(r(444, l));
    }
  }
  function Ra(l) {
    return 'href="' + xt(l) + '"';
  }
  function Mu(l) {
    return 'link[rel="stylesheet"][' + l + "]";
  }
  function or(l) {
    return D({}, l, {
      "data-precedence": l.precedence,
      precedence: null
    });
  }
  function Wm(l, t, e, a) {
    l.querySelector('link[rel="preload"][as="style"][' + t + "]") ? a.loading = 1 : (t = l.createElement("link"), a.preload = t, t.addEventListener("load", function() {
      return a.loading |= 1;
    }), t.addEventListener("error", function() {
      return a.loading |= 2;
    }), Fl(t, "link", e), Xl(t), l.head.appendChild(t));
  }
  function Ha(l) {
    return '[src="' + xt(l) + '"]';
  }
  function Ou(l) {
    return "script[async]" + l;
  }
  function rr(l, t, e) {
    if (t.count++, t.instance === null)
      switch (t.type) {
        case "style":
          var a = l.querySelector(
            'style[data-href~="' + xt(e.href) + '"]'
          );
          if (a)
            return t.instance = a, Xl(a), a;
          var u = D({}, e, {
            "data-href": e.href,
            "data-precedence": e.precedence,
            href: null,
            precedence: null
          });
          return a = (l.ownerDocument || l).createElement(
            "style"
          ), Xl(a), Fl(a, "style", u), Jn(a, e.precedence, l), t.instance = a;
        case "stylesheet":
          u = Ra(e.href);
          var n = l.querySelector(
            Mu(u)
          );
          if (n)
            return t.state.loading |= 4, t.instance = n, Xl(n), n;
          a = or(e), (u = Dt.get(u)) && of(a, u), n = (l.ownerDocument || l).createElement("link"), Xl(n);
          var i = n;
          return i._p = new Promise(function(c, f) {
            i.onload = c, i.onerror = f;
          }), Fl(n, "link", a), t.state.loading |= 4, Jn(n, e.precedence, l), t.instance = n;
        case "script":
          return n = Ha(e.src), (u = l.querySelector(
            Ou(n)
          )) ? (t.instance = u, Xl(u), u) : (a = e, (u = Dt.get(n)) && (a = D({}, e), rf(a, u)), l = l.ownerDocument || l, u = l.createElement("script"), Xl(u), Fl(u, "link", a), l.head.appendChild(u), t.instance = u);
        case "void":
          return null;
        default:
          throw Error(r(443, t.type));
      }
    else
      t.type === "stylesheet" && (t.state.loading & 4) === 0 && (a = t.instance, t.state.loading |= 4, Jn(a, e.precedence, l));
    return t.instance;
  }
  function Jn(l, t, e) {
    for (var a = e.querySelectorAll(
      'link[rel="stylesheet"][data-precedence],style[data-precedence]'
    ), u = a.length ? a[a.length - 1] : null, n = u, i = 0; i < a.length; i++) {
      var c = a[i];
      if (c.dataset.precedence === t) n = c;
      else if (n !== u) break;
    }
    n ? n.parentNode.insertBefore(l, n.nextSibling) : (t = e.nodeType === 9 ? e.head : e, t.insertBefore(l, t.firstChild));
  }
  function of(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy), l.title == null && (l.title = t.title);
  }
  function rf(l, t) {
    l.crossOrigin == null && (l.crossOrigin = t.crossOrigin), l.referrerPolicy == null && (l.referrerPolicy = t.referrerPolicy), l.integrity == null && (l.integrity = t.integrity);
  }
  var wn = null;
  function dr(l, t, e) {
    if (wn === null) {
      var a = /* @__PURE__ */ new Map(), u = wn = /* @__PURE__ */ new Map();
      u.set(e, a);
    } else
      u = wn, a = u.get(e), a || (a = /* @__PURE__ */ new Map(), u.set(e, a));
    if (a.has(l)) return a;
    for (a.set(l, null), e = e.getElementsByTagName(l), u = 0; u < e.length; u++) {
      var n = e[u];
      if (!(n[Ka] || n[wl] || l === "link" && n.getAttribute("rel") === "stylesheet") && n.namespaceURI !== "http://www.w3.org/2000/svg") {
        var i = n.getAttribute(t) || "";
        i = l + i;
        var c = a.get(i);
        c ? c.push(n) : a.set(i, [n]);
      }
    }
    return a;
  }
  function mr(l, t, e) {
    l = l.ownerDocument || l, l.head.insertBefore(
      e,
      t === "title" ? l.querySelector("head > title") : null
    );
  }
  function km(l, t, e) {
    if (e === 1 || t.itemProp != null) return !1;
    switch (l) {
      case "meta":
      case "title":
        return !0;
      case "style":
        if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
          break;
        return !0;
      case "link":
        if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
          break;
        return t.rel === "stylesheet" ? (l = t.disabled, typeof t.precedence == "string" && l == null) : !0;
      case "script":
        if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
          return !0;
    }
    return !1;
  }
  function hr(l) {
    return !(l.type === "stylesheet" && (l.state.loading & 3) === 0);
  }
  function Fm(l, t, e, a) {
    if (e.type === "stylesheet" && (typeof a.media != "string" || matchMedia(a.media).matches !== !1) && (e.state.loading & 4) === 0) {
      if (e.instance === null) {
        var u = Ra(a.href), n = t.querySelector(
          Mu(u)
        );
        if (n) {
          t = n._p, t !== null && typeof t == "object" && typeof t.then == "function" && (l.count++, l = $n.bind(l), t.then(l, l)), e.state.loading |= 4, e.instance = n, Xl(n);
          return;
        }
        n = t.ownerDocument || t, a = or(a), (u = Dt.get(u)) && of(a, u), n = n.createElement("link"), Xl(n);
        var i = n;
        i._p = new Promise(function(c, f) {
          i.onload = c, i.onerror = f;
        }), Fl(n, "link", a), e.instance = n;
      }
      l.stylesheets === null && (l.stylesheets = /* @__PURE__ */ new Map()), l.stylesheets.set(e, t), (t = e.state.preload) && (e.state.loading & 3) === 0 && (l.count++, e = $n.bind(l), t.addEventListener("load", e), t.addEventListener("error", e));
    }
  }
  var df = 0;
  function Im(l, t) {
    return l.stylesheets && l.count === 0 && kn(l, l.stylesheets), 0 < l.count || 0 < l.imgCount ? function(e) {
      var a = setTimeout(function() {
        if (l.stylesheets && kn(l, l.stylesheets), l.unsuspend) {
          var n = l.unsuspend;
          l.unsuspend = null, n();
        }
      }, 6e4 + t);
      0 < l.imgBytes && df === 0 && (df = 62500 * jm());
      var u = setTimeout(
        function() {
          if (l.waitingForImages = !1, l.count === 0 && (l.stylesheets && kn(l, l.stylesheets), l.unsuspend)) {
            var n = l.unsuspend;
            l.unsuspend = null, n();
          }
        },
        (l.imgBytes > df ? 50 : 800) + t
      );
      return l.unsuspend = e, function() {
        l.unsuspend = null, clearTimeout(a), clearTimeout(u);
      };
    } : null;
  }
  function $n() {
    if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
      if (this.stylesheets) kn(this, this.stylesheets);
      else if (this.unsuspend) {
        var l = this.unsuspend;
        this.unsuspend = null, l();
      }
    }
  }
  var Wn = null;
  function kn(l, t) {
    l.stylesheets = null, l.unsuspend !== null && (l.count++, Wn = /* @__PURE__ */ new Map(), t.forEach(Pm, l), Wn = null, $n.call(l));
  }
  function Pm(l, t) {
    if (!(t.state.loading & 4)) {
      var e = Wn.get(l);
      if (e) var a = e.get(null);
      else {
        e = /* @__PURE__ */ new Map(), Wn.set(l, e);
        for (var u = l.querySelectorAll(
          "link[data-precedence],style[data-precedence]"
        ), n = 0; n < u.length; n++) {
          var i = u[n];
          (i.nodeName === "LINK" || i.getAttribute("media") !== "not all") && (e.set(i.dataset.precedence, i), a = i);
        }
        a && e.set(null, a);
      }
      u = t.instance, i = u.getAttribute("data-precedence"), n = e.get(i) || a, n === a && e.set(null, u), e.set(i, u), this.count++, a = $n.bind(this), u.addEventListener("load", a), u.addEventListener("error", a), n ? n.parentNode.insertBefore(u, n.nextSibling) : (l = l.nodeType === 9 ? l.head : l, l.insertBefore(u, l.firstChild)), t.state.loading |= 4;
    }
  }
  var Uu = {
    $$typeof: pl,
    Provider: null,
    Consumer: null,
    _currentValue: j,
    _currentValue2: j,
    _threadCount: 0
  };
  function lh(l, t, e, a, u, n, i, c, f) {
    this.tag = 1, this.containerInfo = l, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = ii(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = ii(0), this.hiddenUpdates = ii(null), this.identifierPrefix = a, this.onUncaughtError = u, this.onCaughtError = n, this.onRecoverableError = i, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = f, this.incompleteTransitions = /* @__PURE__ */ new Map();
  }
  function yr(l, t, e, a, u, n, i, c, f, h, S, E) {
    return l = new lh(
      l,
      t,
      e,
      i,
      f,
      h,
      S,
      E,
      c
    ), t = 1, n === !0 && (t |= 24), n = mt(3, null, null, t), l.current = n, n.stateNode = l, t = Vi(), t.refCount++, l.pooledCache = t, t.refCount++, n.memoizedState = {
      element: a,
      isDehydrated: e,
      cache: t
    }, $i(n), l;
  }
  function vr(l) {
    return l ? (l = da, l) : da;
  }
  function gr(l, t, e, a, u, n) {
    u = vr(u), a.context === null ? a.context = u : a.pendingContext = u, a = ve(t), a.payload = { element: e }, n = n === void 0 ? null : n, n !== null && (a.callback = n), e = ge(l, a, t), e !== null && (ct(e, l, t), fu(e, l, t));
  }
  function br(l, t) {
    if (l = l.memoizedState, l !== null && l.dehydrated !== null) {
      var e = l.retryLane;
      l.retryLane = e !== 0 && e < t ? e : t;
    }
  }
  function mf(l, t) {
    br(l, t), (l = l.alternate) && br(l, t);
  }
  function Sr(l) {
    if (l.tag === 13 || l.tag === 31) {
      var t = Ye(l, 67108864);
      t !== null && ct(t, l, 67108864), mf(l, 67108864);
    }
  }
  function pr(l) {
    if (l.tag === 13 || l.tag === 31) {
      var t = bt();
      t = ci(t);
      var e = Ye(l, t);
      e !== null && ct(e, l, t), mf(l, t);
    }
  }
  var Fn = !0;
  function th(l, t, e, a) {
    var u = p.T;
    p.T = null;
    var n = M.p;
    try {
      M.p = 2, hf(l, t, e, a);
    } finally {
      M.p = n, p.T = u;
    }
  }
  function eh(l, t, e, a) {
    var u = p.T;
    p.T = null;
    var n = M.p;
    try {
      M.p = 8, hf(l, t, e, a);
    } finally {
      M.p = n, p.T = u;
    }
  }
  function hf(l, t, e, a) {
    if (Fn) {
      var u = yf(a);
      if (u === null)
        Pc(
          l,
          t,
          a,
          In,
          e
        ), Tr(l, a);
      else if (uh(
        u,
        l,
        t,
        e,
        a
      ))
        a.stopPropagation();
      else if (Tr(l, a), t & 4 && -1 < ah.indexOf(l)) {
        for (; u !== null; ) {
          var n = ta(u);
          if (n !== null)
            switch (n.tag) {
              case 3:
                if (n = n.stateNode, n.current.memoizedState.isDehydrated) {
                  var i = Ce(n.pendingLanes);
                  if (i !== 0) {
                    var c = n;
                    for (c.pendingLanes |= 2, c.entangledLanes |= 2; i; ) {
                      var f = 1 << 31 - rt(i);
                      c.entanglements[1] |= f, i &= ~f;
                    }
                    Gt(n), (rl & 6) === 0 && (Rn = Al() + 500, Eu(0));
                  }
                }
                break;
              case 31:
              case 13:
                c = Ye(n, 2), c !== null && ct(c, n, 2), Bn(), mf(n, 2);
            }
          if (n = yf(a), n === null && Pc(
            l,
            t,
            a,
            In,
            e
          ), n === u) break;
          u = n;
        }
        u !== null && a.stopPropagation();
      } else
        Pc(
          l,
          t,
          a,
          null,
          e
        );
    }
  }
  function yf(l) {
    return l = vi(l), vf(l);
  }
  var In = null;
  function vf(l) {
    if (In = null, l = la(l), l !== null) {
      var t = q(l);
      if (t === null) l = null;
      else {
        var e = t.tag;
        if (e === 13) {
          if (l = Q(t), l !== null) return l;
          l = null;
        } else if (e === 31) {
          if (l = ll(t), l !== null) return l;
          l = null;
        } else if (e === 3) {
          if (t.stateNode.current.memoizedState.isDehydrated)
            return t.tag === 3 ? t.stateNode.containerInfo : null;
          l = null;
        } else t !== l && (l = null);
      }
    }
    return In = l, null;
  }
  function zr(l) {
    switch (l) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (Gu()) {
          case Xa:
            return 2;
          case Of:
            return 8;
          case Lu:
          case Zr:
            return 32;
          case Uf:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var gf = !1, Me = null, Oe = null, Ue = null, Du = /* @__PURE__ */ new Map(), ju = /* @__PURE__ */ new Map(), De = [], ah = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(
    " "
  );
  function Tr(l, t) {
    switch (l) {
      case "focusin":
      case "focusout":
        Me = null;
        break;
      case "dragenter":
      case "dragleave":
        Oe = null;
        break;
      case "mouseover":
      case "mouseout":
        Ue = null;
        break;
      case "pointerover":
      case "pointerout":
        Du.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        ju.delete(t.pointerId);
    }
  }
  function Cu(l, t, e, a, u, n) {
    return l === null || l.nativeEvent !== n ? (l = {
      blockedOn: t,
      domEventName: e,
      eventSystemFlags: a,
      nativeEvent: n,
      targetContainers: [u]
    }, t !== null && (t = ta(t), t !== null && Sr(t)), l) : (l.eventSystemFlags |= a, t = l.targetContainers, u !== null && t.indexOf(u) === -1 && t.push(u), l);
  }
  function uh(l, t, e, a, u) {
    switch (t) {
      case "focusin":
        return Me = Cu(
          Me,
          l,
          t,
          e,
          a,
          u
        ), !0;
      case "dragenter":
        return Oe = Cu(
          Oe,
          l,
          t,
          e,
          a,
          u
        ), !0;
      case "mouseover":
        return Ue = Cu(
          Ue,
          l,
          t,
          e,
          a,
          u
        ), !0;
      case "pointerover":
        var n = u.pointerId;
        return Du.set(
          n,
          Cu(
            Du.get(n) || null,
            l,
            t,
            e,
            a,
            u
          )
        ), !0;
      case "gotpointercapture":
        return n = u.pointerId, ju.set(
          n,
          Cu(
            ju.get(n) || null,
            l,
            t,
            e,
            a,
            u
          )
        ), !0;
    }
    return !1;
  }
  function xr(l) {
    var t = la(l.target);
    if (t !== null) {
      var e = q(t);
      if (e !== null) {
        if (t = e.tag, t === 13) {
          if (t = Q(e), t !== null) {
            l.blockedOn = t, Bf(l.priority, function() {
              pr(e);
            });
            return;
          }
        } else if (t === 31) {
          if (t = ll(e), t !== null) {
            l.blockedOn = t, Bf(l.priority, function() {
              pr(e);
            });
            return;
          }
        } else if (t === 3 && e.stateNode.current.memoizedState.isDehydrated) {
          l.blockedOn = e.tag === 3 ? e.stateNode.containerInfo : null;
          return;
        }
      }
    }
    l.blockedOn = null;
  }
  function Pn(l) {
    if (l.blockedOn !== null) return !1;
    for (var t = l.targetContainers; 0 < t.length; ) {
      var e = yf(l.nativeEvent);
      if (e === null) {
        e = l.nativeEvent;
        var a = new e.constructor(
          e.type,
          e
        );
        yi = a, e.target.dispatchEvent(a), yi = null;
      } else
        return t = ta(e), t !== null && Sr(t), l.blockedOn = e, !1;
      t.shift();
    }
    return !0;
  }
  function Er(l, t, e) {
    Pn(l) && e.delete(t);
  }
  function nh() {
    gf = !1, Me !== null && Pn(Me) && (Me = null), Oe !== null && Pn(Oe) && (Oe = null), Ue !== null && Pn(Ue) && (Ue = null), Du.forEach(Er), ju.forEach(Er);
  }
  function li(l, t) {
    l.blockedOn === t && (l.blockedOn = null, gf || (gf = !0, y.unstable_scheduleCallback(
      y.unstable_NormalPriority,
      nh
    )));
  }
  var ti = null;
  function Ar(l) {
    ti !== l && (ti = l, y.unstable_scheduleCallback(
      y.unstable_NormalPriority,
      function() {
        ti === l && (ti = null);
        for (var t = 0; t < l.length; t += 3) {
          var e = l[t], a = l[t + 1], u = l[t + 2];
          if (typeof a != "function") {
            if (vf(a || e) === null)
              continue;
            break;
          }
          var n = ta(e);
          n !== null && (l.splice(t, 3), t -= 3, hc(
            n,
            {
              pending: !0,
              data: u,
              method: e.method,
              action: a
            },
            a,
            u
          ));
        }
      }
    ));
  }
  function Ba(l) {
    function t(f) {
      return li(f, l);
    }
    Me !== null && li(Me, l), Oe !== null && li(Oe, l), Ue !== null && li(Ue, l), Du.forEach(t), ju.forEach(t);
    for (var e = 0; e < De.length; e++) {
      var a = De[e];
      a.blockedOn === l && (a.blockedOn = null);
    }
    for (; 0 < De.length && (e = De[0], e.blockedOn === null); )
      xr(e), e.blockedOn === null && De.shift();
    if (e = (l.ownerDocument || l).$$reactFormReplay, e != null)
      for (a = 0; a < e.length; a += 3) {
        var u = e[a], n = e[a + 1], i = u[tt] || null;
        if (typeof n == "function")
          i || Ar(e);
        else if (i) {
          var c = null;
          if (n && n.hasAttribute("formAction")) {
            if (u = n, i = n[tt] || null)
              c = i.formAction;
            else if (vf(u) !== null) continue;
          } else c = i.action;
          typeof c == "function" ? e[a + 1] = c : (e.splice(a, 3), a -= 3), Ar(e);
        }
      }
  }
  function Nr() {
    function l(n) {
      n.canIntercept && n.info === "react-transition" && n.intercept({
        handler: function() {
          return new Promise(function(i) {
            return u = i;
          });
        },
        focusReset: "manual",
        scroll: "manual"
      });
    }
    function t() {
      u !== null && (u(), u = null), a || setTimeout(e, 20);
    }
    function e() {
      if (!a && !navigation.transition) {
        var n = navigation.currentEntry;
        n && n.url != null && navigation.navigate(n.url, {
          state: n.getState(),
          info: "react-transition",
          history: "replace"
        });
      }
    }
    if (typeof navigation == "object") {
      var a = !1, u = null;
      return navigation.addEventListener("navigate", l), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(e, 100), function() {
        a = !0, navigation.removeEventListener("navigate", l), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), u !== null && (u(), u = null);
      };
    }
  }
  function bf(l) {
    this._internalRoot = l;
  }
  ei.prototype.render = bf.prototype.render = function(l) {
    var t = this._internalRoot;
    if (t === null) throw Error(r(409));
    var e = t.current, a = bt();
    gr(e, a, l, t, null, null);
  }, ei.prototype.unmount = bf.prototype.unmount = function() {
    var l = this._internalRoot;
    if (l !== null) {
      this._internalRoot = null;
      var t = l.containerInfo;
      gr(l.current, 2, null, l, null, null), Bn(), t[Pe] = null;
    }
  };
  function ei(l) {
    this._internalRoot = l;
  }
  ei.prototype.unstable_scheduleHydration = function(l) {
    if (l) {
      var t = Hf();
      l = { blockedOn: null, target: l, priority: t };
      for (var e = 0; e < De.length && t !== 0 && t < De[e].priority; e++) ;
      De.splice(e, 0, l), e === 0 && xr(l);
    }
  };
  var _r = x.version;
  if (_r !== "19.2.4")
    throw Error(
      r(
        527,
        _r,
        "19.2.4"
      )
    );
  M.findDOMNode = function(l) {
    var t = l._reactInternals;
    if (t === void 0)
      throw typeof l.render == "function" ? Error(r(188)) : (l = Object.keys(l).join(","), Error(r(268, l)));
    return l = T(t), l = l !== null ? J(l) : null, l = l === null ? null : l.stateNode, l;
  };
  var ih = {
    bundleType: 0,
    version: "19.2.4",
    rendererPackageName: "react-dom",
    currentDispatcherRef: p,
    reconcilerVersion: "19.2.4"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var ai = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!ai.isDisabled && ai.supportsFiber)
      try {
        Qa = ai.inject(
          ih
        ), ot = ai;
      } catch {
      }
  }
  return Hu.createRoot = function(l, t) {
    if (!Y(l)) throw Error(r(299));
    var e = !1, a = "", u = Ro, n = Ho, i = Bo;
    return t != null && (t.unstable_strictMode === !0 && (e = !0), t.identifierPrefix !== void 0 && (a = t.identifierPrefix), t.onUncaughtError !== void 0 && (u = t.onUncaughtError), t.onCaughtError !== void 0 && (n = t.onCaughtError), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = yr(
      l,
      1,
      !1,
      null,
      null,
      e,
      a,
      null,
      u,
      n,
      i,
      Nr
    ), l[Pe] = t.current, Ic(l), new bf(t);
  }, Hu.hydrateRoot = function(l, t, e) {
    if (!Y(l)) throw Error(r(299));
    var a = !1, u = "", n = Ro, i = Ho, c = Bo, f = null;
    return e != null && (e.unstable_strictMode === !0 && (a = !0), e.identifierPrefix !== void 0 && (u = e.identifierPrefix), e.onUncaughtError !== void 0 && (n = e.onUncaughtError), e.onCaughtError !== void 0 && (i = e.onCaughtError), e.onRecoverableError !== void 0 && (c = e.onRecoverableError), e.formState !== void 0 && (f = e.formState)), t = yr(
      l,
      1,
      !0,
      t,
      e ?? null,
      a,
      u,
      f,
      n,
      i,
      c,
      Nr
    ), t.context = vr(null), e = t.current, a = bt(), a = ci(a), u = ve(a), u.callback = null, ge(e, u, a), e = a, t.current.lanes = e, Va(t, e), Gt(t), l[Pe] = t.current, Ic(l), new ei(t);
  }, Hu.version = "19.2.4", Hu;
}
var qr;
function vh() {
  if (qr) return zf.exports;
  qr = 1;
  function y() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(y);
      } catch (x) {
        console.error(x);
      }
  }
  return y(), zf.exports = yh(), zf.exports;
}
var gh = vh();
const bh = (y) => y.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Sh = (y) => y.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (x, _, r) => r ? r.toUpperCase() : _.toLowerCase()
), Yr = (y) => {
  const x = Sh(y);
  return x.charAt(0).toUpperCase() + x.slice(1);
}, Xr = (...y) => y.filter((x, _, r) => !!x && x.trim() !== "" && r.indexOf(x) === _).join(" ").trim(), ph = (y) => {
  for (const x in y)
    if (x.startsWith("aria-") || x === "role" || x === "title")
      return !0;
};
var zh = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const Th = X.forwardRef(
  ({
    color: y = "currentColor",
    size: x = 24,
    strokeWidth: _ = 2,
    absoluteStrokeWidth: r,
    className: Y = "",
    children: q,
    iconNode: Q,
    ...ll
  }, U) => X.createElement(
    "svg",
    {
      ref: U,
      ...zh,
      width: x,
      height: x,
      stroke: y,
      strokeWidth: r ? Number(_) * 24 / Number(x) : _,
      className: Xr("lucide", Y),
      ...!q && !ph(ll) && { "aria-hidden": "true" },
      ...ll
    },
    [
      ...Q.map(([T, J]) => X.createElement(T, J)),
      ...Array.isArray(q) ? q : [q]
    ]
  )
);
const ce = (y, x) => {
  const _ = X.forwardRef(
    ({ className: r, ...Y }, q) => X.createElement(Th, {
      ref: q,
      iconNode: x,
      className: Xr(
        `lucide-${bh(Yr(y))}`,
        `lucide-${y}`,
        r
      ),
      ...Y
    })
  );
  return _.displayName = Yr(y), _;
};
const xh = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], Eh = ce("chevron-down", xh);
const Ah = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
], Gr = ce("circle-alert", Ah);
const Nh = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
], _h = ce("inbox", Nh);
const Mh = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
], Oh = ce("layers", Mh);
const Uh = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
], Dh = ce("plus", Uh);
const jh = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
], Ch = ce("save", jh);
const Rh = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
], Hh = ce("trash-2", Rh);
const Bh = [
  [
    "path",
    {
      d: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1",
      key: "18etb6"
    }
  ],
  ["path", { d: "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4", key: "xoc0q4" }]
], qh = ce("wallet", Bh);
const Yh = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
], Gh = ce("x", Yh);
function Lh(y) {
  return typeof y == "string" && y.startsWith("/api/");
}
async function qu(y, x = {}) {
  let _;
  try {
    _ = await fetch(y, {
      credentials: "same-origin",
      ...x
    });
  } catch {
    throw new Error("Nao foi possivel conectar com a API. Reinicie o servidor com npm run dev.");
  }
  if (_.status === 401)
    throw window.location.href = "/login", new Error("Sessão expirada. Faça login novamente.");
  if (!_.ok) {
    let Y = "Erro inesperado.";
    try {
      Y = (await _.json()).error || Y;
    } catch {
      Y = _.statusText || Y;
    }
    const q = new Error(Y);
    throw q.status = _.status, q;
  }
  if (_.status === 204) return null;
  const r = _.headers.get("content-type") || "";
  if (Lh(y) && !r.includes("application/json"))
    throw new Error("API indisponivel ou desatualizada. Reinicie o servidor.");
  return _.json();
}
function Xh() {
  return qu("/api/auth/status");
}
function Qh() {
  return qu("/api/topicos");
}
function Zh(y) {
  return qu("/api/topicos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(y)
  });
}
function Vh(y, x) {
  return qu(`/api/topicos/${encodeURIComponent(y)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(x)
  });
}
function Kh(y) {
  return qu(`/api/topicos/${encodeURIComponent(y)}`, {
    method: "DELETE"
  });
}
function Jh(y) {
  if (typeof y != "function") return () => {
  };
  const x = () => document.body.classList.contains("theme-dark"), _ = () => y(x());
  _();
  const r = new MutationObserver(() => {
    _();
  });
  return r.observe(document.body, {
    attributes: !0,
    attributeFilter: ["class"]
  }), () => r.disconnect();
}
function wh({
  canManageConfig: y,
  isEditMode: x,
  onToggleEditMode: _,
  onOpenCreateModal: r,
  onToggleTheme: Y,
  isDark: q,
  themeToggleId: Q = "config-theme-toggle"
}) {
  const ll = q ? "text-slate-300" : "text-slate-600", U = q ? "text-slate-100" : "text-slate-900", T = q ? "border-slate-700/60 bg-slate-900/80 text-slate-200" : "border-slate-300/80 bg-white/90 text-slate-700", J = x ? "bg-indigo-500" : q ? "bg-slate-700" : "bg-slate-300";
  return /* @__PURE__ */ b.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ b.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ b.jsx("h3", { className: `text-4xl font-extrabold tracking-tight md:text-5xl ${U}`, children: "Configurações" }),
      /* @__PURE__ */ b.jsx("p", { className: `max-w-4xl text-sm leading-relaxed md:text-[1.02rem] ${ll}`, children: "Faça a gestão dos tópicos, orçamentos e permissões de lançamento. O total é recalculado em tempo real conforme o filtro e os campos editados." })
    ] }),
    /* @__PURE__ */ b.jsx("div", { className: "flex justify-start md:justify-end", children: /* @__PURE__ */ b.jsxs("div", { className: "grid w-full max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-3", children: [
      y && x ? /* @__PURE__ */ b.jsxs(
        "button",
        {
          type: "button",
          onClick: r,
          className: "group inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-indigo-300/25 bg-gradient-to-r from-indigo-600 to-blue-600 px-5 text-[1.02rem] font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]",
          children: [
            /* @__PURE__ */ b.jsx(Dh, { size: 20, className: "transition-transform duration-300 group-hover:rotate-90" }),
            "Acrescentar Tópico"
          ]
        }
      ) : /* @__PURE__ */ b.jsx("div", { className: "hidden sm:block", "aria-hidden": "true" }),
      /* @__PURE__ */ b.jsxs(
        "div",
        {
          className: `inline-flex h-14 items-center justify-between gap-3 rounded-2xl border px-5 shadow-lg backdrop-blur ${T}`,
          children: [
            /* @__PURE__ */ b.jsx(
              "span",
              {
                className: `text-[1.02rem] font-semibold ${x ? "text-indigo-400" : ll}`,
                children: "Modo Edição"
              }
            ),
            /* @__PURE__ */ b.jsx(
              "button",
              {
                type: "button",
                role: "switch",
                "aria-checked": x,
                onClick: _,
                className: `relative inline-flex h-8 w-14 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ${J}`,
                children: /* @__PURE__ */ b.jsx(
                  "span",
                  {
                    className: `pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow transition duration-300 ${x ? "translate-x-6" : "translate-x-0"}`
                  }
                )
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ b.jsxs(
        "div",
        {
          className: `inline-flex h-14 items-center justify-between gap-2 rounded-2xl border px-4 shadow-lg backdrop-blur ${T}`,
          children: [
            /* @__PURE__ */ b.jsx("span", { className: `text-[0.95rem] font-semibold ${ll}`, children: "Tema" }),
            /* @__PURE__ */ b.jsxs("div", { className: "menu-theme-toggle config-menu-theme-toggle", children: [
              /* @__PURE__ */ b.jsx(
                "input",
                {
                  id: Q,
                  className: "theme-toggle-input",
                  type: "checkbox",
                  role: "switch",
                  "aria-label": "Alternar tema claro e escuro",
                  checked: q,
                  onChange: Y
                }
              ),
              /* @__PURE__ */ b.jsxs(
                "label",
                {
                  htmlFor: Q,
                  className: "theme-toggle-label",
                  title: "Alternar tema claro e escuro",
                  children: [
                    /* @__PURE__ */ b.jsxs("span", { className: "theme-toggle-stars", "aria-hidden": "true", children: [
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-star theme-toggle-star-1" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-star theme-toggle-star-2" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-star theme-toggle-star-3" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-star theme-toggle-star-4" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-star theme-toggle-star-5" })
                    ] }),
                    /* @__PURE__ */ b.jsxs("span", { className: "theme-toggle-clouds", "aria-hidden": "true", children: [
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-cloud theme-toggle-cloud-1" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-cloud theme-toggle-cloud-2" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-cloud theme-toggle-cloud-3" })
                    ] }),
                    /* @__PURE__ */ b.jsxs("span", { className: "theme-toggle-knob", "aria-hidden": "true", children: [
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-crater theme-toggle-crater-1" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-crater theme-toggle-crater-2" }),
                      /* @__PURE__ */ b.jsx("span", { className: "theme-toggle-crater theme-toggle-crater-3" })
                    ] })
                  ]
                }
              )
            ] })
          ]
        }
      )
    ] }) })
  ] });
}
function $h({ filterGroup: y, groups: x, onChangeFilter: _, isDark: r }) {
  const Y = X.useRef(null), q = () => {
    const Q = Y.current;
    if (Q) {
      if (Q.focus(), typeof Q.showPicker == "function")
        try {
          Q.showPicker();
          return;
        } catch {
        }
      Q.click();
    }
  };
  return /* @__PURE__ */ b.jsxs(
    "div",
    {
      className: `col-span-1 flex min-h-[142px] flex-col justify-center rounded-2xl border p-5 shadow-xl backdrop-blur-xl md:col-span-2 md:p-6 ${r ? "border-slate-800/65 bg-slate-900/45" : "border-slate-200/90 bg-white/90"}`,
      children: [
        /* @__PURE__ */ b.jsxs(
          "div",
          {
            className: `mb-3 inline-flex w-fit items-center justify-start gap-2 text-xs font-bold uppercase tracking-[0.08em] ${r ? "text-slate-400" : "text-slate-500"}`,
            children: [
              /* @__PURE__ */ b.jsx(Oh, { size: 14 }),
              "Filtrar por Macro-Topico"
            ]
          }
        ),
        /* @__PURE__ */ b.jsxs("div", { className: "relative w-full max-w-[360px]", children: [
          /* @__PURE__ */ b.jsx(
            "select",
            {
              ref: Y,
              value: y,
              onChange: (Q) => _(Q.target.value),
              className: `h-12 w-full appearance-none rounded-xl border px-4 py-3 text-[1.04rem] font-semibold leading-none outline-none transition-all ${r ? "border-slate-700/60 bg-slate-950/50 text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40" : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"}`,
              children: x.map((Q) => /* @__PURE__ */ b.jsx("option", { value: Q.value, children: Q.label }, Q.value))
            }
          ),
          /* @__PURE__ */ b.jsx(
            "button",
            {
              type: "button",
              onClick: q,
              "aria-label": "Abrir lista de macro-topicos",
              className: "absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center",
              children: /* @__PURE__ */ b.jsx(Eh, { size: 16, className: r ? "text-slate-500" : "text-slate-400" })
            }
          )
        ] })
      ]
    }
  );
}
function Wh({ totalBudget: y, formatCurrency: x, filterLabel: _, isDark: r }) {
  return /* @__PURE__ */ b.jsxs(
    "div",
    {
      className: `group relative col-span-1 flex min-h-[142px] flex-col justify-center overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-xl ${r ? "border-slate-800/60 bg-gradient-to-br from-slate-900/85 to-slate-900/45" : "border-slate-200 bg-gradient-to-br from-white to-slate-100"}`,
      children: [
        /* @__PURE__ */ b.jsx("div", { className: "absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20" }),
        /* @__PURE__ */ b.jsxs(
          "div",
          {
            className: `relative z-10 mb-2 inline-flex w-fit items-center justify-start gap-2 text-xs font-bold uppercase tracking-[0.08em] ${r ? "text-slate-400" : "text-slate-500"}`,
            children: [
              /* @__PURE__ */ b.jsx(qh, { size: 14, className: "text-indigo-400" }),
              "Orcamento Total (",
              _,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ b.jsx(
          "div",
          {
            className: `relative z-10 text-left text-[2.45rem] font-extrabold leading-none ${r ? "text-indigo-200" : "text-indigo-900"}`,
            children: x(y)
          }
        )
      ]
    }
  );
}
function kh({ filterLabel: y, isDark: x }) {
  return /* @__PURE__ */ b.jsx("tr", { children: /* @__PURE__ */ b.jsx("td", { colSpan: 6, className: "px-6 py-16 text-center", children: /* @__PURE__ */ b.jsxs(
    "div",
    {
      className: `flex flex-col items-center justify-center ${x ? "text-slate-500" : "text-slate-400"}`,
      children: [
        /* @__PURE__ */ b.jsx(_h, { size: 48, className: "mb-4 opacity-50" }),
        /* @__PURE__ */ b.jsx("p", { className: `text-lg font-semibold ${x ? "text-slate-200" : "text-slate-700"}`, children: "Nenhum tópico encontrado" }),
        /* @__PURE__ */ b.jsxs("p", { className: "mt-1 text-sm", children: [
          'Não existem tópicos para o filtro "',
          y,
          '".'
        ] })
      ]
    }
  ) }) });
}
function Fh(y) {
  return String(y ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function Ih(y) {
  const x = Fh(y);
  return x === "team hires" || x === "contratacoes da equipe";
}
function Lr({ checked: y, disabled: x, onClick: _, tone: r = "indigo", isDark: Y }) {
  const q = r === "emerald" ? "bg-emerald-500" : "bg-indigo-500", Q = Y ? "bg-slate-700" : "bg-slate-300";
  return /* @__PURE__ */ b.jsx(
    "button",
    {
      type: "button",
      disabled: x,
      onClick: _,
      className: `relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${y ? q : Q} ${x ? "cursor-default opacity-60" : "cursor-pointer"}`,
      children: /* @__PURE__ */ b.jsx(
        "span",
        {
          className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${y ? "translate-x-5" : "translate-x-0"}`
        }
      )
    }
  );
}
function Ph({
  topic: y,
  draft: x,
  isEditMode: _,
  canManageConfig: r,
  isDark: Y,
  isSaving: q,
  isDeleting: Q,
  onFieldChange: ll,
  onToggleField: U,
  onSave: T,
  onDelete: J,
  getGroupLabel: D,
  groupSuggestionsListId: fl
}) {
  const ul = r && _, _l = Ih(x?.grupo), sl = ul ? Y ? "text-slate-200 border border-slate-700/40 hover:border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60 bg-slate-950/40" : "text-slate-900 border border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 bg-white" : Y ? "text-slate-300 border border-transparent bg-transparent cursor-default" : "text-slate-700 border border-transparent bg-transparent cursor-default";
  return /* @__PURE__ */ b.jsxs(
    "tr",
    {
      className: `group/row transition-colors ${Y ? "hover:bg-slate-800/30" : "hover:bg-slate-100/70"}`,
      children: [
        /* @__PURE__ */ b.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ b.jsx(
          "input",
          {
            type: "text",
            value: x.nome,
            readOnly: !ul,
            onChange: (Cl) => ll(y.id, "nome", Cl.target.value),
            className: `w-full rounded-md px-3 py-1.5 text-sm font-semibold outline-none transition-all ${sl}`
          }
        ) }),
        /* @__PURE__ */ b.jsx("td", { className: "px-6 py-4", children: ul ? /* @__PURE__ */ b.jsx(
          "input",
          {
            type: "text",
            list: fl,
            value: x?.grupo ?? "",
            onChange: (Cl) => ll(y.id, "grupo", Cl.target.value),
            className: `w-full rounded-md px-3 py-1.5 text-sm font-semibold outline-none transition-all ${sl}`,
            placeholder: "Informe o grupo"
          }
        ) : /* @__PURE__ */ b.jsx(
          "span",
          {
            className: `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${Y ? "border-slate-700/50 bg-slate-800/60 text-slate-300" : "border-slate-300 bg-slate-100 text-slate-700"}`,
            children: D(y.grupo)
          }
        ) }),
        /* @__PURE__ */ b.jsx("td", { className: "px-6 py-4 text-right", children: /* @__PURE__ */ b.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ b.jsx("span", { className: `text-xs font-semibold ${Y ? "text-slate-500" : "text-slate-400"}`, children: "R$" }),
          /* @__PURE__ */ b.jsx(
            "input",
            {
              type: "number",
              min: "0",
              step: "0.01",
              value: x.orcamentoProgramaBRL,
              readOnly: !ul,
              onChange: (Cl) => ll(y.id, "orcamentoProgramaBRL", Cl.target.value),
              className: `w-32 rounded-md px-3 py-1.5 text-right font-mono text-sm outline-none transition-all ${sl}`
            }
          )
        ] }) }),
        /* @__PURE__ */ b.jsx("td", { className: "px-6 py-4 text-center", children: /* @__PURE__ */ b.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ b.jsx(
          Lr,
          {
            checked: !!x.incluirNoResumo,
            disabled: !ul,
            tone: "indigo",
            isDark: Y,
            onClick: () => U(y.id, "incluirNoResumo")
          }
        ) }) }),
        /* @__PURE__ */ b.jsx("td", { className: "px-6 py-4 text-center", children: /* @__PURE__ */ b.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ b.jsx(
          Lr,
          {
            checked: !!x.permitirLancamento,
            disabled: !ul || _l,
            tone: "emerald",
            isDark: Y,
            onClick: () => U(y.id, "permitirLancamento")
          }
        ) }) }),
        /* @__PURE__ */ b.jsx("td", { className: "px-6 py-4 text-right", children: ul ? /* @__PURE__ */ b.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
          /* @__PURE__ */ b.jsxs(
            "button",
            {
              type: "button",
              disabled: q,
              onClick: () => T(y.id),
              className: "inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60",
              title: "Salvar alterações",
              children: [
                /* @__PURE__ */ b.jsx(Ch, { size: 16 }),
                /* @__PURE__ */ b.jsx("span", { children: q ? "Salvando..." : "Salvar" })
              ]
            }
          ),
          /* @__PURE__ */ b.jsx(
            "button",
            {
              type: "button",
              disabled: Q,
              onClick: () => J(y.id),
              className: `inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${Y ? "text-slate-400 hover:bg-rose-500/15 hover:text-rose-400" : "text-slate-500 hover:bg-rose-100 hover:text-rose-600"} disabled:cursor-not-allowed disabled:opacity-50`,
              title: "Remover tópico",
              children: /* @__PURE__ */ b.jsx(Hh, { size: 18 })
            }
          )
        ] }) : /* @__PURE__ */ b.jsx("span", { className: `text-xs font-semibold ${Y ? "text-slate-500" : "text-slate-400"}`, children: r ? "Ative o modo edição" : "Somente leitura" }) })
      ]
    }
  );
}
function ly({
  filteredTopics: y,
  drafts: x,
  filterLabel: _,
  isEditMode: r,
  canManageConfig: Y,
  isDark: q,
  savingIds: Q,
  deletingIds: ll,
  isSavingAllTopics: U,
  pendingTotalCount: T,
  pendingVisibleCount: J,
  getGroupLabel: D,
  groupSuggestions: fl,
  onFieldChange: ul,
  onToggleField: _l,
  onSaveAllTopics: sl,
  onSaveTopic: Cl,
  onDeleteTopic: dl
}) {
  const ft = Array.isArray(fl) ? fl : [];
  return /* @__PURE__ */ b.jsxs(
    "div",
    {
      className: `overflow-hidden rounded-2xl border shadow-2xl ${q ? "border-slate-800/60 bg-slate-900/45" : "border-slate-200 bg-white/95"}`,
      children: [
        Y && r ? /* @__PURE__ */ b.jsxs(
          "div",
          {
            className: `flex flex-col items-start justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center ${q ? "border-slate-800/60 bg-slate-950/35" : "border-slate-200 bg-slate-50"}`,
            children: [
              /* @__PURE__ */ b.jsxs(
                "span",
                {
                  className: `text-xs font-semibold uppercase tracking-[0.12em] ${q ? "text-slate-400" : "text-slate-500"}`,
                  children: [
                    "Alteracoes pendentes: ",
                    T,
                    J !== T ? ` (${J} no filtro)` : ""
                  ]
                }
              ),
              /* @__PURE__ */ b.jsx(
                "button",
                {
                  type: "button",
                  onClick: sl,
                  disabled: U || T === 0,
                  className: "inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60",
                  children: U ? "Salvando..." : T > 0 ? `Salvar tudo (${T})` : "Salvar tudo"
                }
              )
            ]
          }
        ) : null,
        /* @__PURE__ */ b.jsxs("div", { className: "overflow-x-auto", children: [
          /* @__PURE__ */ b.jsx("datalist", { id: "config-group-suggestions", children: ft.map((pl) => /* @__PURE__ */ b.jsx("option", { value: pl }, pl)) }),
          /* @__PURE__ */ b.jsxs("table", { className: "w-full border-collapse", children: [
            /* @__PURE__ */ b.jsx("thead", { children: /* @__PURE__ */ b.jsxs(
              "tr",
              {
                className: `border-b text-left text-xs font-bold uppercase tracking-[0.14em] ${q ? "border-slate-800/60 bg-slate-950/55 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"}`,
                children: [
                  /* @__PURE__ */ b.jsx("th", { className: "whitespace-nowrap px-6 py-5", children: "Tópico" }),
                  /* @__PURE__ */ b.jsx("th", { className: "whitespace-nowrap px-6 py-5", children: "Grupo" }),
                  /* @__PURE__ */ b.jsx("th", { className: "whitespace-nowrap px-6 py-5 text-right", children: "Orçamento" }),
                  /* @__PURE__ */ b.jsx("th", { className: "whitespace-nowrap px-6 py-5 text-center", children: "No Resumo" }),
                  /* @__PURE__ */ b.jsx("th", { className: "whitespace-nowrap px-6 py-5 text-center", children: "Lançamento" }),
                  /* @__PURE__ */ b.jsx("th", { className: "whitespace-nowrap px-6 py-5 text-right", children: "Ações" })
                ]
              }
            ) }),
            /* @__PURE__ */ b.jsx("tbody", { className: q ? "divide-y divide-slate-800/55" : "divide-y divide-slate-200", children: y.length === 0 ? /* @__PURE__ */ b.jsx(kh, { filterLabel: _, isDark: q }) : y.map((pl) => /* @__PURE__ */ b.jsx(
              Ph,
              {
                topic: pl,
                draft: x[pl.id],
                isEditMode: r,
                canManageConfig: Y,
                isDark: q,
                isSaving: Q.has(pl.id),
                isDeleting: ll.has(pl.id),
                getGroupLabel: D,
                groupSuggestionsListId: "config-group-suggestions",
                onFieldChange: ul,
                onToggleField: _l,
                onSave: Cl,
                onDelete: dl
              },
              pl.id
            )) })
          ] })
        ] })
      ]
    }
  );
}
const qa = "Todos", Qr = {
  "TEAM HIRES": "Contratações da Equipe",
  "COMMUNICATIONS & PUBLICATIONS": "Comunicação e Publicações",
  "THIRD PARTY SERVICES": "Serviços de Terceiros"
}, ty = new Map(
  Object.entries(Qr).flatMap(([y, x]) => {
    const _ = String(y).trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(), r = String(x).trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return [
      [_, x],
      [r, x]
    ];
  })
);
function Ga(y) {
  const x = String(y ?? "").trim();
  if (!x) return "Sem grupo";
  const _ = x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return ty.get(_) || x;
}
function _f(y) {
  return String(y ?? "").trim();
}
function Bu(y) {
  return _f(y).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function Ya(y) {
  const x = Bu(y);
  return x === "team hires" || x === Bu(Qr["TEAM HIRES"]);
}
function ey(y) {
  return {
    id: String(y?.id ?? ""),
    nome: String(y?.nome ?? ""),
    grupo: Ga(y?.grupo),
    orcamentoProgramaBRL: Number(y?.orcamentoProgramaBRL ?? 0),
    incluirNoResumo: !!y?.incluirNoResumo,
    permitirLancamento: !!y?.permitirLancamento,
    permitirLancamentoEfetivo: !!y?.permitirLancamentoEfetivo
  };
}
function ay(y) {
  const x = {};
  for (const _ of y)
    x[_.id] = {
      nome: _.nome,
      grupo: Ga(_.grupo),
      orcamentoProgramaBRL: String(Number(_.orcamentoProgramaBRL ?? 0)),
      incluirNoResumo: !!_.incluirNoResumo,
      permitirLancamento: !!_.permitirLancamento
    };
  return x;
}
function ui(y) {
  const x = Number(String(y ?? "").replace(",", "."));
  return Number.isFinite(x) ? x : NaN;
}
function uy(y, x) {
  if (!y || !x) return !1;
  const _ = String(y.nome ?? "").trim(), r = String(x.nome ?? "").trim(), Y = Bu(Ga(y.grupo)), q = Bu(x.grupo), Q = Number(y.orcamentoProgramaBRL ?? 0), ll = ui(x.orcamentoProgramaBRL), U = !Number.isFinite(ll) || Math.abs(ll - Q) > 1e-6, T = q !== Y, J = !!x.incluirNoResumo != !!y.incluirNoResumo, D = !!x.permitirLancamento != !!y.permitirLancamento;
  return r !== _ || T || U || J || D;
}
function ny(y) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(y ?? 0));
}
function Af(y, x) {
  const _ = new Set(y);
  return _.add(x), _;
}
function Nf(y, x) {
  const _ = new Set(y);
  return _.delete(x), _;
}
function iy({ onError: y }) {
  const [x, _] = X.useState(() => document.body.classList.contains("theme-dark")), [r, Y] = X.useState(!0), [q, Q] = X.useState(""), [ll, U] = X.useState(""), [T, J] = X.useState(null), [D, fl] = X.useState([]), [ul, _l] = X.useState({}), [sl, Cl] = X.useState(qa), [dl, ft] = X.useState(!1), [pl, Zl] = X.useState(/* @__PURE__ */ new Set()), [St, Vl] = X.useState(/* @__PURE__ */ new Set()), [F, Kl] = X.useState(!1), [st, Lt] = X.useState(!1), [pt, Gl] = X.useState(!1), [Rl, zt] = X.useState({
    nome: "",
    grupo: "COMMUNICATIONS & PUBLICATIONS",
    orcamentoProgramaBRL: "0",
    incluirNoResumo: !0,
    permitirLancamento: !0
  }), vl = !!T?.permissions?.canManageConfig, p = X.useCallback(() => {
    const N = !document.body.classList.contains("theme-dark");
    document.body.classList.toggle("theme-dark", N), _(N);
    try {
      localStorage.setItem("theme", N ? "dark" : "light");
    } catch {
    }
    const H = document.getElementById("theme-toggle");
    H && "checked" in H && (H.checked = N, H.setAttribute("aria-checked", N ? "true" : "false"), H.setAttribute("title", N ? "Ativar tema claro" : "Ativar tema escuro"));
  }, []), M = X.useCallback(() => {
    window.dispatchEvent(new CustomEvent("config:topics-changed"));
  }, []), j = X.useCallback(
    (N) => {
      const H = String(N || "Falha ao processar requisição.");
      Q(H), typeof y == "function" && y(H);
    },
    [y]
  ), k = X.useCallback(async () => {
    const N = await Qh(), H = Array.isArray(N) ? N.map(ey) : [];
    return fl(H), _l(ay(H)), H;
  }, []), ml = X.useCallback(async () => {
    const N = await Xh();
    return N?.authenticated ? (J(N), N) : (window.location.href = "/login", null);
  }, []);
  X.useEffect(() => {
    let N = !0;
    return (async () => {
      try {
        Y(!0), await Promise.all([ml(), k()]);
      } catch (H) {
        if (!N) return;
        j(H?.message || "Falha ao carregar dados da configuracao.");
      } finally {
        N && Y(!1);
      }
    })(), () => {
      N = !1;
    };
  }, [ml, k, j]), X.useEffect(() => Jh(_), []), X.useEffect(() => {
    vl || (ft(!1), Gl(!1));
  }, [vl]), X.useEffect(() => {
    if (!q) return () => {
    };
    const N = setTimeout(() => Q(""), 3600);
    return () => clearTimeout(N);
  }, [q]), X.useEffect(() => {
    if (!ll) return () => {
    };
    const N = setTimeout(() => U(""), 2400);
    return () => clearTimeout(N);
  }, [ll]);
  const o = X.useMemo(() => {
    const N = /* @__PURE__ */ new Map();
    for (const H of D) {
      const w = Ga(H.grupo);
      !w || w === "Sem grupo" || N.set(Bu(w), w);
    }
    return [
      { value: qa, label: "Todos os Macro-Tópicos" },
      ...[...N.values()].sort((H, w) => H.localeCompare(w)).map((H) => ({ value: H, label: H }))
    ];
  }, [D]), A = X.useMemo(() => o.filter((N) => N.value !== qa).map((N) => N.label), [o]), O = X.useMemo(() => sl === qa ? D : D.filter((N) => N.grupo === sl), [D, sl]), R = X.useMemo(() => O.reduce((N, H) => {
    const w = ul[H.id], zl = Number(H.orcamentoProgramaBRL ?? 0), ol = w ? ui(w.orcamentoProgramaBRL) : zl;
    return N + (Number.isFinite(ol) ? ol : zl);
  }, 0), [O, ul]), Z = o.find((N) => N.value === sl)?.label || "Todos os Macro-Tópicos", V = X.useMemo(() => D.filter((N) => uy(N, ul[N.id])).map((N) => N.id), [ul, D]), nl = X.useMemo(() => {
    const N = new Set(O.map((H) => H.id));
    return V.filter((H) => N.has(H));
  }, [V, O]), Jl = X.useCallback((N, H, w) => {
    _l((zl) => {
      const ol = {
        ...zl[N] || {}
      };
      if (H === "grupo") {
        const Il = String(w ?? ""), Al = Ya(Il);
        return {
          ...zl,
          [N]: {
            ...ol,
            grupo: Il,
            permitirLancamento: Al ? !1 : !!ol.permitirLancamento
          }
        };
      }
      return {
        ...zl,
        [N]: {
          ...ol,
          [H]: w
        }
      };
    });
  }, []), Ml = X.useCallback((N, H) => {
    _l((w) => ({
      ...w,
      [N]: {
        ...w[N] || {},
        [H]: !w?.[N]?.[H]
      }
    }));
  }, []), Ht = X.useCallback(
    async (N) => {
      if (!vl || !dl) return;
      const H = ul[N];
      if (!H) return;
      const w = String(H.nome ?? "").trim();
      if (!w)
        throw new Error("Nome do topico e obrigatorio.");
      const zl = _f(H.grupo);
      if (!zl)
        throw new Error("Grupo do topico e obrigatorio.");
      const ol = ui(H.orcamentoProgramaBRL);
      if (!Number.isFinite(ol) || ol < 0)
        throw new Error("Orcamento invalido.");
      await Vh(N, {
        nome: w,
        grupo: zl,
        orcamentoProgramaBRL: ol,
        incluirNoResumo: !!H.incluirNoResumo,
        permitirLancamento: Ya(zl) ? !1 : !!H.permitirLancamento
      });
    },
    [vl, ul, dl]
  ), Fe = X.useCallback(
    async (N) => {
      if (!(!vl || !dl)) {
        Zl((H) => Af(H, N));
        try {
          await Ht(N), await k(), M(), U("Topico atualizado com sucesso.");
        } catch (H) {
          j(H?.message || "Falha ao atualizar topico.");
        } finally {
          Zl((H) => Nf(H, N));
        }
      }
    },
    [vl, M, dl, k, j, Ht]
  ), La = X.useCallback(async () => {
    if (!vl || !dl) return;
    if (V.length === 0) {
      U("Nenhuma alteracao pendente para salvar.");
      return;
    }
    const N = [...V], H = {};
    for (const w of N)
      ul[w] && (H[w] = { ...ul[w] });
    Kl(!0);
    try {
      const w = [];
      for (const Il of N) {
        Zl((Al) => Af(Al, Il));
        try {
          await Ht(Il), w.push({ topicId: Il, ok: !0 });
        } catch (Al) {
          w.push({
            topicId: Il,
            ok: !1,
            message: Al?.message || "Falha ao salvar topico."
          });
        } finally {
          Zl((Al) => Nf(Al, Il));
        }
      }
      const zl = w.filter((Il) => Il.ok).length, ol = w.filter((Il) => !Il.ok);
      zl > 0 && (await k(), M(), ol.length > 0 && _l((Il) => {
        const Al = { ...Il };
        for (const Gu of ol) {
          const Xa = H[Gu.topicId];
          Xa && (Al[Gu.topicId] = Xa);
        }
        return Al;
      })), ol.length === 0 ? U(
        zl === 1 ? "1 topico salvo com sucesso." : `${zl} topicos salvos com sucesso.`
      ) : j(zl === 0 ? ol[0]?.message || "Falha ao salvar topicos." : `Salvos ${zl} topico(s); ${ol.length} com erro. Primeiro erro: ${ol[0]?.message || "Falha ao salvar."}`);
    } finally {
      Kl(!1);
    }
  }, [
    vl,
    V,
    ul,
    M,
    dl,
    k,
    j,
    Ht
  ]), Yu = X.useCallback(
    async (N) => {
      if (!vl || !dl) return;
      const w = D.find((ol) => ol.id === N)?.nome || N;
      if (window.confirm(
        `Deseja remover o tópico "${w}"? Esta ação não pode ser desfeita.`
      )) {
        Vl((ol) => Af(ol, N));
        try {
          await Kh(N), await k(), M(), U("Tópico removido com sucesso.");
        } catch (ol) {
          j(ol?.message || "Falha ao remover tópico.");
        } finally {
          Vl((ol) => Nf(ol, N));
        }
      }
    },
    [vl, M, dl, k, j, D]
  ), Xt = X.useCallback(() => {
    if (!vl || !dl) {
      j("Ative o modo edição para acrescentar tópicos.");
      return;
    }
    const N = sl !== qa ? sl : D[0]?.grupo || "COMMUNICATIONS & PUBLICATIONS";
    zt({
      nome: "",
      grupo: Ga(N),
      orcamentoProgramaBRL: "0",
      incluirNoResumo: !0,
      permitirLancamento: !Ya(N)
    }), Gl(!0);
  }, [vl, sl, dl, j, D]), Ie = X.useCallback(() => {
    Gl(!1);
  }, []), Qt = X.useCallback((N, H) => {
    zt((w) => {
      if (N === "grupo") {
        const zl = !Ya(H);
        return {
          ...w,
          grupo: H,
          permitirLancamento: zl ? w.permitirLancamento : !1
        };
      }
      return {
        ...w,
        [N]: H
      };
    });
  }, []), ni = X.useCallback(
    async (N) => {
      if (N.preventDefault(), !vl || !dl) {
        j("Ative o modo edição para salvar tópicos.");
        return;
      }
      const H = String(Rl.nome ?? "").trim(), w = _f(Rl.grupo), zl = ui(Rl.orcamentoProgramaBRL);
      if (!H) {
        j("Nome do tópico é obrigatório.");
        return;
      }
      if (!w) {
        j("Grupo do tópico é obrigatório.");
        return;
      }
      if (!Number.isFinite(zl) || zl < 0) {
        j("Orçamento inválido.");
        return;
      }
      Lt(!0);
      try {
        const ol = await Zh({
          nome: H,
          grupo: w,
          orcamentoProgramaBRL: zl,
          incluirNoResumo: !!Rl.incluirNoResumo,
          permitirLancamento: Ya(w) ? !1 : !!Rl.permitirLancamento
        });
        Cl(ol?.grupo || w), Gl(!1), await k(), M(), U("Tópico criado com sucesso.");
      } catch (ol) {
        j(ol?.message || "Falha ao criar tópico.");
      } finally {
        Lt(!1);
      }
    },
    [vl, M, dl, k, Rl, j]
  );
  return r ? /* @__PURE__ */ b.jsx(
    "div",
    {
      className: `config-react-scope rounded-2xl border p-6 ${x ? "border-slate-800/60 bg-slate-900/45 text-slate-300" : "border-slate-200 bg-white text-slate-700"}`,
      children: "Carregando configurações..."
    }
  ) : /* @__PURE__ */ b.jsxs("div", { className: `config-react-scope space-y-6 ${x ? "text-slate-200" : "text-slate-900"}`, children: [
    /* @__PURE__ */ b.jsx(
      wh,
      {
        canManageConfig: vl,
        isEditMode: dl,
        onToggleEditMode: () => ft((N) => !N),
        onOpenCreateModal: Xt,
        onToggleTheme: p,
        isDark: x
      }
    ),
    q ? /* @__PURE__ */ b.jsxs(
      "div",
      {
        className: `flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${x ? "border-rose-500/40 bg-rose-500/10 text-rose-200" : "border-rose-300 bg-rose-50 text-rose-700"}`,
        children: [
          /* @__PURE__ */ b.jsx(Gr, { size: 16, className: "mt-0.5 shrink-0" }),
          /* @__PURE__ */ b.jsx("span", { children: q })
        ]
      }
    ) : null,
    ll ? /* @__PURE__ */ b.jsx(
      "div",
      {
        className: `rounded-xl border px-4 py-3 text-sm ${x ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`,
        children: ll
      }
    ) : null,
    pt ? /* @__PURE__ */ b.jsxs(
      "div",
      {
        className: `rounded-2xl border p-5 shadow-xl ${x ? "border-slate-800/60 bg-slate-900/45" : "border-slate-200 bg-white"}`,
        children: [
          /* @__PURE__ */ b.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
            /* @__PURE__ */ b.jsx("h4", { className: "text-lg font-bold", children: "Novo tópico" }),
            /* @__PURE__ */ b.jsx(
              "button",
              {
                type: "button",
                onClick: Ie,
                className: `inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${x ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`,
                children: /* @__PURE__ */ b.jsx(Gh, { size: 16 })
              }
            )
          ] }),
          /* @__PURE__ */ b.jsxs("form", { className: "grid gap-3 md:grid-cols-2", onSubmit: ni, children: [
            /* @__PURE__ */ b.jsxs("label", { className: "flex flex-col gap-1 text-sm font-semibold", children: [
              "Nome do tópico",
              /* @__PURE__ */ b.jsx(
                "input",
                {
                  type: "text",
                  value: Rl.nome,
                  onChange: (N) => Qt("nome", N.target.value),
                  className: `rounded-lg border px-3 py-2 outline-none transition-all ${x ? "border-slate-700 bg-slate-950/45 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60" : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"}`,
                  required: !0
                }
              )
            ] }),
            /* @__PURE__ */ b.jsxs("label", { className: "flex flex-col gap-1 text-sm font-semibold", children: [
              "Grupo",
              /* @__PURE__ */ b.jsx(
                "input",
                {
                  type: "text",
                  value: Rl.grupo,
                  onChange: (N) => Qt("grupo", N.target.value),
                  list: "config-group-suggestions",
                  placeholder: "Ex.: Comunicação e Publicações",
                  className: `rounded-lg border px-3 py-2 outline-none transition-all ${x ? "border-slate-700 bg-slate-950/45 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60" : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"}`,
                  required: !0
                }
              )
            ] }),
            /* @__PURE__ */ b.jsxs("label", { className: "flex flex-col gap-1 text-sm font-semibold", children: [
              "Orçamento (BRL)",
              /* @__PURE__ */ b.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  step: "0.01",
                  value: Rl.orcamentoProgramaBRL,
                  onChange: (N) => Qt("orcamentoProgramaBRL", N.target.value),
                  className: `rounded-lg border px-3 py-2 outline-none transition-all ${x ? "border-slate-700 bg-slate-950/45 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/60" : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"}`
                }
              )
            ] }),
            /* @__PURE__ */ b.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2", children: [
              /* @__PURE__ */ b.jsxs("label", { className: "inline-flex items-center gap-2 text-sm font-semibold", children: [
                /* @__PURE__ */ b.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: Rl.incluirNoResumo,
                    onChange: (N) => Qt("incluirNoResumo", N.target.checked)
                  }
                ),
                "Incluir no resumo"
              ] }),
              /* @__PURE__ */ b.jsxs("label", { className: "inline-flex items-center gap-2 text-sm font-semibold", children: [
                /* @__PURE__ */ b.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: Rl.permitirLancamento,
                    onChange: (N) => Qt("permitirLancamento", N.target.checked),
                    disabled: Ya(Rl.grupo)
                  }
                ),
                "Lançamento ativo"
              ] })
            ] }),
            /* @__PURE__ */ b.jsxs("div", { className: "col-span-full flex justify-end gap-2 pt-1", children: [
              /* @__PURE__ */ b.jsx(
                "button",
                {
                  type: "button",
                  onClick: Ie,
                  className: `rounded-lg border px-4 py-2 text-sm font-semibold ${x ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`,
                  children: "Cancelar"
                }
              ),
              /* @__PURE__ */ b.jsx(
                "button",
                {
                  type: "submit",
                  disabled: st,
                  className: "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60",
                  children: st ? "Salvando..." : "Criar tópico"
                }
              )
            ] })
          ] })
        ]
      }
    ) : null,
    /* @__PURE__ */ b.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ b.jsx(
        $h,
        {
          filterGroup: sl,
          groups: o,
          onChangeFilter: Cl,
          isDark: x
        }
      ),
      /* @__PURE__ */ b.jsx(
        Wh,
        {
          totalBudget: R,
          formatCurrency: ny,
          filterLabel: sl === qa ? "Geral" : Z,
          isDark: x
        }
      )
    ] }),
    /* @__PURE__ */ b.jsx(
      ly,
      {
        filteredTopics: O,
        drafts: ul,
        filterLabel: Z,
        isEditMode: dl,
        canManageConfig: vl,
        isDark: x,
        savingIds: pl,
        deletingIds: St,
        isSavingAllTopics: F,
        pendingTotalCount: V.length,
        pendingVisibleCount: nl.length,
        getGroupLabel: Ga,
        groupSuggestions: A,
        onFieldChange: Jl,
        onToggleField: Ml,
        onSaveAllTopics: La,
        onSaveTopic: Fe,
        onDeleteTopic: Yu
      }
    ),
    /* @__PURE__ */ b.jsxs(
      "div",
      {
        className: `flex flex-col items-center justify-between gap-4 rounded-xl border px-4 py-3 text-xs font-semibold sm:flex-row ${x ? "border-slate-800/60 bg-slate-950/35 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"}`,
        children: [
          /* @__PURE__ */ b.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-500/90", children: [
            /* @__PURE__ */ b.jsx(Gr, { size: 14 }),
            /* @__PURE__ */ b.jsx("span", { children: "As alterações ficam pendentes até clicar em salvar." })
          ] }),
          /* @__PURE__ */ b.jsxs("span", { children: [
            "A mostrar ",
            O.length,
            " de ",
            D.length,
            " tópicos"
          ] })
        ]
      }
    )
  ] });
}
function cy(y = {}) {
  const x = y.root ?? document.getElementById("config-react-root");
  if (!x)
    throw new Error("Container da Config React nao encontrado.");
  const _ = gh.createRoot(x);
  return _.render(/* @__PURE__ */ b.jsx(iy, { onError: y.onError })), () => {
    _.unmount();
  };
}
export {
  cy as mountConfigApp
};
