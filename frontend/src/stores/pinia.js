import { createPinia } from 'pinia';
import { useSessionStore } from './modules/sessionStore';
import { useAnswerStore } from './modules/answerStore';
import { useScoreStore } from './modules/scoreStore';

const pinia = createPinia();
pinia.use(useSessionStore);
pinia.use(useAnswerStore);
pinia.use(useScoreStore);

export default pinia;
