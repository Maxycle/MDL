import { createPinia } from 'pinia';
import { useSessionStore } from './modules/sessionStore';
import { useAnswerStore } from './modules/answerStore';
import { useScoreStore } from './modules/scoreStore';
import { useParamsStore } from './modules/paramsStore';
import { usePostStore } from './modules/postStore';
import { useResourceStore } from './modules/resourceStore';


const pinia = createPinia();
pinia.use(useSessionStore);
pinia.use(useAnswerStore);
pinia.use(useScoreStore);
pinia.use(useParamsStore);
pinia.use(usePostStore);
pinia.use(useResourceStore);

export default pinia;
