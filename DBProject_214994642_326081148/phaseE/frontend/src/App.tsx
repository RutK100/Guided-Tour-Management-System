import React, { useEffect, useMemo, useState } from "react";
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
  BadgeDollarSign,
  Route as RouteIcon,
  Bus,
  ClipboardList,
  Database,
  Play,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

// ------------------------ מקטע 1: הגדרות כלליות וחיבור לשרת ------------------------
const API_BASE = "http://localhost:5000";

// ------------------------ מקטע 2: טיפוסים / מבני נתונים מה-DB ------------------------
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

interface RouteRecord {
  routeid: number;
  r_name: string;
  estimatedlength: number | null;
  estimatedduration: number | null;
  description: string;
  r_level: number | null;
  area: string | null;
}

interface Tour {
  tourid: number;
  startdate: string;
  enddate: string;
  starttime: string;
  endtime: string;
  meetingpoint: string;
  price: number | null;
  maxparticipants: number | null;
  notes: string;
  accessibility: number | null;
  t_type: string;
  guide_name: string;
  route_name: string;
  status_name: string;
  guideid: number | null;
  routeid: number | null;
  tourstatusid: number | null;
}

interface Registration {
  registrationid: number;
  registrationdate: string;
  amounttopay: number | null;
  notes: string;
  numpeople: number | null;
  customer_name: string;
  route_name: string;
  meetingpoint: string;
  status_name: string;
  customerid: number | null;
  tourid: number | null;
  registrationstatusid: number | null;
}

interface AvailableTour {
  tourid: number;
  meetingpoint: string;
  maxparticipants: number;
  total_registered: number;
  spots_left: number;
  route_name: string;
}

interface AuditRow {
  audit_id: number;
  registrationid: number;
  old_status: number | null;
  change_date: string;
}

type Tab =
    | "dashboard"
    | "customers"
    | "guides"
    | "routes"
    | "tours"
    | "registrations"
    | "programs"
    | "audit";

