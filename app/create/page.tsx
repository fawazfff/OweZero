"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductNav from "../components/ProductNav";
import { Group, GroupType, groupTypes, makeMember, saveGroup } from "../lib/groups";

export default function CreateGroup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<GroupType>("trip");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("$");
  const [members, setMembers] = useState(["You", ""]);
  const readyMembers = members.map((item) => item.trim()).filter(Boolean);
  function create() {
    const id = `${(name || "my-group").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const group: Group = { id, name: name || "My group", type, currency, members: readyMembers.map(makeMember), expenses: [], paidSettlements: [], createdAt: new Date().toISOString() };
    saveGroup(group); router.push(`/groups/${id}`);
  }
  return <><ProductNav/><main className="app-page page-enter"><div className="wizard-head"><span>CREATE A GROUP</span><h1>Who are you splitting with?</h1><p>Set it up once. OweZero keeps every expense, balance and payment clear.</p><div className="progress"><i style={{width:`${step * 33.33}%`}}/></div></div>
    <section className="wizard-card">
      {step === 1 && <div className="step-panel"><div className="step-label">1 of 3 · Pick a group type</div><div className="type-grid">{groupTypes.map((item) => <button key={item.id} className={type === item.id ? "type-card selected" : "type-card"} onClick={() => setType(item.id)}><span>{item.icon}</span><strong>{item.title}</strong><small>{item.copy}</small><i>{type === item.id ? "✓" : ""}</i></button>)}</div></div>}
      {step === 2 && <div className="step-panel narrow"><div className="step-label">2 of 3 · Name the group</div><label>Group name<input autoFocus value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Lisbon weekend"/></label><label>Currency<select value={currency} onChange={(e)=>setCurrency(e.target.value)}><option value="$">$ · US Dollar</option><option value="£">£ · British Pound</option><option value="€">€ · Euro</option><option value="₦">₦ · Nigerian Naira</option><option value="₹">₹ · Indian Rupee</option></select></label></div>}
      {step === 3 && <div className="step-panel narrow"><div className="step-label">3 of 3 · Add the people</div><p className="field-help">You can always add more people later.</p>{members.map((member,index)=><div className="member-input" key={index}><span style={{background:["#6255e7","#ff6e62","#1c9a70","#e79a35"][index%4]}}>{member.trim().charAt(0).toUpperCase() || "+"}</span><input value={member} disabled={index===0} placeholder="Friend's name" onChange={(e)=>setMembers(members.map((m,i)=>i===index?e.target.value:m))}/>{index>1&&<button onClick={()=>setMembers(members.filter((_,i)=>i!==index))}>×</button>}</div>)}<button className="add-person" onClick={()=>setMembers([...members,""])}>+ Add another person</button></div>}
      <div className="wizard-actions">{step>1?<button className="secondary" onClick={()=>setStep(step-1)}>← Back</button>:<span/>}{step<3?<button className="primary" onClick={()=>setStep(step+1)} disabled={step===2&&!name.trim()}>Continue →</button>:<button className="primary" onClick={create} disabled={readyMembers.length<2}>Create group →</button>}</div>
    </section><p className="privacy-note">Private to this browser · No bank or wallet connection needed</p></main></>;
}

