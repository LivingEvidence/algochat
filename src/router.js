import { createRouter, createWebHashHistory } from 'vue-router'
import { GUIDELINES } from './data/guidelines.js'
import TriColumnView from './views/TriColumnView.vue'
import InteractiveAlgorithmView from './views/InteractiveAlgorithmView.vue'
import ClassicView from './views/ClassicView.vue'
import OverviewView from './views/OverviewView.vue'
import DetailView from './views/DetailView.vue'

const guidelineIds = new Set(Object.keys(GUIDELINES))

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'all-pathways',
      component: TriColumnView,
    },
    {
      path: '/all-pathways',
      redirect: '/',
    },
    {
      path: '/interactive-algorithm',
      name: 'interactive-algorithm',
      component: InteractiveAlgorithmView,
    },
    {
      path: '/classic',
      component: ClassicView,
      children: [
        {
          path: '',
          name: 'classic-overview',
          component: OverviewView,
        },
        {
          path: ':guidelineId',
          name: 'classic-pathway',
          component: DetailView,
          props: route => ({ guidelineId: route.params.guidelineId }),
          beforeEnter: to => {
            if (!guidelineIds.has(to.params.guidelineId)) return { name: 'classic-overview' }
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})
