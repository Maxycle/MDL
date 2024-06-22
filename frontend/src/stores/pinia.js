import { createPinia } from 'pinia';
import { useSessionStore } from './modules/sessionStore';

const pinia = createPinia();
pinia.use(useSessionStore);

export default pinia;
