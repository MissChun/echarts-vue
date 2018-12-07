import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'HelloWorld',
    component: (resolve) => require(['@/components/HelloWorld'], resolve)
  }, {
    path: '/map',
    name: 'map',
    component: (resolve) => require(['@/components/map'], resolve)
  }, {
    path: '/webKnowledge',
    name: 'webKnowledge',
    component: (resolve) => require(['@/components/webKnowledge'], resolve)
  }]
})
