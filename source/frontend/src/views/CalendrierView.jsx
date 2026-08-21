import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Pour la simplicité du clone : fériés français fixes + Lundi de Pâques calculé
const easterDate = (year) => {
  // Algorithme de Meeus/Jones/Butcher
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const holidayList = (year) => {
  const easter = easterDate(year);
  const easterMon = new Date(easter); easterMon.setDate(easter.getDate() + 1);
  const ascension = new Date(easter); ascension.setDate(easter.getDate() + 39);
  const pentecost = new Date(easter); pentecost.setDate(easter.getDate() + 50);
  return [
    { d: new Date(year, 0, 1), label: "Jour de l'An" },
    { d: easterMon, label: 'Lundi de Pâques' },
    { d: new Date(year, 4, 1), label: 'Fête du Travail' },
    { d: new Date(year, 4, 8), label: 'Victoire 1945' },
    { d: ascension, label: 'Ascension' },
    { d: pentecost, label: 'Lundi de Pentecôte' },
    { d: new Date(year, 6, 14), label: 'Fête Nationale' },
    { d: new Date(year, 7, 15), label: 'Assomption' },
    { d: new Date(year, 10, 1), label: 'Toussaint' },
    { d: new Date(year, 10, 11), label: 'Armistice 1918' },
    { d: new Date(year, 11, 25), label: 'Noël' }
  ];
};

const EVENT_COLORS = [
  { value: '#6c63ff', label: 'Violet' },
  { value: '#3ecf8e', label: 'Vert' },
  { value: '#f97316', label: 'Orange' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#ec4899', label: 'Rose' },
  { value: '#facc15', label: 'Jaune' },
  { value: '#ef4444', label: 'Rouge' },
  { value: '#a855f7', label: 'Mauve' }
];

const CalendrierView = () => {
  const { data, upsertCalEvent, deleteCalEvent, setWorkSaturday } = useApp();
  const [cursor, setCursor] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', color: '#6c63ff', sequenceId: '' });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const holidays = useMemo(() => holidayList(year), [year]);
  const holidayMap = useMemo(() => {
    const m = new Map();
    holidays.forEach(h => m.set(h.d.toDateString(), h.label));
    return m;
  }, [holidays]);

  // Construire la grille du mois (commençant lundi)
  const gridDays = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = (first.getDay() + 6) % 7; // 0 = lundi
    const days = [];
    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, 1 - (startDow - i));
      days.push({ date: d, inMonth: false });
    }
    const last = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= last; i++) {
      days.push({ date: new Date(year, month, i), inMonth: true });
    }
    while (days.length % 7 !== 0) {
      const lastD = days[days.length - 1].date;
      const d = new Date(lastD); d.setDate(lastD.getDate() + 1);
      days.push({ date: d, inMonth: false });
    }
    return days;
  }, [year, month]);

  const eventsForDay = (date) => {
    const ds = date.toDateString();
    return data.calendar.events.filter(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate || e.startDate);
      return date >= start && date <= end;
    });
  };

  const openDayModal = (date) => {
    setSelectedDay(date);
    setEventForm({ title: '', color: '#6c63ff', sequenceId: '', endDate: date.toISOString().slice(0, 10) });
    setShowModal(true);
  };

  const saveEvent = () => {
    if (!selectedDay || !eventForm.title.trim()) return;
    const id = 'evt_' + Date.now();
    upsertCalEvent({
      id,
      title: eventForm.title.trim(),
      color: eventForm.color,
      sequenceId: eventForm.sequenceId || null,
      startDate: selectedDay.toISOString(),
      endDate: new Date(eventForm.endDate).toISOString()
    });
    setShowModal(false);
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="app-view" style={{ display: 'block', overflowY: 'auto' }}>
      <div className="dash" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
          <div>
            <h1 className="dash-title" style={{ marginBottom: 0 }}>Calendrier scolaire</h1>
            <p className="dash-sub" style={{ marginBottom: 0 }}>Planifiez vos séquences au fil de l'année.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <input type="checkbox" checked={data.calendar.workSaturday} onChange={e => setWorkSaturday(e.target.checked)} />
              Travailler le samedi
            </label>
            <button className="btn btn-ghost btn-sm" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={14} /></button>
            <div style={{ fontWeight: 800, minWidth: 160, textAlign: 'center', fontFamily: "'Playfair Display', serif", fontSize: 16 }}>{MONTHS_FR[month]} {year}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={14} /></button>
            <button className="btn btn-green btn-sm" onClick={() => setCursor(new Date())}>Aujourd'hui</button>
          </div>
        </div>

        <div className="cal-grid">
          {DAYS_FR.map(d => <div key={d} className="cal-day-hdr">{d}</div>)}
          {gridDays.map(({ date, inMonth }, idx) => {
            const dow = (date.getDay() + 6) % 7; // 5 = sam, 6 = dim
            const isWeekend = dow >= 5;
            const hideSat = !data.calendar.workSaturday && dow === 5;
            const isHoliday = holidayMap.has(date.toDateString());
            const isToday = date.toDateString() === today.toDateString();
            const events = eventsForDay(date);
            return (
              <div
                key={idx}
                className={`cal-day ${!inMonth ? 'muted' : ''} ${isWeekend || hideSat ? 'weekend' : ''} ${isHoliday ? 'holiday' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => inMonth && !isHoliday && openDayModal(date)}
              >
                <div className="cal-day-num">{date.getDate()}</div>
                {isHoliday && <div style={{ fontSize: 8.5, color: '#ef4444', fontWeight: 700, marginTop: 2 }}>{holidayMap.get(date.toDateString())}</div>}
                {events.map(e => (
                  <div key={e.id} className="cal-event" style={{ background: e.color }} title={e.title} onClick={(ev) => { ev.stopPropagation(); if (window.confirm(`Supprimer « ${e.title} » ?`)) deleteCalEvent(e.id); }}>
                    {e.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 18, fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(239,68,68,0.25)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Jour férié</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'rgba(100,116,139,0.15)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Week-end</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid var(--accent)', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Aujourd'hui</span>
          <span>Cliquez sur un événement pour le supprimer.</span>
        </div>
      </div>

      {showModal && selectedDay && (
        <div className="modal-back" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Ajouter un événement</div>
            <div className="modal-sub">Le {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>

            <div className="fg">
              <label className="fl">Titre</label>
              <input className="fi" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Ex : Séquence My Home / Sortie scolaire…" autoFocus />
            </div>

            <div className="fg">
              <label className="fl">Lier à une séquence (optionnel)</label>
              <select className="fs" value={eventForm.sequenceId} onChange={e => setEventForm({ ...eventForm, sequenceId: e.target.value })}>
                <option value="">— Aucune —</option>
                {data.sequences.map(s => <option key={s.id} value={s.id}>{(s.niveau || '').replace(/_/g, ' ')} · {s.titre || 'Sans titre'}</option>)}
              </select>
            </div>

            <div className="fg">
              <label className="fl">Date de fin</label>
              <input type="date" className="fi" value={eventForm.endDate} onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })} />
            </div>

            <div className="fg">
              <label className="fl">Couleur</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EVENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEventForm({ ...eventForm, color: c.value })}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: eventForm.color === c.value ? '3px solid var(--text)' : '2px solid var(--border)',
                      background: c.value, cursor: 'pointer'
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-green btn-sm" onClick={saveEvent} disabled={!eventForm.title.trim()}><Plus size={12} /> Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendrierView;
