'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from './Badge';

interface Appointment {
  appointment_ID?: number;
  date: string;
  time: string;
  type: string;
  patient_ID: number;
  patientName?: string;
}

interface CalendarViewProps {
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  currentDate?: Date;
}

export default function CalendarView({
  appointments,
  onDateClick,
  onAppointmentClick,
  currentDate = new Date(),
}: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(currentDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getAppointmentsForDate = (day: number) => {
    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const getAppointmentColor = (type: string) => {
    const colors: Record<string, string> = {
      'Checkup': 'bg-blue-500',
      'Cleaning': 'bg-green-500',
      'Root Canal': 'bg-purple-500',
      'Filling': 'bg-yellow-500',
      'Emergency': 'bg-red-500',
      'Extraction': 'bg-orange-500',
      'Treatment': 'bg-indigo-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setViewDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDayOfMonth = getFirstDayOfMonth(viewDate);
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const dayAppointments = getAppointmentsForDate(day);
            const today = isToday(day);

            return (
              <button
                key={day}
                onClick={() => {
                  const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                  onDateClick(date);
                }}
                className={`
                  aspect-square p-2 rounded-lg border-2 transition-all hover:border-primary-500
                  ${today ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}
                  ${dayAppointments.length > 0 ? 'font-semibold' : ''}
                  hover:shadow-md
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`text-sm ${today ? 'text-primary-700' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  
                  {/* Appointment indicators */}
                  {dayAppointments.length > 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-1 mt-1">
                      {dayAppointments.slice(0, 3).map((apt, idx) => (
                        <div
                          key={apt.appointment_ID}
                          className={`w-full h-1 rounded-full ${getAppointmentColor(apt.type)}`}
                          title={`${apt.time} - ${apt.type}`}
                        ></div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="text-[10px] text-gray-500">
                          +{dayAppointments.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Checkup</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Cleaning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="text-xs text-gray-600">Root Canal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Emergency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
