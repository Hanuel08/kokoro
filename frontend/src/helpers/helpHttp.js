export const helpHttp = () => {
  const customFetch = (endpoint, options)=> {
    const defaultHeaders = {
      accept: "application/json"
    }

    const controller = new AbortController()

    options.signal = controller.signal

    options.method = options.method || "GET"
    options.headers = options.headers 
      ? { ...defaultHeaders, ...options.headers } 
      : defaultHeaders

    options.body = JSON.stringify(options.body) || false
    if (!options.body) delete options.body
    
    setTimeout(() => controller.abort(), 1200000)

    const getBody = (res) =>
      res.text().then(text => {
        let parsed;
        try { parsed = JSON.parse(text) } catch { parsed = null }
        return {
          err: true,
          status: res.status || "00",
          statusText: parsed?.error || res.statusText || "Ocurrió un error",
          body: text,
        }
      })

    const handleResponse = async (res) => {
      if (res.ok) return options?.headers?.accept === "application/json" ? res.json() : res;
      throw await getBody(res);
    }

    return fetch(endpoint, options).then(handleResponse)
  }

  const get = (url, options = {}) => customFetch(url, options)

  const post = (url, options = {}) => {
    options.method = "POST"
    return customFetch(url, options)
  }

  const put = (url, options = {}) => {
    options.method = "PUT"
    return customFetch(url, options)
  }

  const del = (url, options = {}) => {
    options.method = "DELETE"
    return customFetch(url, options)
  }

  return {
    get,
    post,
    put,
    del
  }
}