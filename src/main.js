import { createApp } from "vue";
import i18nInstance from "./i18n";
import App from "./App.vue";

const app = createApp( App );

app.use( i18nInstance );
app.mount( "#app" );