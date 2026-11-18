/* The Packet Dispatch Bureau — N10-009 Lesson 1.5: Traffic Types (static port)
   Extracted verbatim from the audited single-file lab (all audit fixes included).
   Self-test harness (?selftest=1) — console-only diagnostics.
   Classic script (no modules) so the lab also runs from file:// after unzip. */

/* self-test (append ?selftest=1 to the URL; writes to console only then) */
(function selftest(){
  try{
    const params=new URLSearchParams(location.search);
    if(params.get("selftest")!=="1") return;
    const t=[];
    const ids=OBJ_DEFS.map(o=>o.id);
    t.push(["unique objective ids", new Set(ids).size===ids.length]);
    t.push(["11 medium objectives", OBJS_OF("medium").length===11]);
    t.push(["10 hard objectives", OBJS_OF("hard").length===10]);
    Object.keys(QUIZ).forEach(m=>{
      t.push([`quiz ${m}: 7 items, options sane`,
        QUIZ[m].length===7&&QUIZ[m].every(q=>q.opts.length===4&&q.correct>=0&&q.correct<4&&typeof q.exp==="string")]);
      const idx=QUIZ[m].map(q=>q.correct);
      t.push([`quiz ${m}: correct-position rotates (R4)`,
        new Set(idx).size>1 && idx.every((v,i)=>i===0||v!==QUIZ[m][i-1].correct)]);
      const wc=s=>s.trim().split(/\s+/).length;
      t.push([`quiz ${m}: correct answer never longest, within 1 word (R5)`,
        QUIZ[m].every(q=>{ const L=q.opts.map(wc); const mw=Math.max(...L.filter((_,j)=>j!==q.correct));
          return L[q.correct]<=mw && mw-L[q.correct]<=1; })]);
    });
    FRAMES.forEach(f=>t.push([`frame ${f.id} type valid`, TRAFFIC_TYPES.includes(f.type)]));
    const pristine=defaultState();
    OBJ_DEFS.forEach(o=>{ let r; try{ r=o.validate(pristine); }catch(e){ r=null; }
      t.push([`${o.id} validator runs & rejects pristine`, !!r&&r.pass===false&&typeof r.fail==="string"]); });
    GLOSSARY.forEach(g=>t.push([`glossary ${g[0]}`, g.length===2&&g[1].length>10]));
    const fails=t.filter(x=>!x[1]);
    console.log(fails.length===0?"SELFTEST OK — all checks passed":"SELFTEST FAILURES:", fails.length?fails:t.map(x=>x[0]));
  }catch(e){ console.error("selftest crashed", e); }
})();
