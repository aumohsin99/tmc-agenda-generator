// ── Global state ───────────────────────────────────────────────────────────
let MEMBERS = [];

// ── Utilities ──────────────────────────────────────────────────────────────
function val(id)   { return (document.getElementById(id)?.value || '').trim(); }
function set(id,v) { const el = document.getElementById(id); if (el) el.value = v; }
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg, type = 'success') {
  const id   = 'toast-' + Date.now();
  const icon = type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';
  document.getElementById('toast-container').insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center border-0 mb-2" role="alert">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon}"></i> ${msg}
        </div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>`);
  const el = document.getElementById(id);
  new bootstrap.Toast(el, { delay: 3500 }).show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

// ── Member picker ──────────────────────────────────────────────────────────
function memberPickerHTML(id, value, small = false) {
  const cls     = small ? 'form-control-sm' : '';
  const isOther = value && !MEMBERS.includes(value);
  const opts    = MEMBERS.map(m =>
    `<option value="${esc(m)}"${m === value ? ' selected' : ''}>${esc(m)}</option>`
  ).join('');
  return `
    <select class="form-control ${cls} member-select" id="${id}" onchange="onMemberChange(this)">
      <option value="">— Select —</option>
      ${opts}
      <option value="__other__"${isOther ? ' selected' : ''}>✏️ Other…</option>
    </select>
    <input type="text" class="form-control ${cls} mt-1" id="${id}-custom"
           placeholder="Type full name"
           value="${isOther ? esc(value) : ''}"
           style="display:${isOther ? 'block' : 'none'}">`;
}

function onMemberChange(sel) {
  const ci = document.getElementById(sel.id + '-custom');
  if (!ci) return;
  if (sel.value === '__other__') { ci.style.display = 'block'; ci.focus(); }
  else { ci.style.display = 'none'; ci.value = ''; }
}

function getMemberValue(id) {
  const sel = document.getElementById(id);
  if (!sel) return '';
  if (sel.value === '__other__') return (document.getElementById(id+'-custom')?.value||'').trim();
  return sel.value;
}

function setMemberValue(id, value) {
  const sel = document.getElementById(id);
  if (!sel) return;
  if (!value) { sel.value = ''; return; }
  if (MEMBERS.includes(value)) { sel.value = value; return; }
  sel.value = '__other__';
  const ci = document.getElementById(id+'-custom');
  if (ci) { ci.value = value; ci.style.display = 'block'; }
}

function refreshAllMemberPickers() {
  MEMBERS = [];
  document.querySelectorAll('.member-name-input').forEach(el => {
    const n = el.value.trim();
    if (n) MEMBERS.push(n);
  });
  document.querySelectorAll('.member-select').forEach(sel => {
    const current = getMemberValue(sel.id);
    const isOther = current && !MEMBERS.includes(current);
    const opts = MEMBERS.map(m =>
      `<option value="${esc(m)}"${m === current ? ' selected' : ''}>${esc(m)}</option>`
    ).join('');
    sel.innerHTML = `
      <option value="">— Select —</option>
      ${opts}
      <option value="__other__"${isOther ? ' selected' : ''}>✏️ Other…</option>`;
    if (isOther) sel.value = '__other__';
  });
}

function initStaticPickers() {
  [
    ['role-toastmaster-wrap', 'role-toastmaster'],
    ['role-saa-wrap',         'role-saa'],
    ['role-gen-eval-wrap',    'role-gen-eval'],
    ['role-grammarian-wrap',  'role-grammarian'],
    ['role-timer-wrap',       'role-timer'],
    ['role-ah-counter-wrap',  'role-ah-counter'],
    ['tt-facilitator-wrap',   'tt-facilitator'],
  ].forEach(([wrapId, pickerId]) => {
    const wrap = document.getElementById(wrapId);
    if (wrap) wrap.innerHTML = memberPickerHTML(pickerId, '');
  });
}

// ── Members management ─────────────────────────────────────────────────────
function renderMembersUI(members) {
  const body = document.getElementById('members-body');
  if (!body) return;
  body.innerHTML = '';
  if (members.length === 0) {
    body.insertAdjacentHTML('beforeend', '<p class="text-muted small">No members yet. Add some above.</p>');
  }
  members.forEach(name => addMemberRow(name));
}

function addMemberRow(name = '') {
  const body  = document.getElementById('members-body');
  const empty = body.querySelector('p.text-muted');
  if (empty) empty.remove();
  body.insertAdjacentHTML('beforeend', `
    <div class="d-flex align-items-center gap-2 mb-2 member-row">
      <input type="text" class="form-control form-control-sm member-name-input flex-grow-1"
             placeholder="Full name" value="${esc(name)}"
             onblur="refreshAllMemberPickers()">
      <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2"
              onclick="this.closest('.member-row').remove(); refreshAllMemberPickers()">
        <i class="bi bi-trash3"></i>
      </button>
    </div>`);
}

// ── Speaker management ─────────────────────────────────────────────────────
let speakerCount = 0;

function addSpeaker(data = {}) {
  if (speakerCount >= 10) return;
  speakerCount++;
  const n = speakerCount;
  const colors  = ['#FDE8EA','#FFF8E7','#FDE8EA','#FFF8E7','#FDE8EA','#FFF8E7','#FDE8EA','#FFF8E7','#FDE8EA','#FFF8E7'];
  const borders = ['#F5B7B1','#F9E79F','#F5B7B1','#F9E79F','#F5B7B1','#F9E79F','#F5B7B1','#F9E79F','#F5B7B1','#F9E79F'];
  const bg = colors[n-1], bd = borders[n-1];
  document.getElementById('speakers-container').insertAdjacentHTML('beforeend', `
    <div class="speaker-card" id="speaker-card-${n}" style="background:${bg};border-color:${bd}">
      <div class="d-flex align-items-center mb-2">
        <span class="badge rounded-pill me-2">Speaker ${n}</span>
        <span class="fw-semibold text-muted small flex-grow-1">Prepared Speech ${n}</span>
        <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeSpeaker(${n})">
          <i class="bi bi-trash3"></i>
        </button>
      </div>
      <div class="row g-2">
        <div class="col-8 col-md-5">
          <label class="form-label small mb-1">Speaker Name</label>
          ${memberPickerHTML('spk-'+n+'-name', data.name||'', true)}
        </div>
        <div class="col-4 col-md-2">
          <label class="form-label small mb-1">Duration (min)</label>
          <input type="number" class="form-control form-control-sm" id="spk-${n}-duration"
                 min="1" max="20" value="${data.duration||7}" inputmode="numeric">
        </div>
        <div class="col-12 col-md-5">
          <label class="form-label small mb-1">Evaluator</label>
          ${memberPickerHTML('spk-'+n+'-evaluator', data.evaluator||'', true)}
        </div>
        <div class="col-12">
          <label class="form-label small mb-1">Speech Topic</label>
          <textarea class="form-control form-control-sm" id="spk-${n}-topic" rows="2"
                    placeholder="e.g. The Power of Storytelling">${esc(data.topic||'')}</textarea>
        </div>
        <div class="col-12">
          <label class="form-label small mb-1">Speech Project / Manual</label>
          <input type="text" class="form-control form-control-sm" id="spk-${n}-project"
                 placeholder="e.g. Pathways Level 2 - Speech #3"
                 value="${esc(data.speech_number||'')}">
        </div>
      </div>
    </div>`);
  updateAddSpeakerBtn();
}

function removeSpeaker(n) {
  const card = document.getElementById(`speaker-card-${n}`);
  if (card) card.remove();
  speakerCount = 0;
  document.querySelectorAll('#speakers-container .speaker-card').forEach(card => {
    speakerCount++;
    const idx    = speakerCount;
    const oldIdx = parseInt(card.id.replace('speaker-card-', ''));
    card.id = `speaker-card-${idx}`;
    card.querySelector('.badge').textContent       = `Speaker ${idx}`;
    card.querySelector('.fw-semibold').textContent = `Prepared Speech ${idx}`;
    card.querySelectorAll(`[id^="spk-${oldIdx}-"]`).forEach(el => {
      el.id = el.id.replace(`spk-${oldIdx}-`, `spk-${idx}-`);
    });
    const btn = card.querySelector('button[onclick^="removeSpeaker"]');
    if (btn) btn.setAttribute('onclick', `removeSpeaker(${idx})`);
  });
  updateAddSpeakerBtn();
}

function updateAddSpeakerBtn() {
  const btn  = document.getElementById('btn-add-speaker');
  const hint = document.getElementById('speakers-hint');
  btn.disabled = speakerCount >= 10;
  btn.classList.toggle('disabled', speakerCount >= 10);
  hint.textContent = speakerCount >= 10
    ? 'Maximum 10 speakers reached.'
    : `Up to 10 prepared speakers. ${speakerCount}/10 added.`;
}

// ── Committee ──────────────────────────────────────────────────────────────
function addCommitteeRow(data = {}) {
  document.getElementById('committee-body').insertAdjacentHTML('beforeend', `
    <tr class="committee-row">
      <td><input type="text" class="form-control form-control-sm cm-designation"
           placeholder="e.g. President" value="${esc(data.designation||'')}"></td>
      <td><input type="text" class="form-control form-control-sm cm-name"
           placeholder="Full name" value="${esc(data.name||'')}"></td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2"
                onclick="this.closest('tr').remove()">
          <i class="bi bi-trash3"></i>
        </button>
      </td>
    </tr>`);
}

// ── Data collection ────────────────────────────────────────────────────────
function collectMeetingData() {
  const speakers = [];
  document.querySelectorAll('#speakers-container .speaker-card').forEach(card => {
    const i = card.id.replace('speaker-card-', '');
    speakers.push({
      name:          getMemberValue(`spk-${i}-name`),
      topic:         val(`spk-${i}-topic`),
      duration:      parseInt(val(`spk-${i}-duration`)) || 7,
      speech_number: val(`spk-${i}-project`),
      evaluator:     getMemberValue(`spk-${i}-evaluator`),
    });
  });
  return {
    date:           val('mtg-date'),
    time:           val('mtg-time'),
    meeting_number: val('mtg-number'),
    theme:          val('mtg-theme'),
    word_of_day:    val('mtg-wod'),
    word_meaning:   val('mtg-wod-meaning'),
    roles: {
      toastmaster:       getMemberValue('role-toastmaster'),
      sergeant_at_arms:  getMemberValue('role-saa'),
      grammarian:        getMemberValue('role-grammarian'),
      timer:             getMemberValue('role-timer'),
      ah_counter:        getMemberValue('role-ah-counter'),
      general_evaluator: getMemberValue('role-gen-eval'),
    },
    speakers,
    table_topics: {
      facilitator: getMemberValue('tt-facilitator'),
      duration:    parseInt(val('tt-duration')) || 20,
    },
  };
}

function collectConfigData() {
  const committee = [];
  document.querySelectorAll('#committee-body tr').forEach(tr => {
    const des = tr.querySelector('.cm-designation')?.value?.trim();
    const nm  = tr.querySelector('.cm-name')?.value?.trim();
    if (des || nm) committee.push({ designation: des||'', name: nm||'' });
  });
  const members = [];
  document.querySelectorAll('.member-name-input').forEach(el => {
    const n = el.value.trim();
    if (n) members.push(n);
  });
  members.sort((a, b) => a.localeCompare(b));
  return {
    club: {
      name:           val('cfg-name'),
      vision:         val('cfg-vision'),
      mission:        val('cfg-mission'),
      meeting_time:   val('cfg-time'),
      location:       val('cfg-location'),
      meeting_days:   val('cfg-meeting-days'),
      social_connect: val('cfg-social-connect'),
    },
    committee,
    members,
  };
}

// ── Populate form ──────────────────────────────────────────────────────────
function populateMeeting(m) {
  set('mtg-date',        m.date || new Date().toLocaleDateString('en-CA'));
  set('mtg-time',        m.time || '');
  set('mtg-number',      m.meeting_number || '');
  set('mtg-theme',       m.theme || '');
  set('mtg-wod',         m.word_of_day || '');
  set('mtg-wod-meaning', m.word_meaning || '');
  const roles = m.roles || {};
  setMemberValue('role-toastmaster', roles.toastmaster || '');
  setMemberValue('role-saa',         roles.sergeant_at_arms || '');
  setMemberValue('role-grammarian',  roles.grammarian || '');
  setMemberValue('role-timer',       roles.timer || '');
  setMemberValue('role-ah-counter',  roles.ah_counter || '');
  setMemberValue('role-gen-eval',    roles.general_evaluator || '');
  setMemberValue('tt-facilitator',   (m.table_topics||{}).facilitator || '');
  set('tt-duration', (m.table_topics||{}).duration || 20);
  (m.speakers||[]).slice(0,10).forEach(s => addSpeaker(s));
}

function populateConfig(cfg) {
  const club = cfg.club || {};
  set('cfg-name',           club.name           || '');
  set('cfg-vision',         club.vision         || '');
  set('cfg-mission',        club.mission        || '');
  set('cfg-time',           club.meeting_time   || '');
  set('cfg-location',       club.location       || '');
  set('cfg-meeting-days',   club.meeting_days   || '');
  set('cfg-social-connect', club.social_connect || '');
  (cfg.committee||[]).forEach(row => addCommitteeRow(row));
  MEMBERS = (cfg.members||[]).slice();
  renderMembersUI(MEMBERS);
}

// ── localStorage save/load ─────────────────────────────────────────────────
function saveDraft() {
  localStorage.setItem('tm_meeting', JSON.stringify(collectMeetingData()));
  showToast('Draft saved to browser!');
}

function saveClubSettings() {
  const cfg = collectConfigData();
  // Only persist club text fields — members/committee are always loaded fresh from club-settings.json
  localStorage.setItem('tm_config', JSON.stringify({ club: cfg.club }));
  showToast('Club settings saved to browser!');
}

// ── New meeting ────────────────────────────────────────────────────────────
function newMeeting() {
  if (!confirm('Clear all meeting fields and start a new meeting?')) return;
  document.getElementById('speakers-container').innerHTML = '';
  speakerCount = 0;
  updateAddSpeakerBtn();
  set('mtg-date',        new Date().toLocaleDateString('en-CA'));
  set('mtg-time',        '');
  set('mtg-number',      '');
  set('mtg-theme',       '');
  set('mtg-wod',         '');
  set('mtg-wod-meaning', '');
  ['role-toastmaster','role-saa','role-gen-eval','role-grammarian','role-timer','role-ah-counter','tt-facilitator'].forEach(id => setMemberValue(id, ''));
  set('tt-duration', 20);
  localStorage.removeItem('tm_meeting');
  showToast('Meeting form cleared. Ready for a new meeting.');
}

// ── Time utilities ─────────────────────────────────────────────────────────
function normalizeTime(s) {
  const str = s.trim();
  if (!str) return str;
  const m = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return str;
  let h = parseInt(m[1]);
  const min = m[2] ? parseInt(m[2]) : 0;
  const period = m[3] ? m[3].toUpperCase() : null;
  if (period) {
    return `${h}:${String(min).padStart(2,'0')} ${period}`;
  } else if (h >= 13) {
    return `${h - 12}:${String(min).padStart(2,'0')} PM`;
  } else if (h === 12) {
    return `12:${String(min).padStart(2,'0')} PM`;
  } else if (h === 0) {
    return `12:${String(min).padStart(2,'0')} AM`;
  }
  return `${h}:${String(min).padStart(2,'0')}`;
}

function parseTime(s) {
  const str = (s || '2:00 PM').trim().toUpperCase();
  const m = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!m) return { h: 14, m: 0 };
  let h = parseInt(m[1]), min = parseInt(m[2]);
  const period = m[3];
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return { h, m: min };
}

function addMinutes(t, mins) {
  const total = t.h * 60 + t.m + mins;
  return { h: Math.floor(total / 60) % 24, m: ((total % 60) + 60) % 60 };
}

function formatTime(t) {
  let h = t.h, period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(t.m).padStart(2,'0')} ${period}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  } catch(e) { return dateStr; }
}

// ── Agenda row builder ─────────────────────────────────────────────────────
function buildAgendaRows(meeting, config) {
  const club      = (config && config.club) || {};
  const committee = (config && config.committee) || [];
  const president = (committee.find(m => (m.designation||'').toLowerCase().includes('president'))||{}).name || '';

  const roles      = meeting.roles || {};
  const toastmaster = roles.toastmaster || '';
  const saa         = roles.sergeant_at_arms || '';
  const grammarian  = roles.grammarian || '';
  const timer       = roles.timer || '';
  const ahCounter   = roles.ah_counter || '';
  const genEval     = roles.general_evaluator || '';

  const speakers = (meeting.speakers || []).slice(0, 10);
  const ttObj    = meeting.table_topics || {};
  const ttHost   = ttObj.facilitator || '';
  const ttDur    = parseInt(ttObj.duration || 20);

  let cur = parseTime(meeting.time || club.meeting_time || '2:00 PM');

  function row(dur, act, person, type) {
    const t = cur;
    if (parseInt(dur||0) > 0) cur = addMinutes(cur, dur);
    return { type: type||'fixed', time: t, dur: parseInt(dur||0), act, person: person||'' };
  }
  function seg(title) {
    return { type: 'segment', title, time: null, dur: 0, act: title, person: '' };
  }

  const rows = [];
  rows.push(seg('MEETING STARTS'));
  rows.push(row(2, 'Open Meeting, Play National Anthem & Invite the President', saa));
  rows.push(row(5, "President's Address and Official Start of the Meeting", president));
  rows.push(row(5, 'Opening Remarks, Welcome Guests, Meeting Agenda & Business Session by Toastmaster of the Day', toastmaster));
  rows.push(row(2, 'Introduce Role Players', toastmaster, 'sub_header'));
  rows.push(row(1, 'General Evaluator', genEval,    'role'));
  rows.push(row(1, 'Grammarian',        grammarian, 'role'));
  rows.push(row(1, 'Ah-Counter',        ahCounter,  'role'));
  rows.push(row(1, 'Timer',             timer,      'role'));

  if (speakers.length > 0) {
    rows.push(seg('PREPARED SPEECHES SEGMENT'));
    speakers.forEach((spk, i) => {
      const dur  = parseInt(spk.duration || 7);
      const proj = spk.speech_number || '';
      rows.push(row(dur, `Speech #${i+1} Title: ${spk.topic||''}`, spk.name||'', 'speaker'));
      if (proj) rows.push(row(0, `Speech Details — ${proj}`, '', 'details'));
      rows.push(row(0, 'Speech Evaluator', spk.evaluator||'', 'evaluation'));
    });
    rows.push(row(2, "Timer's Report", timer, 'report'));
    rows.push(row(0, 'Voting Reminder', '', 'voting'));
  }

  rows.push(seg('TABLE TOPICS SEGMENT'));
  rows.push(row(ttDur, 'Table Topics Session (Impromptu Speaking)', ttHost, 'table_topics'));
  rows.push(row(2, "Timer's Report", timer, 'report'));
  rows.push(row(0, 'Voting Reminder', '', 'voting'));

  rows.push(seg('EVALUATION (FEEDBACK) SEGMENT'));
  speakers.forEach((spk, i) => {
    rows.push(row(3, `Feedback for Speaker #${i+1}: ${spk.name||''}`, spk.evaluator||'', 'evaluation'));
  });
  if (speakers.length > 0) {
    rows.push(row(2, "Timer's Report", timer, 'report'));
    rows.push(row(0, 'Voting Reminder', '', 'voting'));
  }
  rows.push(row(2, 'Ah-Counter Report',  ahCounter,  'report'));
  rows.push(row(2, 'Grammarian Report',  grammarian, 'report'));
  rows.push(row(5, 'Awards Segment',     toastmaster,'fixed'));
  rows.push(row(5, 'Overall Meeting Report by General Evaluator', genEval, 'fixed'));

  rows.push(seg('MEETING CLOSURE'));
  rows.push(row(5, 'Toastmaster of the Day makes announcements (if any), invites feedback, and wraps up the session', toastmaster));
  rows.push(row(2, 'President adjourns the meeting.', president));

  return rows;
}

