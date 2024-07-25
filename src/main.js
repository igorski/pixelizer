import { createApp } from "vue";
import { vTooltip } from "floating-vue";
import i18nInstance from "./i18n";
import App from "./App.vue";

const app = createApp( App );

app.use( i18nInstance );
app.directive( "tooltip", vTooltip );

app.mount( "#app" );