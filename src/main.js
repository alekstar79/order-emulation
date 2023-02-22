import Vue from 'vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.scss'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
