type Locale = 'zh' | 'en';
const locale: Locale = localStorage.getItem('game_locale') === 'en' || (!localStorage.getItem('game_locale') && !navigator.language.toLowerCase().startsWith('zh')) ? 'en' : 'zh';

const messages = {
  zh: {
    eyebrow: '暗房认人实验', title: '这是谁？', intro: '只看一小块，你认得出朋友吗？', start: '开始认人', demo: '演示联系人', real: '真实联系人', round: '第 {n}/{total} 轮', hint: '已揭露 {n}%', prompt: '选出这个人', wrong: '不是。再多给你一点。', right: '你在 {n}% 就认出来了', revealed: '原来是 {name}', next: '下一位', finish: '看结果', score: '你拿到 {n}/{total} 分', resultTitle: '你真的认得他们', firstSight: '{n} 位只看 18% 就认出', best: '你最快认出', again: '再玩一次', loading: '正在冲洗朋友的照片…', emptyTitle: '还差几张脸', emptyBody: '需要至少 3 位有头像的联系人才能开始。', retry: '重试', tryDemo: '先玩演示', errorTitle: '暗房暂时停电', errorBody: '联系人没有加载成功。', profile: '查看 {name} 的资料', notify: '{sender_name} 只看一张照片的 18% 就认出了你。', mute: '切换声音', roundScore: '+{n}', none18: '这次没人是在 18% 时认出的',
  },
  en: {
    eyebrow: 'DARKROOM ID TEST', title: "WHO'S THAT?", intro: 'Can you recognize a friend from one tiny slice?', start: 'START RECOGNIZING', demo: 'DEMO CONTACTS', real: 'REAL CONTACTS', round: 'ROUND {n}/{total}', hint: '{n}% REVEALED', prompt: 'PICK THE PERSON', wrong: 'No. Here is a little more.', right: 'YOU KNEW THEM AT {n}%', revealed: 'IT WAS {name}', next: 'NEXT PERSON', finish: 'SEE RESULTS', score: 'YOU SCORED {n}/{total}', resultTitle: 'YOU REALLY KNOW THEM', firstSight: '{n} recognized from only 18%', best: 'FASTEST RECOGNITION', again: 'PLAY AGAIN', loading: 'Developing your friends…', emptyTitle: 'A FEW FACES SHORT', emptyBody: 'You need at least 3 contacts with profile photos.', retry: 'RETRY', tryDemo: 'TRY DEMO', errorTitle: 'DARKROOM POWER CUT', errorBody: 'Your contacts did not load.', profile: 'Open {name} profile', notify: '{sender_name} recognized you from only 18% of a photo.', mute: 'Toggle sound', roundScore: '+{n}', none18: 'No one was recognized at 18% this time',
  },
} as const;

export function t(key: keyof typeof messages.zh, vars: Record<string, string | number> = {}): string {
  let value: string = messages[locale][key];
  Object.entries(vars).forEach(([name, replacement]) => { value = value.replace(`{${name}}`, String(replacement)); });
  return value;
}