// ── pdfmake PDF generation ─────────────────────────────────────────────────
const MM = 2.8346;
const A4W = 595.28;
const LM  = 20 * MM;
const RM  = 20 * MM;
const BM  = 14 * MM;
const contentW = A4W - LM - RM;   // 481.9 pt
const LP_W  = 36 * MM;            // 102 pt
const LP_GAP = 5 * MM;            // 14 pt
const RP_W  = contentW - LP_W - LP_GAP; // 365.7 pt
const CT = 20 * MM;  // TIME col
const CD = 16 * MM;  // DURATION col
const CA = 62 * MM;  // ACTIVITY col
const CP = RP_W - CT - CD - CA - 2;  // ASSIGNED TO col (-2 keeps right border inside bounds)

const ROW_COLORS_JS = {
  fixed:        ['#FFFFFF', '#F5F5F5'],
  wod:          ['#FFFFFF', '#F5F5F5'],
  speaker:      ['#FDE8EA', '#FBDADC'],
  table_topics: ['#FFF8E7', '#FFF0D0'],
  evaluation:   ['#FDF0F1', '#F9E4E6'],
  report:       ['#FFFFFF', '#F5F5F5'],
  role:         ['#FEF6F6', '#F5F5F5'],
  voting:       ['#FFF8E7', '#FFF0D0'],
  details:      ['#F5F5F5', '#EBEBEB'],
  sub_header:   ['#F5E6E6', '#EED8D8'],
};

