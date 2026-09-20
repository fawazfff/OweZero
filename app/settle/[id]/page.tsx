// @ts-nocheck
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ProductNav from "../../components/ProductNav";
import LedgerAssistant from "../../components/LedgerAssistant";
import { calculate, getGroup, Group, saveGroup } from "../../lib/groups";

export default function SettlePage(){
 const {id}=useParams<{id:string}>(); const[group,setGroup]=useState<Group|null>(null); const[copied,setCopied]=useState(false);
 useEffect(()=>setGroup(getGroup(id)),[id]); const stats=useMemo(()=>group?calculate(group):null,[group]); if(!group||!stats)return null;
 const member=(x:string)=>group.members.find(m=>m.id===x);
 function mark(id:string){const updated={...group,paidSettlements:group.paidSettlements.includes(id)?group.paidSettlements.filter(x=>x!==id):[...group.paidSettlements,id]};setGroup(updated);saveGroup(updated)}
 async function copy(){await navigator.clipboard.writeText(stats.settlements.map(s=>`${member(s.from)?.name} pays ${member(s.to)?.name} ${group.currency}${s.amount.toFixed(2)}`).join("\n"));setCopied(true);setTimeout(()=>setCopied(false),1500)}
 const now=new Date();
 return <><ProductNav/><main className="app-page settle-page page-enter">
  <div className="settle-topbar no-print"><Link href={`/groups/${group.id}`} className="back-link">← Back to {group.name}</Link><div><button className="secondary" onClick={()=>window.print()}>Print statement</button><button className="secondary" onClick={copy}>{copied?"Copied!":"Copy plan"}</button></div></div>
  <div className="settle-hero"><span className="success-orb">✓</span><span className="step-label">SHORTEST SETTLEMENT PATH</span><h1>{stats.settlements.length} payments and everyone is even.</h1><p>OweZero turns every expense into one clear final ledger.</p></div>
  <section className="statement">
    <div className="statement-head"><div><span className="statement-brand"><b>0</b> OweZero</span><h2>Settlement statement</h2><p>{group.name}</p></div><div className="statement-meta"><span>Generated</span><b>{now.toLocaleDateString()}</b><span>Group spend</span><b>{group.currency}{stats.total.toFixed(2)}</b></div></div>
    <div className="statement-summary"><div><span>People</span><b>{group.members.length}</b></div><div><span>Expenses</span><b>{group.expenses.length}</b></div><div><span>Final payments</span><b>{stats.settlements.length}</b></div></div>
    <div className="statement-section"><div className="statement-title"><span>01</span><div><b>Balance breakdown</b><small>What each person paid versus their fair share.</small></div></div>
      <div className="statement-table"><div className="statement-row head"><span>Person</span><span>Paid</span><span>Fair share</span><span>Net</span></div>{group.members.map(m=><div className="statement-row" key={m.id}><span><i style={{background:m.color}}>{m.name.charAt(0)}</i>{m.name}</span><span>{group.currency}{stats.paid[m.id].toFixed(2)}</span><span>{group.currency}{stats.share[m.id].toFixed(2)}</span><strong className={stats.balances[m.id]>=0?"positive":"negative"}>{stats.balances[m.id]>=0?"+":"−"}{group.currency}{Math.abs(stats.balances[m.id]).toFixed(2)}</strong></div>)}</div>
    </div>
    <div className="statement-section"><div className="statement-title"><span>02</span><div><b>Why the balances look this way</b><small>Every expense is split only across the people who shared it.</small></div></div>
      <div className="expense-ledger">{group.expenses.map(e=>{const payer=member(e.paidBy);const split=e.amount/Math.max(1,e.participants.length);return <div className="ledger-line" key={e.id}><div><b>{e.title}</b><small>{payer?.name} paid {group.currency}{e.amount.toFixed(2)} · {e.participants.length} people · {group.currency}{split.toFixed(2)} each</small></div><span>{e.date}</span></div>})}</div>
    </div>
    <div className="statement-section"><div className="statement-title"><span>03</span><div><b>Final payment plan</b><small>These transfers settle the whole group with no circular paybacks.</small></div></div>
      <div className="payment-stack">{stats.settlements.length?stats.settlements.map((s,index)=>{const done=group.paidSettlements.includes(s.id);return <div className={done?"payment-card paid":"payment-card"} key={s.id}><span className="pay-number">{done?"✓":index+1}</span><i style={{background:member(s.from)?.color}}>{member(s.from)?.name.charAt(0)}</i><div><b>{member(s.from)?.name}</b><small>pays {member(s.to)?.name}</small></div><span className="pay-arrow">→</span><i style={{background:member(s.to)?.color}}>{member(s.to)?.name.charAt(0)}</i><strong>{group.currency}{s.amount.toFixed(2)}</strong><button className="no-print" onClick={()=>mark(s.id)}>{done?"Paid ✓":"Mark paid"}</button></div>}):<div className="all-clear">✓<b>Everyone is even</b><span>No payment needed.</span></div>}</div>
    </div>
    <div className="statement-note"><b>How OweZero gets this number</b><p>For each person: money paid minus their fair share gives the net balance. Positive means they should receive money. Negative means they owe. The settlement engine then matches debtors and creditors to reduce unnecessary back-and-forth.</p></div>
    <div className="statement-signoff"><span>Generated by OweZero</span><span>Math first. AI explains.</span></div>
  </section>
  <div className="no-print"><LedgerAssistant group={group}/></div>
 </main></>;
}
