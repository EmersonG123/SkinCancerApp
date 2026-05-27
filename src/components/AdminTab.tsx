// src/components/AdminTab.tsx – Panel de Gestión de Usuarios (CRUD Admin)
import React, { useState, useEffect } from "react";
import { User, Shield, Search, Plus, Edit2, Trash2, CheckCircle, XCircle, RefreshCw, BarChart2, Briefcase } from "lucide-react";
import { api } from "../services/api";
import { User as UserType } from "../types";

export default function AdminTab() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  
  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formLicense, setFormLicense] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("Dermatología Clínica");
  const [formRol, setFormRol] = useState<"usuario" | "admin">("usuario");
  const [formPrecision, setFormPrecision] = useState("95");
  const [formAnalyses, setFormAnalyses] = useState("0");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getUsuarios();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedUserId(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormLicense("");
    setFormSpecialty("Dermatología Clínica");
    setFormRol("usuario");
    setFormPrecision("95");
    setFormAnalyses("0");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (user: UserType) => {
    if (!user.id_usuario) return;
    setModalMode("edit");
    setSelectedUserId(user.id_usuario);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword(""); // Vacía al editar
    setFormLicense(user.license);
    setFormSpecialty(user.specialty);
    setFormRol(user.rol || "usuario");
    setFormPrecision(String(user.precision));
    setFormAnalyses(String(user.analyses));
    setFormError("");
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (modalMode === "create") {
        if (!formPassword) {
          setFormError("La contraseña es requerida para nuevos usuarios.");
          setFormLoading(false);
          return;
        }
        await api.crearUsuario({
          nombre: formName,
          email: formEmail,
          password: formPassword,
          license: formLicense,
          specialty: formSpecialty,
          rol: formRol,
        });
      } else {
        if (!selectedUserId) return;
        await api.actualizarUsuario(selectedUserId, {
          nombre: formName,
          email: formEmail,
          license: formLicense,
          specialty: formSpecialty,
          rol: formRol,
          precision: parseInt(formPrecision, 10),
          analyses: parseInt(formAnalyses, 10),
        });
      }
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Error al procesar el usuario.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, email: string) => {
    if (confirm(`¿Está seguro de que desea eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) {
      try {
        await api.eliminarUsuario(id);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || "No se pudo eliminar al usuario.");
      }
    }
  };

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const term = (search || "").toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.license || "").toLowerCase().includes(term) ||
      (u.specialty || "").toLowerCase().includes(term)
    );
  });

  // Stats calculation
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.rol === "admin").length;
  const userCount = totalUsers - adminCount;
  const totalAnalyses = users.reduce((sum, u) => sum + (u.analyses || 0), 0);

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-divider/50 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-primary tracking-wider flex items-center gap-2.5 neon-glow">
            <Shield className="w-8 h-8 text-primary animate-pulse" />
            Panel de Administración
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-mono uppercase tracking-widest">
            Control de Acceso y Gestión de Operadores Clínicos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-800/60 border border-slate-700 hover:border-primary/50 text-text-secondary hover:text-primary rounded-lg transition-all active:scale-95 cursor-pointer"
            title="Sincronizar Usuarios"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/45 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.1)] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Operador
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="glassmorphism p-5 rounded-xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-xl text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold font-mono uppercase block">Total Cuentas</span>
            <span className="text-2xl font-bold text-text-main font-mono">{totalUsers}</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glassmorphism p-5 rounded-xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 flex items-center justify-center rounded-xl text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold font-mono uppercase block">Administradores</span>
            <span className="text-2xl font-bold text-text-main font-mono">{adminCount}</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glassmorphism p-5 rounded-xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center rounded-xl text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold font-mono uppercase block">Médicos Activos</span>
            <span className="text-2xl font-bold text-text-main font-mono">{userCount}</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glassmorphism p-5 rounded-xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center rounded-xl text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-secondary font-bold font-mono uppercase block">Análisis Realizados</span>
            <span className="text-2xl font-bold text-text-main font-mono">{totalAnalyses}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glassmorphism rounded-2xl border border-primary/10 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        {/* Filtering & Search Bar */}
        <div className="p-5 border-b border-border-divider/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, email, licencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all placeholder:text-text-secondary/70 font-mono"
            />
          </div>
          <div className="text-xs text-text-secondary font-mono self-end sm:self-center">
            Mostrando <span className="text-primary font-bold">{filteredUsers.length}</span> de {totalUsers} usuarios
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-20 text-center text-text-secondary flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <span className="font-mono text-sm">Consultando registros en base de datos...</span>
          </div>
        ) : error ? (
          <div className="p-20 text-center text-red-400 font-mono text-xs border border-red-500/20 bg-red-500/5 rounded-xl m-5">
            ❌ {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-20 text-center text-text-secondary font-mono text-sm">
            Ningún operador coincide con los filtros especificados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 text-[10px] font-bold text-text-secondary uppercase tracking-widest border-b border-border-divider/60 font-mono">
                  <th className="p-4 pl-6">Operador</th>
                  <th className="p-4">Credencial (Licencia)</th>
                  <th className="p-4">Especialidad</th>
                  <th className="p-4 text-center">Análisis</th>
                  <th className="p-4 text-center">Precisión</th>
                  <th className="p-4 text-center">Rol</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-divider/30 text-xs text-text-main font-sans">
                {filteredUsers.map((user) => (
                  <tr key={user.id_usuario} className="hover:bg-slate-800/25 transition-all">
                    {/* Operador (Nombre + Correo) */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-800 border border-slate-700 flex items-center justify-center rounded-lg text-primary font-bold font-mono">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-text-main hover:text-primary transition-colors">{user.name || "Sin Nombre"}</div>
                          <div className="text-[10px] text-text-secondary font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Licencia */}
                    <td className="p-4 font-mono text-text-secondary font-bold">
                      {user.license}
                    </td>

                    {/* Especialidad */}
                    <td className="p-4 text-text-secondary font-semibold">
                      {user.specialty}
                    </td>

                    {/* Análisis */}
                    <td className="p-4 text-center font-mono font-bold text-primary">
                      {user.analyses}
                    </td>

                    {/* Precisión */}
                    <td className="p-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        {user.precision}%
                      </span>
                    </td>

                    {/* Rol */}
                    <td className="p-4 text-center font-mono">
                      {user.rol === "admin" ? (
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center justify-center gap-1 w-max mx-auto shadow-[0_0_5px_rgba(168,85,247,0.15)]">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-text-secondary text-[10px] font-bold block w-max mx-auto">
                          Médico
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-primary rounded border border-transparent hover:border-slate-600 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => user.id_usuario && handleDeleteUser(user.id_usuario, user.email)}
                          className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded border border-transparent hover:border-red-500/25 transition-all cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal (Premium Backdrop + Form) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glassmorphism w-full max-w-[500px] rounded-2xl border border-primary/25 overflow-hidden shadow-[0_0_40px_rgba(0,240,255,0.15)]">
            {/* Modal Title */}
            <div className="px-6 py-4 bg-slate-900/60 border-b border-border-divider/50 flex justify-between items-center">
              <h2 className="font-display text-lg font-bold text-primary tracking-wider uppercase font-mono">
                {modalMode === "create" ? "Alta de Operador Clínico" : "Modificar Operador Clínico"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-secondary hover:text-primary font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs text-red-400 bg-red-500/10 rounded-lg border border-red-500/30 font-mono">
                  ⚠️ {formError}
                </div>
              )}

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Dr. Alejandro Ruiz"
                  className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="ejemplo@hospital.com"
                  className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all"
                />
              </div>

              {/* Password (Only required in Create mode) */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">
                  Contraseña {modalMode === "edit" && <span className="text-text-secondary/60 font-normal">(Dejar en blanco para no cambiar)</span>}
                </label>
                <input
                  type="password"
                  required={modalMode === "create"}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder={modalMode === "edit" ? "••••••••" : "Mínimo 6 caracteres"}
                  className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all"
                />
              </div>

              {/* License & Specialty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Nº Colegiado</label>
                  <input
                    type="text"
                    required
                    value={formLicense}
                    onChange={(e) => setFormLicense(e.target.value)}
                    placeholder="Ej. CO-28394-B"
                    className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Especialidad</label>
                  <select
                    value={formSpecialty}
                    onChange={(e) => setFormSpecialty(e.target.value)}
                    className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Dermatología Clínica">Dermatología Clínica</option>
                    <option value="Medicina General">Medicina General</option>
                    <option value="Oncología Cutánea">Oncología Cutánea</option>
                    <option value="Investigación Científica">Investigación Científica</option>
                  </select>
                </div>
              </div>

              {/* Rol, Precision, Analyses */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Rol de Sistema</label>
                  <select
                    value={formRol}
                    onChange={(e) => setFormRol(e.target.value as any)}
                    className="px-2 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="usuario">Médico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Precisión (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formPrecision}
                    onChange={(e) => setFormPrecision(e.target.value)}
                    className="px-2 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all font-mono"
                    disabled={modalMode === "create"}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary font-mono uppercase tracking-wider">Análisis</label>
                  <input
                    type="number"
                    min="0"
                    value={formAnalyses}
                    onChange={(e) => setFormAnalyses(e.target.value)}
                    className="px-2 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-text-main focus:border-primary focus:outline-none transition-all font-mono"
                    disabled={modalMode === "create"}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-divider/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-text-secondary hover:text-text-main text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  disabled={formLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/45 text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_10px_rgba(0,240,255,0.05)] transition-all cursor-pointer"
                  disabled={formLoading}
                >
                  {formLoading ? "Procesando..." : "Guardar Expediente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
