#!/usr/bin/env node
/*! For license information please see minecraft-asset-reader.js.LICENSE.txt */
;(() => {
  var e = {
      9669: (e, t, r) => {
        e.exports = r(1609)
      },
      7970: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = r(6026),
          s = r(4097),
          i = r(5327),
          a = r(8605),
          u = r(7211),
          c = r(938).http,
          f = r(938).https,
          p = r(8835),
          l = r(8761),
          d = r(696),
          h = r(5061),
          m = r(481),
          g = /https:?/
        function y(e, t, r) {
          if (
            ((e.hostname = t.host),
            (e.host = t.host),
            (e.port = t.port),
            (e.path = r),
            t.auth)
          ) {
            var n = Buffer.from(
              t.auth.username + `:` + t.auth.password,
              `utf8`
            ).toString(`base64`)
            e.headers[`Proxy-Authorization`] = `Basic ` + n
          }
          e.beforeRedirect = function (e) {
            ;(e.headers.host = e.host), y(e, t, e.href)
          }
        }
        e.exports = function (e) {
          return new Promise(function (t, r) {
            var v = function (e) {
                t(e)
              },
              C = function (e) {
                r(e)
              },
              b = e.data,
              _ = e.headers
            if (
              (_[`User-Agent`] ||
                _[`user-agent`] ||
                (_[`User-Agent`] = `axios/` + d.version),
              b && !n.isStream(b))
            ) {
              if (Buffer.isBuffer(b));
              else if (n.isArrayBuffer(b)) b = Buffer.from(new Uint8Array(b))
              else {
                if (!n.isString(b))
                  return C(
                    h(
                      `Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream`,
                      e
                    )
                  )
                b = Buffer.from(b, `utf-8`)
              }
              _[`Content-Length`] = b.length
            }
            var x = void 0
            e.auth &&
              (x = (e.auth.username || ``) + `:` + (e.auth.password || ``))
            var w = s(e.baseURL, e.url),
              R = p.parse(w),
              E = R.protocol || `http:`
            if (!x && R.auth) {
              var O = R.auth.split(`:`)
              x = (O[0] || ``) + `:` + (O[1] || ``)
            }
            x && delete _.Authorization
            var j = g.test(E),
              F = j ? e.httpsAgent : e.httpAgent,
              k = {
                path: i(R.path, e.params, e.paramsSerializer).replace(
                  /^\?/,
                  ``
                ),
                method: e.method.toUpperCase(),
                headers: _,
                agent: F,
                agents: { http: e.httpAgent, https: e.httpsAgent },
                auth: x,
              }
            e.socketPath
              ? (k.socketPath = e.socketPath)
              : ((k.hostname = R.hostname), (k.port = R.port))
            var A,
              S = e.proxy
            if (!S && !1 !== S) {
              var T = E.slice(0, -1) + `_proxy`,
                B = process.env[T] || process.env[T.toUpperCase()]
              if (B) {
                var L = p.parse(B),
                  q = process.env.no_proxy || process.env.NO_PROXY,
                  N = !0
                if (
                  (q &&
                    (N = !q
                      .split(`,`)
                      .map(function (e) {
                        return e.trim()
                      })
                      .some(function (e) {
                        return (
                          !!e &&
                          (`*` === e ||
                            (`.` === e[0] &&
                              R.hostname.substr(
                                R.hostname.length - e.length
                              ) === e) ||
                            R.hostname === e)
                        )
                      })),
                  N &&
                    ((S = {
                      host: L.hostname,
                      port: L.port,
                      protocol: L.protocol,
                    }),
                    L.auth))
                ) {
                  var P = L.auth.split(`:`)
                  S.auth = { username: P[0], password: P[1] }
                }
              }
            }
            S &&
              ((k.headers.host = R.hostname + (R.port ? `:` + R.port : ``)),
              y(
                k,
                S,
                E + `//` + R.hostname + (R.port ? `:` + R.port : ``) + k.path
              ))
            var U = j && (!S || g.test(S.protocol))
            e.transport
              ? (A = e.transport)
              : 0 === e.maxRedirects
              ? (A = U ? u : a)
              : (e.maxRedirects && (k.maxRedirects = e.maxRedirects),
                (A = U ? f : c)),
              e.maxBodyLength > -1 && (k.maxBodyLength = e.maxBodyLength)
            var I = A.request(k, function (t) {
              if (!I.aborted) {
                var r = t,
                  s = t.req || I
                if (
                  204 !== t.statusCode &&
                  `HEAD` !== s.method &&
                  !1 !== e.decompress
                )
                  switch (t.headers[`content-encoding`]) {
                    case `gzip`:
                    case `compress`:
                    case `deflate`:
                      ;(r = r.pipe(l.createUnzip())),
                        delete t.headers[`content-encoding`]
                  }
                var i = {
                  status: t.statusCode,
                  statusText: t.statusMessage,
                  headers: t.headers,
                  config: e,
                  request: s,
                }
                if (`stream` === e.responseType) (i.data = r), o(v, C, i)
                else {
                  var a = []
                  r.on(`data`, function (t) {
                    a.push(t),
                      e.maxContentLength > -1 &&
                        Buffer.concat(a).length > e.maxContentLength &&
                        (r.destroy(),
                        C(
                          h(
                            `maxContentLength size of ` +
                              e.maxContentLength +
                              ` exceeded`,
                            e,
                            null,
                            s
                          )
                        ))
                  }),
                    r.on(`error`, function (t) {
                      I.aborted || C(m(t, e, null, s))
                    }),
                    r.on(`end`, function () {
                      var t = Buffer.concat(a)
                      `arraybuffer` !== e.responseType &&
                        ((t = t.toString(e.responseEncoding)),
                        (e.responseEncoding && `utf8` !== e.responseEncoding) ||
                          (t = n.stripBOM(t))),
                        (i.data = t),
                        o(v, C, i)
                    })
                }
              }
            })
            I.on(`error`, function (t) {
              ;(I.aborted && `ERR_FR_TOO_MANY_REDIRECTS` !== t.code) ||
                C(m(t, e, null, I))
            }),
              e.timeout &&
                I.setTimeout(e.timeout, function () {
                  I.abort(),
                    C(
                      h(
                        `timeout of ` + e.timeout + `ms exceeded`,
                        e,
                        `ECONNABORTED`,
                        I
                      )
                    )
                }),
              e.cancelToken &&
                e.cancelToken.promise.then(function (e) {
                  I.aborted || (I.abort(), C(e))
                }),
              n.isStream(b)
                ? b
                    .on(`error`, function (t) {
                      C(m(t, e, null, I))
                    })
                    .pipe(I)
                : I.end(b)
          })
        }
      },
      5448: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = r(6026),
          s = r(4372),
          i = r(5327),
          a = r(4097),
          u = r(4109),
          c = r(7985),
          f = r(5061)
        e.exports = function (e) {
          return new Promise(function (t, r) {
            var p = e.data,
              l = e.headers
            n.isFormData(p) && delete l[`Content-Type`]
            var d = new XMLHttpRequest()
            if (e.auth) {
              var h = e.auth.username || ``,
                m = e.auth.password
                  ? unescape(encodeURIComponent(e.auth.password))
                  : ``
              l.Authorization = `Basic ` + btoa(h + `:` + m)
            }
            var g = a(e.baseURL, e.url)
            if (
              (d.open(
                e.method.toUpperCase(),
                i(g, e.params, e.paramsSerializer),
                !0
              ),
              (d.timeout = e.timeout),
              (d.onreadystatechange = function () {
                if (
                  d &&
                  4 === d.readyState &&
                  (0 !== d.status ||
                    (d.responseURL && 0 === d.responseURL.indexOf(`file:`)))
                ) {
                  var n =
                      `getAllResponseHeaders` in d
                        ? u(d.getAllResponseHeaders())
                        : null,
                    s = {
                      data:
                        e.responseType && `text` !== e.responseType
                          ? d.response
                          : d.responseText,
                      status: d.status,
                      statusText: d.statusText,
                      headers: n,
                      config: e,
                      request: d,
                    }
                  o(t, r, s), (d = null)
                }
              }),
              (d.onabort = function () {
                d && (r(f(`Request aborted`, e, `ECONNABORTED`, d)), (d = null))
              }),
              (d.onerror = function () {
                r(f(`Network Error`, e, null, d)), (d = null)
              }),
              (d.ontimeout = function () {
                var t = `timeout of ` + e.timeout + `ms exceeded`
                e.timeoutErrorMessage && (t = e.timeoutErrorMessage),
                  r(f(t, e, `ECONNABORTED`, d)),
                  (d = null)
              }),
              n.isStandardBrowserEnv())
            ) {
              var y =
                (e.withCredentials || c(g)) && e.xsrfCookieName
                  ? s.read(e.xsrfCookieName)
                  : void 0
              y && (l[e.xsrfHeaderName] = y)
            }
            if (
              (`setRequestHeader` in d &&
                n.forEach(l, function (e, t) {
                  void 0 === p && `content-type` === t.toLowerCase()
                    ? delete l[t]
                    : d.setRequestHeader(t, e)
                }),
              n.isUndefined(e.withCredentials) ||
                (d.withCredentials = !!e.withCredentials),
              e.responseType)
            )
              try {
                d.responseType = e.responseType
              } catch (t) {
                if (`json` !== e.responseType) throw t
              }
            `function` == typeof e.onDownloadProgress &&
              d.addEventListener(`progress`, e.onDownloadProgress),
              `function` == typeof e.onUploadProgress &&
                d.upload &&
                d.upload.addEventListener(`progress`, e.onUploadProgress),
              e.cancelToken &&
                e.cancelToken.promise.then(function (e) {
                  d && (d.abort(), r(e), (d = null))
                }),
              p || (p = null),
              d.send(p)
          })
        }
      },
      1609: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = r(1849),
          s = r(321),
          i = r(7185)
        function a(e) {
          var t = new s(e),
            r = o(s.prototype.request, t)
          return n.extend(r, s.prototype, t), n.extend(r, t), r
        }
        var u = a(r(5655))
        ;(u.Axios = s),
          (u.create = function (e) {
            return a(i(u.defaults, e))
          }),
          (u.Cancel = r(5263)),
          (u.CancelToken = r(4972)),
          (u.isCancel = r(6502)),
          (u.all = function (e) {
            return Promise.all(e)
          }),
          (u.spread = r(8713)),
          (u.isAxiosError = r(6268)),
          (e.exports = u),
          (e.exports.default = u)
      },
      5263: (e) => {
        "use strict"
        function t(e) {
          this.message = e
        }
        ;(t.prototype.toString = function () {
          return `Cancel` + (this.message ? `: ` + this.message : ``)
        }),
          (t.prototype.__CANCEL__ = !0),
          (e.exports = t)
      },
      4972: (e, t, r) => {
        "use strict"
        var n = r(5263)
        function o(e) {
          if (`function` != typeof e)
            throw new TypeError(`executor must be a function.`)
          var t
          this.promise = new Promise(function (e) {
            t = e
          })
          var r = this
          e(function (e) {
            r.reason || ((r.reason = new n(e)), t(r.reason))
          })
        }
        ;(o.prototype.throwIfRequested = function () {
          if (this.reason) throw this.reason
        }),
          (o.source = function () {
            var e
            return {
              token: new o(function (t) {
                e = t
              }),
              cancel: e,
            }
          }),
          (e.exports = o)
      },
      6502: (e) => {
        "use strict"
        e.exports = function (e) {
          return !(!e || !e.__CANCEL__)
        }
      },
      321: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = r(5327),
          s = r(782),
          i = r(3572),
          a = r(7185)
        function u(e) {
          ;(this.defaults = e),
            (this.interceptors = { request: new s(), response: new s() })
        }
        ;(u.prototype.request = function (e) {
          `string` == typeof e
            ? ((e = arguments[1] || {}).url = arguments[0])
            : (e = e || {}),
            (e = a(this.defaults, e)).method
              ? (e.method = e.method.toLowerCase())
              : this.defaults.method
              ? (e.method = this.defaults.method.toLowerCase())
              : (e.method = `get`)
          var t = [i, void 0],
            r = Promise.resolve(e)
          for (
            this.interceptors.request.forEach(function (e) {
              t.unshift(e.fulfilled, e.rejected)
            }),
              this.interceptors.response.forEach(function (e) {
                t.push(e.fulfilled, e.rejected)
              });
            t.length;

          )
            r = r.then(t.shift(), t.shift())
          return r
        }),
          (u.prototype.getUri = function (e) {
            return (
              (e = a(this.defaults, e)),
              o(e.url, e.params, e.paramsSerializer).replace(/^\?/, ``)
            )
          }),
          n.forEach([`delete`, `get`, `head`, `options`], function (e) {
            u.prototype[e] = function (t, r) {
              return this.request(
                a(r || {}, { method: e, url: t, data: (r || {}).data })
              )
            }
          }),
          n.forEach([`post`, `put`, `patch`], function (e) {
            u.prototype[e] = function (t, r, n) {
              return this.request(a(n || {}, { method: e, url: t, data: r }))
            }
          }),
          (e.exports = u)
      },
      782: (e, t, r) => {
        "use strict"
        var n = r(4867)
        function o() {
          this.handlers = []
        }
        ;(o.prototype.use = function (e, t) {
          return (
            this.handlers.push({ fulfilled: e, rejected: t }),
            this.handlers.length - 1
          )
        }),
          (o.prototype.eject = function (e) {
            this.handlers[e] && (this.handlers[e] = null)
          }),
          (o.prototype.forEach = function (e) {
            n.forEach(this.handlers, function (t) {
              null !== t && e(t)
            })
          }),
          (e.exports = o)
      },
      4097: (e, t, r) => {
        "use strict"
        var n = r(1793),
          o = r(7303)
        e.exports = function (e, t) {
          return e && !n(t) ? o(e, t) : t
        }
      },
      5061: (e, t, r) => {
        "use strict"
        var n = r(481)
        e.exports = function (e, t, r, o, s) {
          var i = new Error(e)
          return n(i, t, r, o, s)
        }
      },
      3572: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = r(8527),
          s = r(6502),
          i = r(5655)
        function a(e) {
          e.cancelToken && e.cancelToken.throwIfRequested()
        }
        e.exports = function (e) {
          return (
            a(e),
            (e.headers = e.headers || {}),
            (e.data = o(e.data, e.headers, e.transformRequest)),
            (e.headers = n.merge(
              e.headers.common || {},
              e.headers[e.method] || {},
              e.headers
            )),
            n.forEach(
              [`delete`, `get`, `head`, `post`, `put`, `patch`, `common`],
              function (t) {
                delete e.headers[t]
              }
            ),
            (e.adapter || i.adapter)(e).then(
              function (t) {
                return (
                  a(e), (t.data = o(t.data, t.headers, e.transformResponse)), t
                )
              },
              function (t) {
                return (
                  s(t) ||
                    (a(e),
                    t &&
                      t.response &&
                      (t.response.data = o(
                        t.response.data,
                        t.response.headers,
                        e.transformResponse
                      ))),
                  Promise.reject(t)
                )
              }
            )
          )
        }
      },
      481: (e) => {
        "use strict"
        e.exports = function (e, t, r, n, o) {
          return (
            (e.config = t),
            r && (e.code = r),
            (e.request = n),
            (e.response = o),
            (e.isAxiosError = !0),
            (e.toJSON = function () {
              return {
                message: this.message,
                name: this.name,
                description: this.description,
                number: this.number,
                fileName: this.fileName,
                lineNumber: this.lineNumber,
                columnNumber: this.columnNumber,
                stack: this.stack,
                config: this.config,
                code: this.code,
              }
            }),
            e
          )
        }
      },
      7185: (e, t, r) => {
        "use strict"
        var n = r(4867)
        e.exports = function (e, t) {
          t = t || {}
          var r = {},
            o = [`url`, `method`, `data`],
            s = [`headers`, `auth`, `proxy`, `params`],
            i = [
              `baseURL`,
              `transformRequest`,
              `transformResponse`,
              `paramsSerializer`,
              `timeout`,
              `timeoutMessage`,
              `withCredentials`,
              `adapter`,
              `responseType`,
              `xsrfCookieName`,
              `xsrfHeaderName`,
              `onUploadProgress`,
              `onDownloadProgress`,
              `decompress`,
              `maxContentLength`,
              `maxBodyLength`,
              `maxRedirects`,
              `transport`,
              `httpAgent`,
              `httpsAgent`,
              `cancelToken`,
              `socketPath`,
              `responseEncoding`,
            ],
            a = [`validateStatus`]
          function u(e, t) {
            return n.isPlainObject(e) && n.isPlainObject(t)
              ? n.merge(e, t)
              : n.isPlainObject(t)
              ? n.merge({}, t)
              : n.isArray(t)
              ? t.slice()
              : t
          }
          function c(o) {
            n.isUndefined(t[o])
              ? n.isUndefined(e[o]) || (r[o] = u(void 0, e[o]))
              : (r[o] = u(e[o], t[o]))
          }
          n.forEach(o, function (e) {
            n.isUndefined(t[e]) || (r[e] = u(void 0, t[e]))
          }),
            n.forEach(s, c),
            n.forEach(i, function (o) {
              n.isUndefined(t[o])
                ? n.isUndefined(e[o]) || (r[o] = u(void 0, e[o]))
                : (r[o] = u(void 0, t[o]))
            }),
            n.forEach(a, function (n) {
              n in t
                ? (r[n] = u(e[n], t[n]))
                : n in e && (r[n] = u(void 0, e[n]))
            })
          var f = o.concat(s).concat(i).concat(a),
            p = Object.keys(e)
              .concat(Object.keys(t))
              .filter(function (e) {
                return -1 === f.indexOf(e)
              })
          return n.forEach(p, c), r
        }
      },
      6026: (e, t, r) => {
        "use strict"
        var n = r(5061)
        e.exports = function (e, t, r) {
          var o = r.config.validateStatus
          r.status && o && !o(r.status)
            ? t(
                n(
                  `Request failed with status code ` + r.status,
                  r.config,
                  null,
                  r.request,
                  r
                )
              )
            : e(r)
        }
      },
      8527: (e, t, r) => {
        "use strict"
        var n = r(4867)
        e.exports = function (e, t, r) {
          return (
            n.forEach(r, function (r) {
              e = r(e, t)
            }),
            e
          )
        }
      },
      5655: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = r(6016),
          s = { "Content-Type": `application/x-www-form-urlencoded` }
        function i(e, t) {
          !n.isUndefined(e) &&
            n.isUndefined(e[`Content-Type`]) &&
            (e[`Content-Type`] = t)
        }
        var a,
          u = {
            adapter:
              (`undefined` != typeof XMLHttpRequest
                ? (a = r(5448))
                : `undefined` != typeof process &&
                  `[object process]` ===
                    Object.prototype.toString.call(process) &&
                  (a = r(7970)),
              a),
            transformRequest: [
              function (e, t) {
                return (
                  o(t, `Accept`),
                  o(t, `Content-Type`),
                  n.isFormData(e) ||
                  n.isArrayBuffer(e) ||
                  n.isBuffer(e) ||
                  n.isStream(e) ||
                  n.isFile(e) ||
                  n.isBlob(e)
                    ? e
                    : n.isArrayBufferView(e)
                    ? e.buffer
                    : n.isURLSearchParams(e)
                    ? (i(t, `application/x-www-form-urlencoded;charset=utf-8`),
                      e.toString())
                    : n.isObject(e)
                    ? (i(t, `application/json;charset=utf-8`),
                      JSON.stringify(e))
                    : e
                )
              },
            ],
            transformResponse: [
              function (e) {
                if (`string` == typeof e)
                  try {
                    e = JSON.parse(e)
                  } catch (e) {}
                return e
              },
            ],
            timeout: 0,
            xsrfCookieName: `XSRF-TOKEN`,
            xsrfHeaderName: `X-XSRF-TOKEN`,
            maxContentLength: -1,
            maxBodyLength: -1,
            validateStatus: function (e) {
              return e >= 200 && e < 300
            },
            headers: {
              common: { Accept: `application/json, text/plain, */*` },
            },
          }
        n.forEach([`delete`, `get`, `head`], function (e) {
          u.headers[e] = {}
        }),
          n.forEach([`post`, `put`, `patch`], function (e) {
            u.headers[e] = n.merge(s)
          }),
          (e.exports = u)
      },
      1849: (e) => {
        "use strict"
        e.exports = function (e, t) {
          return function () {
            for (var r = new Array(arguments.length), n = 0; n < r.length; n++)
              r[n] = arguments[n]
            return e.apply(t, r)
          }
        }
      },
      5327: (e, t, r) => {
        "use strict"
        var n = r(4867)
        function o(e) {
          return encodeURIComponent(e)
            .replace(/%3A/gi, `:`)
            .replace(/%24/g, `$`)
            .replace(/%2C/gi, `,`)
            .replace(/%20/g, `+`)
            .replace(/%5B/gi, `[`)
            .replace(/%5D/gi, `]`)
        }
        e.exports = function (e, t, r) {
          if (!t) return e
          var s
          if (r) s = r(t)
          else if (n.isURLSearchParams(t)) s = t.toString()
          else {
            var i = []
            n.forEach(t, function (e, t) {
              null != e &&
                (n.isArray(e) ? (t += `[]`) : (e = [e]),
                n.forEach(e, function (e) {
                  n.isDate(e)
                    ? (e = e.toISOString())
                    : n.isObject(e) && (e = JSON.stringify(e)),
                    i.push(o(t) + `=` + o(e))
                }))
            }),
              (s = i.join(`&`))
          }
          if (s) {
            var a = e.indexOf(`#`)
            ;-1 !== a && (e = e.slice(0, a)),
              (e += (-1 === e.indexOf(`?`) ? `?` : `&`) + s)
          }
          return e
        }
      },
      7303: (e) => {
        "use strict"
        e.exports = function (e, t) {
          return t ? e.replace(/\/+$/, ``) + `/` + t.replace(/^\/+/, ``) : e
        }
      },
      4372: (e, t, r) => {
        "use strict"
        var n = r(4867)
        e.exports = n.isStandardBrowserEnv()
          ? {
              write: function (e, t, r, o, s, i) {
                var a = []
                a.push(e + `=` + encodeURIComponent(t)),
                  n.isNumber(r) &&
                    a.push(`expires=` + new Date(r).toGMTString()),
                  n.isString(o) && a.push(`path=` + o),
                  n.isString(s) && a.push(`domain=` + s),
                  !0 === i && a.push(`secure`),
                  (document.cookie = a.join(`; `))
              },
              read: function (e) {
                var t = document.cookie.match(
                  new RegExp(`(^|;\\s*)(` + e + `)=([^;]*)`)
                )
                return t ? decodeURIComponent(t[3]) : null
              },
              remove: function (e) {
                this.write(e, ``, Date.now() - 864e5)
              },
            }
          : {
              write: function () {},
              read: function () {
                return null
              },
              remove: function () {},
            }
      },
      1793: (e) => {
        "use strict"
        e.exports = function (e) {
          return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(e)
        }
      },
      6268: (e) => {
        "use strict"
        e.exports = function (e) {
          return `object` == typeof e && !0 === e.isAxiosError
        }
      },
      7985: (e, t, r) => {
        "use strict"
        var n = r(4867)
        e.exports = n.isStandardBrowserEnv()
          ? (function () {
              var e,
                t = /(msie|trident)/i.test(navigator.userAgent),
                r = document.createElement(`a`)
              function o(e) {
                var n = e
                return (
                  t && (r.setAttribute(`href`, n), (n = r.href)),
                  r.setAttribute(`href`, n),
                  {
                    href: r.href,
                    protocol: r.protocol ? r.protocol.replace(/:$/, ``) : ``,
                    host: r.host,
                    search: r.search ? r.search.replace(/^\?/, ``) : ``,
                    hash: r.hash ? r.hash.replace(/^#/, ``) : ``,
                    hostname: r.hostname,
                    port: r.port,
                    pathname:
                      `/` === r.pathname.charAt(0)
                        ? r.pathname
                        : `/` + r.pathname,
                  }
                )
              }
              return (
                (e = o(window.location.href)),
                function (t) {
                  var r = n.isString(t) ? o(t) : t
                  return r.protocol === e.protocol && r.host === e.host
                }
              )
            })()
          : function () {
              return !0
            }
      },
      6016: (e, t, r) => {
        "use strict"
        var n = r(4867)
        e.exports = function (e, t) {
          n.forEach(e, function (r, n) {
            n !== t &&
              n.toUpperCase() === t.toUpperCase() &&
              ((e[t] = r), delete e[n])
          })
        }
      },
      4109: (e, t, r) => {
        "use strict"
        var n = r(4867),
          o = [
            `age`,
            `authorization`,
            `content-length`,
            `content-type`,
            `etag`,
            `expires`,
            `from`,
            `host`,
            `if-modified-since`,
            `if-unmodified-since`,
            `last-modified`,
            `location`,
            `max-forwards`,
            `proxy-authorization`,
            `referer`,
            `retry-after`,
            `user-agent`,
          ]
        e.exports = function (e) {
          var t,
            r,
            s,
            i = {}
          return e
            ? (n.forEach(e.split(`\n`), function (e) {
                if (
                  ((s = e.indexOf(`:`)),
                  (t = n.trim(e.substr(0, s)).toLowerCase()),
                  (r = n.trim(e.substr(s + 1))),
                  t)
                ) {
                  if (i[t] && o.indexOf(t) >= 0) return
                  i[t] =
                    `set-cookie` === t
                      ? (i[t] ? i[t] : []).concat([r])
                      : i[t]
                      ? i[t] + `, ` + r
                      : r
                }
              }),
              i)
            : i
        }
      },
      8713: (e) => {
        "use strict"
        e.exports = function (e) {
          return function (t) {
            return e.apply(null, t)
          }
        }
      },
      4867: (e, t, r) => {
        "use strict"
        var n = r(1849),
          o = Object.prototype.toString
        function s(e) {
          return `[object Array]` === o.call(e)
        }
        function i(e) {
          return void 0 === e
        }
        function a(e) {
          return null !== e && `object` == typeof e
        }
        function u(e) {
          if (`[object Object]` !== o.call(e)) return !1
          var t = Object.getPrototypeOf(e)
          return null === t || t === Object.prototype
        }
        function c(e) {
          return `[object Function]` === o.call(e)
        }
        function f(e, t) {
          if (null != e)
            if ((`object` != typeof e && (e = [e]), s(e)))
              for (var r = 0, n = e.length; r < n; r++) t.call(null, e[r], r, e)
            else
              for (var o in e)
                Object.prototype.hasOwnProperty.call(e, o) &&
                  t.call(null, e[o], o, e)
        }
        e.exports = {
          isArray: s,
          isArrayBuffer: function (e) {
            return `[object ArrayBuffer]` === o.call(e)
          },
          isBuffer: function (e) {
            return (
              null !== e &&
              !i(e) &&
              null !== e.constructor &&
              !i(e.constructor) &&
              `function` == typeof e.constructor.isBuffer &&
              e.constructor.isBuffer(e)
            )
          },
          isFormData: function (e) {
            return `undefined` != typeof FormData && e instanceof FormData
          },
          isArrayBufferView: function (e) {
            return `undefined` != typeof ArrayBuffer && ArrayBuffer.isView
              ? ArrayBuffer.isView(e)
              : e && e.buffer && e.buffer instanceof ArrayBuffer
          },
          isString: function (e) {
            return `string` == typeof e
          },
          isNumber: function (e) {
            return `number` == typeof e
          },
          isObject: a,
          isPlainObject: u,
          isUndefined: i,
          isDate: function (e) {
            return `[object Date]` === o.call(e)
          },
          isFile: function (e) {
            return `[object File]` === o.call(e)
          },
          isBlob: function (e) {
            return `[object Blob]` === o.call(e)
          },
          isFunction: c,
          isStream: function (e) {
            return a(e) && c(e.pipe)
          },
          isURLSearchParams: function (e) {
            return (
              `undefined` != typeof URLSearchParams &&
              e instanceof URLSearchParams
            )
          },
          isStandardBrowserEnv: function () {
            return (
              (`undefined` == typeof navigator ||
                (`ReactNative` !== navigator.product &&
                  `NativeScript` !== navigator.product &&
                  `NS` !== navigator.product)) &&
              `undefined` != typeof window &&
              `undefined` != typeof document
            )
          },
          forEach: f,
          merge: function e() {
            var t = {}
            function r(r, n) {
              u(t[n]) && u(r)
                ? (t[n] = e(t[n], r))
                : u(r)
                ? (t[n] = e({}, r))
                : s(r)
                ? (t[n] = r.slice())
                : (t[n] = r)
            }
            for (var n = 0, o = arguments.length; n < o; n++) f(arguments[n], r)
            return t
          },
          extend: function (e, t, r) {
            return (
              f(t, function (t, o) {
                e[o] = r && `function` == typeof t ? n(t, r) : t
              }),
              e
            )
          },
          trim: function (e) {
            return e.replace(/^\s*/, ``).replace(/\s*$/, ``)
          },
          stripBOM: function (e) {
            return 65279 === e.charCodeAt(0) && (e = e.slice(1)), e
          },
        }
      },
      696: (e) => {
        "use strict"
        e.exports = JSON.parse(
          `{"name":"axios","version":"0.21.1","description":"Promise based HTTP client for the browser and node.js","main":"index.js","scripts":{"test":"grunt test && bundlesize","start":"node ./sandbox/server.js","build":"NODE_ENV=production grunt build","preversion":"npm test","version":"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json","postversion":"git push && git push --tags","examples":"node ./examples/server.js","coveralls":"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js","fix":"eslint --fix lib/**/*.js"},"repository":{"type":"git","url":"https://github.com/axios/axios.git"},"keywords":["xhr","http","ajax","promise","node"],"author":"Matt Zabriskie","license":"MIT","bugs":{"url":"https://github.com/axios/axios/issues"},"homepage":"https://github.com/axios/axios","devDependencies":{"bundlesize":"^0.17.0","coveralls":"^3.0.0","es6-promise":"^4.2.4","grunt":"^1.0.2","grunt-banner":"^0.6.0","grunt-cli":"^1.2.0","grunt-contrib-clean":"^1.1.0","grunt-contrib-watch":"^1.0.0","grunt-eslint":"^20.1.0","grunt-karma":"^2.0.0","grunt-mocha-test":"^0.13.3","grunt-ts":"^6.0.0-beta.19","grunt-webpack":"^1.0.18","istanbul-instrumenter-loader":"^1.0.0","jasmine-core":"^2.4.1","karma":"^1.3.0","karma-chrome-launcher":"^2.2.0","karma-coverage":"^1.1.1","karma-firefox-launcher":"^1.1.0","karma-jasmine":"^1.1.1","karma-jasmine-ajax":"^0.1.13","karma-opera-launcher":"^1.0.0","karma-safari-launcher":"^1.0.0","karma-sauce-launcher":"^1.2.0","karma-sinon":"^1.0.5","karma-sourcemap-loader":"^0.3.7","karma-webpack":"^1.7.0","load-grunt-tasks":"^3.5.2","minimist":"^1.2.0","mocha":"^5.2.0","sinon":"^4.5.0","typescript":"^2.8.1","url-search-params":"^0.10.0","webpack":"^1.13.1","webpack-dev-server":"^1.14.1"},"browser":{"./lib/adapters/http.js":"./lib/adapters/xhr.js"},"jsdelivr":"dist/axios.min.js","unpkg":"dist/axios.min.js","typings":"./index.d.ts","dependencies":{"follow-redirects":"^1.10.0"},"bundlesize":[{"path":"./dist/axios.min.js","threshold":"5kB"}]}`
        )
      },
      9435: (e) => {
        var t = 1e3,
          r = 60 * t,
          n = 60 * r,
          o = 24 * n
        function s(e, t, r, n) {
          var o = t >= 1.5 * r
          return Math.round(e / r) + ` ` + n + (o ? `s` : ``)
        }
        e.exports = function (e, i) {
          i = i || {}
          var a,
            u,
            c = typeof e
          if (`string` === c && e.length > 0)
            return (function (e) {
              if (!((e = String(e)).length > 100)) {
                var s = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
                  e
                )
                if (s) {
                  var i = parseFloat(s[1])
                  switch ((s[2] || `ms`).toLowerCase()) {
                    case `years`:
                    case `year`:
                    case `yrs`:
                    case `yr`:
                    case `y`:
                      return 315576e5 * i
                    case `weeks`:
                    case `week`:
                    case `w`:
                      return 6048e5 * i
                    case `days`:
                    case `day`:
                    case `d`:
                      return i * o
                    case `hours`:
                    case `hour`:
                    case `hrs`:
                    case `hr`:
                    case `h`:
                      return i * n
                    case `minutes`:
                    case `minute`:
                    case `mins`:
                    case `min`:
                    case `m`:
                      return i * r
                    case `seconds`:
                    case `second`:
                    case `secs`:
                    case `sec`:
                    case `s`:
                      return i * t
                    case `milliseconds`:
                    case `millisecond`:
                    case `msecs`:
                    case `msec`:
                    case `ms`:
                      return i
                    default:
                      return
                  }
                }
              }
            })(e)
          if (`number` === c && isFinite(e))
            return i.long
              ? ((a = e),
                (u = Math.abs(a)) >= o
                  ? s(a, u, o, `day`)
                  : u >= n
                  ? s(a, u, n, `hour`)
                  : u >= r
                  ? s(a, u, r, `minute`)
                  : u >= t
                  ? s(a, u, t, `second`)
                  : a + ` ms`)
              : (function (e) {
                  var s = Math.abs(e)
                  return s >= o
                    ? Math.round(e / o) + `d`
                    : s >= n
                    ? Math.round(e / n) + `h`
                    : s >= r
                    ? Math.round(e / r) + `m`
                    : s >= t
                    ? Math.round(e / t) + `s`
                    : e + `ms`
                })(e)
          throw new Error(
            `val is not a non-empty string or a valid number. val=` +
              JSON.stringify(e)
          )
        }
      },
      1227: (e, t, r) => {
        ;(t.formatArgs = function (t) {
          if (
            ((t[0] =
              (this.useColors ? `%c` : ``) +
              this.namespace +
              (this.useColors ? ` %c` : ` `) +
              t[0] +
              (this.useColors ? `%c ` : ` `) +
              `+` +
              e.exports.humanize(this.diff)),
            !this.useColors)
          )
            return
          const r = `color: ` + this.color
          t.splice(1, 0, r, `color: inherit`)
          let n = 0,
            o = 0
          t[0].replace(/%[a-zA-Z%]/g, (e) => {
            `%%` !== e && (n++, `%c` === e && (o = n))
          }),
            t.splice(o, 0, r)
        }),
          (t.save = function (e) {
            try {
              e ? t.storage.setItem(`debug`, e) : t.storage.removeItem(`debug`)
            } catch (e) {}
          }),
          (t.load = function () {
            let e
            try {
              e = t.storage.getItem(`debug`)
            } catch (e) {}
            return (
              !e &&
                `undefined` != typeof process &&
                `env` in process &&
                (e = process.env.DEBUG),
              e
            )
          }),
          (t.useColors = function () {
            return (
              !(
                `undefined` == typeof window ||
                !window.process ||
                (`renderer` !== window.process.type && !window.process.__nwjs)
              ) ||
              ((`undefined` == typeof navigator ||
                !navigator.userAgent ||
                !navigator.userAgent
                  .toLowerCase()
                  .match(/(edge|trident)\/(\d+)/)) &&
                ((`undefined` != typeof document &&
                  document.documentElement &&
                  document.documentElement.style &&
                  document.documentElement.style.WebkitAppearance) ||
                  (`undefined` != typeof window &&
                    window.console &&
                    (window.console.firebug ||
                      (window.console.exception && window.console.table))) ||
                  (`undefined` != typeof navigator &&
                    navigator.userAgent &&
                    navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) &&
                    parseInt(RegExp.$1, 10) >= 31) ||
                  (`undefined` != typeof navigator &&
                    navigator.userAgent &&
                    navigator.userAgent
                      .toLowerCase()
                      .match(/applewebkit\/(\d+)/))))
            )
          }),
          (t.storage = (function () {
            try {
              return localStorage
            } catch (e) {}
          })()),
          (t.destroy = (() => {
            let e = !1
            return () => {
              e ||
                ((e = !0),
                console.warn(
                  `Instance method \`debug.destroy()\` is deprecated and no longer does anything. It will be removed in the next major version of \`debug\`.`
                ))
            }
          })()),
          (t.colors = [
            `#0000CC`,
            `#0000FF`,
            `#0033CC`,
            `#0033FF`,
            `#0066CC`,
            `#0066FF`,
            `#0099CC`,
            `#0099FF`,
            `#00CC00`,
            `#00CC33`,
            `#00CC66`,
            `#00CC99`,
            `#00CCCC`,
            `#00CCFF`,
            `#3300CC`,
            `#3300FF`,
            `#3333CC`,
            `#3333FF`,
            `#3366CC`,
            `#3366FF`,
            `#3399CC`,
            `#3399FF`,
            `#33CC00`,
            `#33CC33`,
            `#33CC66`,
            `#33CC99`,
            `#33CCCC`,
            `#33CCFF`,
            `#6600CC`,
            `#6600FF`,
            `#6633CC`,
            `#6633FF`,
            `#66CC00`,
            `#66CC33`,
            `#9900CC`,
            `#9900FF`,
            `#9933CC`,
            `#9933FF`,
            `#99CC00`,
            `#99CC33`,
            `#CC0000`,
            `#CC0033`,
            `#CC0066`,
            `#CC0099`,
            `#CC00CC`,
            `#CC00FF`,
            `#CC3300`,
            `#CC3333`,
            `#CC3366`,
            `#CC3399`,
            `#CC33CC`,
            `#CC33FF`,
            `#CC6600`,
            `#CC6633`,
            `#CC9900`,
            `#CC9933`,
            `#CCCC00`,
            `#CCCC33`,
            `#FF0000`,
            `#FF0033`,
            `#FF0066`,
            `#FF0099`,
            `#FF00CC`,
            `#FF00FF`,
            `#FF3300`,
            `#FF3333`,
            `#FF3366`,
            `#FF3399`,
            `#FF33CC`,
            `#FF33FF`,
            `#FF6600`,
            `#FF6633`,
            `#FF9900`,
            `#FF9933`,
            `#FFCC00`,
            `#FFCC33`,
          ]),
          (t.log = console.debug || console.log || (() => {})),
          (e.exports = r(2447)(t))
        const { formatters: n } = e.exports
        n.j = function (e) {
          try {
            return JSON.stringify(e)
          } catch (e) {
            return `[UnexpectedJSONParseError]: ` + e.message
          }
        }
      },
      2447: (e, t, r) => {
        e.exports = function (e) {
          function t(e) {
            let r,
              o = null
            function s(...e) {
              if (!s.enabled) return
              const n = s,
                o = Number(new Date()),
                i = o - (r || o)
              ;(n.diff = i),
                (n.prev = r),
                (n.curr = o),
                (r = o),
                (e[0] = t.coerce(e[0])),
                `string` != typeof e[0] && e.unshift(`%O`)
              let a = 0
              ;(e[0] = e[0].replace(/%([a-zA-Z%])/g, (r, o) => {
                if (`%%` === r) return `%`
                a++
                const s = t.formatters[o]
                if (`function` == typeof s) {
                  const t = e[a]
                  ;(r = s.call(n, t)), e.splice(a, 1), a--
                }
                return r
              })),
                t.formatArgs.call(n, e),
                (n.log || t.log).apply(n, e)
            }
            return (
              (s.namespace = e),
              (s.useColors = t.useColors()),
              (s.color = t.selectColor(e)),
              (s.extend = n),
              (s.destroy = t.destroy),
              Object.defineProperty(s, `enabled`, {
                enumerable: !0,
                configurable: !1,
                get: () => (null === o ? t.enabled(e) : o),
                set: (e) => {
                  o = e
                },
              }),
              `function` == typeof t.init && t.init(s),
              s
            )
          }
          function n(e, r) {
            const n = t(this.namespace + (void 0 === r ? `:` : r) + e)
            return (n.log = this.log), n
          }
          function o(e) {
            return e
              .toString()
              .substring(2, e.toString().length - 2)
              .replace(/\.\*\?$/, `*`)
          }
          return (
            (t.debug = t),
            (t.default = t),
            (t.coerce = function (e) {
              return e instanceof Error ? e.stack || e.message : e
            }),
            (t.disable = function () {
              const e = [
                ...t.names.map(o),
                ...t.skips.map(o).map((e) => `-` + e),
              ].join(`,`)
              return t.enable(``), e
            }),
            (t.enable = function (e) {
              let r
              t.save(e), (t.names = []), (t.skips = [])
              const n = (`string` == typeof e ? e : ``).split(/[\s,]+/),
                o = n.length
              for (r = 0; r < o; r++)
                n[r] &&
                  (`-` === (e = n[r].replace(/\*/g, `.*?`))[0]
                    ? t.skips.push(new RegExp(`^` + e.substr(1) + `$`))
                    : t.names.push(new RegExp(`^` + e + `$`)))
            }),
            (t.enabled = function (e) {
              if (`*` === e[e.length - 1]) return !0
              let r, n
              for (r = 0, n = t.skips.length; r < n; r++)
                if (t.skips[r].test(e)) return !1
              for (r = 0, n = t.names.length; r < n; r++)
                if (t.names[r].test(e)) return !0
              return !1
            }),
            (t.humanize = r(9435)),
            (t.destroy = function () {
              console.warn(
                `Instance method \`debug.destroy()\` is deprecated and no longer does anything. It will be removed in the next major version of \`debug\`.`
              )
            }),
            Object.keys(e).forEach((r) => {
              t[r] = e[r]
            }),
            (t.names = []),
            (t.skips = []),
            (t.formatters = {}),
            (t.selectColor = function (e) {
              let r = 0
              for (let t = 0; t < e.length; t++)
                (r = (r << 5) - r + e.charCodeAt(t)), (r |= 0)
              return t.colors[Math.abs(r) % t.colors.length]
            }),
            t.enable(t.load()),
            t
          )
        }
      },
      5158: (e, t, r) => {
        `undefined` == typeof process ||
        `renderer` === process.type ||
        !0 === process.browser ||
        process.__nwjs
          ? (e.exports = r(1227))
          : (e.exports = r(39))
      },
      39: (e, t, r) => {
        const n = r(3867),
          o = r(1669)
        ;(t.init = function (e) {
          e.inspectOpts = {}
          const r = Object.keys(t.inspectOpts)
          for (let n = 0; n < r.length; n++)
            e.inspectOpts[r[n]] = t.inspectOpts[r[n]]
        }),
          (t.log = function (...e) {
            return process.stderr.write(o.format(...e) + `\n`)
          }),
          (t.formatArgs = function (r) {
            const { namespace: n, useColors: o } = this
            if (o) {
              const t = this.color,
                o = `[3` + (t < 8 ? t : `8;5;` + t),
                s = `  ${o};1m${n} [0m`
              ;(r[0] = s + r[0].split(`\n`).join(`\n` + s)),
                r.push(o + `m+` + e.exports.humanize(this.diff) + `[0m`)
            } else
              r[0] =
                (t.inspectOpts.hideDate ? `` : new Date().toISOString() + ` `) +
                n +
                ` ` +
                r[0]
          }),
          (t.save = function (e) {
            e ? (process.env.DEBUG = e) : delete process.env.DEBUG
          }),
          (t.load = function () {
            return process.env.DEBUG
          }),
          (t.useColors = function () {
            return `colors` in t.inspectOpts
              ? Boolean(t.inspectOpts.colors)
              : n.isatty(process.stderr.fd)
          }),
          (t.destroy = o.deprecate(() => {},
          `Instance method \`debug.destroy()\` is deprecated and no longer does anything. It will be removed in the next major version of \`debug\`.`)),
          (t.colors = [6, 2, 3, 4, 5, 1])
        try {
          const e = r(2130)
          e &&
            (e.stderr || e).level >= 2 &&
            (t.colors = [
              20,
              21,
              26,
              27,
              32,
              33,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              56,
              57,
              62,
              63,
              68,
              69,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              92,
              93,
              98,
              99,
              112,
              113,
              128,
              129,
              134,
              135,
              148,
              149,
              160,
              161,
              162,
              163,
              164,
              165,
              166,
              167,
              168,
              169,
              170,
              171,
              172,
              173,
              178,
              179,
              184,
              185,
              196,
              197,
              198,
              199,
              200,
              201,
              202,
              203,
              204,
              205,
              206,
              207,
              208,
              209,
              214,
              215,
              220,
              221,
            ])
        } catch (e) {}
        ;(t.inspectOpts = Object.keys(process.env)
          .filter((e) => /^debug_/i.test(e))
          .reduce((e, t) => {
            const r = t
              .substring(6)
              .toLowerCase()
              .replace(/_([a-z])/g, (e, t) => t.toUpperCase())
            let n = process.env[t]
            return (
              (n =
                !!/^(yes|on|true|enabled)$/i.test(n) ||
                (!/^(no|off|false|disabled)$/i.test(n) &&
                  (`null` === n ? null : Number(n)))),
              (e[r] = n),
              e
            )
          }, {})),
          (e.exports = r(2447)(t))
        const { formatters: s } = e.exports
        ;(s.o = function (e) {
          return (
            (this.inspectOpts.colors = this.useColors),
            o
              .inspect(e, this.inspectOpts)
              .split(`\n`)
              .map((e) => e.trim())
              .join(` `)
          )
        }),
          (s.O = function (e) {
            return (
              (this.inspectOpts.colors = this.useColors),
              o.inspect(e, this.inspectOpts)
            )
          })
      },
      2261: (e, t, r) => {
        var n
        e.exports = function () {
          if (!n)
            try {
              n = r(5158)(`follow-redirects`)
            } catch (e) {
              n = function () {}
            }
          n.apply(null, arguments)
        }
      },
      938: (e, t, r) => {
        var n = r(8835),
          o = n.URL,
          s = r(8605),
          i = r(7211),
          a = r(2413).Writable,
          u = r(2357),
          c = r(2261),
          f = [`abort`, `aborted`, `connect`, `error`, `socket`, `timeout`],
          p = Object.create(null)
        f.forEach(function (e) {
          p[e] = function (t, r, n) {
            this._redirectable.emit(e, t, r, n)
          }
        })
        var l = _(`ERR_FR_REDIRECTION_FAILURE`, ``),
          d = _(
            `ERR_FR_TOO_MANY_REDIRECTS`,
            `Maximum number of redirects exceeded`
          ),
          h = _(
            `ERR_FR_MAX_BODY_LENGTH_EXCEEDED`,
            `Request body larger than maxBodyLength limit`
          ),
          m = _(`ERR_STREAM_WRITE_AFTER_END`, `write after end`)
        function g(e, t) {
          a.call(this),
            this._sanitizeOptions(e),
            (this._options = e),
            (this._ended = !1),
            (this._ending = !1),
            (this._redirectCount = 0),
            (this._redirects = []),
            (this._requestBodyLength = 0),
            (this._requestBodyBuffers = []),
            t && this.on(`response`, t)
          var r = this
          ;(this._onNativeResponse = function (e) {
            r._processResponse(e)
          }),
            this._performRequest()
        }
        function y(e) {
          var t = { maxRedirects: 21, maxBodyLength: 10485760 },
            r = {}
          return (
            Object.keys(e).forEach(function (s) {
              var i = s + `:`,
                a = (r[i] = e[s]),
                f = (t[s] = Object.create(a))
              Object.defineProperties(f, {
                request: {
                  value: function (e, s, a) {
                    if (`string` == typeof e) {
                      var f = e
                      try {
                        e = C(new o(f))
                      } catch (t) {
                        e = n.parse(f)
                      }
                    } else
                      o && e instanceof o
                        ? (e = C(e))
                        : ((a = s), (s = e), (e = { protocol: i }))
                    return (
                      `function` == typeof s && ((a = s), (s = null)),
                      ((s = Object.assign(
                        {
                          maxRedirects: t.maxRedirects,
                          maxBodyLength: t.maxBodyLength,
                        },
                        e,
                        s
                      )).nativeProtocols = r),
                      u.equal(s.protocol, i, `protocol mismatch`),
                      c(`options`, s),
                      new g(s, a)
                    )
                  },
                  configurable: !0,
                  enumerable: !0,
                  writable: !0,
                },
                get: {
                  value: function (e, t, r) {
                    var n = f.request(e, t, r)
                    return n.end(), n
                  },
                  configurable: !0,
                  enumerable: !0,
                  writable: !0,
                },
              })
            }),
            t
          )
        }
        function v() {}
        function C(e) {
          var t = {
            protocol: e.protocol,
            hostname: e.hostname.startsWith(`[`)
              ? e.hostname.slice(1, -1)
              : e.hostname,
            hash: e.hash,
            search: e.search,
            pathname: e.pathname,
            path: e.pathname + e.search,
            href: e.href,
          }
          return `` !== e.port && (t.port = Number(e.port)), t
        }
        function b(e, t) {
          var r
          for (var n in t) e.test(n) && ((r = t[n]), delete t[n])
          return r
        }
        function _(e, t) {
          function r(e) {
            Error.captureStackTrace(this, this.constructor),
              (this.message = e || t)
          }
          return (
            (r.prototype = new Error()),
            (r.prototype.constructor = r),
            (r.prototype.name = `Error [` + e + `]`),
            (r.prototype.code = e),
            r
          )
        }
        function x(e) {
          for (var t = 0; t < f.length; t++) e.removeListener(f[t], p[f[t]])
          e.on(`error`, v), e.abort()
        }
        ;(g.prototype = Object.create(a.prototype)),
          (g.prototype.abort = function () {
            x(this._currentRequest),
              this.emit(`abort`),
              this.removeAllListeners()
          }),
          (g.prototype.write = function (e, t, r) {
            if (this._ending) throw new m()
            if (
              !(`string` == typeof e || (`object` == typeof e && `length` in e))
            )
              throw new TypeError(
                `data should be a string, Buffer or Uint8Array`
              )
            `function` == typeof t && ((r = t), (t = null)),
              0 !== e.length
                ? this._requestBodyLength + e.length <=
                  this._options.maxBodyLength
                  ? ((this._requestBodyLength += e.length),
                    this._requestBodyBuffers.push({ data: e, encoding: t }),
                    this._currentRequest.write(e, t, r))
                  : (this.emit(`error`, new h()), this.abort())
                : r && r()
          }),
          (g.prototype.end = function (e, t, r) {
            if (
              (`function` == typeof e
                ? ((r = e), (e = t = null))
                : `function` == typeof t && ((r = t), (t = null)),
              e)
            ) {
              var n = this,
                o = this._currentRequest
              this.write(e, t, function () {
                ;(n._ended = !0), o.end(null, null, r)
              }),
                (this._ending = !0)
            } else
              (this._ended = this._ending = !0),
                this._currentRequest.end(null, null, r)
          }),
          (g.prototype.setHeader = function (e, t) {
            ;(this._options.headers[e] = t),
              this._currentRequest.setHeader(e, t)
          }),
          (g.prototype.removeHeader = function (e) {
            delete this._options.headers[e],
              this._currentRequest.removeHeader(e)
          }),
          (g.prototype.setTimeout = function (e, t) {
            var r = this
            function n(t) {
              t.setTimeout(e),
                t.removeListener(`timeout`, t.destroy),
                t.addListener(`timeout`, t.destroy)
            }
            function o(t) {
              r._timeout && clearTimeout(r._timeout),
                (r._timeout = setTimeout(function () {
                  r.emit(`timeout`), s()
                }, e)),
                n(t)
            }
            function s() {
              clearTimeout(this._timeout),
                t && r.removeListener(`timeout`, t),
                this.socket || r._currentRequest.removeListener(`socket`, o)
            }
            return (
              t && this.on(`timeout`, t),
              this.socket
                ? o(this.socket)
                : this._currentRequest.once(`socket`, o),
              this.on(`socket`, n),
              this.once(`response`, s),
              this.once(`error`, s),
              this
            )
          }),
          [
            `flushHeaders`,
            `getHeader`,
            `setNoDelay`,
            `setSocketKeepAlive`,
          ].forEach(function (e) {
            g.prototype[e] = function (t, r) {
              return this._currentRequest[e](t, r)
            }
          }),
          [`aborted`, `connection`, `socket`].forEach(function (e) {
            Object.defineProperty(g.prototype, e, {
              get: function () {
                return this._currentRequest[e]
              },
            })
          }),
          (g.prototype._sanitizeOptions = function (e) {
            if (
              (e.headers || (e.headers = {}),
              e.host && (e.hostname || (e.hostname = e.host), delete e.host),
              !e.pathname && e.path)
            ) {
              var t = e.path.indexOf(`?`)
              t < 0
                ? (e.pathname = e.path)
                : ((e.pathname = e.path.substring(0, t)),
                  (e.search = e.path.substring(t)))
            }
          }),
          (g.prototype._performRequest = function () {
            var e = this._options.protocol,
              t = this._options.nativeProtocols[e]
            if (t) {
              if (this._options.agents) {
                var r = e.substr(0, e.length - 1)
                this._options.agent = this._options.agents[r]
              }
              var o = (this._currentRequest = t.request(
                this._options,
                this._onNativeResponse
              ))
              ;(this._currentUrl = n.format(this._options)),
                (o._redirectable = this)
              for (var s = 0; s < f.length; s++) o.on(f[s], p[f[s]])
              if (this._isRedirect) {
                var i = 0,
                  a = this,
                  u = this._requestBodyBuffers
                !(function e(t) {
                  if (o === a._currentRequest)
                    if (t) a.emit(`error`, t)
                    else if (i < u.length) {
                      var r = u[i++]
                      o.finished || o.write(r.data, r.encoding, e)
                    } else a._ended && o.end()
                })()
              }
            } else
              this.emit(`error`, new TypeError(`Unsupported protocol ` + e))
          }),
          (g.prototype._processResponse = function (e) {
            var t = e.statusCode
            this._options.trackRedirects &&
              this._redirects.push({
                url: this._currentUrl,
                headers: e.headers,
                statusCode: t,
              })
            var r = e.headers.location
            if (
              r &&
              !1 !== this._options.followRedirects &&
              t >= 300 &&
              t < 400
            ) {
              if (
                (x(this._currentRequest),
                e.destroy(),
                ++this._redirectCount > this._options.maxRedirects)
              )
                return void this.emit(`error`, new d())
              ;(((301 === t || 302 === t) && `POST` === this._options.method) ||
                (303 === t && !/^(?:GET|HEAD)$/.test(this._options.method))) &&
                ((this._options.method = `GET`),
                (this._requestBodyBuffers = []),
                b(/^content-/i, this._options.headers))
              var o =
                  b(/^host$/i, this._options.headers) ||
                  n.parse(this._currentUrl).hostname,
                s = n.resolve(this._currentUrl, r)
              c(`redirecting to`, s), (this._isRedirect = !0)
              var i = n.parse(s)
              if (
                (Object.assign(this._options, i),
                i.hostname !== o &&
                  b(/^authorization$/i, this._options.headers),
                `function` == typeof this._options.beforeRedirect)
              ) {
                var a = { headers: e.headers }
                try {
                  this._options.beforeRedirect.call(null, this._options, a)
                } catch (e) {
                  return void this.emit(`error`, e)
                }
                this._sanitizeOptions(this._options)
              }
              try {
                this._performRequest()
              } catch (e) {
                var u = new l(`Redirected request failed: ` + e.message)
                ;(u.cause = e), this.emit(`error`, u)
              }
            } else
              (e.responseUrl = this._currentUrl),
                (e.redirects = this._redirects),
                this.emit(`response`, e),
                (this._requestBodyBuffers = [])
          }),
          (e.exports = y({ http: s, https: i })),
          (e.exports.wrap = y)
      },
      6560: (e) => {
        "use strict"
        e.exports = (e, t = process.argv) => {
          const r = e.startsWith(`-`) ? `` : 1 === e.length ? `-` : `--`,
            n = t.indexOf(r + e),
            o = t.indexOf(`--`)
          return -1 !== n && (-1 === o || n < o)
        }
      },
      7418: (e) => {
        "use strict"
        var t = Object.getOwnPropertySymbols,
          r = Object.prototype.hasOwnProperty,
          n = Object.prototype.propertyIsEnumerable
        function o(e) {
          if (null == e)
            throw new TypeError(
              `Object.assign cannot be called with null or undefined`
            )
          return Object(e)
        }
        e.exports = (function () {
          try {
            if (!Object.assign) return !1
            var e = new String(`abc`)
            if (((e[5] = `de`), `5` === Object.getOwnPropertyNames(e)[0]))
              return !1
            for (var t = {}, r = 0; r < 10; r++)
              t[`_` + String.fromCharCode(r)] = r
            if (
              `0123456789` !==
              Object.getOwnPropertyNames(t)
                .map(function (e) {
                  return t[e]
                })
                .join(``)
            )
              return !1
            var n = {}
            return (
              `abcdefghijklmnopqrst`.split(``).forEach(function (e) {
                n[e] = e
              }),
              `abcdefghijklmnopqrst` ===
                Object.keys(Object.assign({}, n)).join(``)
            )
          } catch (e) {
            return !1
          }
        })()
          ? Object.assign
          : function (e, s) {
              for (var i, a, u = o(e), c = 1; c < arguments.length; c++) {
                for (var f in (i = Object(arguments[c])))
                  r.call(i, f) && (u[f] = i[f])
                if (t) {
                  a = t(i)
                  for (var p = 0; p < a.length; p++)
                    n.call(i, a[p]) && (u[a[p]] = i[a[p]])
                }
              }
              return u
            }
      },
      2408: (e, t, r) => {
        "use strict"
        var n = r(7418),
          o = 60103,
          s = 60106
        ;(t.Fragment = 60107), (t.StrictMode = 60108), (t.Profiler = 60114)
        var i = 60109,
          a = 60110,
          u = 60112
        t.Suspense = 60113
        var c = 60115,
          f = 60116
        if (`function` == typeof Symbol && Symbol.for) {
          var p = Symbol.for
          ;(o = p(`react.element`)),
            (s = p(`react.portal`)),
            (t.Fragment = p(`react.fragment`)),
            (t.StrictMode = p(`react.strict_mode`)),
            (t.Profiler = p(`react.profiler`)),
            (i = p(`react.provider`)),
            (a = p(`react.context`)),
            (u = p(`react.forward_ref`)),
            (t.Suspense = p(`react.suspense`)),
            (c = p(`react.memo`)),
            (f = p(`react.lazy`))
        }
        var l = `function` == typeof Symbol && Symbol.iterator
        function d(e) {
          for (
            var t =
                `https://reactjs.org/docs/error-decoder.html?invariant=` + e,
              r = 1;
            r < arguments.length;
            r++
          )
            t += `&args[]=` + encodeURIComponent(arguments[r])
          return (
            `Minified React error #` +
            e +
            `; visit ` +
            t +
            ` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
          )
        }
        var h = {
            isMounted: function () {
              return !1
            },
            enqueueForceUpdate: function () {},
            enqueueReplaceState: function () {},
            enqueueSetState: function () {},
          },
          m = {}
        function g(e, t, r) {
          ;(this.props = e),
            (this.context = t),
            (this.refs = m),
            (this.updater = r || h)
        }
        function y() {}
        function v(e, t, r) {
          ;(this.props = e),
            (this.context = t),
            (this.refs = m),
            (this.updater = r || h)
        }
        ;(g.prototype.isReactComponent = {}),
          (g.prototype.setState = function (e, t) {
            if (`object` != typeof e && `function` != typeof e && null != e)
              throw Error(d(85))
            this.updater.enqueueSetState(this, e, t, `setState`)
          }),
          (g.prototype.forceUpdate = function (e) {
            this.updater.enqueueForceUpdate(this, e, `forceUpdate`)
          }),
          (y.prototype = g.prototype)
        var C = (v.prototype = new y())
        ;(C.constructor = v), n(C, g.prototype), (C.isPureReactComponent = !0)
        var b = { current: null },
          _ = Object.prototype.hasOwnProperty,
          x = { key: !0, ref: !0, __self: !0, __source: !0 }
        function w(e, t, r) {
          var n,
            s = {},
            i = null,
            a = null
          if (null != t)
            for (n in (void 0 !== t.ref && (a = t.ref),
            void 0 !== t.key && (i = `` + t.key),
            t))
              _.call(t, n) && !x.hasOwnProperty(n) && (s[n] = t[n])
          var u = arguments.length - 2
          if (1 === u) s.children = r
          else if (1 < u) {
            for (var c = Array(u), f = 0; f < u; f++) c[f] = arguments[f + 2]
            s.children = c
          }
          if (e && e.defaultProps)
            for (n in (u = e.defaultProps)) void 0 === s[n] && (s[n] = u[n])
          return {
            $$typeof: o,
            type: e,
            key: i,
            ref: a,
            props: s,
            _owner: b.current,
          }
        }
        function R(e) {
          return `object` == typeof e && null !== e && e.$$typeof === o
        }
        var E = /\/+/g
        function O(e, t) {
          return `object` == typeof e && null !== e && null != e.key
            ? (function (e) {
                var t = { "=": `=0`, ":": `=2` }
                return (
                  `$` +
                  e.replace(/[=:]/g, function (e) {
                    return t[e]
                  })
                )
              })(`` + e.key)
            : t.toString(36)
        }
        function j(e, t, r, n, i) {
          var a = typeof e
          ;(`undefined` !== a && `boolean` !== a) || (e = null)
          var u = !1
          if (null === e) u = !0
          else
            switch (a) {
              case `string`:
              case `number`:
                u = !0
                break
              case `object`:
                switch (e.$$typeof) {
                  case o:
                  case s:
                    u = !0
                }
            }
          if (u)
            return (
              (i = i((u = e))),
              (e = `` === n ? `.` + O(u, 0) : n),
              Array.isArray(i)
                ? ((r = ``),
                  null != e && (r = e.replace(E, `$&/`) + `/`),
                  j(i, t, r, ``, function (e) {
                    return e
                  }))
                : null != i &&
                  (R(i) &&
                    (i = (function (e, t) {
                      return {
                        $$typeof: o,
                        type: e.type,
                        key: t,
                        ref: e.ref,
                        props: e.props,
                        _owner: e._owner,
                      }
                    })(
                      i,
                      r +
                        (!i.key || (u && u.key === i.key)
                          ? ``
                          : (`` + i.key).replace(E, `$&/`) + `/`) +
                        e
                    )),
                  t.push(i)),
              1
            )
          if (((u = 0), (n = `` === n ? `.` : n + `:`), Array.isArray(e)))
            for (var c = 0; c < e.length; c++) {
              var f = n + O((a = e[c]), c)
              u += j(a, t, r, f, i)
            }
          else if (
            `function` ==
            typeof (f = (function (e) {
              return null === e || `object` != typeof e
                ? null
                : `function` == typeof (e = (l && e[l]) || e[`@@iterator`])
                ? e
                : null
            })(e))
          )
            for (e = f.call(e), c = 0; !(a = e.next()).done; )
              u += j((a = a.value), t, r, (f = n + O(a, c++)), i)
          else if (`object` === a)
            throw (
              ((t = `` + e),
              Error(
                d(
                  31,
                  `[object Object]` === t
                    ? `object with keys {` + Object.keys(e).join(`, `) + `}`
                    : t
                )
              ))
            )
          return u
        }
        function F(e, t, r) {
          if (null == e) return e
          var n = [],
            o = 0
          return (
            j(e, n, ``, ``, function (e) {
              return t.call(r, e, o++)
            }),
            n
          )
        }
        function k(e) {
          if (-1 === e._status) {
            var t = e._result
            ;(t = t()),
              (e._status = 0),
              (e._result = t),
              t.then(
                function (t) {
                  0 === e._status &&
                    ((t = t.default), (e._status = 1), (e._result = t))
                },
                function (t) {
                  0 === e._status && ((e._status = 2), (e._result = t))
                }
              )
          }
          if (1 === e._status) return e._result
          throw e._result
        }
        var A = { current: null }
        function S() {
          var e = A.current
          if (null === e) throw Error(d(321))
          return e
        }
        var T = {
          ReactCurrentDispatcher: A,
          ReactCurrentBatchConfig: { transition: 0 },
          ReactCurrentOwner: b,
          IsSomeRendererActing: { current: !1 },
          assign: n,
        }
        ;(t.Children = {
          map: F,
          forEach: function (e, t, r) {
            F(
              e,
              function () {
                t.apply(this, arguments)
              },
              r
            )
          },
          count: function (e) {
            var t = 0
            return (
              F(e, function () {
                t++
              }),
              t
            )
          },
          toArray: function (e) {
            return (
              F(e, function (e) {
                return e
              }) || []
            )
          },
          only: function (e) {
            if (!R(e)) throw Error(d(143))
            return e
          },
        }),
          (t.Component = g),
          (t.PureComponent = v),
          (t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = T),
          (t.cloneElement = function (e, t, r) {
            if (null == e) throw Error(d(267, e))
            var s = n({}, e.props),
              i = e.key,
              a = e.ref,
              u = e._owner
            if (null != t) {
              if (
                (void 0 !== t.ref && ((a = t.ref), (u = b.current)),
                void 0 !== t.key && (i = `` + t.key),
                e.type && e.type.defaultProps)
              )
                var c = e.type.defaultProps
              for (f in t)
                _.call(t, f) &&
                  !x.hasOwnProperty(f) &&
                  (s[f] = void 0 === t[f] && void 0 !== c ? c[f] : t[f])
            }
            var f = arguments.length - 2
            if (1 === f) s.children = r
            else if (1 < f) {
              c = Array(f)
              for (var p = 0; p < f; p++) c[p] = arguments[p + 2]
              s.children = c
            }
            return {
              $$typeof: o,
              type: e.type,
              key: i,
              ref: a,
              props: s,
              _owner: u,
            }
          }),
          (t.createContext = function (e, t) {
            return (
              void 0 === t && (t = null),
              ((e = {
                $$typeof: a,
                _calculateChangedBits: t,
                _currentValue: e,
                _currentValue2: e,
                _threadCount: 0,
                Provider: null,
                Consumer: null,
              }).Provider = { $$typeof: i, _context: e }),
              (e.Consumer = e)
            )
          }),
          (t.createElement = w),
          (t.createFactory = function (e) {
            var t = w.bind(null, e)
            return (t.type = e), t
          }),
          (t.createRef = function () {
            return { current: null }
          }),
          (t.forwardRef = function (e) {
            return { $$typeof: u, render: e }
          }),
          (t.isValidElement = R),
          (t.lazy = function (e) {
            return {
              $$typeof: f,
              _payload: { _status: -1, _result: e },
              _init: k,
            }
          }),
          (t.memo = function (e, t) {
            return { $$typeof: c, type: e, compare: void 0 === t ? null : t }
          }),
          (t.useCallback = function (e, t) {
            return S().useCallback(e, t)
          }),
          (t.useContext = function (e, t) {
            return S().useContext(e, t)
          }),
          (t.useDebugValue = function () {}),
          (t.useEffect = function (e, t) {
            return S().useEffect(e, t)
          }),
          (t.useImperativeHandle = function (e, t, r) {
            return S().useImperativeHandle(e, t, r)
          }),
          (t.useLayoutEffect = function (e, t) {
            return S().useLayoutEffect(e, t)
          }),
          (t.useMemo = function (e, t) {
            return S().useMemo(e, t)
          }),
          (t.useReducer = function (e, t, r) {
            return S().useReducer(e, t, r)
          }),
          (t.useRef = function (e) {
            return S().useRef(e)
          }),
          (t.useState = function (e) {
            return S().useState(e)
          }),
          (t.version = `17.0.2`)
      },
      7294: (e, t, r) => {
        "use strict"
        e.exports = r(2408)
      },
      2130: (e, t, r) => {
        "use strict"
        const n = r(2087),
          o = r(3867),
          s = r(6560),
          { env: i } = process
        let a
        function u(e) {
          return (
            0 !== e && {
              level: e,
              hasBasic: !0,
              has256: e >= 2,
              has16m: e >= 3,
            }
          )
        }
        function c(e, t) {
          if (0 === a) return 0
          if (s(`color=16m`) || s(`color=full`) || s(`color=truecolor`))
            return 3
          if (s(`color=256`)) return 2
          if (e && !t && void 0 === a) return 0
          const r = a || 0
          if (`dumb` === i.TERM) return r
          if (`win32` === process.platform) {
            const e = n.release().split(`.`)
            return Number(e[0]) >= 10 && Number(e[2]) >= 10586
              ? Number(e[2]) >= 14931
                ? 3
                : 2
              : 1
          }
          if (`CI` in i)
            return [
              `TRAVIS`,
              `CIRCLECI`,
              `APPVEYOR`,
              `GITLAB_CI`,
              `GITHUB_ACTIONS`,
              `BUILDKITE`,
            ].some((e) => e in i) || `codeship` === i.CI_NAME
              ? 1
              : r
          if (`TEAMCITY_VERSION` in i)
            return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(i.TEAMCITY_VERSION)
              ? 1
              : 0
          if (`truecolor` === i.COLORTERM) return 3
          if (`TERM_PROGRAM` in i) {
            const e = parseInt((i.TERM_PROGRAM_VERSION || ``).split(`.`)[0], 10)
            switch (i.TERM_PROGRAM) {
              case `iTerm.app`:
                return e >= 3 ? 3 : 2
              case `Apple_Terminal`:
                return 2
            }
          }
          return /-256(color)?$/i.test(i.TERM)
            ? 2
            : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(
                i.TERM
              ) || `COLORTERM` in i
            ? 1
            : r
        }
        s(`no-color`) || s(`no-colors`) || s(`color=false`) || s(`color=never`)
          ? (a = 0)
          : (s(`color`) ||
              s(`colors`) ||
              s(`color=true`) ||
              s(`color=always`)) &&
            (a = 1),
          `FORCE_COLOR` in i &&
            (a =
              `true` === i.FORCE_COLOR
                ? 1
                : `false` === i.FORCE_COLOR
                ? 0
                : 0 === i.FORCE_COLOR.length
                ? 1
                : Math.min(parseInt(i.FORCE_COLOR, 10), 3)),
          (e.exports = {
            supportsColor: function (e) {
              return u(c(e, e && e.isTTY))
            },
            stdout: u(c(!0, o.isatty(1))),
            stderr: u(c(!0, o.isatty(2))),
          })
      },
      1629: function (e, t, r) {
        "use strict"
        var n =
          (this && this.__importDefault) ||
          function (e) {
            return e && e.__esModule ? e : { default: e }
          }
        Object.defineProperty(t, `__esModule`, { value: !0 }),
          (t.useContentMap = void 0)
        var o = r(7294),
          s = n(r(9669))
        t.useContentMap = function (e) {
          var t = o.useState({}),
            r = t[0],
            n = t[1]
          return (
            o.useEffect(
              function () {
                s.default
                  .get(`http://localhost:3000/content-map`)
                  .then(function (e) {
                    var t = e.data
                    n(t)
                  })
              },
              [e.watch]
            ),
            r
          )
        }
      },
      2357: (e) => {
        "use strict"
        e.exports = require(`assert`)
      },
      8605: (e) => {
        "use strict"
        e.exports = require(`http`)
      },
      7211: (e) => {
        "use strict"
        e.exports = require(`https`)
      },
      2087: (e) => {
        "use strict"
        e.exports = require(`os`)
      },
      2413: (e) => {
        "use strict"
        e.exports = require(`stream`)
      },
      3867: (e) => {
        "use strict"
        e.exports = require(`tty`)
      },
      8835: (e) => {
        "use strict"
        e.exports = require(`url`)
      },
      1669: (e) => {
        "use strict"
        e.exports = require(`util`)
      },
      8761: (e) => {
        "use strict"
        e.exports = require(`zlib`)
      },
    },
    t = {}
  !(function r(n) {
    var o = t[n]
    if (void 0 !== o) return o.exports
    var s = (t[n] = { exports: {} })
    return e[n].call(s.exports, s, s.exports, r), s.exports
  })(1629)
})()
