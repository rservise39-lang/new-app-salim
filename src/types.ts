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
  pricingType?: 'daily' | 'sqm' | 'fixed';
  dailyRate?: number;
  pricePerSqm?: number;

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
  // حقول اختيارية للتوافق مع البيانات القديمة (لها تاريخ لكن بلا علم «مسدّدة» ولا سجل صرف سابق).
  // weekKey: مفتاح الأسبوع المشتق من التاريخ إن أمكن (مثال '2026-W42').
  // settled: هل تمت تسوية هذه السلفة/الخصم ضمن صرف أسبوعي.
  // settledAt: تاريخ التسوية إن وُجد.
  weekKey?: string;
  settled?: boolean;
  settledAt?: string;
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

// سجل صرف أسبوعي ثابت بعد التأكيد. لا يُعدّل بعد الإنشاء.
export interface WeeklyPayoutItem {
  workerId: string;
  workerName: string;
  dailyRate: number;
  daysWorked: number;
  grossWage: number;
  advances: number; // مجموع السلف المسددة في هذا الصرف
  deductions: number; // مجموع الخصومات المسددة في هذا الصرف
  netPayout: number;
}

export interface WeeklyPayoutRecord {
  id: string; // 'wp_' + weekKey
  weekKey: string; // مثال '2026-W42'
  weekLabel: string; // مثال 'من 19/10 إلى 25/10'
  paidAt: string; // ISO timestamp
  items: WeeklyPayoutItem[];
  totalGross: number;
  totalAdvances: number;
  totalDeductions: number;
  totalNet: number;
  note?: string;
}

// حضور أسبوعي مفصول بحسب المشروع والأسبوع والعامل (شاشة الحضور بالمشروع).
// البنية: projectId -> weekKey (تاريخ السبت YYYY-MM-DD) -> workerId -> [السبت..الخميس]
// القيم: 1 (يوم كامل) | 0.5 (نصف يوم) | 0 (غياب).
export type ProjectAttendance = Record<
  string,
  Record<string, Record<string, number[]>>
>;

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
