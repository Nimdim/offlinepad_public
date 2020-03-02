import Vue from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown, faAngleUp, faCaretDown, faSortAmountUp, faTh, faSortAmountDownAlt, faPlus, faTrash, faBars, faSearch, faTimes, faTimesCircle, faPen, faClock, faCheck, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faAngleDown)
library.add(faAngleUp)
library.add(faBars)
library.add(faCalendarAlt)
library.add(faCaretDown)
library.add(faClock)
library.add(faCheck)
library.add(faPen)
library.add(faPlus)
library.add(faSearch)
library.add(faSortAmountUp)
library.add(faSortAmountDownAlt)
library.add(faTh)
library.add(faTimes)
library.add(faTimesCircle)
library.add(faTrash)
 
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
