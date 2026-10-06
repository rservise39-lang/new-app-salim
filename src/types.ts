export type ProjectStatus = 'قيد التنفيذ' | 'مكتمل' | 'معلق' | 'جديد';

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: 'لتر' | 'كغ' | 'مجموعة' | 'سطل' | 'قطعة' | 'رول';
  unitPrice: number; // بالدينار الجزائري (دج)
  category?: 'دهانات' | 'معجون وتحضير' | 'أدوات وفراشي' | 'أخرى';
}

export interface ProjectWorkerRecord {
  workerId: string;
  workerName: string;
  dailyRate: number; // دج
  daysSpent: number;
}

export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  location: string;
  areaSqm: number;
  startDate: string;
  estimatedDays: number;
  status: ProjectStatus;
  progress: number; // 0 - 100%
  clientBudget: number; // الميزانية المتفق عليها (دج)
  paidAmount: number; // المدفوع من الزبون (دج)
  workTypes: string[]; // ['دهان الجدران', 'دهان السقف', 'دهان الأبواب والنوافذ']
  materials: MaterialItem[];
  workers: ProjectWorkerRecord[];
  toolsAndTransportCost: number; // الأدوات والنقل (دج)
  otherExpensesCost: number; // مصاريف أخرى (دج)
  notes?: string;
  propertyType?: string; // 'شقة سكنية' | 'فيلا خاصة' | 'محل تجاري' | 'مكتب'
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  dailyWage: number; // الأجر اليومي (دج)
  status: 'نشط' | 'متوقف';
  role: string; // 'صباغ محترف' | 'مساعد صباغ' | 'فني ديكور ومعجون'
  daysAssignedThisWeek: number;
  avatarSeed?: string;
}

export interface AdvanceOrDeduction {
  id: string;
  workerId: string;
  workerName: string;
  type: 'سلفة' | 'خصم';
  amount: number; // دج
  date: string;
  reason: string;
}

export interface WeeklyPayrollItem {
  workerId: string;
  workerName: string;
  dailyRate: number;
  daysWorked: number;
  advances: number;
  deductions: number;
  isPaid: boolean;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalProjects: number;
  status: 'نشط' | 'مكتمل' | 'معلق';
  notes?: string;
}

export interface ClientOrderRequest {
  id: string;
  title: string;
  clientName: string;
  location: string;
  areaSqm: number;
  budgetOffer: number;
  timeAgo: string;
  paintType: string;
  materialsProvided: 'متوفرة من الزبون' | 'على عاتق الصباغ';
  preferredDate: string;
  notes: string;
  status: 'قيد الانتظار' | 'مقبولة' | 'مرفوضة';
}

export interface RoomMeasurement {
  id: string;
  name: string;
  type: 'غرفة' | 'صالون' | 'بلكون' | 'مطبخ' | 'حمام' | 'واجهة';
  lengthM: number;
  widthM: number;
  heightM: number;
  doorsDeductionM2: number;
  windowsDeductionM2: number;
  includeCeiling: boolean;
}