function buildPdfDefinition(meeting, config) {
  const club      = (config && config.club) || {};
  const committee = (config && config.committee) || [];
  const clubName  = (club.name || 'Toastmasters Club').toUpperCase();
  const vision    = club.vision || '';
  const mission   = club.mission || '';
  const location  = club.location || '';

  const mtgDate = meeting.date || '';
  const mtgTime = meeting.time || club.meeting_time || '2:00 PM';
  const mtgNum  = meeting.meeting_number || '';
  const theme   = meeting.theme || '';
  const wod     = meeting.word_of_day || '';
  const wodMean = meeting.word_meaning || '';

  const dateStr   = formatDate(mtgDate);
  const reportStr = formatTime(addMinutes(parseTime(mtgTime), -15));

  const rows = buildAgendaRows(meeting, config);

  // ── Header ───────────────────────────────────────────────────────────
  const hdrStack = [];
  hdrStack.push({ text: clubName, bold: true, fontSize: 18, color: 'white', alignment: 'center', margin: [0,0,0,4] });
  if (mtgNum) hdrStack.push({ text: `Meeting No. ${mtgNum}`, fontSize: 10, color: '#F5CBA7', alignment: 'center', margin: [0,0,0,3] });
  // Date · Time · Reporting Time — all on one line
  const dateTimeParts = [dateStr, mtgTime, reportStr ? `Reporting: ${reportStr}` : ''].filter(Boolean);
  if (dateTimeParts.length) hdrStack.push({ text: dateTimeParts.join('   ·   '), fontSize: 10, bold: true, color: '#E8A020', alignment: 'center', margin: [0,0,0,3] });
  if (location) {
    hdrStack.push({ text: `MEETING LOCATION: ${location}`, fontSize: 9, color: '#E8D5D5', alignment: 'center', margin: [0,0,0,0] });
  }

  // pageMargins top = 24pt; offset header up by -24 so the red band still starts at y=0
  const header = {
    margin: [-LM, -24, -RM, 4*MM],
    table: { widths: ['*'], body: [[{
      fillColor: '#AC1623',
      border: [false,false,false,false],
      stack: hdrStack,
      margin: [8*MM, 12*MM, 8*MM, 5*MM]
    }]] },
    layout: { hLineWidth: ()=>0, vLineWidth: ()=>0 }
  };

  // ── Highlight box ─────────────────────────────────────────────────────
  const wdStack = [
    { text: 'WORD OF THE DAY', fontSize: 7, bold: true, color: '#AC1623', alignment: 'center', margin: [0,0,0,3] },
    { text: wod || '—', fontSize: 10, bold: true, color: '#1A1A1A', alignment: 'center', margin: [0,0,0, wodMean?2:0] },
  ];
  if (wodMean) wdStack.push({ text: `"${wodMean}"`, fontSize: 8, italics: true, color: '#555555', alignment: 'center' });

  const hlBox = {
    margin: [0, 0, 0, 4*MM],
    table: {
      widths: ['50%','50%'],
      body: [[
        { stack: [
            { text: 'THEME', fontSize: 7, bold: true, color: '#AC1623', alignment: 'center', margin: [0,0,0,3] },
            { text: theme||'—', fontSize: 10, bold: true, color: '#1A1A1A', alignment: 'center' }
          ], fillColor: '#FFF8E7', border: [true,true,false,true], margin: [4,6,4,6] },
        { stack: wdStack, fillColor: '#FFF8E7', border: [false,true,true,true], margin: [4,6,4,6] }
      ]]
    },
    layout: { hLineColor: ()=>'#E8A020', vLineColor: ()=>'#E8A020', hLineWidth: ()=>1.5, vLineWidth: ()=>1 }
  };

  // ── Left panel ────────────────────────────────────────────────────────
  const lpChildren = [];
  lpChildren.push({
    table: { widths: ['*'], body: [[{
      text: 'CLUB MANAGEMENT', fontSize: 7, bold: true, color: 'white',
      alignment: 'center', fillColor: '#7C0E14',
      border: [false,false,false,false], margin: [0,5,0,5]
    }]] },
    layout: { hLineWidth: ()=>0, vLineWidth: ()=>0 }, margin: [0,0,0,4]
  });
  committee.forEach(m => {
    lpChildren.push({ text: (m.designation||'').toUpperCase(), fontSize: 7.5, bold: true, color: '#AC1623', alignment: 'center', margin: [0,0,0,1] });
    lpChildren.push({ text: m.name||'', fontSize: 9, bold: true, color: '#1A1A1A', alignment: 'center', margin: [0,0,0,5] });
  });

  function lpDivider() {
    return { canvas: [{ type:'line', x1:0, y1:0, x2:LP_W, y2:0, lineWidth:0.8, lineColor:'#E8A020' }], margin:[0,4,0,8] };
  }
  function lpSection(label, text) {
    if (!text) return null;
    return { stack: [
      { text: label, fontSize: 7.5, bold: true, color: '#AC1623', alignment: 'center', margin:[0,0,0,2] },
      { text, fontSize: 9, color: '#1A1A1A', alignment: 'center', margin:[0,0,0,4] }
    ]};
  }

  lpChildren.push(lpDivider());
  [['VISION', vision],['MISSION', mission]].forEach(([l,t]) => {
    const s = lpSection(l,t); if(s) lpChildren.push(s);
  });
  lpChildren.push(lpDivider());
  const md = lpSection('MEETING DAYS', club.meeting_days || '');
  if (md) lpChildren.push(md);
  lpChildren.push(lpDivider());
  const sc = lpSection('HOW TO CONNECT WITH US?', club.social_connect || '');
  if (sc) lpChildren.push(sc);

  // ── Agenda table ──────────────────────────────────────────────────────
  const agendaBody = [[
    { text:'TIME',            bold:true, fontSize:9, color:'white', fillColor:'#7C0E14', alignment:'center', margin:[2,4,2,4], border:[true,true,true,true] },
    { text:'DURATION',        bold:true, fontSize:9, color:'white', fillColor:'#7C0E14', alignment:'center', margin:[2,4,2,4], border:[true,true,true,true], noWrap:true },
    { text:'ACTIVITY / SPEECH',bold:true,fontSize:9, color:'white', fillColor:'#7C0E14', alignment:'center', margin:[2,4,2,4], border:[true,true,true,true] },
    { text:'ASSIGNED TO',     bold:true, fontSize:9, color:'white', fillColor:'#7C0E14', alignment:'center', margin:[2,4,2,4], border:[true,true,true,true] },
  ]];

  let rowColorIdx = 0;
  rows.forEach(r => {
    if (r.type === 'segment') {
      agendaBody.push([
        { text: r.title, colSpan:4, bold:true, fontSize:10, color:'white', fillColor:'#7C0E14', alignment:'center', margin:[4,4,4,3], border:[true,false,true,false] },
        {},{},{}
      ]);
      rowColorIdx = 0;
    } else {
      const clrs = ROW_COLORS_JS[r.type] || ['#FFFFFF','#F5F5F5'];
      const fill = clrs[rowColorIdx % 2];
      rowColorIdx++;
      const isBold   = ['speaker','sub_header'].includes(r.type);
      const timeStr  = r.time ? formatTime(r.time) : '';
      const durStr   = r.dur > 0 ? `${r.dur} min` : '—';
      agendaBody.push([
        { text:timeStr,  bold:true, fontSize:8.5, color:'#AC1623', alignment:'center', fillColor:fill, margin:[2,2,2,2] },
        { text:durStr,   fontSize:8.5, alignment:'center', fillColor:fill, margin:[2,2,2,2] },
        { text:r.act,    bold:isBold,  fontSize:10, alignment:'left', fillColor:fill, margin:[3,2,2,2] },
        { text:r.person, fontSize:9.5, color:'#555555', alignment:'center', fillColor:fill, margin:[2,2,2,2] },
      ]);
    }
  });

  const agendaTable = {
    table: { widths:[CT,CD,CA,CP], headerRows:1, body:agendaBody, dontBreakRows:true },
    layout: {
      hLineWidth: (i,n) => (i===0||i===n.table.body.length) ? 1.5 : 0.25,
      vLineWidth: (i,n) => (i===0||i===n.table.widths.length) ? 1.5 : 0.4,
      hLineColor: ()=>'#AC1623',
      vLineColor: (i,n) => (i===0||i===n.table.widths.length) ? '#AC1623' : '#CCCCCC',
      paddingLeft:   ()=>0, paddingRight:  ()=>0,
      paddingTop:    ()=>0, paddingBottom: ()=>0,
    }
  };

  // Gold line sits inside the agenda column — appears right after the last agenda row
  const footerLine = {
    canvas: [{ type:'line', x1:0, y1:0, x2:RP_W, y2:0, lineWidth:0.8, lineColor:'#E8A020' }],
    margin: [0, 8, 0, 0]
  };

  // ── Body: 3-col columns (left panel | gap | agenda) ───────────────────
  // Using columns instead of nested table avoids right-border clipping
  const body = {
    columns: [
      { width: LP_W,   stack: lpChildren },
      { width: LP_GAP, text: '' },
      { width: RP_W,   stack: [agendaTable, footerLine] }
    ],
    columnGap: 0
  };

  return {
    pageSize: 'A4',
    pageMargins: [LM, 24, RM, BM],
    // Page 2+ gets a compact continuation banner in the 24pt top margin
    header: function(currentPage) {
      if (currentPage === 1) return {};
      return {
        margin: [LM + LP_W + LP_GAP, 6, RM, 0],
        table: { widths: [RP_W], body: [[{
          fillColor: '#7C0E14',
          border: [false,false,false,false],
          text: clubName + '  —  MEETING AGENDA (CONTINUED)',
          fontSize: 8, bold: true, color: 'white',
          alignment: 'center', margin: [4, 6, 4, 6]
        }]] },
        layout: { hLineWidth: ()=>0, vLineWidth: ()=>0 }
      };
    },
    content: [header, hlBox, body],
    defaultStyle: { fontSize: 10 }
  };
}

