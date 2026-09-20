// @ts-nocheck
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductNav from "../components/ProductNav";
import { calculate, Group, groupTypes, readGroups } from "../lib/groups";

export default function GroupsPage(){
 const [groups,setGroups]=useState<Group[]>([]); useEffect(()=>setGroups(readGroups()),[]);
 return <><ProductNav/><main className="app-page page-enter"><div className="dashboard-head"><div><span className="step-label">YOUR MONEY, ORGANIZED</span><h1>My groups</h1><p>Every shared expense and balance, without the spreadsheet.</p></div><Link className="primary" href="/create">+ Create a group</Link></div>
 <div className="group-grid">{groups.map(group=>{const stats=calculate(group);const kind=groupTypes.find(x=>x.id===group.type);return <Link href={`/groups/${group.id}`} className="group-card" key={group.id}><div className="group-card-top"><span className="group-icon">{kind?.icon}</span><span className={group.id==="demo"?"demo-tag":"saved-tag"}>{group.id==="demo"?"LIVE DEMO":"SAVED"}</span></div><h2>{group.name}</h2><p>{kind?.title} · {group.members.length} people</p><div className="face-row">{group.members.slice(0,5).map(m=><i key={m.id} style={{background:m.color}}>{m.name.charAt(0)}</i>)}</div><div className="group-stats"><div><small>TOTAL SPENT</small><strong>{group.currency}{stats.total.toFixed(2)}</strong></div><div><small>PAYMENTS LEFT</small><strong>{stats.settlements.length}</strong></div></div><span className="open-group">Open group <b>→</b></span></Link>})}<Link href="/create" className="group-card add-card"><span>+</span><h2>Start a new group</h2><p>Trips, roommates, dinners, events and more.</p></Link></div>
 </main></>;
}
