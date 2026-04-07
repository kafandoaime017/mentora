// plugins/sonner.client.js
import { Toaster, toast } from 'vue-sonner'
import 'vue-sonner/styles.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Toaster', Toaster)
  
  return {
    provide: {
      toast: toast
    }
  }
})