import { createI18n } from "vue-i18n";
import messages from "./messages.json";

const i18nInstance = createI18n({
    locale: "en",
    allowComposition: false,
    messages,
});

export default i18nInstance; // use in root Vue app setup
export const i18n = i18nInstance.global; // use in any .ts file