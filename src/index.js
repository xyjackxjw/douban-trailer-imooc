import './assets/common.sass'

function changeTitle () {
  window.$('#app').html('Parcel 打包包')
}

setTimeout(function () {
  changeTitle()
}, 2000)