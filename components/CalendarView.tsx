import React, { useState, useMemo } from 'react';
import { Treatment, TreatmentType } from '../types';
import { ChevronLeft, ChevronRight, Calendar, DollarSign } from 'lucide-react';

interface CalendarViewProps {
  treatments: Treatment[];
  onSelectDate: (date: string, treatments: Treatment[]) => void;
}

// Color mapping for treatment types (matching tooth status colors)
const getTreatmentColor = (type: TreatmentType): { bg: string; dot: string } => {
  switch (type) {
    case TreatmentType.FILLING:
      return { bg: 'bg-blue-100', dot: 'bg-blue-500' };
    case TreatmentType.ROOT_CANAL:
      return { bg: 'bg-red-100', dot: 'bg-red-500' };
    case TreatmentType.CROWN:
      return { bg: 'bg-yellow-100', dot: 'bg-yellow-500' };
    case TreatmentType.EXTRACTION:
      return { bg: 'bg-slate-200', dot: 'bg-slate-500' };
    case TreatmentType.VENEER:
      return { bg: 'bg-purple-100', dot: 'bg-purple-500' };
    case TreatmentType.HYGIENE:
      return { bg: 'bg-green-100', dot: 'bg-green-500' };
    case TreatmentType.CHECKUP:
      return { bg: 'bg-teal-100', dot: 'bg-teal-500' };
    case TreatmentType.IMPLANT:
      return { bg: 'bg-gray-200', dot: 'bg-gray-600' };
    case TreatmentType.BRACES:
      return { bg: 'bg-pink-100', dot: 'bg-pink-500' };
    default: // OTHER
      return { bg: 'bg-orange-100', dot: 'bg-orange-500' };
  }
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarView: React.FC<CalendarViewProps> = ({ treatments, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Group treatments by date
  const treatmentsByDate: Record<string, Treatment[]> = {};
  treatments.forEach((t) => {
    const dateKey = t.date.split('T')[0]; // Get YYYY-MM-DD
    if (!treatmentsByDate[dateKey]) {
      treatmentsByDate[dateKey] = [];
    }
    treatmentsByDate[dateKey].push(t);
  });

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar grid
  const calendarDays: { day: number; isCurrentMonth: boolean; date: string }[] = [];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  // Next month days (fill remaining cells)
  const remainingCells = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    });
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const monthTreatments = treatments.filter((t) => {
      const treatmentDate = new Date(t.date);
      return treatmentDate.getFullYear() === year && treatmentDate.getMonth() === month;
    });

    const totalVisits = monthTreatments.length;

    // Group by currency for money spent
    const moneyByCurrency: Record<string, number> = {};
    monthTreatments.forEach((t) => {
      if (t.cost) {
        const curr = t.currency || 'USD';
        moneyByCurrency[curr] = (moneyByCurrency[curr] || 0) + t.cost;
      }
    });

    // Get unique visit days
    const uniqueDays = new Set(monthTreatments.map((t) => t.date.split('T')[0])).size;

    return {
      totalVisits,
      uniqueDays,
      moneyByCurrency,
    };
  }, [treatments, year, month]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>

        <div className="text-center">
          <h3 className="font-bold text-slate-900">{MONTHS[month]} {year}</h3>
          <button
            onClick={goToToday}
            className="text-xs text-dental-600 font-medium hover:underline"
          >
            Today
          </button>
        </div>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-slate-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((cell, index) => {
          const dayTreatments = treatmentsByDate[cell.date] || [];
          const isToday = cell.date === todayStr;
          const hasTreatments = dayTreatments.length > 0;

          return (
            <button
              key={index}
              onClick={() => hasTreatments && onSelectDate(cell.date, dayTreatments)}
              disabled={!hasTreatments}
              className={`
                relative min-h-[52px] p-1 border-b border-r border-slate-50
                flex flex-col items-center justify-start
                transition-colors
                ${cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50'}
                ${hasTreatments ? 'hover:bg-slate-100 cursor-pointer' : 'cursor-default'}
                ${isToday ? 'ring-2 ring-inset ring-dental-500' : ''}
              `}
            >
              <span
                className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                  ${cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}
                  ${isToday ? 'bg-dental-600 text-white' : ''}
                `}
              >
                {cell.day}
              </span>

              {/* Treatment dots */}
              {hasTreatments && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-1 max-w-full">
                  {dayTreatments.slice(0, 3).map((t, i) => {
                    const color = getTreatmentColor(t.type);
                    return (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${color.dot}`}
                        title={t.type}
                      />
                    );
                  })}
                  {dayTreatments.length > 3 && (
                    <span className="text-[8px] text-slate-400 font-bold">+{dayTreatments.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Monthly Stats */}
      {(monthlyStats.totalVisits > 0 || Object.keys(monthlyStats.moneyByCurrency).length > 0) && (
        <div className="p-4 border-t border-slate-100 bg-gradient-to-r from-dental-50 to-blue-50">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-dental-600 mb-1">
                <Calendar size={16} />
                <span className="text-2xl font-bold">{monthlyStats.totalVisits}</span>
              </div>
              <p className="text-xs text-slate-500">
                {monthlyStats.totalVisits === 1 ? 'procedure' : 'procedures'}
                {monthlyStats.uniqueDays > 0 && ` · ${monthlyStats.uniqueDays} ${monthlyStats.uniqueDays === 1 ? 'day' : 'days'}`}
              </p>
            </div>

            {Object.keys(monthlyStats.moneyByCurrency).length > 0 && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <DollarSign size={16} />
                  <span className="text-2xl font-bold">
                    {Object.entries(monthlyStats.moneyByCurrency)
                      .map(([curr, amount]) => `${amount.toFixed(0)}`)
                      .join(' + ')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {Object.keys(monthlyStats.moneyByCurrency).join(', ')} spent
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.values(TreatmentType).slice(0, 6).map((type) => {
            const color = getTreatmentColor(type);
            return (
              <div key={type} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                <span className="text-[10px] text-slate-500">{type}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
