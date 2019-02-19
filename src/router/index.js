import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'allCompany',
    component: (resolve) => require(['@/components/allCompany'], resolve)
  }, {
    path: '/senton',
    name: 'map',
    component: (resolve) => require(['@/components/map'], resolve)
  }, {
    path: '/freight',
    name: 'freight',
    component: (resolve) => require(['@/components/HelloWorld'], resolve)
  }, {
    path: '/webKnowledge',
    name: 'webKnowledge',
    component: (resolve) => require(['@/components/webKnowledge'], resolve)
  }, {
    path: '/webKnowledge',
    name: 'webKnowledge',
    component: (resolve) => require(['@/components/webKnowledge'], resolve)
  }, {
    path: '/overview',
    name: 'overview',
    component: (resolve) => require(['@/components/overview'], resolve)
  }]
})
