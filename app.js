/* Dosing logic — mg rounded to 1 decimal; round bolus first */
function round1(x){ return Math.round((x + Number.EPSILON) * 10)/10; }
function n(id){ return Number(document.getElementById(id).value||0); }
function volume(mg){ return mg; } // 1 mg/mL
function boxes(totalMg){ return Math.ceil(totalMg/50); } // Actilyse 50 mg

// Tabs
document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.dataset.tab;
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    document.getElementById(key).classList.add('active');
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

function renderRows(rows){
  return '<div class="result card">' +
    rows.map(([l,v])=>`<div class="row"><div>${l}</div><div><b>${v}</b></div></div>`).join('') +
    '</div>';
}
function detailsCalc(lines){
  return `<details style="margin-top:8px"><summary>กางดูการคำนวณ</summary><ul style="line-height:1.6;margin-top:8px">`+
    lines.map(t=>`<li><code>${t}</code></li>`).join('')+`</ul></details>`;
}

// AIS
document.getElementById('ais-calc').addEventListener('click', ()=>{
  const age=n('ais-age'), wt=n('ais-weight');
  const reg=document.getElementById('ais-regimen').value;
  const cfg = reg==='std' ? {name:'Standard 0.9 mg/kg', perKg:0.9, max:90, bol:10} : {name:'Low 0.6 mg/kg', perKg:0.6, max:60, bol:15};
  const rawTotal = wt*cfg.perKg;
  const total = Math.min(round1(rawTotal), cfg.max);
  const bolus = round1(total * cfg.bol/100);
  const infusion = round1(total - bolus);

  const rows=[
    ['Regimen', cfg.name],
    ['อายุ / น้ำหนัก', `${age} ปี • ${wt} กก.`],
    ['Total dose', `${total} mg`],
    ['Bolus', `${bolus} mg • ${volume(bolus)} mL`],
    ['Infusion (60 นาที)', `${infusion} mg • ${volume(infusion)} mL`],
    ['จำนวนกล่อง Actilyse 50 mg', `${boxes(total)} กล่อง`],
    ['คำเตือนอายุ', age<18 ? '<span style="color:#b91c1c">AIS: <18 ปี — ทบทวนเกณฑ์</span>' : 'ผ่านเกณฑ์อายุ (≥18 ปี)']
  ];
  const lines=[
    `total = min( round1(${wt} × ${cfg.perKg}), ${cfg.max} ) = ${total} mg`,
    `bolus = round1( ${cfg.bol}% × total ) = ${bolus} mg`,
    `infusion = round1( total − bolus ) = ${infusion} mg`,
    `กล่อง Actilyse = ceil( total / 50 ) = ${boxes(total)}`,
    `ปริมาตร = mg (1 mg/mL)`
  ];
  document.getElementById('ais-result').innerHTML = renderRows(rows) + detailsCalc(lines);
});

