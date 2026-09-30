import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Clock, User, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { HealthAppointment } from '../../types/health';

interface AppointmentsViewProps {
  appointments: HealthAppointment[];
  onAddAppointment: (apt: HealthAppointment) => void;
  onDeleteAppointment: (id: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onAddAppointment,
  onDeleteAppointment,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('General Physician');
  const [clinicHospital, setClinicHospital] = useState('Apollo Health Clinic');
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [appointmentTime, setAppointmentTime] = useState('10:00 AM');
  const [reason, setReason] = useState('Quarterly Health Checkup');
  const [contactNumber, setContactNumber] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim()) return;
    const newApt: HealthAppointment = {
      id: 'apt-' + Date.now(),
      doctorName: doctorName.trim(),
      specialty,
      clinicHospital,
      appointmentDate,
      appointmentTime,
      status: 'Upcoming',
      reason,
      contactNumber,
      doctorNotes,
    };
    onAddAppointment(newApt);
    setShowModal(false);
    setDoctorName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" /> Doctor & Health Appointments
          </h3>
          <p className="text-xs text-zinc-400">Schedule appointments, track clinic visits, and save doctor notes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-cyan-600/20"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-[#0D0E16] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-cyan-500/30 transition-all">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{apt.doctorName}</h4>
                  <span className="text-xs text-cyan-400 font-medium">{apt.specialty}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  apt.status === 'Upcoming' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {apt.status}
                </span>
                <button
                  onClick={() => onDeleteAppointment(apt.id)}
                  className="text-zinc-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Date & Time:
                </span>
                <span className="font-semibold text-white">{apt.appointmentDate} at {apt.appointmentTime}</span>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" /> Location / Clinic:
                </span>
                <span className="font-semibold text-white">{apt.clinicHospital}</span>
              </div>

              {apt.reason && (
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-zinc-300">
                  <span className="text-[10px] font-semibold text-zinc-400 block">Reason for Visit</span>
                  <p className="text-xs">{apt.reason}</p>
                </div>
              )}

              {apt.doctorNotes && (
                <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-cyan-200">
                  <span className="text-[10px] font-semibold text-cyan-400 block">Doctor Notes / Instructions</span>
                  <p className="text-xs italic">{apt.doctorNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12131F] border border-white/10 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" /> Schedule Doctor Appointment
              </h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Nutritionist / Cardiologist"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    value={clinicHospital}
                    onChange={(e) => setClinicHospital(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Doctor Phone</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Time</label>
                  <input
                    type="text"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. 5kg weight loss consultation"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Doctor Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Fast for 10 hours prior to consultation"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-600/30"
                >
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
