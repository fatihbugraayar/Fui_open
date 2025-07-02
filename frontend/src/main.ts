import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueKonva from 'vue-konva'
import App from './App.vue'

// Import Tailwind CSS
import './assets/main.css'
// Import base styles
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(VueKonva)
app.mount('#app')