// ------------------------ מקטע 3: הקומפוננטה הראשית של האתר ------------------------
export default function App() {
  // ------------------------ מקטע 4: מצבי מסכים ונתונים ------------------------
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [availableTours, setAvailableTours] = useState<AvailableTour[]>([]);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);

  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteRecord | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

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

  const [programCustomerId, setProgramCustomerId] = useState("");
  const [programTourId, setProgramTourId] = useState("");
  const [remainingSpots, setRemainingSpots] = useState<number | null>(null);
  const [customerDebt, setCustomerDebt] = useState<number | null>(null);
  const [programResult, setProgramResult] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ------------------------ מקטע 4.1: עימוד הטבלאות ------------------------
  // בכל מסך מוצגות 50 רשומות בלבד. הכפתורים בתחתית עוברים בין העמודים.
  const PAGE_SIZE = 50;
  const [customerPage, setCustomerPage] = useState(1);
  const [guidePage, setGuidePage] = useState(1);
  const [routePage, setRoutePage] = useState(1);
  const [tourPage, setTourPage] = useState(1);
  const [registrationPage, setRegistrationPage] = useState(1);
  const [availableTourPage, setAvailableTourPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  const pageItems = <T,>(items: T[], page: number) =>
      items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ------------------------ מקטע 5: טעינה ראשונית של נתונים ------------------------
  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------ מקטע 6: טעינת כל המידע המרכזי ------------------------
  const fetchData = async () => {
    setLoading(true);
    setMessage("");

    await Promise.all([
      fetchCustomers(),
      fetchGuides(),
      fetchRoutes(),
      fetchTours(),
      fetchRegistrations(),
      fetchAvailableTours(),
      fetchAudit()
    ]);

    setLoading(false);
  };

  // ------------------------ מקטע 7: פונקציית עזר לקריאות GET ------------------------
  const getJson = async <T,>(path: string): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${path}`);
    }

    return data;
  };

  // ------------------------ מקטע 8: שליפת לקוחות ------------------------
  const fetchCustomers = async () => {
    try {
      setCustomers(await getJson<Customer[]>("/api/customers"));
    } catch (error) {
      console.error(error);
      setMessage("Error loading customers");
    }
  };

  // ------------------------ מקטע 9: שליפת מדריכים ------------------------
  const fetchGuides = async () => {
    try {
      setGuides(await getJson<Guide[]>("/api/guides"));
    } catch (error) {
      console.error(error);
      setMessage("Error loading guides");
    }
  };

  // ------------------------ מקטע 10: שליפת מסלולים ------------------------
  const fetchRoutes = async () => {
    try {
      setRoutes(await getJson<RouteRecord[]>("/api/routes"));
    } catch (error) {
      console.error(error);
      setMessage("Error loading routes");
    }
  };

  // ------------------------ מקטע 11: שליפת סיורים עם שמות במקום IDs ------------------------
  const fetchTours = async () => {
    try {
      setTours(await getJson<Tour[]>("/api/tours"));
    } catch (error) {
      console.error(error);
      setMessage("Error loading tours");
    }
  };

  // ------------------------ מקטע 12: שליפת הרשמות עם פרטי לקוח וסיור ------------------------
  const fetchRegistrations = async () => {
    try {
      setRegistrations(await getJson<Registration[]>("/api/registrations"));
    } catch (error) {
      console.error(error);
      setMessage("Error loading registrations");
    }
  };

  // ------------------------ מקטע 13: שאילתה - סיורים שיש בהם מקום ------------------------
  const fetchAvailableTours = async () => {
    try {
      setAvailableTours(await getJson<AvailableTour[]>("/api/queries/available-tours"));
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------ מקטע 14: שליפת יומן השינויים של הטריגר ------------------------
  const fetchAudit = async () => {
    try {
      setAuditRows(await getJson<AuditRow[]>("/api/audit/registrations"));
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------ מקטע 15: פתיחת טופס הוספת לקוח ------------------------
  const openNewCustomer = () => {
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
    setIsCustomerFormOpen(true);
  };

  // ------------------------ מקטע 16: פתיחת טופס עדכון לקוח ------------------------
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

  // ------------------------ מקטע 17: שמירת לקוח - POST או PUT ------------------------
  const saveCustomer = async (event: React.FormEvent) => {
    event.preventDefault();

    const url = editingCustomerId
        ? `${API_BASE}/api/customers/${editingCustomerId}`
        : `${API_BASE}/api/customers`;

    const method = editingCustomerId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerid: customerForm.customerid
            ? Number(customerForm.customerid)
            : undefined,
        fullname: customerForm.fullname,
        phone: customerForm.phone,
        email: customerForm.email,
        joindate: customerForm.joindate || undefined
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Customer save failed");
      return;
    }

    setMessage(
        editingCustomerId
            ? "Customer updated successfully"
            : "Customer added successfully"
    );

    setIsCustomerFormOpen(false);
    setEditingCustomerId(null);
    setCustomerForm(emptyCustomerForm);
    await fetchCustomers();
  };

  // ------------------------ מקטע 18: מחיקת לקוח ------------------------
  const deleteCustomer = async (customerid: number) => {
    if (!confirm("Delete this customer?")) return;

    const response = await fetch(`${API_BASE}/api/customers/${customerid}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Customer delete failed");
      return;
    }

    setMessage("Customer deleted successfully");
    await fetchCustomers();
  };

  // ------------------------ מקטע 19: פונקציה - בדיקת מקומות פנויים ------------------------
  const runRemainingSpots = async () => {
    if (!programTourId) return;

    try {
      const data = await getJson<{ tourid: number; remaining_spots: number }>(
          `/api/programs/remaining-spots/${programTourId}`
      );

      setRemainingSpots(data.remaining_spots);
      setProgramResult(
          `Tour ${data.tourid} has ${data.remaining_spots} remaining spots.`
      );
    } catch (error) {
      setProgramResult(error instanceof Error ? error.message : "Program failed");
    }
  };

  // ------------------------ מקטע 20: פרוצדורה - רישום לקוח לסיור ------------------------
  const runRegisterCustomer = async () => {
    if (!programCustomerId || !programTourId) return;

    const response = await fetch(`${API_BASE}/api/programs/register-customer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerid: Number(programCustomerId),
        tourid: Number(programTourId)
      })
    });

    const data = await response.json();

    setProgramResult(
        response.ok
            ? data.message
            : data.error || "Registration procedure failed"
    );

    await Promise.all([
      fetchRegistrations(),
      fetchAvailableTours(),
      fetchAudit()
    ]);
  };

  // ------------------------ מקטע 21: פונקציה - בדיקת חוב לקוח ------------------------
  const runCustomerDebt = async () => {
    if (!programCustomerId) return;

    try {
      const data = await getJson<{ customerid: number; debt: number }>(
          `/api/programs/customer-debt/${programCustomerId}`
      );

      setCustomerDebt(data.debt);
      setProgramResult(`Customer debt: ₪${data.debt}`);
    } catch (error) {
      setProgramResult(error instanceof Error ? error.message : "Program failed");
    }
  };

  // ------------------------ מקטע 22: פרוצדורה - תשלום כל חובות הלקוח ------------------------
  const runPayDebt = async () => {
    if (!programCustomerId) return;

    const response = await fetch(`${API_BASE}/api/programs/pay-customer-debt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerid: Number(programCustomerId) })
    });

    const data = await response.json();

    setProgramResult(
        response.ok ? data.message : data.error || "Payment procedure failed"
    );

    await Promise.all([
      fetchRegistrations(),
      fetchAudit(),
      runCustomerDebt()
    ]);
  };

  // ------------------------ מקטע 23: טריגר - ביטול סיור וכל ההרשמות שלו ------------------------
  const cancelTour = async (tourid: number) => {
    if (!confirm("Cancel this tour and all related registrations?")) return;

    const response = await fetch(`${API_BASE}/api/tours/${tourid}/cancel`, {
      method: "PUT"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Tour cancellation failed");
      return;
    }

    setMessage(data.message);
    await Promise.all([fetchTours(), fetchRegistrations(), fetchAudit()]);
  };

  // ------------------------ מקטע 24: נתוני סיכום למסך הבית ------------------------
  const totalDebt = useMemo(
      () =>
          registrations.reduce(
              (sum, registration) => sum + Number(registration.amounttopay || 0),
              0
          ),
      [registrations]
  );

  // ------------------------ מקטע 25: תצוגת האתר ------------------------
  return (
      <div className="min-h-screen bg-emerald-50/30 text-emerald-950">
        {/* ------------------------ מקטע 26: תפריט ניווט צדדי ------------------------ */}
        <aside className="fixed left-0 top-0 h-full w-72 bg-white/90 border-r border-emerald-900/10 p-8 hidden lg:block overflow-y-auto">
          <h1
              onClick={() => setActiveTab("dashboard")}
              className="text-2xl font-serif italic cursor-pointer mb-10"
          >
            Swee<span className="font-bold text-emerald-600">T</span>our
          </h1>

          <nav className="space-y-3">
            <NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<Database size={18} />} label="Dashboard" />
            <NavButton active={activeTab === "customers"} onClick={() => setActiveTab("customers")} icon={<Users size={18} />} label="Customers" />
            <NavButton active={activeTab === "guides"} onClick={() => setActiveTab("guides")} icon={<Search size={18} />} label="Guides" />
            <NavButton active={activeTab === "routes"} onClick={() => setActiveTab("routes")} icon={<RouteIcon size={18} />} label="Our Tours" />
            <NavButton active={activeTab === "tours"} onClick={() => setActiveTab("tours")} icon={<Bus size={18} />} label="Tour Instances" />
            <NavButton active={activeTab === "registrations"} onClick={() => setActiveTab("registrations")} icon={<ClipboardList size={18} />} label="Registrations" />
            <NavButton active={activeTab === "programs"} onClick={() => setActiveTab("programs")} icon={<Play size={18} />} label="Queries & Programs" />
            <NavButton active={activeTab === "audit"} onClick={() => setActiveTab("audit")} icon={<RefreshCw size={18} />} label="Audit Log" />
          </nav>

          <div className="mt-10 p-4 border border-emerald-900/10 bg-emerald-50">
            <p className="text-[10px] uppercase opacity-60 mb-1">Project Team</p>
            <p className="text-sm font-medium">Shirel & Rut</p>
          </div>
        </aside>

        <main className="lg:ml-72 p-8">
          {/* ------------------------ מקטע 27: כותרת כללית וכפתור רענון ------------------------ */}
          <header className="flex items-start justify-between gap-4 mb-10">
            <div>
              <p className="text-[11px] uppercase tracking-widest opacity-50 mb-1">
                SweetTour Management
              </p>
              <h2 className="text-5xl font-serif italic capitalize">
                {activeTab === "routes" ? "Our Tours" : activeTab}
              </h2>
            </div>

            <div className="flex gap-3">
              {activeTab === "customers" && (
                  <button
                      onClick={openNewCustomer}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-900 text-white hover:bg-emerald-800 shadow"
                  >
                    <Plus size={16} />
                    New Customer
                  </button>
              )}

              <button
                  onClick={fetchData}
                  className="flex items-center gap-2 px-5 py-3 border border-emerald-900/20 bg-white hover:bg-emerald-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </header>

          {message && (
              <div className="mb-6 p-3 bg-emerald-100 border border-emerald-900/10 text-sm">
                {message}
              </div>
          )}

          {loading && (
              <div className="mb-6 p-3 bg-white border border-emerald-900/10 text-sm">
                Loading database data...
              </div>
          )}

          {/* ------------------------ מקטע 28: מסך הבית ------------------------ */}
          {activeTab === "dashboard" && (
              <section className="space-y-10">
                <div className="py-14 text-center">
                  <h1 className="text-7xl font-serif italic">
                    Swee<span className="font-bold text-emerald-600">T</span>our
                  </h1>
                  <p className="mt-4 uppercase tracking-[0.4em] text-sm opacity-60">
                    Guided Tour Management System
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  <StatCard label="Customers" value={customers.length} icon={<Users />} />
                  <StatCard label="Guides" value={guides.length} icon={<Search />} />
                  <StatCard label="Tours" value={tours.length} icon={<Bus />} />
                  <StatCard label="Registration Debt" value={`₪${totalDebt.toLocaleString()}`} icon={<CreditCard />} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DashboardCard title="Our Tours" text="Browse route cards and open the complete route profile." icon={<RouteIcon />} onClick={() => setActiveTab("routes")} />
                  <DashboardCard title="Programs" text="Run PostgreSQL functions, procedures and trigger actions." icon={<Play />} onClick={() => setActiveTab("programs")} />
                </div>
              </section>
          )}

          {/* ------------------------ מקטע 29: מסך לקוחות CRUD ------------------------ */}
          {activeTab === "customers" && (
              <TableShell>
                <div className="grid grid-cols-5 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                  <div>Full Name</div>
                  <div className="col-span-2">Email</div>
                  <div>Phone</div>
                  <div className="text-right">Actions</div>
                </div>

                {pageItems(customers, customerPage).map((customer) => (
                    <div key={customer.customerid} className="grid grid-cols-5 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4">
                      <div className="font-medium">{customer.fullname}</div>
                      <div className="col-span-2 font-mono text-sm">{customer.email}</div>
                      <div className="font-mono text-sm">{customer.phone}</div>
                      <div className="flex justify-end gap-2">
                        <IconButton title="Edit customer" onClick={() => openEditCustomer(customer)} icon={<Edit2 size={15} />} />
                        <IconButton title="Delete customer" danger onClick={() => deleteCustomer(customer.customerid)} icon={<Trash2 size={15} />} />
                      </div>
                    </div>
                ))}
                <Pagination
                    page={customerPage}
                    totalItems={customers.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCustomerPage}
                />
              </TableShell>
          )}

          {/* ------------------------ מקטע 30: מסך מדריכים ------------------------ */}
          {activeTab === "guides" && (
              <TableShell>
                <div className="grid grid-cols-5 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Phone</div>
                  <div>Rating</div>
                  <div>School</div>
                </div>

                {pageItems(guides, guidePage).map((guide) => (
                    <div
                        key={guide.guideid}
                        onClick={() => setSelectedGuide(guide)}
                        className="grid grid-cols-5 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4 cursor-pointer"
                    >
                      <div className="font-medium">{guide.firstname} {guide.lastname}</div>
                      <div className="font-mono text-sm">{guide.email}</div>
                      <div className="font-mono text-sm">{guide.phone}</div>
                      <div className="font-mono text-sm">{guide.rating ?? ""}</div>
                      <div className="text-sm">{guide.school ?? ""}</div>
                    </div>
                ))}
                <Pagination
                    page={guidePage}
                    totalItems={guides.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setGuidePage}
                />
              </TableShell>
          )}

          {/* ------------------------ מקטע 31: מסך כרטיסי המסלולים ------------------------ */}
          {activeTab === "routes" && (
              <section>
                <p className="mb-8 max-w-2xl text-sm opacity-70">
                  Select a tour route to view its complete database information.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pageItems(routes, routePage).map((route) => (
                      <button
                          key={route.routeid}
                          onClick={() => setSelectedRoute(route)}
                          className="p-7 min-h-52 bg-white/75 border border-emerald-900/15 hover:-translate-y-1 hover:shadow-lg transition-all text-left"
                      >
                        <RouteIcon className="mb-8 text-emerald-700" />
                        <h3 className="text-2xl font-serif italic mb-3">{route.r_name}</h3>
                        <p className="text-sm opacity-65 line-clamp-3">{route.description}</p>
                        <div className="mt-6 flex gap-2 text-[10px] uppercase tracking-widest">
                          <span className="px-2 py-1 bg-emerald-100">Level {route.r_level ?? "-"}</span>
                          <span className="px-2 py-1 bg-emerald-100">{route.estimatedduration ?? "-"} min</span>
                        </div>
                      </button>
                  ))}
                </div>
                <Pagination
                    page={routePage}
                    totalItems={routes.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setRoutePage}
                />
              </section>
          )}

          {/* ------------------------ מקטע 32: מסך מופעי סיור ------------------------ */}
          {activeTab === "tours" && (
              <TableShell>
                <div className="grid grid-cols-7 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                  <div>Route</div>
                  <div>Guide</div>
                  <div>Date</div>
                  <div>Meeting Point</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div className="text-right">Actions</div>
                </div>

                {pageItems(tours, tourPage).map((tour) => (
                    <div key={tour.tourid} className="grid grid-cols-7 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4">
                      <button onClick={() => setSelectedTour(tour)} className="font-medium text-left hover:underline">{tour.route_name}</button>
                      <div>{tour.guide_name}</div>
                      <div className="font-mono text-sm">{tour.startdate}</div>
                      <div>{tour.meetingpoint}</div>
                      <div className="font-mono">₪{tour.price ?? ""}</div>
                      <div>{tour.status_name}</div>
                      <div className="text-right">
                        <button onClick={() => cancelTour(tour.tourid)} className="px-3 py-2 text-xs border border-red-700/30 text-red-700 hover:bg-red-700 hover:text-white">
                          Cancel
                        </button>
                      </div>
                    </div>
                ))}
                <Pagination
                    page={tourPage}
                    totalItems={tours.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setTourPage}
                />
              </TableShell>
          )}

          {/* ------------------------ מקטע 33: מסך הרשמות ------------------------ */}
          {activeTab === "registrations" && (
              <TableShell>
                <div className="grid grid-cols-7 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                  <div>Customer</div>
                  <div>Route</div>
                  <div>Date</div>
                  <div>People</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div>Meeting Point</div>
                </div>

                {pageItems(registrations, registrationPage).map((registration) => (
                    <div key={registration.registrationid} className="grid grid-cols-7 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4">
                      <div className="font-medium">{registration.customer_name}</div>
                      <div>{registration.route_name}</div>
                      <div className="font-mono text-sm">{registration.registrationdate}</div>
                      <div>{registration.numpeople ?? ""}</div>
                      <div className="font-mono">₪{registration.amounttopay ?? ""}</div>
                      <div>{registration.status_name}</div>
                      <div>{registration.meetingpoint}</div>
                    </div>
                ))}
                <Pagination
                    page={registrationPage}
                    totalItems={registrations.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setRegistrationPage}
                />
              </TableShell>
          )}

          {/* ------------------------ מקטע 34: מסך שאילתות, פונקציות ופרוצדורות ------------------------ */}
          {activeTab === "programs" && (
              <section className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <ProgramCard title="Program 1 — Register Customer to Tour" icon={<ClipboardList />}>
                    <SelectCustomer value={programCustomerId} setValue={setProgramCustomerId} customers={customers} />
                    <SelectTour value={programTourId} setValue={setProgramTourId} tours={tours} />
                    <div className="flex flex-wrap gap-3">
                      <ActionButton onClick={runRemainingSpots} label="Check Remaining Spots" />
                      <ActionButton onClick={runRegisterCustomer} label="Run Registration Procedure" />
                    </div>
                    {remainingSpots !== null && <ResultBox text={`Remaining spots: ${remainingSpots}`} />}
                  </ProgramCard>

                  <ProgramCard title="Program 2 — Customer Debt Management" icon={<CreditCard />}>
                    <SelectCustomer value={programCustomerId} setValue={setProgramCustomerId} customers={customers} />
                    <div className="flex flex-wrap gap-3">
                      <ActionButton onClick={runCustomerDebt} label="Check Customer Debt" />
                      <ActionButton onClick={runPayDebt} label="Pay All Customer Debt" />
                    </div>
                    {customerDebt !== null && <ResultBox text={`Current debt: ₪${customerDebt}`} />}
                  </ProgramCard>
                </div>

                {programResult && (
                    <div className="p-5 bg-emerald-950 text-emerald-50 font-mono text-sm">
                      {programResult}
                    </div>
                )}

                <div>
                  <h3 className="text-2xl font-serif italic mb-5">Tours With Available Spots</h3>
                  <TableShell>
                    <div className="grid grid-cols-5 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                      <div>Route</div>
                      <div>Meeting Point</div>
                      <div>Capacity</div>
                      <div>Registered</div>
                      <div>Spots Left</div>
                    </div>
                    {pageItems(availableTours, availableTourPage).map((tour) => (
                        <div key={tour.tourid} className="grid grid-cols-5 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4">
                          <div className="font-medium">{tour.route_name}</div>
                          <div>{tour.meetingpoint}</div>
                          <div>{tour.maxparticipants}</div>
                          <div>{tour.total_registered}</div>
                          <div className="font-bold text-emerald-700">{tour.spots_left}</div>
                        </div>
                    ))}
                    <Pagination
                        page={availableTourPage}
                        totalItems={availableTours.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setAvailableTourPage}
                    />
                  </TableShell>
                </div>
              </section>
          )}

          {/* ------------------------ מקטע 35: מסך Audit של הטריגר ------------------------ */}
          {activeTab === "audit" && (
              <TableShell>
                <div className="grid grid-cols-3 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                  <div>Registration</div>
                  <div>Old Status</div>
                  <div>Change Date</div>
                </div>

                {pageItems(auditRows, auditPage).map((row) => (
                    <div key={row.audit_id} className="grid grid-cols-3 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4">
                      <div>Registration #{row.registrationid}</div>
                      <div>{row.old_status ?? ""}</div>
                      <div className="font-mono text-sm">{row.change_date}</div>
                    </div>
                ))}
                <Pagination
                    page={auditPage}
                    totalItems={auditRows.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setAuditPage}
                />
              </TableShell>
          )}
        </main>

        {/* ------------------------ מקטע 36: חלון הוספה/עדכון לקוח ------------------------ */}
        {isCustomerFormOpen && (
            <Modal onClose={() => setIsCustomerFormOpen(false)}>
              <form onSubmit={saveCustomer}>
                <h3 className="text-3xl font-serif italic mb-6">
                  {editingCustomerId ? "Update Customer" : "Add Customer"}
                </h3>

                {!editingCustomerId && (
                    <Field label="Customer ID" type="number" value={customerForm.customerid} onChange={(value) => setCustomerForm({ ...customerForm, customerid: value })} required />
                )}

                <Field label="Full Name" value={customerForm.fullname} onChange={(value) => setCustomerForm({ ...customerForm, fullname: value })} required />
                <Field label="Email" type="email" value={customerForm.email} onChange={(value) => setCustomerForm({ ...customerForm, email: value })} required />
                <Field label="Phone" value={customerForm.phone} onChange={(value) => setCustomerForm({ ...customerForm, phone: value })} required />
                <Field label="Join Date" type="date" value={customerForm.joindate} onChange={(value) => setCustomerForm({ ...customerForm, joindate: value })} />

                <button type="submit" className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-900 text-white hover:bg-emerald-800">
                  <Save size={16} />
                  Save
                </button>
              </form>
            </Modal>
        )}

        {/* ------------------------ מקטע 37: חלון פרטי מדריך ------------------------ */}
        {selectedGuide && (
            <Modal onClose={() => setSelectedGuide(null)}>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Guide Profile</p>
              <h3 className="text-3xl font-serif italic mb-8">{selectedGuide.firstname} {selectedGuide.lastname}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <Info label="Phone" value={selectedGuide.phone} icon={<Phone size={16} />} />
                <Info label="Email" value={selectedGuide.email} icon={<Mail size={16} />} />
                <Info label="Birth Date" value={selectedGuide.birthdate} icon={<CalendarDays size={16} />} />
                <Info label="Join Date" value={selectedGuide.joindate} icon={<CalendarDays size={16} />} />
                <Info label="Experience Years" value={selectedGuide.experienceyears ?? ""} icon={<User size={16} />} />
                <Info label="Daily Rate" value={selectedGuide.dailyrate ?? ""} icon={<BadgeDollarSign size={16} />} />
                <Info label="Rating" value={selectedGuide.rating ?? ""} icon={<Star size={16} />} />
                <Info label="School" value={selectedGuide.school ?? ""} icon={<User size={16} />} />
                <Info label="Address" value={selectedGuide.address ?? ""} icon={<MapPin size={16} />} />
                <div className="md:col-span-2">
                  <p className="label">Notes</p>
                  <p className="italic">{selectedGuide.notes ?? ""}</p>
                </div>
              </div>
            </Modal>
        )}

        {/* ------------------------ מקטע 38: חלון פרטי מסלול ------------------------ */}
        {selectedRoute && (
            <Modal onClose={() => setSelectedRoute(null)}>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Route Profile</p>
              <h3 className="text-3xl font-serif italic mb-8">{selectedRoute.r_name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info label="Estimated Length" value={selectedRoute.estimatedlength ?? ""} icon={<RouteIcon size={16} />} />
                <Info label="Estimated Duration" value={`${selectedRoute.estimatedduration ?? ""} minutes`} icon={<CalendarDays size={16} />} />
                <Info label="Level" value={selectedRoute.r_level ?? ""} icon={<Star size={16} />} />
                <Info label="Area" value={selectedRoute.area ?? "Not specified"} icon={<MapPin size={16} />} />
                <div className="md:col-span-2">
                  <p className="label">Description</p>
                  <p className="leading-relaxed">{selectedRoute.description}</p>
                </div>
              </div>
            </Modal>
        )}

        {/* ------------------------ מקטע 39: חלון פרטי מופע סיור ------------------------ */}
        {selectedTour && (
            <Modal onClose={() => setSelectedTour(null)}>
              <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Tour Instance</p>
              <h3 className="text-3xl font-serif italic mb-8">{selectedTour.route_name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Info label="Guide" value={selectedTour.guide_name} icon={<User size={16} />} />
                <Info label="Status" value={selectedTour.status_name} icon={<CheckCircle2 size={16} />} />
                <Info label="Start Date" value={selectedTour.startdate} icon={<CalendarDays size={16} />} />
                <Info label="End Date" value={selectedTour.enddate} icon={<CalendarDays size={16} />} />
                <Info label="Time" value={`${selectedTour.starttime} - ${selectedTour.endtime}`} icon={<CalendarDays size={16} />} />
                <Info label="Meeting Point" value={selectedTour.meetingpoint} icon={<MapPin size={16} />} />
                <Info label="Price" value={`₪${selectedTour.price ?? ""}`} icon={<BadgeDollarSign size={16} />} />
                <Info label="Max Participants" value={selectedTour.maxparticipants ?? ""} icon={<Users size={16} />} />
                <Info label="Accessibility" value={selectedTour.accessibility ?? ""} icon={<CheckCircle2 size={16} />} />
                <Info label="Type" value={selectedTour.t_type ?? ""} icon={<Bus size={16} />} />
                <div className="md:col-span-2">
                  <p className="label">Notes</p>
                  <p>{selectedTour.notes || "No notes"}</p>
                </div>
              </div>
            </Modal>
        )}

        {/* ------------------------ מקטע 40: עיצוב קטן לרכיבים החוזרים ------------------------ */}
        <style>{`

        .label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .12em;
          font-weight: 700;
          opacity: .5;
          margin-bottom: .25rem;
        }
      `}</style>
      </div>
  );
}

