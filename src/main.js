import { createApp } from "vue";
import { vTooltip } from "floating-vue";
import { createPinia } from "pinia";
import i18nInstance from "./i18n";
import App from "./App.vue";

const app = createApp( App );
const pinia = createPinia();

app.use( i18nInstance );
app.use( pinia );
app.directive( "tooltip", vTooltip );

app.mount( "#app" );