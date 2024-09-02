import { createPinia } from 'pinia';
import { useSessionStore } from './modules/sessionStore';
import { useAnswerStore } from './modules/answerStore';
import { useScoreStore } from './modules/scoreStore';
import { useParamsStore } from './modules/paramsStore';


const pinia = createPinia();
pinia.use(useSessionStore);
pinia.use(useAnswerStore);
pinia.use(useScoreStore);
pinia.use(useParamsStore);

export default pinia;
