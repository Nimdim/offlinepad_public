import Vue from 'vue'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faTag, faTags, faDownload, faBook, faBookOpen, faHome, faLock, faArrowUp, faEdit, faTerminal, faSun, faMoon, faSave, faBoxOpen, faAngleDown, faAngleUp, faCaretDown, faSortAmountUp, faTh, faSortAmountDownAlt, faPlus, faTrash, faBars, faSearch, faTimes, faTimesCircle, faPen, faClock, faCheck, faCalendarAlt, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { faVk} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faAngleDown)
library.add(faAngleUp)
library.add(faArrowUp)
library.add(faBars)
library.add(faBook)
library.add(faBookOpen)
library.add(faBoxOpen)
library.add(faCalendarAlt)
library.add(faCaretDown)
library.add(faClock)
library.add(faCheck)
library.add(faDownload)
library.add(faEdit)
library.add(faExclamationTriangle)
library.add(faHome)
library.add(faLock)
library.add(faMoon)
library.add(faPen)
library.add(faPlus)
library.add(faSave)
library.add(faSearch)
library.add(faSortAmountUp)
library.add(faSortAmountDownAlt)
library.add(faSun)
library.add(faTag)
library.add(faTags)
library.add(faTerminal)
library.add(faTh)
library.add(faTimes)
library.add(faTimesCircle)
library.add(faTrash)

library.add(faVk)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

let app = new Vue({
  render: h => h(App),
});
app.$mount('#app');