// STEMI
document.getElementById('stemi-calc').addEventListener('click', ()=>{
  const age=n('stemi-age'), wt=n('stemi-weight');
  const reg=document.getElementById('stemi-regimen').value;
  if(reg==='accel'){
    const step1=15, step2=Math.min(round1(0.75*wt),50), step3=Math.min(round1(0.5*wt),35);
    const total=round1(step1+step2+step3);
    const rows=[
      ['Regimen','Accelerated 90 นาที'],
      ['อายุ / น้ำหนัก', `${age} ปี • ${wt} กก.`],
      ['Bolus', `${step1} mg`],
      ['0.75 mg/kg / 30 นาที', `${step2} mg`],
      ['0.5 mg/kg / 60 นาที', `${step3} mg`],
      ['Total dose', `${total} mg`],
      ['จำนวนกล่อง Actilyse 50 mg', `${boxes(total)} กล่อง`],
    ];
    const lines=[
      `step2 = min( round1(0.75 × ${wt}), 50 ) = ${step2} mg`,
      `step3 = min( round1(0.5 × ${wt}), 35 ) = ${step3} mg`,
      `total = round1(15 + step2 + step3) = ${total} mg`,
      `กล่อง = ceil( total / 50 ) = ${boxes(total)}`
    ];
    document.getElementById('stemi-result').innerHTML = renderRows(rows) + detailsCalc(lines);
  }else{
    const bol=10, h1=50, h23=40, total=round1(bol+h1+h23);
    const rows=[
      ['Regimen','3 ชั่วโมง'],
      ['อายุ / น้ำหนัก', `${age} ปี • ${wt} กก.`],
      ['Bolus', `${bol} mg`],
      ['Infuse 60 นาที', `${h1} mg`],
      ['Infuse 120 นาที', `${h23} mg`],
      ['Total dose', `${total} mg`],
      ['จำนวนกล่อง Actilyse 50 mg', `${boxes(total)} กล่อง`],
    ];
    const lines=[
      `total = round1(10 + 50 + 40) = ${total} mg`,
      `กล่อง = ceil( total / 50 ) = ${boxes(total)}`
    ];
    document.getElementById('stemi-result').innerHTML = renderRows(rows) + detailsCalc(lines);
  }
});

// PE
document.getElementById('pe-calc').addEventListener('click', ()=>{
  const age=n('pe-age'), wt=n('pe-weight');
  const reg=document.getElementById('pe-regimen').value;
  const total= reg==='pe100' ? 100 : 50;
  const rows=[
    ['Regimen', reg==='pe100'?'100 mg / 2 ชั่วโมง':'50 mg / 2 ชั่วโมง (reduced)'],
    ['อายุ / น้ำหนัก', `${age} ปี • ${wt} กก.`],
    ['Total dose', `${total} mg`],
    ['ปริมาตรรวม', `${total} mL (1 mg/mL)`],
    ['เวลาหยด', `120 นาที`],
    ['จำนวนกล่อง Actilyse 50 mg', `${boxes(total)} กล่อง`],
  ];
  const lines=[
    `total = ${total} mg`,
    `กล่อง = ceil( total / 50 ) = ${boxes(total)}`
  ];
  document.getElementById('pe-result').innerHTML = renderRows(rows) + detailsCalc(lines);
});

// Cathflo
document.getElementById('cf-calc').addEventListener('click', ()=>{
  const age=n('cf-age'), wt=n('cf-weight'), lumen=n('cf-lumen');
  const lumens=Math.max(1, parseInt(document.getElementById('cf-lumens').value||1,10));
  let perMg, perMl, note='';
  if(wt>=30){ perMg=2.0; perMl=2.0; note='≥30 กก.: 2 mg (2 mL) ต่อหนึ่งลูเมน; dwell 30–120 นาที; ทำซ้ำได้ 1 ครั้งหากยังไม่เปิด'; }
  else { perMg=Math.min(2.0, round1(1.1*lumen)); perMl=perMg; note='<30 กก.: 110% ของปริมาตรลูเมน (สูงสุด 2 mg/2 mL) ต่อหนึ่งลูเมน'; }
  const totalMg=round1(perMg*lumens), totalMl=round1(perMl*lumens);
  const rows=[
    ['อายุ / น้ำหนัก', `${age} ปี • ${wt} กก.`],
    ['ขนาดต่อหนึ่งลูเมน', `${perMg} mg = ${perMl} mL`],
    ['จำนวนลูเมน', `${lumens}`],
    ['Total', `${totalMg} mg = ${totalMl} mL`],
    ['คำแนะนำ', note],
  ];
  const lines=[
    wt>=30 ? `per-lumen = 2 mg (2 mL)` : `per-lumen = min( round1(1.1 × lumenVol=${lumen}), 2 ) = ${perMg} mg`,
    `รวม = per-lumen × ${lumens} ลูเมน = ${totalMg} mg`
  ];
  document.getElementById('cf-result').innerHTML = renderRows(rows) + detailsCalc(lines);
});
