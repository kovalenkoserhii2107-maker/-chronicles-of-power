import { useEffect, useMemo, useState } from "react";
import { Archive, Buildings, Coins, Crown, Newspaper, ShieldCheck, Sparkle, UsersThree, X } from "@phosphor-icons/react";

type Metrics={treasury:number;people:number;elite:number;security:number;diplomacy:number};
type Choice={id:string;label:string;hint:string};
type Scene={chapter:string;kicker:string;title:string;text:string;speaker:string;role:string;choices:Choice[]};
type TurnResponse={mode:"ai"|"demo";consequence:{headline:string;text:string;newspaper:string};scene:Scene;changes:Metrics;threads:string[]};
type HistoryItem={turn:number;title:string;choice:string;result:string};
type Save={turn:number;metrics:Metrics;scene:Scene|null;history:HistoryItem[];threads:string[]};

const API="https://eyeesjdoqnjfhhbljawq.supabase.co/functions/v1/story-turn";
const ANON="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5ZWVzamRvcW5qZmhoYmxqYXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTAzNTcsImV4cCI6MjEwNDg2NjM1N30.ADPxixgrriI3UIGl5JhWd2gw4R303GXxdu9nqTgbtEQ";
const initial:Save={turn:1,metrics:{treasury:62,people:58,elite:51,security:67,diplomacy:44},scene:null,history:[],threads:[]};
const clamp=(n:number)=>Math.max(0,Math.min(100,n));

export default function App(){
  const [game,setGame]=useState<Save>(()=>{try{return JSON.parse(localStorage.getItem("chronicles-save-v1")||"null")||initial}catch{return initial}});
  const [loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null),[result,setResult]=useState<TurnResponse|null>(null),[archive,setArchive]=useState(false),[mode,setMode]=useState<"ai"|"demo"|null>(null);
  const danger=useMemo(()=>Object.values(game.metrics).filter(v=>v<25).length,[game.metrics]);
  useEffect(()=>{localStorage.setItem("chronicles-save-v1",JSON.stringify(game))},[game]);
  useEffect(()=>{if(!game.scene)requestTurn(null)},[]);

  async function requestTurn(choice:Choice|null){
    setLoading(true);setError(null);
    try{
      const response=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json","apikey":ANON,"Authorization":`Bearer ${ANON}`},body:JSON.stringify({turn:game.turn,choice,metrics:game.metrics,threads:game.threads,history:game.history.slice(-8)})});
      const payload=await response.json().catch(()=>null);
      if(!response.ok)throw new Error(payload?.error||`Сервер ответил ${response.status}`);
      const data=payload as TurnResponse;setMode(data.mode);
      if(choice&&game.scene){const metrics=Object.fromEntries(Object.entries(game.metrics).map(([k,v])=>[k,clamp(v+data.changes[k as keyof Metrics])])) as Metrics;setGame(g=>({...g,turn:g.turn+1,metrics,scene:data.scene,threads:data.threads,history:[...g.history,{turn:g.turn,title:g.scene!.title,choice:choice.label,result:data.consequence.headline}]}));setResult(data)}else setGame(g=>({...g,scene:data.scene,threads:data.threads}));
    }catch(e){setError(e instanceof Error?e.message:"Не удалось связаться с хроникой")}finally{setLoading(false)}
  }
  const reset=()=>{localStorage.removeItem("chronicles-save-v1");setGame(initial);setResult(null);setArchive(false);setTimeout(()=>requestTurn(null),0)};

  return <div className="app-shell">
    <header><div className="brand"><Crown weight="fill"/><span><b>ХРОНИКИ ВЛАСТИ</b><small>Черноморская Республика · год 1</small></span></div><button className="archive-button" onClick={()=>setArchive(true)} aria-label="Открыть хронику"><Archive/></button></header>
    <section className="metrics" aria-label="Показатели государства"><Metric icon={Coins} label="Казна" value={game.metrics.treasury}/><Metric icon={UsersThree} label="Народ" value={game.metrics.people}/><Metric icon={Buildings} label="Элиты" value={game.metrics.elite}/><Metric icon={ShieldCheck} label="Порядок" value={game.metrics.security}/></section>
    <main>
      <div className={`scene-art mood-${danger}`}><div className="sun"/><div className="city-silhouette"/><span>ХОД {game.turn}</span>{mode&&<small>{mode==="ai"?"СЦЕНАРИЙ СОЗДАН МОДЕЛЬЮ":"ДЕМОНСТРАЦИОННЫЙ СЦЕНАРИЙ"}</small>}</div>
      <article className="scene-card" aria-busy={loading}>
        {loading&&!game.scene?<Loading/>:game.scene&&<><div className="speaker"><div>{game.scene.speaker.slice(0,1)}</div><span><b>{game.scene.speaker}</b><small>{game.scene.role}</small></span></div><small className="kicker">{game.scene.kicker} · {game.scene.chapter}</small><h1>{game.scene.title}</h1><p>{game.scene.text}</p><div className="choices">{game.scene.choices.map((choice,i)=><button key={choice.id} disabled={loading} onClick={()=>requestTurn(choice)}><i>{i+1}</i><span><b>{choice.label}</b><small>{choice.hint}</small></span></button>)}</div></>}
        {loading&&game.scene&&<div className="thinking"><Sparkle weight="fill"/> Модель просчитывает последствия…</div>}
        {error&&<div className="error"><b>Связь с хроникой потеряна</b><span>{error}</span><button onClick={()=>requestTurn(null)}>Повторить</button></div>}
      </article>
    </main>
    {result&&<div className="overlay"><article className="result-card"><Newspaper weight="fill"/><small>ПОСЛЕДСТВИЯ РЕШЕНИЯ</small><h2>{result.consequence.headline}</h2><p>{result.consequence.text}</p><blockquote>«{result.consequence.newspaper}»</blockquote><Changes changes={result.changes}/><button onClick={()=>setResult(null)}>Продолжить хронику</button></article></div>}
    {archive&&<div className="archive"><div className="archive-head"><span><small>ГОСУДАРСТВЕННЫЙ АРХИВ</small><h2>Хроника решений</h2></span><button onClick={()=>setArchive(false)}><X/></button></div>{game.history.length===0?<p className="empty">История начнётся после первого решения.</p>:game.history.slice().reverse().map(item=><article key={item.turn}><small>ХОД {item.turn}</small><b>{item.title}</b><span>{item.choice}</span><p>{item.result}</p></article>)}<button className="reset" onClick={reset}>Начать новую историю</button></div>}
  </div>
}

function Metric({icon:Icon,label,value}:{icon:typeof Coins;label:string;value:number}){return <div className={value<25?"critical":""}><Icon weight="fill"/><span><small>{label}</small><b>{value}</b></span></div>}
function Changes({changes}:{changes:Metrics}){const names:Record<keyof Metrics,string>={treasury:"Казна",people:"Народ",elite:"Элиты",security:"Порядок",diplomacy:"Дипломатия"};return <div className="changes">{(Object.keys(changes) as Array<keyof Metrics>).filter(k=>changes[k]!==0).map(k=><span className={changes[k]>0?"up":"down"} key={k}>{names[k]} {changes[k]>0?"+":""}{changes[k]}</span>)}</div>}
function Loading(){return <div className="loading"><Crown weight="fill"/><b>Создаётся первая глава</b><span>Модель формирует государство, персонажей и конфликт…</span></div>}
