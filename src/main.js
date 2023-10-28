import { createBtn, mouteEl, ajaxHooker, apiPrefix, storeKey } from './utils'
// 1.init btn
mouteEl(createBtn())
// 2. proxy
ajaxHooker.hook(request => {
  const { url } = request
  if (!url.startsWith(apiPrefix)) {
    return
  }
  request.response = res => {
    window[storeKey] = res.json.data.section.markdown_show
  };
});