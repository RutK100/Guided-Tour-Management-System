import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Trash2,
  Edit2,
  Save,
  X,
  Plus,
  User,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Star,
  BadgeDollarSign
} from "lucide-react";

const API_BASE = "http://localhost:5000";

interface Customer {
  customerid: number;
  fullname: string;
  phone: string;
  email: string;
  joindate: string;
}

interface Guide {
  guideid: number;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  birthdate: string;
  joindate: string;
  dailyrate: number | null;
  experienceyears: number | null;
  rating: number | null;
  address: string;
  notes: string;
  school: string;
}

type Tab = "dashboard" | "customers" | "guides";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const emptyCustomerForm = {
    customerid: "",
    fullname: "",
    phone: "",
    email: "",
    joindate: ""
  };

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchCustomers(), fetchGuides()]);
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customers`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      setMessage("Error loading customers");
    }
  };

  const fetchGuides = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/guides`);
      if (!res.ok) throw new Error("Failed to fetch guides");
      const data = await res.json();
      setGuides(data);
    } catch (error) {
      console.error(error);
      setMessage("Error loading guides");
    }
  };

  const openNewCustomer = () => {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
    setIsCustomerFormOpen(true);
  };

  const openEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.customerid);
    setCustomerForm({
      customerid: String(customer.customerid),
      fullname: customer.fullname ?? "",
      phone: customer.phone ?? "",
      email: customer.email ?? "",
      joindate: customer.joindate ?? ""
    });
    setIsCustomerFormOpen(true);
  };

  const saveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    const body = {
      customerid: customerForm.customerid ? Number(customerForm.customerid) : undefined,
      fullname: customerForm.fullname,
      phone: customerForm.phone,
      email: customerForm.email,
      joindate: customerForm.joindate || undefined
    };

    try {
      const url = editingCustomerId
          ? `${API_BASE}/api/customers/${editingCustomerId}`
          : `${API_BASE}/api/customers`;
      const method = editingCustomerId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Customer save failed");
        return;
      }

      setMessage(editingCustomerId ? "Customer updated successfully" : "Customer added successfully");
      setIsCustomerFormOpen(false);
      setCustomerForm(emptyCustomerForm);
      setEditingCustomerId(null);
      await fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Customer save failed");
    }
  };

  const deleteCustomer = async (customerid: number) => {
    const ok = confirm("Delete this customer?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/api/customers/${customerid}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Customer delete failed");
        return;
      }

      setMessage("Customer deleted successfully");
      await fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Customer delete failed");
    }
  };

  return (
      <div className="min-h-screen bg-emerald-50/30 text-emerald-950">
        <aside className="fixed left-0 top-0 h-full w-64 bg-white/85 border-r border-emerald-900/10 p-8 hidden lg:block">
          <h1 onClick={() => setActiveTab("dashboard")} className="text-2xl font-serif italic cursor-pointer mb-12">
            Swee<span className="font-bold text-emerald-600">T</span>our
          </h1>

          <nav className="space-y-4">
            <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 p-3 text-left ${activeTab === "dashboard" ? "bg-emerald-900 text-white" : "hover:bg-emerald-900/5"}`}>
              <User size={18} /> Dashboard
            </button>
            <button onClick={() => setActiveTab("customers")} className={`w-full flex items-center gap-3 p-3 text-left ${activeTab === "customers" ? "bg-emerald-900 text-white" : "hover:bg-emerald-900/5"}`}>
              <Users size={18} /> Customers
            </button>
            <button onClick={() => setActiveTab("guides")} className={`w-full flex items-center gap-3 p-3 text-left ${activeTab === "guides" ? "bg-emerald-900 text-white" : "hover:bg-emerald-900/5"}`}>
              <Search size={18} /> Guides
            </button>
          </nav>

          <div className="absolute bottom-8 left-8 right-8 p-4 border border-emerald-900/10 bg-emerald-50">
            <p className="text-[10px] uppercase opacity-60 mb-1">Project Team</p>
            <p className="text-sm font-medium">Shirel & Rut</p>
          </div>
        </aside>

        <main className="lg:ml-64 p-8">
          <header className="flex items-start justify-between mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-widest opacity-50 mb-1">Overview</p>
              <h2 className="text-5xl font-serif italic capitalize">{activeTab}</h2>
            </div>

            {activeTab === "customers" && (
                <button onClick={openNewCustomer} className="flex items-center gap-2 px-5 py-3 bg-emerald-900 text-white hover:bg-emerald-800 shadow">
                  <Plus size={16} /> New Customer
                </button>
            )}
          </header>

          {message && <div className="mb-6 p-3 bg-emerald-100 border border-emerald-900/10 text-sm">{message}</div>}

          {activeTab === "dashboard" && (
              <section className="space-y-10">
                <div className="py-20 text-center">
                  <h1 className="text-7xl font-serif italic">Swee<span className="font-bold text-emerald-600">T</span>our</h1>
                  <p className="mt-4 uppercase tracking-[0.4em] text-sm opacity-60">Guided Tour Management System</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button onClick={() => setActiveTab("customers")} className="p-8 border border-emerald-900/20 bg-white/60 hover:bg-emerald-50 text-left shadow-sm">
                    <Users className="mb-4 text-emerald-700" />
                    <h3 className="text-2xl font-serif italic">Customers</h3>
                    <p className="text-sm opacity-60 mt-2">View, add, update and delete customers.</p>
                  </button>
                  <button onClick={() => setActiveTab("guides")} className="p-8 border border-emerald-900/20 bg-white/60 hover:bg-emerald-50 text-left shadow-sm">
                    <Search className="mb-4 text-emerald-700" />
                    <h3 className="text-2xl font-serif italic">Guides</h3>
                    <p className="text-sm opacity-60 mt-2">View guide data and open full guide profile.</p>
                  </button>
                </div>
              </section>
          )}

          {activeTab === "customers" && (
              <section className="border border-emerald-900/20 bg-white/40 shadow-sm overflow-hidden">
                <div className="grid grid-cols-6 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold">
                  <div>Customer ID</div><div>Full Name</div><div className="col-span-2">Email</div><div>Phone</div><div className="text-right">Actions</div>
                </div>

                {customers.map((customer) => (
                    <div key={customer.customerid} className="grid grid-cols-6 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center">
                      <div className="font-mono text-sm">{customer.customerid}</div>
                      <div className="font-medium">{customer.fullname}</div>
                      <div className="col-span-2 font-mono text-sm">{customer.email}</div>
                      <div className="font-mono text-sm">{customer.phone}</div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditCustomer(customer)} className="p-2 border border-emerald-900/20 hover:bg-emerald-900 hover:text-white" title="Edit customer"><Edit2 size={15} /></button>
                        <button onClick={() => deleteCustomer(customer.customerid)} className="p-2 border border-red-900/20 text-red-700 hover:bg-red-700 hover:text-white" title="Delete customer"><Trash2 size={15} /></button>
                      </div>
                    </div>
                ))}

                {customers.length === 0 && <div className="p-8 text-center text-sm opacity-60">No customers found.</div>}
              </section>
          )}

          {activeTab === "guides" && (
              <section className="border border-emerald-900/20 bg-white/40 shadow-sm overflow-hidden">
                <div className="grid grid-cols-6 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold">
                  <div>Guide</div><div>Name</div><div>Email</div><div>Phone</div><div>Rating</div><div>School</div>
                </div>

                {guides.map((guide) => (
                    <div key={guide.guideid} onClick={() => setSelectedGuide(guide)} className="grid grid-cols-6 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center cursor-pointer">
                      <div className="font-mono text-sm">{guide.guideid}</div>
                      <div className="font-medium">{guide.firstname} {guide.lastname}</div>
                      <div className="font-mono text-sm">{guide.email}</div>
                      <div className="font-mono text-sm">{guide.phone}</div>
                      <div className="font-mono text-sm">{guide.rating ?? ""}</div>
                      <div className="text-sm">{guide.school ?? ""}</div>
                    </div>
                ))}

                {guides.length === 0 && <div className="p-8 text-center text-sm opacity-60">No guides found.</div>}
              </section>
          )}
        </main>

        {isCustomerFormOpen && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <form onSubmit={saveCustomer} className="bg-[#F2F5F2] w-full max-w-lg p-8 shadow-2xl border border-emerald-900/20 relative">
                <button type="button" onClick={() => setIsCustomerFormOpen(false)} className="absolute top-4 right-4"><X size={22} /></button>
                <h3 className="text-3xl font-serif italic mb-6">{editingCustomerId ? "Update Customer" : "Add Customer"}</h3>

                {!editingCustomerId && (
                    <Field label="Customer ID" type="number" value={customerForm.customerid} onChange={(v) => setCustomerForm({ ...customerForm, customerid: v })} required />
                )}
                <Field label="Full Name" value={customerForm.fullname} onChange={(v) => setCustomerForm({ ...customerForm, fullname: v })} required />
                <Field label="Email" type="email" value={customerForm.email} onChange={(v) => setCustomerForm({ ...customerForm, email: v })} required />
                <Field label="Phone" value={customerForm.phone} onChange={(v) => setCustomerForm({ ...customerForm, phone: v })} required />
                <Field label="Join Date" type="date" value={customerForm.joindate} onChange={(v) => setCustomerForm({ ...customerForm, joindate: v })} />

                <button type="submit" className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-900 text-white hover:bg-emerald-800">
                  <Save size={16} /> Save
                </button>
              </form>
            </div>
        )}

        {selectedGuide && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-[#F2F5F2] w-full max-w-2xl p-8 shadow-2xl border border-emerald-900/20 relative">
                <button onClick={() => setSelectedGuide(null)} className="absolute top-4 right-4"><X size={22} /></button>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Guide Profile</p>
                <h3 className="text-3xl font-serif italic mb-8">{selectedGuide.firstname} {selectedGuide.lastname}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <Info label="Guide ID" value={selectedGuide.guideid} icon={<User size={16} />} />
                  <Info label="Phone" value={selectedGuide.phone} icon={<Phone size={16} />} />
                  <Info label="Email" value={selectedGuide.email} icon={<Mail size={16} />} />
                  <Info label="Birth Date" value={selectedGuide.birthdate} icon={<CalendarDays size={16} />} />
                  <Info label="Join Date" value={selectedGuide.joindate} icon={<CalendarDays size={16} />} />
                  <Info label="Experience Years" value={selectedGuide.experienceyears ?? ""} icon={<User size={16} />} />
                  <Info label="Daily Rate" value={selectedGuide.dailyrate ?? ""} icon={<BadgeDollarSign size={16} />} />
                  <Info label="Rating" value={selectedGuide.rating ?? ""} icon={<Star size={16} />} />
                  <Info label="School" value={selectedGuide.school ?? ""} icon={<User size={16} />} />
                  <Info label="Address" value={selectedGuide.address ?? ""} icon={<MapPin size={16} />} />
                  <div className="md:col-span-2"><p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1">Notes</p><p className="italic">{selectedGuide.notes ?? ""}</p></div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
      <div className="mb-4">
        <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">{label}</label>
        <input required={required} type={type} className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
      <div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-50 mb-1 flex items-center gap-1">{icon}{label}</p>
        <p className="font-mono">{value}</p>
      </div>
  );
}
