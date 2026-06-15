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
  AlertTriangle,
  GraduationCap
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
  min_price: number | null;
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

interface TourCustomer {
  registrationid: number;
  fullname: string;
  phone: string;
  email: string;
  numpeople: number | null;
  amounttopay: number | null;
  status_name: string;
}

interface MonthlyRevenue {
  year: number;
  month: number;
  monthlyincome: number;
  transactioncount: number;
}

interface UpcomingTour {
  tourid: number;
  routename: string;
  starting: string;
  maxparticipants: number;
  availableslots: number;
}

interface RegistrationStatus {
  registrationstatusid: number;
  statusname: string;
}

interface StationRecord {
  s_name: string;
  s_address: string | null;
  description: string | null;
  station_order: number | null;
}

interface UnpaidCustomerQueryRow {
  fullname: string;
  phone: string;
  unpaid_registrations: number;
}

interface ActiveGuideQueryRow {
  guide_name: string;
  tours_count: number;
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
  const [registrationStatuses, setRegistrationStatuses] = useState<RegistrationStatus[]>([]);
  const [availableTours, setAvailableTours] = useState<AvailableTour[]>([]);
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [tourCustomers, setTourCustomers] = useState<TourCustomer[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [upcomingTours, setUpcomingTours] = useState<UpcomingTour[]>([]);
  const [unpaidRegistrationCount, setUnpaidRegistrationCount] = useState("10");
  const [unpaidCustomers, setUnpaidCustomers] = useState<UnpaidCustomerQueryRow[]>([]);
  const [unpaidCustomersLoading, setUnpaidCustomersLoading] = useState(false);
  const [unpaidCustomersQueryRan, setUnpaidCustomersQueryRan] = useState(false);
  const [activeGuides, setActiveGuides] = useState<ActiveGuideQueryRow[]>([]);
  const [selectedReport, setSelectedReport] = useState<
      "monthly" | "upcoming" | "unpaid" | "activeGuides"
  >("monthly");

  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteRecord | null>(null);
  const [routeStations, setRouteStations] = useState<StationRecord[]>([]);
  const [selectedStation, setSelectedStation] = useState<StationRecord | null>(null);
  const [stationsLoading, setStationsLoading] = useState(false);
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

  // ------------------------ מקטע 4.5: חיפוש במסכי לקוחות ומדריכים ------------------------
  const [customerSearch, setCustomerSearch] = useState("");
  const [guideSearch, setGuideSearch] = useState("");

  // ------------------------ מקטע 4.6: טופס הוספה ועדכון מדריך ------------------------
  const emptyGuideForm = {
    guideid: "",
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    birthdate: "",
    joindate: "",
    dailyrate: "",
    experienceyears: "",
    rating: "",
    address: "",
    notes: "",
    school: ""
  };

  const [guideForm, setGuideForm] = useState(emptyGuideForm);
  const [editingGuideId, setEditingGuideId] = useState<number | null>(null);
  const [isGuideFormOpen, setIsGuideFormOpen] = useState(false);

  // ------------------------ מקטע 4.7: טופס וחיפוש מסלולים ------------------------
  const emptyRouteForm = {
    routeid: "",
    r_name: "",
    estimatedlength: "",
    estimatedduration: "",
    description: "",
    r_level: "",
    area: ""
  };

  const [routeForm, setRouteForm] = useState(emptyRouteForm);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [routeSearch, setRouteSearch] = useState("");

  // ------------------------ מקטע 4.8: סינון מסלולים לפי רמה ומחיר ------------------------
  const [routeLevelFilter, setRouteLevelFilter] = useState("");
  const [routeMaxPrice, setRouteMaxPrice] = useState("");

  const [programCustomerId, setProgramCustomerId] = useState("");
  const [programTourId, setProgramTourId] = useState("");

  // ------------------------ מקטע 4.2: חיפוש מהיר בתוכניות ------------------------
  const [program1CustomerSearch, setProgram1CustomerSearch] = useState("");
  const [program1TourSearch, setProgram1TourSearch] = useState("");
  const [program2CustomerSearch, setProgram2CustomerSearch] = useState("");

  // ------------------------ מקטע 4.3: חיפוש במסך ההרשמות ------------------------
  const [registrationSearch, setRegistrationSearch] = useState("");
  // אפשר לחפש גם לפי registrationid באמצעות אותה שורת חיפוש.

  // ------------------------ מקטע 4.9: טופס עדכון הרשמה ------------------------
  const emptyRegistrationForm = {
    registrationid: "",
    customerid: "",
    tourid: "",
    registrationdate: "",
    numpeople: "",
    registrationstatusid: "",
    notes: ""
  };

  const [registrationForm, setRegistrationForm] = useState(emptyRegistrationForm);
  const [editingRegistrationId, setEditingRegistrationId] = useState<number | null>(null);
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  // ------------------------ מקטע 4.4: בחירת שנה בלוח מופעי הסיור ------------------------
  const currentYear = new Date().getFullYear();
  const [selectedTourYear, setSelectedTourYear] = useState(currentYear);
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

  useEffect(() => {
    setRegistrationPage(1);
  }, [registrationSearch]);

  useEffect(() => {
    setCustomerPage(1);
  }, [customerSearch]);

  useEffect(() => {
    setGuidePage(1);
  }, [guideSearch]);

  useEffect(() => {
    setRoutePage(1);
  }, [routeSearch, routeLevelFilter, routeMaxPrice]);

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
      fetchRegistrationStatuses(),
      fetchAvailableTours(),
      fetchAudit(),
      fetchMonthlyRevenue(),
      fetchUpcomingTours(),
      fetchActiveGuides()
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

  // ------------------------ מקטע 12.1: שליפת סטטוסים אפשריים להרשמה ------------------------
  const fetchRegistrationStatuses = async () => {
    try {
      setRegistrationStatuses(
          await getJson<RegistrationStatus[]>("/api/registration-statuses")
      );
    } catch (error) {
      console.error(error);
      setMessage("Error loading registration statuses");
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

  // ------------------------ מקטע 14.1: שליפת הכנסות חודשיות ------------------------
  const fetchMonthlyRevenue = async () => {
    try {
      setMonthlyRevenue(
          await getJson<MonthlyRevenue[]>("/api/queries/monthly-revenue")
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------ מקטע 14.2: שליפת סיורים בשבוע הקרוב ------------------------
  const fetchUpcomingTours = async () => {
    try {
      setUpcomingTours(
          await getJson<UpcomingTour[]>("/api/queries/upcoming-tours")
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------ מקטע 14.3: שאילתה עם פרמטר - לקוחות עם X הרשמות שלא שולמו ------------------------
  const runUnpaidCustomersQuery = async () => {
    const count = Number(unpaidRegistrationCount);

    if (!Number.isInteger(count) || count < 0) {
      alert("Please enter a whole number of unpaid registrations.");
      return;
    }

    setUnpaidCustomersLoading(true);
    setUnpaidCustomersQueryRan(true);

    try {
      setUnpaidCustomers(
          await getJson<UnpaidCustomerQueryRow[]>(
              `/api/queries/customers-with-unpaid-registrations?count=${count}`
          )
      );
    } catch (error) {
      console.error(error);
      setUnpaidCustomers([]);
      setMessage("Could not run the unpaid registrations query");
    } finally {
      setUnpaidCustomersLoading(false);
    }
  };

  // ------------------------ מקטע 14.4: שאילתה - מדריכים פעילים ומספר הסיורים שלהם ------------------------
  const fetchActiveGuides = async () => {
    try {
      setActiveGuides(
          await getJson<ActiveGuideQueryRow[]>("/api/queries/active-guides")
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ------------------------ מקטע 14.5: שליפת הלקוחות הרשומים למופע סיור ------------------------
  const fetchTourCustomers = async (tourid: number) => {
    try {
      setTourCustomers(
          await getJson<TourCustomer[]>(`/api/tours/${tourid}/customers`)
      );
    } catch (error) {
      console.error(error);
      setTourCustomers([]);
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

  // ------------------------ מקטע 18.1: פתיחת טופס מדריך חדש ------------------------
  const openNewGuide = () => {
    setEditingGuideId(null);
    setGuideForm(emptyGuideForm);
    setSelectedGuide(null);
    setIsGuideFormOpen(true);
  };

  // ------------------------ מקטע 18.2: פתיחת טופס עדכון מדריך ------------------------
  const openEditGuide = (guide: Guide) => {
    setEditingGuideId(guide.guideid);
    setGuideForm({
      guideid: String(guide.guideid),
      firstname: guide.firstname ?? "",
      lastname: guide.lastname ?? "",
      phone: guide.phone ?? "",
      email: guide.email ?? "",
      birthdate: guide.birthdate ?? "",
      joindate: guide.joindate ?? "",
      dailyrate: guide.dailyrate == null ? "" : String(guide.dailyrate),
      experienceyears: guide.experienceyears == null ? "" : String(guide.experienceyears),
      rating: guide.rating == null ? "" : String(guide.rating),
      address: guide.address ?? "",
      notes: guide.notes ?? "",
      school: guide.school ?? ""
    });
    setSelectedGuide(null);
    setIsGuideFormOpen(true);
  };

  // ------------------------ מקטע 18.3: שמירת מדריך - POST או PUT ------------------------
  const saveGuide = async (event: React.FormEvent) => {
    event.preventDefault();

    const url = editingGuideId
        ? `${API_BASE}/api/guides/${editingGuideId}`
        : `${API_BASE}/api/guides`;

    const method = editingGuideId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guideid: guideForm.guideid ? Number(guideForm.guideid) : undefined,
        firstname: guideForm.firstname,
        lastname: guideForm.lastname,
        phone: guideForm.phone,
        email: guideForm.email,
        birthdate: guideForm.birthdate || null,
        joindate: guideForm.joindate || null,
        dailyrate: guideForm.dailyrate === "" ? null : Number(guideForm.dailyrate),
        experienceyears:
            guideForm.experienceyears === ""
                ? null
                : Number(guideForm.experienceyears),
        rating: guideForm.rating === "" ? null : Number(guideForm.rating),
        address: guideForm.address,
        notes: guideForm.notes,
        school: guideForm.school
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Guide save failed");
      return;
    }

    setMessage(
        editingGuideId
            ? "Guide updated successfully"
            : "Guide added successfully"
    );
    setIsGuideFormOpen(false);
    setEditingGuideId(null);
    setGuideForm(emptyGuideForm);
    await Promise.all([fetchGuides(), fetchTours()]);
  };

  // ------------------------ מקטע 18.4: מחיקת מדריך עם אישור ------------------------
  const deleteGuide = async (guide: Guide) => {
    const fullName = `${guide.firstname} ${guide.lastname}`.trim();
    const approved = confirm(
        `Are you sure you want to delete ${fullName}?\n\nThis action will also delete the guide from PostgreSQL and cannot be undone.`
    );

    if (!approved) return;

    const response = await fetch(`${API_BASE}/api/guides/${guide.guideid}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Guide delete failed");
      return;
    }

    setSelectedGuide(null);
    setMessage("Guide deleted successfully");
    await Promise.all([fetchGuides(), fetchTours()]);
  };

  // ------------------------ מקטע 18.4.1: שליפת תחנות של מסלול ------------------------
  const fetchRouteStations = async (routeid: number) => {
    setStationsLoading(true);

    try {
      const stations = await getJson<StationRecord[]>(
          `/api/routes/${routeid}/stations`
      );
      setRouteStations(stations);
    } catch (error) {
      console.error(error);
      setRouteStations([]);
      setMessage("Could not load the stations for this route");
    } finally {
      setStationsLoading(false);
    }
  };

  // ------------------------ מקטע 18.4.2: פתיחת פרטי מסלול ותחנותיו ------------------------
  const openRouteProfile = async (route: RouteRecord) => {
    setSelectedStation(null);
    setSelectedRoute(route);
    await fetchRouteStations(route.routeid);
  };

  // ------------------------ מקטע 18.5: פתיחת טופס מסלול חדש ------------------------
  const openNewRoute = () => {
    setEditingRouteId(null);
    setRouteForm(emptyRouteForm);
    setSelectedRoute(null);
    setIsRouteFormOpen(true);
  };

  // ------------------------ מקטע 18.6: פתיחת טופס עדכון מסלול ------------------------
  const openEditRoute = (route: RouteRecord) => {
    setEditingRouteId(route.routeid);
    setRouteForm({
      routeid: String(route.routeid),
      r_name: route.r_name ?? "",
      estimatedlength:
          route.estimatedlength == null ? "" : String(route.estimatedlength),
      estimatedduration:
          route.estimatedduration == null ? "" : String(route.estimatedduration),
      description: route.description ?? "",
      r_level: route.r_level == null ? "" : String(route.r_level),
      area: route.area ?? ""
    });
    setSelectedRoute(null);
    setIsRouteFormOpen(true);
  };

  // ------------------------ מקטע 18.7: שמירת מסלול - POST או PUT ------------------------
  const saveRoute = async (event: React.FormEvent) => {
    event.preventDefault();

    const url = editingRouteId
        ? `${API_BASE}/api/routes/${editingRouteId}`
        : `${API_BASE}/api/routes`;

    const method = editingRouteId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routeid: routeForm.routeid ? Number(routeForm.routeid) : undefined,
        r_name: routeForm.r_name,
        estimatedlength:
            routeForm.estimatedlength === ""
                ? null
                : Number(routeForm.estimatedlength),
        estimatedduration:
            routeForm.estimatedduration === ""
                ? null
                : Number(routeForm.estimatedduration),
        description: routeForm.description,
        r_level: routeForm.r_level === "" ? null : Number(routeForm.r_level),
        area: routeForm.area || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Route save failed");
      return;
    }

    setMessage(
        editingRouteId
            ? "Route updated successfully — tour instances were refreshed"
            : "Route added successfully"
    );

    setIsRouteFormOpen(false);
    setEditingRouteId(null);
    setRouteForm(emptyRouteForm);

    // חשוב: מופעי הסיור מציגים את שם המסלול באמצעות JOIN,
    // ולכן לאחר עדכון המסלול טוענים מחדש גם routes וגם tours.
    await Promise.all([fetchRoutes(), fetchTours(), fetchUpcomingTours()]);
  };

  // ------------------------ מקטע 18.8: מחיקת מסלול עם אישור ------------------------
  const deleteRoute = async (route: RouteRecord) => {
    const approved = confirm(
        `Are you sure you want to delete "${route.r_name}"?\n\nIf this route is used by tour instances, PostgreSQL will protect the data and the deletion will be blocked.`
    );

    if (!approved) return;

    const response = await fetch(`${API_BASE}/api/routes/${route.routeid}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Route delete failed");
      return;
    }

    setSelectedRoute(null);
    setMessage("Route deleted successfully");
    await Promise.all([fetchRoutes(), fetchTours(), fetchUpcomingTours()]);
  };

  // ------------------------ מקטע 18.9: פתיחת טופס עדכון הרשמה ------------------------
  const openEditRegistration = (registration: Registration) => {
    setEditingRegistrationId(registration.registrationid);
    setRegistrationForm({
      registrationid: String(registration.registrationid),
      customerid: registration.customerid == null ? "" : String(registration.customerid),
      tourid: registration.tourid == null ? "" : String(registration.tourid),
      registrationdate: registration.registrationdate ?? "",
      numpeople: registration.numpeople == null ? "" : String(registration.numpeople),
      registrationstatusid:
          registration.registrationstatusid == null
              ? ""
              : String(registration.registrationstatusid),
      notes: registration.notes ?? ""
    });
    setIsRegistrationFormOpen(true);
  };

  // ------------------------ מקטע 18.10: שמירת עדכון הרשמה ------------------------
  const saveRegistration = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingRegistrationId) return;

    const response = await fetch(
        `${API_BASE}/api/registrations/${editingRegistrationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerid: Number(registrationForm.customerid),
            tourid: Number(registrationForm.tourid),
            registrationdate: registrationForm.registrationdate || null,
            numpeople:
                registrationForm.numpeople === ""
                    ? null
                    : Number(registrationForm.numpeople),
            registrationstatusid:
                registrationForm.registrationstatusid === ""
                    ? null
                    : Number(registrationForm.registrationstatusid),
            notes: registrationForm.notes
          })
        }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Registration update failed");
      return;
    }

    setMessage(
        "Registration updated successfully — PostgreSQL and the audit log were updated"
    );
    setIsRegistrationFormOpen(false);
    setEditingRegistrationId(null);
    setRegistrationForm(emptyRegistrationForm);

    await Promise.all([
      fetchRegistrations(),
      fetchAudit(),
      fetchAvailableTours(),
      fetchTours()
    ]);
  };

  // ------------------------ מקטע 18.11: מחיקת הרשמה עם אישור ------------------------
  const deleteRegistration = async (registration: Registration) => {
    const approved = confirm(
        `Are you sure you want to delete registration #${registration.registrationid}?\n\nCustomer: ${registration.customer_name}\nTour: ${registration.route_name}\n\nThis action will delete the registration from PostgreSQL and cannot be undone.`
    );

    if (!approved) return;

    const response = await fetch(
        `${API_BASE}/api/registrations/${registration.registrationid}`,
        { method: "DELETE" }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Registration delete failed");
      return;
    }

    setMessage("Registration deleted successfully");
    await Promise.all([
      fetchRegistrations(),
      fetchAvailableTours(),
      fetchTours(),
      fetchAudit()
    ]);
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

  // ------------------------ מקטע 23.0: סינון לקוחות ומדריכים לפי שם ------------------------
  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim().toLowerCase();

    if (!search) return customers;

    return customers.filter((customer) =>
        customer.fullname.toLowerCase().includes(search)
    );
  }, [customers, customerSearch]);

  const filteredGuides = useMemo(() => {
    const search = guideSearch.trim().toLowerCase();

    if (!search) return guides;

    return guides.filter((guide) =>
        `${guide.firstname} ${guide.lastname}`.toLowerCase().includes(search)
    );
  }, [guides, guideSearch]);

  const filteredRoutes = useMemo(() => {
    const search = routeSearch.trim().toLowerCase();
    const selectedLevel =
        routeLevelFilter === "" ? null : Number(routeLevelFilter);
    const maxPrice =
        routeMaxPrice === "" ? null : Number(routeMaxPrice);

    return routes.filter((route) => {
      const matchesSearch =
          !search ||
          `${route.r_name} ${route.description} ${route.area ?? ""}`
              .toLowerCase()
              .includes(search);

      const matchesLevel =
          selectedLevel === null || route.r_level === selectedLevel;

      // min_price הוא המחיר הזול ביותר של מופע סיור שמשויך למסלול.
      // מסלול שאין לו עדיין מופע סיור לא יופיע כאשר מופעל סינון מחיר.
      const matchesPrice =
          maxPrice === null ||
          (route.min_price !== null && route.min_price <= maxPrice);

      return matchesSearch && matchesLevel && matchesPrice;
    });
  }, [routes, routeSearch, routeLevelFilter, routeMaxPrice]);

  // ------------------------ מקטע 23.1: סינון הרשמות לפי לקוח או מסלול ------------------------
  const filteredRegistrations = useMemo(() => {
    const search = registrationSearch.trim().toLowerCase();

    if (!search) {
      return registrations;
    }

    return registrations.filter((registration) =>
        registration.customer_name.toLowerCase().includes(search) ||
        registration.route_name.toLowerCase().includes(search) ||
        String(registration.registrationid).includes(search)
    );
  }, [registrations, registrationSearch]);

  // ------------------------ מקטע 23.2: הכנת נתוני לוח השנה של מופעי הסיור ------------------------
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const availableTourYears = useMemo(() => {
    const years = tours
        .map((tour) => Number(tour.startdate?.slice(0, 4)))
        .filter((year) => Number.isFinite(year));

    return Array.from(new Set(years)).sort((a, b) => a - b);
  }, [tours]);

  useEffect(() => {
    if (
        availableTourYears.length > 0 &&
        !availableTourYears.includes(selectedTourYear)
    ) {
      setSelectedTourYear(availableTourYears[0]);
    }
  }, [availableTourYears, selectedTourYear]);

  const toursByMonth = useMemo(() => {
    const months: Tour[][] = Array.from({ length: 12 }, () => []);

    tours.forEach((tour) => {
      if (!tour.startdate) return;

      const date = new Date(`${tour.startdate}T00:00:00`);

      if (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === selectedTourYear
      ) {
        months[date.getMonth()].push(tour);
      }
    });

    months.forEach((monthTours) => {
      monthTours.sort((first, second) =>
          first.startdate.localeCompare(second.startdate)
      );
    });

    return months;
  }, [tours, selectedTourYear]);

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
            <NavButton active={activeTab === "programs"} onClick={() => setActiveTab("programs")} icon={<Play size={18} />} label="Queries" />
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

              {activeTab === "guides" && (
                  <button
                      onClick={openNewGuide}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-900 text-white hover:bg-emerald-800 shadow"
                  >
                    <Plus size={16} />
                    New Guide
                  </button>
              )}

              {activeTab === "routes" && (
                  <button
                      onClick={openNewRoute}
                      className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white hover:bg-orange-600 shadow"
                  >
                    <Plus size={16} />
                    New Route
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
                {/* ------------------------ מקטע 28.1: אזור פתיחה מעוצב ------------------------ */}
                <div className="relative overflow-hidden py-14 px-8 text-center bg-white/55 border border-emerald-900/10 shadow-sm">
                  <div className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-orange-200/40 blur-3xl" />
                  <div className="absolute -bottom-24 -right-10 w-64 h-64 rounded-full bg-emerald-200/50 blur-3xl" />

                  <div className="relative">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-900/50 mb-3">
                      Welcome to your management center
                    </p>

                    <h1 className="text-6xl md:text-7xl font-serif italic">
                      Swee<span className="font-bold text-emerald-600">T</span>our
                    </h1>

                    <p className="mt-4 uppercase tracking-[0.35em] text-xs md:text-sm opacity-60">
                      Guided Tour Management System
                    </p>

                    <p className="max-w-2xl mx-auto mt-5 text-emerald-900/65">
                      Choose any area below to manage customers, guides, routes,
                      tour instances, registrations, queries, and database activity.
                    </p>
                  </div>
                </div>

                {/* ------------------------ מקטע 28.2: נתוני סיכום ------------------------ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <StatCard
                      label="Customers"
                      value={customers.length}
                      icon={<Users />}
                  />
                  <StatCard
                      label="Guides"
                      value={guides.length}
                      icon={<GraduationCap />}
                  />
                  <StatCard
                      label="Tour Instances"
                      value={tours.length}
                      icon={<Bus />}
                  />
                  <StatCard
                      label="Registration Debt"
                      value={`₪${totalDebt.toLocaleString()}`}
                      icon={<CreditCard />}
                  />
                </div>

                {/* ------------------------ מקטע 28.3: ניווט לכל מסכי האתר ------------------------ */}
                <div>
                  <div className="flex items-end justify-between gap-5 mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-orange-700/70">
                        Quick Navigation
                      </p>
                      <h2 className="text-4xl font-serif italic text-emerald-950">
                        Explore the System
                      </h2>
                    </div>

                    <p className="hidden md:block max-w-md text-right text-sm text-emerald-900/55">
                      Every card opens a complete management screen.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <DashboardNavigationCard
                        title="Customers"
                        text="Search, add, update, and delete customer records."
                        icon={<User size={30} />}
                        accent="bg-sky-100 text-sky-700 border-sky-200"
                        onClick={() => setActiveTab("customers")}
                    />

                    <DashboardNavigationCard
                        title="Guides"
                        text="Manage guides and open their complete professional profiles."
                        icon={<GraduationCap size={32} />}
                        accent="bg-violet-100 text-violet-700 border-violet-200"
                        onClick={() => setActiveTab("guides")}
                    />

                    <DashboardNavigationCard
                        title="Our Tours"
                        text="Browse, filter, create, and update tour routes and stations."
                        icon={<RouteIcon size={30} />}
                        accent="bg-orange-100 text-orange-700 border-orange-200"
                        onClick={() => setActiveTab("routes")}
                    />

                    <DashboardNavigationCard
                        title="Tour Instances"
                        text="Open the annual calendar and view scheduled tour instances."
                        icon={<Bus size={30} />}
                        accent="bg-amber-100 text-amber-700 border-amber-200"
                        onClick={() => setActiveTab("tours")}
                    />

                    <DashboardNavigationCard
                        title="Registrations"
                        text="Search, update, and delete customer registrations."
                        icon={<ClipboardList size={30} />}
                        accent="bg-rose-100 text-rose-700 border-rose-200"
                        onClick={() => setActiveTab("registrations")}
                    />

                    <DashboardNavigationCard
                        title="Queries"
                        text="Run procedures, functions, and useful database reports."
                        icon={<Play size={30} />}
                        accent="bg-emerald-100 text-emerald-700 border-emerald-200"
                        onClick={() => setActiveTab("programs")}
                    />

                    <DashboardNavigationCard
                        title="Audit Log"
                        text="Review changes recorded automatically by database triggers."
                        icon={<RefreshCw size={30} />}
                        accent="bg-cyan-100 text-cyan-700 border-cyan-200"
                        onClick={() => setActiveTab("audit")}
                    />

                    <DashboardNavigationCard
                        title="Refresh All Data"
                        text="Reload the latest information from PostgreSQL."
                        icon={<Database size={30} />}
                        accent="bg-lime-100 text-lime-700 border-lime-200"
                        onClick={fetchData}
                    />
                  </div>
                </div>
              </section>
          )}

          {/* ------------------------ מקטע 29: מסך לקוחות CRUD עם חיפוש ------------------------ */}
          {activeTab === "customers" && (
              <section className="space-y-5">
                <SearchPanel
                    title="Find a Customer"
                    subtitle="Search by the customer's full name."
                    value={customerSearch}
                    onChange={setCustomerSearch}
                    resultCount={filteredCustomers.length}
                    placeholder="Start typing a customer name..."
                />

                <TableShell>
                  <div className="grid grid-cols-5 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                    <div>Full Name</div>
                    <div className="col-span-2">Email</div>
                    <div>Phone</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {pageItems(filteredCustomers, customerPage).map((customer) => (
                      <div
                          key={customer.customerid}
                          className="grid grid-cols-5 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4"
                      >
                        <div className="font-medium">{customer.fullname}</div>
                        <div className="col-span-2 font-mono text-sm">{customer.email}</div>
                        <div className="font-mono text-sm">{customer.phone}</div>
                        <div className="flex justify-end gap-2">
                          <IconButton
                              title="Edit customer"
                              onClick={() => openEditCustomer(customer)}
                              icon={<Edit2 size={15} />}
                          />
                          <IconButton
                              title="Delete customer"
                              danger
                              onClick={() => deleteCustomer(customer.customerid)}
                              icon={<Trash2 size={15} />}
                          />
                        </div>
                      </div>
                  ))}

                  {filteredCustomers.length === 0 && (
                      <EmptySearch text="No customers match this search." />
                  )}

                  <Pagination
                      page={customerPage}
                      totalItems={filteredCustomers.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setCustomerPage}
                  />
                </TableShell>
              </section>
          )}

          {/* ------------------------ מקטע 30: מסך מדריכים CRUD עם חיפוש ------------------------ */}
          {activeTab === "guides" && (
              <section className="space-y-5">
                <SearchPanel
                    title="Find a Guide"
                    subtitle="Search by the guide's first name, last name, or full name."
                    value={guideSearch}
                    onChange={setGuideSearch}
                    resultCount={filteredGuides.length}
                    placeholder="Start typing a guide name..."
                />

                <TableShell>
                  <div className="grid grid-cols-5 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                    <div>Name</div>
                    <div>Email</div>
                    <div>Phone</div>
                    <div>Rating</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {pageItems(filteredGuides, guidePage).map((guide) => (
                      <div
                          key={guide.guideid}
                          onClick={() => setSelectedGuide(guide)}
                          className="grid grid-cols-5 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4 cursor-pointer"
                      >
                        <div className="font-medium">
                          {guide.firstname} {guide.lastname}
                        </div>
                        <div className="font-mono text-sm">{guide.email}</div>
                        <div className="font-mono text-sm">{guide.phone}</div>
                        <div className="font-mono text-sm">{guide.rating ?? ""}</div>
                        <div className="flex justify-end gap-2">
                          <button
                              type="button"
                              title="Edit guide"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditGuide(guide);
                              }}
                              className="p-2 border border-emerald-900/20 hover:bg-emerald-900 hover:text-white"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                              type="button"
                              title="Delete guide"
                              onClick={(event) => {
                                event.stopPropagation();
                                deleteGuide(guide);
                              }}
                              className="p-2 border border-red-900/20 text-red-700 hover:bg-red-700 hover:text-white"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                  ))}

                  {filteredGuides.length === 0 && (
                      <EmptySearch text="No guides match this search." />
                  )}

                  <Pagination
                      page={guidePage}
                      totalItems={filteredGuides.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setGuidePage}
                  />
                </TableShell>
              </section>
          )}

          {/* ------------------------ מקטע 31: מסך מסלולים CRUD מעוצב ------------------------ */}
          {activeTab === "routes" && (
              <section className="space-y-6">
                <SearchPanel
                    title="Find a Tour Route"
                    subtitle="Search by route name, description, or area."
                    value={routeSearch}
                    onChange={setRouteSearch}
                    resultCount={filteredRoutes.length}
                    placeholder="Start typing a route name..."
                />

                {/* ------------------------ מקטע 31.1: סינון מסלולים לפי Level ומחיר ------------------------ */}
                <div className="p-5 bg-white/75 border border-emerald-900/15 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="label block">Filter by Level</label>
                      <select
                          value={routeLevelFilter}
                          onChange={(event) => setRouteLevelFilter(event.target.value)}
                          className="w-full px-4 py-3 border border-orange-300 bg-orange-50 outline-none focus:border-orange-500"
                      >
                        <option value="">All levels</option>
                        {[1, 2, 3, 4, 5].map((level) => (
                            <option key={level} value={level}>
                              Level {level}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="label block">Maximum Tour Price</label>
                      <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-700">
                      ₪
                    </span>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={routeMaxPrice}
                            onChange={(event) => setRouteMaxPrice(event.target.value)}
                            placeholder="For example: 200"
                            className="w-full pl-9 pr-4 py-3 border border-orange-300 bg-orange-50 outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                          setRouteLevelFilter("");
                          setRouteMaxPrice("");
                        }}
                        disabled={!routeLevelFilter && !routeMaxPrice}
                        className="px-5 py-3 border border-emerald-900/20 bg-white hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40"
                    >
                      Clear Filters
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-emerald-900/60">
                    Price filtering uses the lowest available tour-instance price for each route.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pageItems(filteredRoutes, routePage).map((route) => (
                      <article
                          key={route.routeid}
                          className="group relative min-h-72 bg-white/80 border border-emerald-900/15 hover:border-orange-300 hover:-translate-y-1 hover:shadow-xl transition-all overflow-hidden"
                      >
                        <div className="h-2 bg-gradient-to-r from-orange-400 via-orange-300 to-emerald-500" />

                        <button
                            type="button"
                            onClick={() => openRouteProfile(route)}
                            className="w-full h-full p-7 text-left"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                              <RouteIcon size={24} />
                            </div>

                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-widest">
                        Level {route.r_level ?? "-"}
                      </span>
                          </div>

                          <h3 className="text-3xl font-serif italic mt-6 mb-3 text-emerald-950 group-hover:text-orange-800">
                            {route.r_name}
                          </h3>

                          <p className="text-sm text-emerald-900/65 line-clamp-3 min-h-16">
                            {route.description || "No description"}
                          </p>

                          <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
                            <div className="flex items-center gap-2">
                              <RouteIcon size={15} className="text-orange-600" />
                              <span>{route.estimatedlength ?? "-"} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays size={15} className="text-orange-600" />
                              <span>{route.estimatedduration ?? "-"} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={15} className="text-orange-600" />
                              <span>{route.area || "Area not specified"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BadgeDollarSign size={15} className="text-orange-600" />
                              <span>
                          {route.min_price === null
                              ? "No priced instance"
                              : `From ₪${route.min_price}`}
                        </span>
                            </div>
                          </div>
                        </button>

                        <div className="grid grid-cols-2 border-t border-emerald-900/10">
                          <button
                              type="button"
                              onClick={() => openEditRoute(route)}
                              className="flex items-center justify-center gap-2 p-3 text-sm hover:bg-orange-50 hover:text-orange-800"
                          >
                            <Edit2 size={15} />
                            Edit
                          </button>

                          <button
                              type="button"
                              onClick={() => deleteRoute(route)}
                              className="flex items-center justify-center gap-2 p-3 text-sm border-l border-emerald-900/10 text-red-700 hover:bg-red-700 hover:text-white"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </article>
                  ))}
                </div>

                {filteredRoutes.length === 0 && (
                    <EmptySearch text="No routes match this search." />
                )}

                <Pagination
                    page={routePage}
                    totalItems={filteredRoutes.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setRoutePage}
                />
              </section>
          )}

          {/* ------------------------ מקטע 32: מסך מופעי סיור בעיצוב לוח שנה ------------------------ */}
          {activeTab === "tours" && (
              <section className="space-y-7">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 p-6 bg-white/70 border border-emerald-900/15 shadow-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-900/50 mb-2">
                      Annual Tour Calendar
                    </p>
                    <h3 className="text-3xl font-serif italic text-emerald-950">
                      Tour Instances by Month
                    </h3>
                    <p className="mt-2 text-sm text-emerald-900/65">
                      Choose a year and open any tour card to view its full details and registered customers.
                    </p>
                  </div>

                  <div className="min-w-52">
                    <label className="label block">Choose Year</label>
                    <select
                        value={selectedTourYear}
                        onChange={(event) => setSelectedTourYear(Number(event.target.value))}
                        className="w-full px-4 py-3 border border-orange-300 bg-orange-50 text-emerald-950 font-medium outline-none focus:border-orange-500"
                    >
                      {availableTourYears.length > 0 ? (
                          availableTourYears.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                          ))
                      ) : (
                          <option value={currentYear}>{currentYear}</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {monthNames.map((monthName, monthIndex) => {
                    const monthTours = toursByMonth[monthIndex];

                    return (
                        <article
                            key={monthName}
                            className="min-h-80 bg-white/70 border border-emerald-900/15 shadow-sm overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-5 py-4 bg-orange-100 border-b border-orange-300">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.24em] text-orange-800/70">
                                {selectedTourYear}
                              </p>
                              <h4 className="text-2xl font-serif italic text-orange-900">
                                {monthName}
                              </h4>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-mono text-sm shadow-sm">
                              {monthTours.length}
                            </div>
                          </div>

                          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                            {monthTours.length > 0 ? (
                                monthTours.map((tour) => (
                                    <div
                                        key={tour.tourid}
                                        className="group p-4 bg-emerald-50/70 border border-emerald-900/10 hover:border-orange-400 hover:shadow-md transition-all"
                                    >
                                      <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedTour(tour);
                                            fetchTourCustomers(tour.tourid);
                                          }}
                                          className="w-full text-left"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <h5 className="font-semibold text-lg text-emerald-950 group-hover:text-orange-800">
                                              {tour.route_name}
                                            </h5>
                                            <p className="text-sm text-emerald-900/65 mt-1">
                                              {tour.guide_name}
                                            </p>
                                          </div>

                                          <span
                                              className={`px-2 py-1 text-[10px] uppercase tracking-wider border ${
                                                  tour.status_name?.toLowerCase() === "cancelled"
                                                      ? "border-red-300 bg-red-50 text-red-700"
                                                      : "border-emerald-300 bg-white text-emerald-800"
                                              }`}
                                          >
                                  {tour.status_name}
                                </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                                          <div className="flex items-center gap-2">
                                            <CalendarDays size={15} className="text-orange-600" />
                                            <span className="font-mono">{tour.startdate}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <MapPin size={15} className="text-orange-600" />
                                            <span className="truncate">{tour.meetingpoint}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <BadgeDollarSign size={15} className="text-orange-600" />
                                            <span className="font-mono">₪{tour.price ?? ""}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Users size={15} className="text-orange-600" />
                                            <span>{tour.maxparticipants ?? "-"} max</span>
                                          </div>
                                        </div>
                                      </button>

                                      {tour.status_name?.toLowerCase() !== "cancelled" && (
                                          <button
                                              type="button"
                                              onClick={() => cancelTour(tour.tourid)}
                                              className="mt-4 w-full px-3 py-2 text-xs border border-red-700/25 text-red-700 hover:bg-red-700 hover:text-white transition-colors"
                                          >
                                            Cancel Tour
                                          </button>
                                      )}
                                    </div>
                                ))
                            ) : (
                                <div className="min-h-48 flex flex-col items-center justify-center text-center text-emerald-900/45">
                                  <CalendarDays size={34} className="mb-3 text-orange-300" />
                                  <p className="font-serif italic text-lg">No tours this month</p>
                                </div>
                            )}
                          </div>
                        </article>
                    );
                  })}
                </div>
              </section>
          )}

          {/* ------------------------ מקטע 33: מסך הרשמות עם חיפוש ו-CRUD ------------------------ */}
          {activeTab === "registrations" && (
              <section className="space-y-5">
                {/* ------------------------ מקטע 33.1: מנוע חיפוש הרשמות ------------------------ */}
                <div className="p-5 bg-white/70 border border-emerald-900/15 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1">
                      <label className="label block">Search registrations</label>
                      <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800/60"
                        />
                        <input
                            type="text"
                            value={registrationSearch}
                            onChange={(event) => setRegistrationSearch(event.target.value)}
                            placeholder="Type a customer name, tour name, or registration number..."
                            className="w-full pl-11 pr-4 py-3 border border-emerald-900/20 bg-white outline-none focus:border-emerald-700"
                        />
                      </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setRegistrationSearch("")}
                        disabled={!registrationSearch}
                        className="px-5 py-3 border border-emerald-900/20 bg-white hover:bg-emerald-50 disabled:opacity-40"
                    >
                      Clear Search
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-emerald-900/65">
                    Found {filteredRegistrations.length} registrations
                  </p>
                </div>

                <TableShell>
                  <div className="grid grid-cols-8 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                    <div>Customer</div>
                    <div>Route</div>
                    <div>Date</div>
                    <div>People</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Meeting Point</div>
                    <div className="text-right">Actions</div>
                  </div>

                  {pageItems(filteredRegistrations, registrationPage).map((registration) => (
                      <div
                          key={registration.registrationid}
                          className="grid grid-cols-8 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4"
                      >
                        <div>
                          <div className="font-medium">{registration.customer_name}</div>
                          <div className="text-[11px] font-mono text-emerald-900/50">
                            #{registration.registrationid}
                          </div>
                        </div>
                        <div>{registration.route_name}</div>
                        <div className="font-mono text-sm">{registration.registrationdate}</div>
                        <div>{registration.numpeople ?? ""}</div>
                        <div className="font-mono">₪{registration.amounttopay ?? ""}</div>
                        <div>{registration.status_name}</div>
                        <div>{registration.meetingpoint}</div>
                        <div className="flex justify-end gap-2">
                          <IconButton
                              title="Edit registration"
                              onClick={() => openEditRegistration(registration)}
                              icon={<Edit2 size={15} />}
                          />
                          <IconButton
                              title="Delete registration"
                              danger
                              onClick={() => deleteRegistration(registration)}
                              icon={<Trash2 size={15} />}
                          />
                        </div>
                      </div>
                  ))}

                  {filteredRegistrations.length === 0 && (
                      <EmptySearch text="No registrations match this search." />
                  )}

                  <Pagination
                      page={registrationPage}
                      totalItems={filteredRegistrations.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setRegistrationPage}
                  />
                </TableShell>
              </section>
          )}

          {/* ------------------------ מקטע 34: מסך שאילתות, פונקציות ופרוצדורות ------------------------ */}
          {activeTab === "programs" && (
              <section className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <ProgramCard title="Program 1 — Register Customer to Tour" icon={<ClipboardList />}>
                    <SearchableCustomerSelect
                        label="Customer"
                        searchValue={program1CustomerSearch}
                        setSearchValue={setProgram1CustomerSearch}
                        selectedValue={programCustomerId}
                        setSelectedValue={setProgramCustomerId}
                        customers={customers}
                    />

                    <SearchableTourSelect
                        label="Tour"
                        searchValue={program1TourSearch}
                        setSearchValue={setProgram1TourSearch}
                        selectedValue={programTourId}
                        setSelectedValue={setProgramTourId}
                        tours={tours}
                    />
                    <div className="flex flex-wrap gap-3">
                      <ActionButton onClick={runRemainingSpots} label="Check Remaining Spots" />
                      <ActionButton onClick={runRegisterCustomer} label="Run Registration Procedure" />
                    </div>
                    {remainingSpots !== null && <ResultBox text={`Remaining spots: ${remainingSpots}`} />}
                  </ProgramCard>

                  <ProgramCard title="Program 2 — Customer Debt Management" icon={<CreditCard />}>
                    <SearchableCustomerSelect
                        label="Customer"
                        searchValue={program2CustomerSearch}
                        setSearchValue={setProgram2CustomerSearch}
                        selectedValue={programCustomerId}
                        setSelectedValue={setProgramCustomerId}
                        customers={customers}
                    />
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

                <div className="border border-emerald-900/15 bg-white/70 p-6">
                  <div className="flex flex-col gap-5 mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-orange-700/70">
                        Database Reports
                      </p>
                      <h3 className="text-3xl font-serif italic">Queries</h3>
                      <p className="mt-2 text-sm text-emerald-900/60">
                        Run and view useful database queries in a clear, friendly format.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                      <button
                          onClick={() => setSelectedReport("monthly")}
                          className={`px-4 py-3 border text-left ${
                              selectedReport === "monthly"
                                  ? "bg-emerald-900 text-white"
                                  : "bg-white hover:bg-emerald-50"
                          }`}
                      >
                        Monthly Revenue
                      </button>

                      <button
                          onClick={() => setSelectedReport("upcoming")}
                          className={`px-4 py-3 border text-left ${
                              selectedReport === "upcoming"
                                  ? "bg-emerald-900 text-white"
                                  : "bg-white hover:bg-emerald-50"
                          }`}
                      >
                        Upcoming Tours
                      </button>

                      <button
                          onClick={() => setSelectedReport("unpaid")}
                          className={`px-4 py-3 border text-left ${
                              selectedReport === "unpaid"
                                  ? "bg-orange-500 text-white"
                                  : "bg-white hover:bg-orange-50"
                          }`}
                      >
                        Customers with X Unpaid Registrations
                      </button>

                      <button
                          onClick={() => setSelectedReport("activeGuides")}
                          className={`px-4 py-3 border text-left ${
                              selectedReport === "activeGuides"
                                  ? "bg-orange-500 text-white"
                                  : "bg-white hover:bg-orange-50"
                          }`}
                      >
                        Most Active Guides
                      </button>
                    </div>
                  </div>

                  {selectedReport === "monthly" && (
                      <TableShell>
                        <div className="grid grid-cols-4 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                          <div>Year</div>
                          <div>Month</div>
                          <div>Income</div>
                          <div>Transactions</div>
                        </div>
                        {monthlyRevenue.map((row) => (
                            <div
                                key={`${row.year}-${row.month}`}
                                className="grid grid-cols-4 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4"
                            >
                              <div>{row.year}</div>
                              <div>{row.month}</div>
                              <div className="font-mono">₪{row.monthlyincome}</div>
                              <div>{row.transactioncount}</div>
                            </div>
                        ))}
                      </TableShell>
                  )}

                  {selectedReport === "upcoming" && (
                      <>
                        {upcomingTours.length > 0 ? (
                            <TableShell>
                              <div className="grid grid-cols-5 p-4 border-b border-emerald-900 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                                <div>Route</div>
                                <div>Date</div>
                                <div>Capacity</div>
                                <div>Available</div>
                                <div>Status</div>
                              </div>
                              {upcomingTours.map((tour) => (
                                  <div
                                      key={tour.tourid}
                                      className="grid grid-cols-5 p-4 border-b border-emerald-900/10 hover:bg-emerald-900/5 items-center gap-4"
                                  >
                                    <div className="font-medium">{tour.routename}</div>
                                    <div className="font-mono text-sm">{tour.starting}</div>
                                    <div>{tour.maxparticipants}</div>
                                    <div className="font-bold text-emerald-700">
                                      {tour.availableslots}
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-700">
                                      <CheckCircle2 size={16} />
                                      Upcoming
                                    </div>
                                  </div>
                              ))}
                            </TableShell>
                        ) : (
                            <div className="p-6 bg-amber-50 border border-amber-200 flex items-center gap-3">
                              <AlertTriangle size={18} />
                              No upcoming tours in the next 7 days.
                            </div>
                        )}
                      </>
                  )}

                  {selectedReport === "unpaid" && (
                      <div className="space-y-5">
                        <div className="p-5 bg-orange-50 border border-orange-200">
                          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                            <div className="flex-1">
                              <label className="label block">
                                Exact number of unpaid registrations
                              </label>
                              <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={unpaidRegistrationCount}
                                  onChange={(event) =>
                                      setUnpaidRegistrationCount(event.target.value)
                                  }
                                  placeholder="For example: 10"
                                  className="w-full px-4 py-3 border border-orange-300 bg-white outline-none focus:border-orange-500"
                              />
                            </div>

                            <button
                                type="button"
                                onClick={runUnpaidCustomersQuery}
                                disabled={unpaidCustomersLoading}
                                className="px-6 py-3 bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                              {unpaidCustomersLoading ? "Running Query..." : "Run Query"}
                            </button>
                          </div>

                          <p className="mt-3 text-sm text-orange-900/70">
                            Example: entering 10 returns customers who have exactly
                            10 unpaid registrations.
                          </p>
                        </div>

                        {unpaidCustomersLoading ? (
                            <div className="p-6 bg-white border border-orange-200">
                              Loading query results...
                            </div>
                        ) : unpaidCustomers.length > 0 ? (
                            <TableShell>
                              <div className="grid grid-cols-3 p-4 border-b border-orange-500 bg-orange-500 text-white text-[10px] uppercase tracking-widest font-bold items-center gap-4">
                                <div>Customer</div>
                                <div>Phone</div>
                                <div>Unpaid Registrations</div>
                              </div>

                              {unpaidCustomers.map((row, index) => (
                                  <div
                                      key={`${row.fullname}-${row.phone}-${index}`}
                                      className="grid grid-cols-3 p-4 border-b border-orange-900/10 hover:bg-orange-50 items-center gap-4"
                                  >
                                    <div className="font-medium">{row.fullname}</div>
                                    <div className="font-mono">{row.phone}</div>
                                    <div>
                            <span className="inline-flex min-w-10 h-10 px-3 rounded-full bg-orange-100 text-orange-800 items-center justify-center font-bold">
                              {row.unpaid_registrations}
                            </span>
                                    </div>
                                  </div>
                              ))}
                            </TableShell>
                        ) : unpaidCustomersQueryRan ? (
                            <div className="p-6 bg-orange-50 border border-orange-200">
                              No customers were found with exactly{" "}
                              {unpaidRegistrationCount || "0"} unpaid registrations.
                            </div>
                        ) : (
                            <div className="p-6 bg-white border border-emerald-900/10 text-emerald-900/60">
                              Choose a number and run the query to view matching customers.
                            </div>
                        )}
                      </div>
                  )}

                  {selectedReport === "activeGuides" && (
                      <>
                        {activeGuides.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                              {activeGuides.map((row, index) => (
                                  <article
                                      key={`${row.guide_name}-${index}`}
                                      className="p-5 bg-white border border-orange-200 shadow-sm hover:shadow-md transition-all"
                                  >
                                    <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center mb-4">
                                      <Users size={20} />
                                    </div>

                                    <h4 className="text-xl font-semibold text-emerald-950">
                                      {row.guide_name}
                                    </h4>

                                    <p className="mt-2 text-sm text-emerald-900/60">
                                      Tour instances led
                                    </p>

                                    <p className="mt-1 text-3xl font-serif italic text-orange-700">
                                      {row.tours_count}
                                    </p>
                                  </article>
                              ))}
                            </div>
                        ) : (
                            <div className="p-6 bg-orange-50 border border-orange-200">
                              No active guides were found.
                            </div>
                        )}
                      </>
                  )}
                </div>

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

        {/* ------------------------ מקטע 36.1: חלון עדכון הרשמה ------------------------ */}
        {isRegistrationFormOpen && (
            <Modal onClose={() => setIsRegistrationFormOpen(false)}>
              <form onSubmit={saveRegistration}>
                <p className="text-[10px] uppercase tracking-widest text-orange-700/70 mb-1">
                  Registration Management
                </p>
                <h3 className="text-3xl font-serif italic mb-7">
                  Update Registration #{registrationForm.registrationid}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                  <div className="mb-4">
                    <label className="label block">Customer</label>
                    <select
                        required
                        value={registrationForm.customerid}
                        onChange={(event) =>
                            setRegistrationForm({
                              ...registrationForm,
                              customerid: event.target.value
                            })
                        }
                        className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none"
                    >
                      <option value="">Select customer...</option>
                      {customers.map((customer) => (
                          <option key={customer.customerid} value={customer.customerid}>
                            {customer.fullname}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="label block">Tour Instance</label>
                    <select
                        required
                        value={registrationForm.tourid}
                        onChange={(event) =>
                            setRegistrationForm({
                              ...registrationForm,
                              tourid: event.target.value
                            })
                        }
                        className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none"
                    >
                      <option value="">Select tour...</option>
                      {tours.map((tour) => (
                          <option key={tour.tourid} value={tour.tourid}>
                            {tour.route_name} — {tour.startdate} — {tour.meetingpoint}
                          </option>
                      ))}
                    </select>
                  </div>

                  <Field
                      label="Registration Date"
                      type="date"
                      value={registrationForm.registrationdate}
                      onChange={(value) =>
                          setRegistrationForm({
                            ...registrationForm,
                            registrationdate: value
                          })
                      }
                      required
                  />

                  <Field
                      label="Number of People"
                      type="number"
                      value={registrationForm.numpeople}
                      onChange={(value) =>
                          setRegistrationForm({
                            ...registrationForm,
                            numpeople: value
                          })
                      }
                      required
                  />

                  <div className="mb-4 md:col-span-2">
                    <label className="label block">Registration Status</label>
                    <select
                        required
                        value={registrationForm.registrationstatusid}
                        onChange={(event) =>
                            setRegistrationForm({
                              ...registrationForm,
                              registrationstatusid: event.target.value
                            })
                        }
                        className="w-full p-3 border border-orange-300 bg-orange-50 outline-none focus:border-orange-500"
                    >
                      <option value="">Select status...</option>
                      {registrationStatuses.map((status) => (
                          <option
                              key={status.registrationstatusid}
                              value={status.registrationstatusid}
                          >
                            {status.statusname}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 mb-5">
                    <label className="label block">Notes</label>
                    <textarea
                        value={registrationForm.notes}
                        onChange={(event) =>
                            setRegistrationForm({
                              ...registrationForm,
                              notes: event.target.value
                            })
                        }
                        rows={4}
                        className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none resize-y"
                    />
                  </div>
                </div>

                <div className="p-4 mb-5 bg-orange-50 border border-orange-200 text-sm text-orange-900">
                  Changing the status updates PostgreSQL and automatically activates
                  the registration audit trigger. The amount is recalculated by the
                  database trigger when the tour or number of people changes.
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Save size={16} />
                  Save Registration
                </button>
              </form>
            </Modal>
        )}

        {/* ------------------------ מקטע 36.2: חלון הוספה/עדכון מדריך ------------------------ */}
        {isGuideFormOpen && (
            <Modal onClose={() => setIsGuideFormOpen(false)}>
              <form onSubmit={saveGuide}>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mb-1">
                  Guide Management
                </p>
                <h3 className="text-3xl font-serif italic mb-7">
                  {editingGuideId ? "Update Guide" : "Add New Guide"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                  {!editingGuideId && (
                      <Field
                          label="Guide ID"
                          type="number"
                          value={guideForm.guideid}
                          onChange={(value) => setGuideForm({ ...guideForm, guideid: value })}
                          required
                      />
                  )}

                  <Field
                      label="First Name"
                      value={guideForm.firstname}
                      onChange={(value) => setGuideForm({ ...guideForm, firstname: value })}
                      required
                  />

                  <Field
                      label="Last Name"
                      value={guideForm.lastname}
                      onChange={(value) => setGuideForm({ ...guideForm, lastname: value })}
                      required
                  />

                  <Field
                      label="Phone"
                      value={guideForm.phone}
                      onChange={(value) => setGuideForm({ ...guideForm, phone: value })}
                      required
                  />

                  <Field
                      label="Email"
                      type="email"
                      value={guideForm.email}
                      onChange={(value) => setGuideForm({ ...guideForm, email: value })}
                      required
                  />

                  <Field
                      label="Birth Date"
                      type="date"
                      value={guideForm.birthdate}
                      onChange={(value) => setGuideForm({ ...guideForm, birthdate: value })}
                  />

                  <Field
                      label="Join Date"
                      type="date"
                      value={guideForm.joindate}
                      onChange={(value) => setGuideForm({ ...guideForm, joindate: value })}
                  />

                  <Field
                      label="Daily Rate"
                      type="number"
                      value={guideForm.dailyrate}
                      onChange={(value) => setGuideForm({ ...guideForm, dailyrate: value })}
                  />

                  <Field
                      label="Experience Years"
                      type="number"
                      value={guideForm.experienceyears}
                      onChange={(value) =>
                          setGuideForm({ ...guideForm, experienceyears: value })
                      }
                  />

                  <Field
                      label="Rating"
                      type="number"
                      value={guideForm.rating}
                      onChange={(value) => setGuideForm({ ...guideForm, rating: value })}
                  />

                  <Field
                      label="School"
                      value={guideForm.school}
                      onChange={(value) => setGuideForm({ ...guideForm, school: value })}
                  />

                  <div className="md:col-span-2">
                    <Field
                        label="Address"
                        value={guideForm.address}
                        onChange={(value) => setGuideForm({ ...guideForm, address: value })}
                    />
                  </div>

                  <div className="md:col-span-2 mb-5">
                    <label className="label block">Notes</label>
                    <textarea
                        value={guideForm.notes}
                        onChange={(event) =>
                            setGuideForm({ ...guideForm, notes: event.target.value })
                        }
                        rows={4}
                        className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none resize-y"
                    />
                  </div>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-900 text-white hover:bg-emerald-800"
                >
                  <Save size={16} />
                  Save Guide
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

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-emerald-900/10">
                <button
                    type="button"
                    onClick={() => openEditGuide(selectedGuide)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-emerald-900 text-white hover:bg-emerald-800"
                >
                  <Edit2 size={16} />
                  Edit Guide
                </button>

                <button
                    type="button"
                    onClick={() => deleteGuide(selectedGuide)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 border border-red-700/30 text-red-700 hover:bg-red-700 hover:text-white"
                >
                  <Trash2 size={16} />
                  Delete Guide
                </button>
              </div>
            </Modal>
        )}

        {/* ------------------------ מקטע 37.1: חלון הוספה/עדכון מסלול ------------------------ */}
        {isRouteFormOpen && (
            <Modal onClose={() => setIsRouteFormOpen(false)}>
              <form onSubmit={saveRoute}>
                <p className="text-[10px] uppercase tracking-widest text-orange-700/70 mb-1">
                  Route Management
                </p>
                <h3 className="text-3xl font-serif italic mb-7">
                  {editingRouteId ? "Update Tour Route" : "Add New Tour Route"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                  {!editingRouteId && (
                      <Field
                          label="Route ID"
                          type="number"
                          value={routeForm.routeid}
                          onChange={(value) =>
                              setRouteForm({ ...routeForm, routeid: value })
                          }
                          required
                      />
                  )}

                  <Field
                      label="Route Name"
                      value={routeForm.r_name}
                      onChange={(value) =>
                          setRouteForm({ ...routeForm, r_name: value })
                      }
                      required
                  />

                  <Field
                      label="Estimated Length"
                      type="number"
                      value={routeForm.estimatedlength}
                      onChange={(value) =>
                          setRouteForm({ ...routeForm, estimatedlength: value })
                      }
                  />

                  <Field
                      label="Estimated Duration (minutes)"
                      type="number"
                      value={routeForm.estimatedduration}
                      onChange={(value) =>
                          setRouteForm({ ...routeForm, estimatedduration: value })
                      }
                  />

                  <Field
                      label="Level"
                      type="number"
                      value={routeForm.r_level}
                      onChange={(value) =>
                          setRouteForm({ ...routeForm, r_level: value })
                      }
                  />

                  <div className="md:col-span-2">
                    <Field
                        label="Area"
                        value={routeForm.area}
                        onChange={(value) =>
                            setRouteForm({ ...routeForm, area: value })
                        }
                    />
                  </div>

                  <div className="md:col-span-2 mb-5">
                    <label className="label block">Description</label>
                    <textarea
                        value={routeForm.description}
                        onChange={(event) =>
                            setRouteForm({
                              ...routeForm,
                              description: event.target.value
                            })
                        }
                        rows={5}
                        className="w-full p-3 border border-emerald-900/20 bg-white/70 outline-none resize-y focus:border-orange-400"
                    />
                  </div>
                </div>

                <div className="p-4 mb-5 bg-orange-50 border border-orange-200 text-sm text-orange-900">
                  Updating a route automatically changes the route name and details
                  shown in every related tour instance, because the tour instances
                  are linked to this route by a foreign key.
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 p-3 bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Save size={16} />
                  Save Route
                </button>
              </form>
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

              {/* ------------------------ מקטע 38.1: תחנות המסלול ------------------------ */}
              <div className="mt-8 pt-6 border-t border-emerald-900/10">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-orange-700/70">
                      Route Stations
                    </p>
                    <h4 className="text-2xl font-serif italic text-emerald-950">
                      Stations on this route
                    </h4>
                  </div>

                  <span className="min-w-10 h-10 px-3 rounded-full bg-orange-500 text-white flex items-center justify-center font-mono text-sm">
                {routeStations.length}
              </span>
                </div>

                {stationsLoading ? (
                    <div className="p-5 bg-orange-50 border border-orange-200 text-orange-900">
                      Loading stations...
                    </div>
                ) : routeStations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {routeStations.map((station, index) => (
                          <button
                              key={`${station.s_name}-${index}`}
                              type="button"
                              onClick={() => setSelectedStation(station)}
                              className="group p-4 text-left bg-white border border-emerald-900/15 hover:border-orange-400 hover:bg-orange-50 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 shrink-0 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-mono text-sm">
                                {station.station_order ?? index + 1}
                              </div>

                              <div className="min-w-0">
                                <h5 className="font-semibold text-emerald-950 group-hover:text-orange-800">
                                  {station.s_name}
                                </h5>
                                <p className="mt-1 text-sm text-emerald-900/55 truncate">
                                  {station.s_address || "Address not specified"}
                                </p>
                              </div>
                            </div>
                          </button>
                      ))}
                    </div>
                ) : (
                    <div className="p-5 bg-white/60 border border-emerald-900/10 text-emerald-900/55">
                      No stations are currently connected to this route.
                    </div>
                )}

                <p className="mt-3 text-xs text-emerald-900/50">
                  Select a station name to view its full information. Internal station IDs are not displayed.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-emerald-900/10">
                <button
                    type="button"
                    onClick={() => openEditRoute(selectedRoute)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Edit2 size={16} />
                  Edit Route
                </button>

                <button
                    type="button"
                    onClick={() => deleteRoute(selectedRoute)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 border border-red-700/30 text-red-700 hover:bg-red-700 hover:text-white"
                >
                  <Trash2 size={16} />
                  Delete Route
                </button>
              </div>
            </Modal>
        )}

        {/* ------------------------ מקטע 38.2: חלון פרטי תחנה ------------------------ */}
        {selectedStation && (
            <Modal onClose={() => setSelectedStation(null)}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-orange-700/70 mb-1">
                Station Profile
              </p>
              <h3 className="text-4xl font-serif italic text-emerald-950 mb-8">
                {selectedStation.s_name}
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200">
                  <MapPin size={20} className="mt-0.5 text-orange-600 shrink-0" />
                  <div>
                    <p className="label">Address</p>
                    <p className="text-lg">
                      {selectedStation.s_address || "Address not specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="label">Description</p>
                  <p className="leading-relaxed text-emerald-950">
                    {selectedStation.description || "No description available"}
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-900/10 text-sm text-emerald-900/65">
                The station is displayed by name, without exposing its internal database identifier.
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

              <div className="mt-10">
                <h4 className="text-2xl font-serif italic mb-4">
                  Registered Customers
                </h4>

                {tourCustomers.length > 0 ? (
                    <div className="border border-emerald-900/20 overflow-x-auto">
                      <div className="grid grid-cols-6 p-3 bg-emerald-900 text-white text-[10px] uppercase tracking-widest font-bold gap-3">
                        <div>Name</div>
                        <div>Phone</div>
                        <div>Email</div>
                        <div>People</div>
                        <div>Amount</div>
                        <div>Status</div>
                      </div>

                      {tourCustomers.map((customer) => (
                          <div
                              key={customer.registrationid}
                              className="grid grid-cols-6 p-3 border-b border-emerald-900/10 gap-3 items-center"
                          >
                            <div className="font-medium">{customer.fullname}</div>
                            <div className="font-mono text-sm">{customer.phone}</div>
                            <div className="font-mono text-sm break-all">{customer.email}</div>
                            <div>{customer.numpeople ?? ""}</div>
                            <div className="font-mono">₪{customer.amounttopay ?? ""}</div>
                            <div>{customer.status_name}</div>
                          </div>
                      ))}
                    </div>
                ) : (
                    <div className="p-4 bg-white border border-emerald-900/10 text-sm opacity-70">
                      No customers are registered for this tour.
                    </div>
                )}
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

function DashboardNavigationCard({
                                   title,
                                   text,
                                   icon,
                                   accent,
                                   onClick
                                 }: {
  title: string;
  text: string;
  icon: React.ReactNode;
  accent: string;
  onClick: () => void;
}) {
  return (
      <button
          type="button"
          onClick={onClick}
          className="group min-h-64 p-6 bg-white/75 border border-emerald-900/12 text-left shadow-sm hover:-translate-y-1 hover:shadow-xl hover:border-orange-300 transition-all"
      >
        <div
            className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-7 group-hover:scale-110 transition-transform ${accent}`}
        >
          {icon}
        </div>

        <h3 className="text-2xl font-serif italic text-emerald-950 group-hover:text-orange-800">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-emerald-900/60">
          {text}
        </p>

        <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-800">
          Open Page
          <span className="text-orange-500 group-hover:translate-x-1 transition-transform">
          →
        </span>
        </div>
      </button>
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


// ------------------------ מקטע 41.0: רכיבי חיפוש משותפים ------------------------
function SearchPanel({
                       title,
                       subtitle,
                       value,
                       onChange,
                       resultCount,
                       placeholder
                     }: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  placeholder: string;
}) {
  return (
      <div className="p-5 bg-white/75 border border-emerald-900/15 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1">
            <p className="text-xl font-serif italic mb-1">{title}</p>
            <p className="text-sm text-emerald-900/55 mb-3">{subtitle}</p>

            <div className="relative">
              <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800/55"
              />
              <input
                  type="text"
                  value={value}
                  onChange={(event) => onChange(event.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-11 pr-4 py-3 border border-emerald-900/20 bg-white outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
              />
            </div>
          </div>

          <button
              type="button"
              disabled={!value}
              onClick={() => onChange("")}
              className="px-5 py-3 border border-emerald-900/20 bg-white hover:bg-orange-50 hover:border-orange-300 disabled:opacity-40"
          >
            Clear Search
          </button>
        </div>

        <p className="mt-3 text-sm text-emerald-900/65">
          Found {resultCount} records
        </p>
      </div>
  );
}

function EmptySearch({ text }: { text: string }) {
  return (
      <div className="p-10 text-center bg-white/40 text-emerald-900/55">
        <Search size={30} className="mx-auto mb-3 text-orange-300" />
        <p className="font-serif italic text-lg">{text}</p>
      </div>
  );
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


function SearchableCustomerSelect({
                                    label,
                                    searchValue,
                                    setSearchValue,
                                    selectedValue,
                                    setSelectedValue,
                                    customers
                                  }: {
  label: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  customers: Customer[];
}) {
  const filteredCustomers = customers.filter((customer) =>
      customer.fullname.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
      <div>
        <label className="label block">{label}</label>

        <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Start typing a customer name..."
            className="w-full p-3 mb-2 border border-emerald-900/20 bg-white outline-none"
        />

        <select
            value={selectedValue}
            onChange={(event) => {
              setSelectedValue(event.target.value);
              const selectedCustomer = customers.find(
                  (customer) => String(customer.customerid) === event.target.value
              );
              if (selectedCustomer) {
                setSearchValue(selectedCustomer.fullname);
              }
            }}
            className="w-full p-3 border border-emerald-900/20 bg-white"
        >
          <option value="">Select customer...</option>
          {filteredCustomers.map((customer) => (
              <option key={customer.customerid} value={customer.customerid}>
                {customer.fullname}
              </option>
          ))}
        </select>
      </div>
  );
}

function SearchableTourSelect({
                                label,
                                searchValue,
                                setSearchValue,
                                selectedValue,
                                setSelectedValue,
                                tours
                              }: {
  label: string;
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  tours: Tour[];
}) {
  const filteredTours = tours.filter((tour) => {
    const searchableText =
        `${tour.route_name} ${tour.startdate} ${tour.meetingpoint}`.toLowerCase();

    return searchableText.includes(searchValue.toLowerCase());
  });

  return (
      <div>
        <label className="label block">{label}</label>

        <input
            type="text"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Start typing a tour name, date or meeting point..."
            className="w-full p-3 mb-2 border border-emerald-900/20 bg-white outline-none"
        />

        <select
            value={selectedValue}
            onChange={(event) => {
              setSelectedValue(event.target.value);
              const selectedTour = tours.find(
                  (tour) => String(tour.tourid) === event.target.value
              );
              if (selectedTour) {
                setSearchValue(
                    `${selectedTour.route_name} — ${selectedTour.startdate} — ${selectedTour.meetingpoint}`
                );
              }
            }}
            className="w-full p-3 border border-emerald-900/20 bg-white"
        >
          <option value="">Select tour...</option>
          {filteredTours.map((tour) => (
              <option key={tour.tourid} value={tour.tourid}>
                {tour.route_name} — {tour.startdate} — {tour.meetingpoint}
              </option>
          ))}
        </select>
      </div>
  );
}