// ------------------------ מקטע 41: רכיבי עזר ------------------------
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
      <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 text-left ${active ? "bg-emerald-900 text-white" : "hover:bg-emerald-900/5"}`}>
        {icon}
        {label}
      </button>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return <section className="w-full border border-emerald-900/20 bg-white/50 shadow-sm overflow-x-auto">{children}</section>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-[#F2F5F2] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-emerald-900/20 relative">
          <button onClick={onClose} className="absolute top-4 right-4"><X size={22} /></button>
          {children}
        </div>
      </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return (
      <div className="mb-4">
        <label className="label block">{label}</label>
        <input required={required} type={type} className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
      <div>
        <p className="label flex items-center gap-1">{icon}{label}</p>
        <p className="font-mono">{value}</p>
      </div>
  );
}

function IconButton({ title, onClick, icon, danger = false }: { title: string; onClick: () => void; icon: React.ReactNode; danger?: boolean }) {
  return (
      <button title={title} onClick={onClick} className={`p-2 border ${danger ? "border-red-900/20 text-red-700 hover:bg-red-700" : "border-emerald-900/20 hover:bg-emerald-900"} hover:text-white`}>
        {icon}
      </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
      <div className="p-6 border border-emerald-900/15 bg-white/70 shadow-sm">
        <div className="text-emerald-700 mb-6">{icon}</div>
        <p className="text-3xl font-mono">{value}</p>
        <p className="text-xs opacity-55 mt-1">{label}</p>
      </div>
  );
}

function DashboardCard({ title, text, icon, onClick }: { title: string; text: string; icon: React.ReactNode; onClick: () => void }) {
  return (
      <button onClick={onClick} className="p-8 border border-emerald-900/20 bg-white/60 hover:bg-emerald-50 text-left shadow-sm">
        <div className="mb-4 text-emerald-700">{icon}</div>
        <h3 className="text-2xl font-serif italic">{title}</h3>
        <p className="text-sm opacity-60 mt-2">{text}</p>
      </button>
  );
}

function ProgramCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
      <div className="p-7 border border-emerald-900/15 bg-white/70 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-emerald-700">{icon}</div>
          <h3 className="text-2xl font-serif italic">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
  );
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="px-4 py-3 bg-emerald-900 text-white hover:bg-emerald-800 text-sm">{label}</button>;
}

function ResultBox({ text }: { text: string }) {
  return <div className="p-4 bg-emerald-100 border border-emerald-900/10 font-mono text-sm">{text}</div>;
}


// ------------------------ מקטע 41.1: רכיב עימוד משותף לכל הטבלאות ------------------------
function Pagination({
                      page,
                      totalItems,
                      pageSize,
                      onPageChange
                    }: {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border-t border-emerald-900/10">
        <p className="text-sm text-emerald-900/70">
          Showing {firstItem}-{lastItem} of {totalItems}
        </p>

        <div className="flex items-center gap-3">
          <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-4 py-2 border border-emerald-900/20 disabled:opacity-40 hover:bg-emerald-50"
          >
            Previous
          </button>

          <span className="text-sm font-mono">
          Page {page} of {totalPages}
        </span>

          <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-4 py-2 border border-emerald-900/20 disabled:opacity-40 hover:bg-emerald-50"
          >
            Next
          </button>
        </div>
      </div>
  );
}

function SelectCustomer({ value, setValue, customers }: { value: string; setValue: (value: string) => void; customers: Customer[] }) {
  return (
      <div>
        <label className="label block">Customer</label>
        <select value={value} onChange={(event) => setValue(event.target.value)} className="w-full p-3 border border-emerald-900/20 bg-white">
          <option value="">Select customer...</option>
          {customers.map((customer) => <option key={customer.customerid} value={customer.customerid}>{customer.fullname}</option>)}
        </select>
      </div>
  );
}

function SelectTour({ value, setValue, tours }: { value: string; setValue: (value: string) => void; tours: Tour[] }) {
  return (
      <div>
        <label className="label block">Tour</label>
        <select value={value} onChange={(event) => setValue(event.target.value)} className="w-full p-3 border border-emerald-900/20 bg-white">
          <option value="">Select tour...</option>
          {tours.map((tour) => <option key={tour.tourid} value={tour.tourid}>{tour.route_name} — {tour.startdate} — {tour.meetingpoint}</option>)}
        </select>
      </div>
  );
}
