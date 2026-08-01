import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isInAigram, openAigramProfile, useGameEvent } from '@shared/runtime';
import { shuffle } from './data';
import { sounds } from './audio';
import { t } from './i18n';
import { useContacts } from './hooks/useContacts';
import { ArrowIcon, RetryIcon, SoundIcon } from './components/Icons';
import type { Contact, RoundResult, Screen } from './types';

const REVEAL_LEVELS = [18, 44, 76];

function Photo({ contact, reveal, full = false }: { contact: Contact; reveal: number; full?: boolean }) {
  const side = full ? 0 : (100 - reveal) / 2;
  return (
    <div className={`wt-photo ${full ? 'wt-photo--full' : ''}`}>
      <img className="wt-photo__shadow" src={contact.avatarUrl} alt="" draggable={false} />
      <img className="wt-photo__image" src={contact.avatarUrl} alt={contact.name} draggable={false} style={{ clipPath: `inset(0 ${side}% 0 ${side}%)` }} />
      {!full && <><i className="wt-photo__crop wt-photo__crop--left" style={{ left: `${side}%` }} /><i className="wt-photo__crop wt-photo__crop--right" style={{ right: `${side}%` }} /></>}
      <span className="wt-photo__number">FRAME 0{Math.min(9, Math.ceil(reveal / 18))}</span>
    </div>
  );
}

function ProfileButton({ contact, isDemo }: { contact: Contact; isDemo: boolean }) {
  const enabled = isInAigram && !isDemo;
  return (
    <button className="wt-profile" type="button" disabled={!enabled} onClick={() => enabled && openAigramProfile(contact.id)} aria-label={t('profile', { name: contact.name })}>
      <img src={contact.avatarUrl} alt="" draggable={false} />
      <span>{contact.name}</span>
      {enabled && <ArrowIcon />}
    </button>
  );
}

