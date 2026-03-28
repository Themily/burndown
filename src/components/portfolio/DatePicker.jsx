import React, { useState, useRef, useEffect } from 'react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function DatePicker({ value, onChange, minDate, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = value ? new Date(value + 'T00:00:00') : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ? new Date(minDate + 'T00:00:00') : today;

  const [view, setView] = useState({
    year: selected?.getFullYear() || today.getFullYear(),
    month: selected?.getMonth() ?? today.getMonth(),
  });
  const viewYear = view.year;
  const viewMonth = view.month;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    setView(v => v.month === 0
      ? { year: v.year - 1, month: 11 }
      : { ...v, month: v.month - 1 }
    );
  };

  const nextMonth = () => {
    setView(v => v.month === 11
      ? { year: v.year + 1, month: 0 }
      : { ...v, month: v.month + 1 }
    );
  };

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    return d < min;
  };

  const isSelected = (day) => {
    if (!selected) return false;
    return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  };

  const isToday = (day) => {
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const handleSelect = (day) => {
    if (isDisabled(day)) return;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const formatDisplay = () => {
    if (!selected) return 'Select date';
    return `${MONTH_NAMES[selected.getMonth()].slice(0, 3)} ${selected.getDate()}, ${selected.getFullYear()}`;
  };

  const canGoPrev = () => {
    const prevLast = viewMonth === 0
      ? new Date(viewYear - 1, 11, new Date(viewYear - 1, 12, 0).getDate())
      : new Date(viewYear, viewMonth, 0);
    return prevLast >= min;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between bg-bg-input border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary hover:border-teal/40 transition-colors"
      >
        <span className={selected ? 'font-mono' : 'text-text-muted'}>{formatDisplay()}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}

      {open && (
        <div className="absolute z-50 mt-2 w-72 bg-bg-card-solid border border-border-subtle rounded-xl shadow-2xl p-4 animate-in fade-in">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canGoPrev()}
              className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-text-primary text-sm font-semibold">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[10px] text-text-muted font-semibold uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0">
            {Array.from({ length: firstDayOfWeek }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              const sel = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  disabled={disabled}
                  className={`
                    h-8 w-full rounded-lg text-xs font-mono transition-colors
                    ${disabled ? 'text-text-muted/30 cursor-not-allowed' : 'hover:bg-teal/20 hover:text-teal cursor-pointer'}
                    ${sel ? 'bg-teal text-bg-primary font-bold hover:bg-teal hover:text-bg-primary' : ''}
                    ${tod && !sel ? 'text-teal font-bold' : ''}
                    ${!sel && !disabled ? 'text-text-secondary' : ''}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
