import Vue from 'vue'
import Router from 'vue-router'

import Explore from "../pages/Explore"
import Create from "../pages/Create"
import Copilot from "../pages/Copilot"
import Resources from "../pages/Resources"
import Profile from "../pages/Profile"
import Details from "../pages/Details"
import Sell from "../pages/Sell"
import Home from "../pages/Home"
Vue.use(Router)

export default new Router({
    routes: [
        {
            path: "/explore",
            component: Explore
        },
        {
            path: '/',
            redirect: '/explore'
        },
        {
            path: '/create',
            component: Create
        },
        {
            path: '/copilot',
            component: Copilot
        },
        {
            path: '/resources',
            component: Resources
        },
        {
            path: '/profile',
            component: Profile
        },
        {
            path: '/details',
            component: Details
        },
        {
            path: '/sell',
            component: Sell
        },
        {
            path: '/home',
            component: Home
        }
    ]
})