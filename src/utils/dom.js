import copy from 'copy-to-clipboard'
import { storeKey } from './index'
const downloadIcon = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 8H7.2C6.0799 8 5.51984 8 5.09202 8.21799C4.71569 8.40973 4.40973 8.71569 4.21799 9.09202C4 9.51984 4 10.0799 4 11.2V16.8C4 17.9201 4 18.4802 4.21799 18.908C4.40973 19.2843 4.71569 19.5903 5.09202 19.782C5.51984 20 6.0799 20 7.2 20H12.8C13.9201 20 14.4802 20 14.908 19.782C15.2843 19.5903 15.5903 19.2843 15.782 18.908C16 18.4802 16 17.9201 16 16.8V16M11.2 16H16.8C17.9201 16 18.4802 16 18.908 15.782C19.2843 15.5903 19.5903 15.2843 19.782 14.908C20 14.4802 20 13.9201 20 12.8V7.2C20 6.0799 20 5.51984 19.782 5.09202C19.5903 4.71569 19.2843 4.40973 18.908 4.21799C18.4802 4 17.9201 4 16.8 4H11.2C10.0799 4 9.51984 4 9.09202 4.21799C8.71569 4.40973 8.40973 4.71569 8.21799 5.09202C8 5.51984 8 6.07989 8 7.2V12.8C8 13.9201 8 14.4802 8.21799 14.908C8.40973 15.2843 8.71569 15.5903 9.09202 15.782C9.51984 16 10.0799 16 11.2 16Z" stroke="#7b808a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
const copyIcon = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 15V21M19 21L17 19M19 21L21 19M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H14M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19M19 9V11" stroke="#7b808a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>`
export function downloadMD(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  // 清理URL对象
  URL.revokeObjectURL(url);
}
export function createDownBtn() {
  const el = document.createElement('span')
  el.style.display = "inline-block"
  el.style.marginLeft = '8px'
  el.innerHTML = downloadIcon
  el.addEventListener('click', () => {
    if (!window[storeKey]) {
      return console.log('md为空');
    }
    if (copy(window[storeKey])) {
      console.log('已复制');
    }
  })
  return el
}
export function createCopyBtn() {
  const el = document.createElement('span')
  el.style.display = "inline-block"
  el.innerHTML = copyIcon
  el.addEventListener('click', () => {
    if (!window[storeKey]) {
      return
    }
    const filename = document.querySelector(".book-summary  a.section.route-active .title-text").innerHTML
    downloadMD(window[storeKey], filename)
  })
  return el
}
export function createBtn() {
  const el = document.createElement('div')
  el.style.cursor = "pointer"
  el.appendChild(createCopyBtn())
  el.appendChild(createDownBtn())
  return el
}
export function mouteEl(el) {
  let counter = 20

  let timer = setInterval(() => {
    if (--counter <= 0) {
      clearInterval(timer)
    }

    const container = document.querySelector("div.book-content nav")
    if (container) {
      container.insertBefore(el, container.querySelector('.toggle'))
      clearInterval(timer)
    }
  }, 1000)

}