// ── Word document generation ───────────────────────────────────────────────
async function buildWordDoc(meeting, config) {
  const {
    Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun,
    WidthType, AlignmentType, ShadingType, BorderStyle
  } = docx;

  const club     = (config && config.club) || {};
  const clubName = (club.name || 'Toastmasters Club').toUpperCase();
  const dateStr  = formatDate(meeting.date || '');
  const mtgTime  = meeting.time || club.meeting_time || '';
  const mtgNum   = meeting.meeting_number || '';
  const theme    = meeting.theme || '';
  const wod      = meeting.word_of_day || '';
  const wodMean  = meeting.word_meaning || '';

  const rows = buildAgendaRows(meeting, config);

  function cellShade(fill) {
    return { fill: fill.replace('#',''), type: ShadingType.SOLID, color: fill.replace('#','') };
  }
  function noBorder() {
    const b = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    return { top:b, bottom:b, left:b, right:b };
  }
  function thinBorder(color='CCCCCC') {
    const b = { style: BorderStyle.SINGLE, size: 4, color: color.replace('#','') };
    return { top:b, bottom:b, left:b, right:b };
  }

  const W_T  = 900;   // TIME col twips (relative)
  const W_D  = 720;
  const W_A  = 3200;
  const W_P  = 1580;
  const W_TOT = W_T + W_D + W_A + W_P;

  // Header table rows
  const tableRows = [];

  // Column header row
  tableRows.push(new TableRow({ children:
    ['TIME','DURATION','ACTIVITY / SPEECH','ASSIGNED TO'].map((h, i) =>
      new TableCell({
        width: { size: [W_T,W_D,W_A,W_P][i], type: WidthType.DXA },
        shading: cellShade('#7C0E14'),
        borders: noBorder(),
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })]
        })]
      })
    )
  }));

  rows.forEach(r => {
    if (r.type === 'segment') {
      tableRows.push(new TableRow({ children: [
        new TableCell({
          columnSpan: 4,
          width: { size: W_TOT, type: WidthType.DXA },
          shading: cellShade('#7C0E14'),
          borders: noBorder(),
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: r.title, bold: true, color: 'FFFFFF', size: 20 })]
          })]
        })
      ]}));
    } else {
      const timeStr = r.time ? formatTime(r.time) : '';
      const durStr  = r.dur > 0 ? `${r.dur} min` : '—';
      const isBold  = ['speaker','sub_header'].includes(r.type);
      tableRows.push(new TableRow({ children: [
        new TableCell({ width:{size:W_T,type:WidthType.DXA}, borders:thinBorder(),
          children: [new Paragraph({ alignment:AlignmentType.CENTER,
            children:[new TextRun({text:timeStr, bold:true, color:'AC1623', size:17})] })] }),
        new TableCell({ width:{size:W_D,type:WidthType.DXA}, borders:thinBorder(),
          children: [new Paragraph({ alignment:AlignmentType.CENTER,
            children:[new TextRun({text:durStr, size:17})] })] }),
        new TableCell({ width:{size:W_A,type:WidthType.DXA}, borders:thinBorder(),
          children: [new Paragraph({
            children:[new TextRun({text:r.act, bold:isBold, size:20})] })] }),
        new TableCell({ width:{size:W_P,type:WidthType.DXA}, borders:thinBorder(),
          children: [new Paragraph({ alignment:AlignmentType.CENTER,
            children:[new TextRun({text:r.person, color:'555555', size:19})] })] }),
      ]}));
    }
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } }
      },
      children: [
        // Club name
        new Paragraph({
          alignment: AlignmentType.CENTER,
          shading: cellShade('#AC1623'),
          children: [new TextRun({ text: clubName, bold: true, size: 36, color: 'FFFFFF' })]
        }),
        // Meeting details
        ...(mtgNum ? [new Paragraph({ alignment:AlignmentType.CENTER,
          children:[new TextRun({text:`Meeting No. ${mtgNum}`, size:20, color:'555555'})] })] : []),
        ...([dateStr, mtgTime].filter(Boolean).length ? [new Paragraph({ alignment:AlignmentType.CENTER,
          children:[new TextRun({text:[dateStr,mtgTime].filter(Boolean).join('   ·   '), size:20, bold:true})] })] : []),
        new Paragraph({}),
        // Theme & WoD
        ...(theme ? [
          new Paragraph({ children:[new TextRun({text:'THEME: ', bold:true, color:'AC1623'}), new TextRun({text:theme})] })
        ] : []),
        ...(wod ? [
          new Paragraph({ children:[new TextRun({text:'WORD OF THE DAY: ', bold:true, color:'AC1623'}), new TextRun({text:wod})] }),
          ...(wodMean ? [new Paragraph({ children:[new TextRun({text:`"${wodMean}"`, italics:true, color:'555555'})] })] : [])
        ] : []),
        new Paragraph({}),
        // Agenda table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        }),
      ]
    }]
  });

  return await Packer.toBlob(doc);
}