export function WhosThat() {
  const { contacts, loading, error, isDemo, retry, useDemo } = useContacts();
  const events = useGameEvent();
  const [screen, setScreen] = useState<Screen>('loading');
  const [targets, setTargets] = useState<Contact[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [muted, setMuted] = useState(false);
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (loading) setScreen('loading');
    else if (error) setScreen('error');
    else if (contacts.length < 3) setScreen('empty');
    else setScreen((current) => current === 'loading' || current === 'error' || current === 'empty' ? 'cover' : current);
  }, [contacts.length, error, loading]);

  const target = targets[roundIndex] ?? contacts[0];
  const totalRounds = targets.length || Math.min(contacts.length >= 5 ? 5 : 3, contacts.length);
  const reveal = screen === 'reveal' ? 100 : REVEAL_LEVELS[Math.min(attempt, 2)];

  const options = useMemo(() => {
    if (!target) return [];
    const distractors = shuffle(contacts.filter((contact) => contact.id !== target.id)).slice(0, 2);
    return shuffle([target, ...distractors]);
  }, [contacts, roundIndex, target]);

  const start = useCallback(() => {
    const rounds = contacts.length >= 5 ? 5 : 3;
    setTargets(shuffle(contacts).slice(0, rounds));
    setRoundIndex(0); setAttempt(0); setWrongIds([]); setResults([]); notifiedRef.current = false;
    sounds.click(); setScreen('round');
  }, [contacts]);

  const finishRound = useCallback((pickedAttempt: number, score: number) => {
    if (!target) return;
    setResults((previous) => [...previous, { contact: target, attempt: pickedAttempt, score }]);
    sounds.right(pickedAttempt === 1); setScreen('reveal');
  }, [target]);

  const choose = useCallback((contact: Contact) => {
    if (screen !== 'round' || wrongIds.includes(contact.id)) return;
    const pickedAttempt = attempt + 1;
    if (contact.id === target.id) { finishRound(pickedAttempt, 4 - pickedAttempt); return; }
    sounds.wrong(); setWrongIds((ids) => [...ids, contact.id]);
    if (pickedAttempt >= 3) { finishRound(pickedAttempt, 0); return; }
    setAttempt(pickedAttempt);
  }, [attempt, finishRound, screen, target, wrongIds]);

  const continueGame = useCallback(() => {
    sounds.click();
    if (roundIndex + 1 >= targets.length) { setScreen('result'); sounds.result(); return; }
    setRoundIndex((index) => index + 1); setAttempt(0); setWrongIds([]); setScreen('round');
  }, [roundIndex, targets.length]);

  useEffect(() => {
    if (screen !== 'result' || notifiedRef.current || isDemo || !events.canEmit) return;
    const firstSight = results.find((result) => result.attempt === 1);
    if (!firstSight) return;
    notifiedRef.current = true;
    events.trigger('recognized_at_18', { actions: [{ type: 'notify', target_user_id: firstSight.contact.id, image: { ref_url: firstSight.contact.avatarUrl, prompt: 'A warm close portrait of the friend who was instantly recognized.' }, message: { template: t('notify'), variables: ['sender_name'] } }] });
  }, [events, isDemo, results, screen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm') setMuted(sounds.toggle());
      if (screen === 'cover' && event.key === 'Enter') start();
      if (screen === 'reveal' && event.key === 'Enter') continueGame();
      if (screen === 'round' && ['1', '2', '3'].includes(event.key)) choose(options[Number(event.key) - 1]);
    };
    window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown);
  }, [choose, continueGame, options, screen, start]);

  const score = results.reduce((sum, result) => sum + result.score, 0);
  const firstSight = results.filter((result) => result.attempt === 1);
  const best = firstSight[0] ?? [...results].sort((a, b) => b.score - a.score)[0];
  const latestResult = results[results.length - 1];

  return (
    <main className={`wt-app wt-app--${screen}`}>
      <header className="wt-topbar">
        <img className="wt-brand" src="./img/alteru.svg" alt="AlterU" draggable={false} />
        {(screen === 'round' || screen === 'reveal') && <span>{t('round', { n: roundIndex + 1, total: totalRounds })}</span>}
        <button className="wt-icon-button" type="button" aria-label={t('mute')} onPointerDown={() => setMuted(sounds.toggle())}><SoundIcon muted={muted} /></button>
      </header>

      {screen === 'loading' && <section className="wt-message"><div className="wt-loading"><i/><i/><i/></div><p>{t('loading')}</p></section>}

      {screen === 'cover' && target && <section className="wt-cover">
        <div className="wt-cover__copy"><span className="wt-kicker">{t('eyebrow')}</span><h1>{t('title')}</h1><p>{t('intro')}</p></div>
        <Photo contact={target} reveal={18} />
        <div className="wt-mode"><i />{isDemo ? t('demo') : t('real')}</div>
        <button className="wt-primary" type="button" onPointerDown={start}>{t('start')}<ArrowIcon /></button>
      </section>}

      {(screen === 'empty' || screen === 'error') && <section className="wt-message">
        <div className="wt-empty-frame"><span>?</span></div>
        <span className="wt-kicker">CONTACT SHEET / 00</span>
        <h2>{screen === 'error' ? t('errorTitle') : t('emptyTitle')}</h2>
        <p>{screen === 'error' ? t('errorBody') : t('emptyBody')}</p>
        <button className="wt-primary" type="button" onPointerDown={retry}><RetryIcon />{t('retry')}</button>
        <button className="wt-text-button" type="button" onPointerDown={useDemo}>{t('tryDemo')}</button>
      </section>}

      {screen === 'round' && target && <section className="wt-round">
        <div className="wt-round__label"><strong>{t('prompt')}</strong><span>{t('hint', { n: reveal })}</span></div>
        <Photo contact={target} reveal={reveal} />
        <div className="wt-feedback" aria-live="polite">{wrongIds.length > 0 ? t('wrong') : '\u00a0'}</div>
        <div className="wt-options">
          {options.map((contact, index) => <button key={contact.id} className={`wt-option ${wrongIds.includes(contact.id) ? 'wt-option--wrong' : ''}`} type="button" disabled={wrongIds.includes(contact.id)} onPointerDown={() => choose(contact)}>
            <b>0{index + 1}</b><img src={contact.avatarUrl} alt="" draggable={false} /><span>{contact.name}</span>
          </button>)}
        </div>
      </section>}

      {screen === 'reveal' && target && <section className="wt-reveal">
        <div className="wt-flash" />
        <Photo contact={target} reveal={100} full />
        <div className="wt-stamp">{latestResult?.score === 0 ? t('revealed', { name: target.name }) : t('right', { n: REVEAL_LEVELS[Math.min(attempt, 2)] })}</div>
        <ProfileButton contact={target} isDemo={isDemo} />
        <button className="wt-primary" type="button" onPointerDown={continueGame}>{roundIndex + 1 >= targets.length ? t('finish') : t('next')}<ArrowIcon /></button>
      </section>}

      {screen === 'result' && <section className="wt-result">
        <span className="wt-kicker">CONTACT SHEET / COMPLETE</span><h1>{t('resultTitle')}</h1>
        <div className="wt-score"><strong>{score}</strong><span>/ {targets.length * 3}</span></div>
        <p>{t('firstSight', { n: firstSight.length })}</p>
        {best ? <div className="wt-best"><span>{t('best')}</span><ProfileButton contact={best.contact} isDemo={isDemo} /></div> : <p>{t('none18')}</p>}
        <div className="wt-result__strip">{results.map((result) => <div key={result.contact.id}><img src={result.contact.avatarUrl} alt={result.contact.name} draggable={false}/><b>{t('roundScore', { n: result.score })}</b></div>)}</div>
        <button className="wt-primary" type="button" onPointerDown={start}>{t('again')}<ArrowIcon /></button>
      </section>}
    </main>
  );
}
