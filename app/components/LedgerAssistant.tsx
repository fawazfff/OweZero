// @ts-nocheck
"use client";
import { FormEvent, useState } from "react";
import type { Group } from "../lib/groups";

export default function LedgerAssistant({ group }:{ group:Group }) {
  const [question,setQuestion]=useState("Why does this settlement make sense?");
  const [answer,setAnswer]=useState("");
  const [facts,setFacts]=useState<string[]>([]);
  const [loading,setLoading]=useState(false);
  const [source,setSource]=useState("");

  async function ask(event?:FormEvent){
    event?.preventDefault();
    if(!question.trim()||loading)return;
    setLoading(true); setAnswer(""); setFacts([]);
    try{
      const response=await fetch("/api/assistant",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,group})});
      const data=await response.json();
      setAnswer(data.answer||data.error||"I couldn't explain that yet.");
      setFacts(Array.isArray(data.facts)?data.facts:[]);
      setSource(data.source||"");
    }catch{
      setAnswer("I couldn't reach the explainer right now. Your settlement math is still calculated locally.");
    }finally{setLoading(false)}
  }

  return <section className="ai-card">
    <div className="ai-card-head">
      <div><span className="ai-badge"><i/> OweZero AI</span><h2>Ask about the math</h2><p>The ledger calculates the numbers. AI explains them in plain English.</p></div>
      <span className="ai-live">{source==="openai"?"AI connected":"ledger ready"}</span>
    </div>
    <div className="quick-prompts">
      {["Why do I owe this?","Who should pay first?","Explain the shortest path"].map(item=><button key={item} onClick={()=>setQuestion(item)}>{item}</button>)}
    </div>
    <form className="ai-composer" onSubmit={ask}>
      <input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask about a balance, expense or payment..." />
      <button disabled={loading}>{loading?"Reading ledger…":"Ask →"}</button>
    </form>
    {answer?<div className="ai-answer">
      <div className="ai-orb">0</div>
      <div><b>{source==="openai"?"OweZero AI":"OweZero ledger"}</b><p>{answer}</p>{facts.length?<div className="fact-chips">{facts.map((fact,index)=><span key={index}>{fact}</span>)}</div>:null}</div>
    </div>:null}
  </section>;
}