// ── Generate files ─────────────────────────────────────────────────────────
async function generateFiles() {
  if (!val('mtg-date'))   { showToast('Please enter a meeting date before downloading.', 'error'); return; }
  if (!val('mtg-number')) { showToast('Please enter a meeting number before downloading.', 'error'); return; }

  const meeting = collectMeetingData();
  const config  = collectConfigData();

  showToast('Generating files…', 'success');

  // PDF
  try {
    const dd = buildPdfDefinition(meeting, config);
    pdfMake.createPdf(dd).download('Lahore Toastmasters Club Meeting Agenda.pdf');
  } catch(e) {
    console.error('PDF error:', e);
    showToast('PDF generation failed: ' + e.message, 'error');
    return;
  }

  // Word
  try {
    const blob = await buildWordDoc(meeting, config);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'Lahore Toastmasters Club Meeting Agenda.docx'; a.click();
    URL.revokeObjectURL(url);
  } catch(e) {
    console.error('Word error:', e);
    showToast('Word generation failed: ' + e.message, 'error');
    return;
  }

  showToast('PDF and Word file downloaded!');
}

// ── Init ───────────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const [cfgRes, mtgRes] = await Promise.all([
      fetch('club-settings.json'),
      fetch('meeting.json'),
    ]);
    const [cfgJson, mtgJson] = await Promise.all([cfgRes.json(), mtgRes.json()]);

    // members + committee always come from the live club-settings.json (admin-controlled).
    // Only club text fields (name, vision, etc.) can be overridden by localStorage.
    // Meeting form data (roles, speakers, date) can be overridden by localStorage.
    const savedCfg = localStorage.getItem('tm_config');
    const savedMtg = localStorage.getItem('tm_meeting');

    const localCfg = savedCfg ? JSON.parse(savedCfg) : null;
    const cfg = {
      // user-editable club text fields come from localStorage if saved
      club: (localCfg && localCfg.club) ? localCfg.club : cfgJson.club,
      // members + committee always from the fetched file — never stale
      members:   (cfgJson.members   || []).slice().sort((a,b) => a.localeCompare(b)),
      committee: cfgJson.committee,
    };
    const mtg = savedMtg ? JSON.parse(savedMtg) : mtgJson;

    MEMBERS = (cfg.members || []).slice();
    initStaticPickers();
    populateConfig(cfg);
    populateMeeting(mtg);
  } catch(e) {
    console.error('Failed to load data:', e);
    showToast('Could not load config/meeting data. Check console.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadData);
