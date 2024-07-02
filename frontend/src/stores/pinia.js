import { createPinia } from 'pinia';
import { useSessionStore } from './modules/sessionStore';
import { useAnswerStore } from './modules/answerStore';

const pinia = createPinia();
pinia.use(useSessionStore);
pinia.use(useAnswerStore);

export default pinia;
