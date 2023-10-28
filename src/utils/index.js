export const ajaxHooker = function () {
  const win = window.unsafeWindow || document.defaultView || window;
  const hookFns = [];
  const xhrProto = win.XMLHttpRequest.prototype;
  const xhrProtoDesc = Object.getOwnPropertyDescriptors(xhrProto);
  const resProto = win.Response.prototype;
  const realXhrOpen = xhrProto.open;
  const realFetch = win.fetch;
  const xhrResponses = ['response', 'responseText', 'responseXML'];
  const fetchResponses = ['arrayBuffer', 'blob', 'formData', 'json', 'text'];
  function emptyFn() { }
  function readOnly(obj, prop, value = obj[prop]) {
    Object.defineProperty(obj, prop, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: emptyFn
    });
  }
  function writable(obj, prop, value = obj[prop]) {
    Object.defineProperty(obj, prop, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: value
    });
  }
  function fakeXhrOpen(...args) {
    const xhr = this;
    const request = {
      type: 'xhr',
      url: args[1],
      method: args[0].toUpperCase(),
      abort: false,
      headers: null,
      data: null,
      response: null
    };
    for (const fn of hookFns) {
      fn(request);
      if (request.abort) return;
    }
    args[1] = request.url;
    args[0] = request.method;
    const headers = {};
    xhr.setRequestHeader = (header, value) => {
      headers[header] = value;
    }
    xhr.send = function (data) {
      if (typeof request.headers === 'function') {
        request.headers(headers);
      }
      for (const header in headers) {
        xhrProto.setRequestHeader.call(xhr, header, headers[header]);
      }
      if (typeof request.data === 'function') {
        const newData = request.data(data);
        if (newData !== undefined) data = newData;
      }
      return xhrProto.send.call(xhr, data);
    };
    if (typeof request.response === 'function') {
      const arg = {};
      xhrResponses.forEach(prop => {
        Object.defineProperty(xhr, prop, {
          configurable: true,
          enumerable: true,
          get: () => {
            if (xhr.readyState === 4) {
              if (!('finalUrl' in arg)) {
                arg.finalUrl = xhr.responseURL;
                arg.status = xhr.status;
                arg.responseHeaders = {};
                const arr = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
                for (const line of arr) {
                  const parts = line.split(/:\s*/);
                  if (parts.length === 2) {
                    arg.responseHeaders[parts[0].toLowerCase()] = parts[1];
                  }
                }
              }
              if (!(prop in arg)) {
                arg[prop] = xhrProtoDesc[prop].get.call(xhr);
                request.response(arg);
              }
            }
            return prop in arg ? arg[prop] : xhrProtoDesc[prop].get.call(xhr);
          }
        });
      });
    } else {
      xhrResponses.forEach(prop => {
        delete xhr[prop]; // delete descriptor
      });
    }
    return realXhrOpen.apply(xhr, args);
  }
  function hookFetchResponse(response, arg, callback) {
    fetchResponses.forEach(prop => {
      response[prop] = () => new Promise((resolve, reject) => {
        resProto[prop].call(response).then(res => {
          if (!(prop in arg)) {
            arg[prop] = res;
            callback(arg);
          }
          resolve(prop in arg ? arg[prop] : res);
        }, reject);
      });
    });
  }
  function fakeFetch(url, init) {
    if (typeof url === 'string' || url instanceof String) {
      init = init || {};
      const request = {
        type: 'fetch',
        url: url,
        method: (init.method || 'GET').toUpperCase(),
        abort: false,
        headers: null,
        data: null,
        response: null
      };
      for (const fn of hookFns) {
        fn(request);
        if (request.abort) return Promise.reject('aborted');
      }
      url = request.url;
      init.method = request.method;
      if (typeof request.headers === 'function') {
        let headers;
        if (init.headers.toString() === '[object Headers]') {
          headers = {};
          for (const [key, val] of init.headers) {
            headers[key] = val;
          }
        } else {
          headers = { ...init.headers };
        }
        request.headers(headers);
        init.headers = headers;
      }
      if (typeof request.data === 'function') {
        const data = request.data(init.body);
        if (data !== undefined) init.body = data;
      }
      if (typeof request.response === 'function') {
        return new Promise((resolve, reject) => {
          realFetch.call(win, url, init).then(response => {
            const arg = {
              finalUrl: response.url,
              status: response.status,
              responseHeaders: {}
            };
            for (const [key, val] of response.headers) {
              arg.responseHeaders[key] = val;
            }
            hookFetchResponse(response, arg, request.response);
            response.clone = () => {
              const resClone = resProto.clone.call(response);
              hookFetchResponse(resClone, arg, request.response);
              return resClone;
            };
            resolve(response);
          }, reject);
        });
      }
    }
    return realFetch.call(win, url, init);
  }
  xhrProto.open = fakeXhrOpen;
  win.fetch = fakeFetch;
  return {
    hook: fn => hookFns.push(fn),
    protect: () => {
      readOnly(win, 'XMLHttpRequest');
      readOnly(xhrProto, 'open');
      readOnly(win, 'fetch');
    },
    unhook: () => {
      writable(win, 'XMLHttpRequest');
      writable(xhrProto, 'open', realXhrOpen);
      writable(win, 'fetch', realFetch);
    }
  };
}();


export const apiPrefix = 'https://api.juejin.cn/booklet_api/v1/section/get'

export const storeKey = Symbol('md')

export * from './dom'