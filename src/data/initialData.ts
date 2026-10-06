import { Project, Worker, AdvanceOrDeduction, Client, ClientOrderRequest, RoomMeasurement } from '../types';

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'w1',
    name: 'أحمد سعيد',
    phone: '+213 661 22 33 44',
    dailyWage: 2500,
    status: 'نشط',
    role: 'صباغ محترف أول',
    daysAssignedThisWeek: 6,
    avatarSeed: 'ahmed'
  },
  {
    id: 'w2',
    name: 'محمد علي',
    phone: '+213 662 55 66 77',
    dailyWage: 2500,
    status: 'نشط',
    role: 'صباغ ديكور',
    daysAssignedThisWeek: 6,
    avatarSeed: 'ali'
  },
  {
    id: 'w3',
    name: 'يوسف قاسي',
    phone: '+213 671 88 99 00',
    dailyWage: 2400,
    status: 'نشط',
    role: 'فني معجون وصنفرة',
    daysAssignedThisWeek: 5,
    avatarSeed: 'youssef'
  },
  {
    id: 'w4',
    name: 'علي بن عيسى',
    phone: '+213 699 11 22 33',
    dailyWage: 2200,
    status: 'نشط',
    role: 'مساعد صباغ',
    daysAssignedThisWeek: 4,
    avatarSeed: 'benaissa'
  },
  {
    id: 'w5',
    name: 'بلال عمر',
    phone: '+213 658 33 44 55',
    dailyWage: 2000,
    status: 'نشط',
    role: 'مساعد تحضير وتنظيف',
    daysAssignedThisWeek: 3,
    avatarSeed: 'bilal'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'منزل عائلة بن حمودة',
    clientName: 'بن حمودة عبد القادر',
    clientPhone: '+213 661 23 45 67',
    location: 'الجزائر - وسط المدينة',
    areaSqm: 120,
    startDate: '2025-08-12',
    estimatedDays: 10,
    status: 'قيد التنفيذ',
    progress: 60,
    clientBudget: 120000,
    paidAmount: 60000,
    propertyType: 'شقة سكنية',
    workTypes: ['دهان الجدران', 'دهان السقف', 'دهان الأبواب والنوافذ'],
    materials: [
      { id: 'm1', name: 'دهان جدران أبيض فينيل مائي', quantity: 25, unit: 'لتر', unitPrice: 500, category: 'دهانات' },
      { id: 'm2', name: 'دهان أسقف مضاد للرطوبة', quantity: 15, unit: 'لتر', unitPrice: 566.67, category: 'دهانات' },
      { id: 'm3', name: 'أدوات تنظيف وتحضير وتغطية', quantity: 1, unit: 'مجموعة', unitPrice: 4800, category: 'أدوات وفراشي' },
      { id: 'm4', name: 'فرش وملحقات ورولات صباغة', quantity: 1, unit: 'مجموعة', unitPrice: 3000, category: 'أدوات وفراشي' }
    ],
    workers: [
      { workerId: 'w1', workerName: 'أحمد سعيد', dailyRate: 2500, daysSpent: 6 },
      { workerId: 'w2', workerName: 'محمد علي', dailyRate: 2500, daysSpent: 6 },
      { workerId: 'w3', workerName: 'يوسف قاسي', dailyRate: 2400, daysSpent: 5 },
      { workerId: 'w4', workerName: 'علي بن عيسى', dailyRate: 2200, daysSpent: 4 }
    ],
    toolsAndTransportCost: 7500,
    otherExpensesCost: 5000,
    notes: 'العميل ملتزم بالمواعيد ويدفع في الوقت المحدد. يطلب طبقة إضافية في المدخل.'
  },
  {
    id: 'p2',
    title: 'مكتب الشركة الاستشارية',
    clientName: 'مؤسسة النور للأعمال',
    clientPhone: '+213 552 11 22 33',
    location: 'الجزائر - سيدي بلعباس',
    areaSqm: 85,
    startDate: '2025-08-05',
    estimatedDays: 7,
    status: 'قيد التنفيذ',
    progress: 40,
    clientBudget: 85000,
    paidAmount: 40000,
    propertyType: 'مكتب',
    workTypes: ['دهان الجدران', 'دهان أبواب خشبية'],
    materials: [
      { id: 'm5', name: 'دهان ساتيني رمادي ناعم', quantity: 20, unit: 'لتر', unitPrice: 700, category: 'دهانات' },
      { id: 'm6', name: 'ورنيش وحماية أبواب', quantity: 5, unit: 'لتر', unitPrice: 1200, category: 'دهانات' },
      { id: 'm7', name: 'معجون تسوية الحوائط', quantity: 15, unit: 'كغ', unitPrice: 150, category: 'معجون وتحضير' }
    ],
    workers: [
      { workerId: 'w1', workerName: 'أحمد سعيد', dailyRate: 2500, daysSpent: 4 },
      { workerId: 'w4', workerName: 'علي بن عيسى', dailyRate: 2200, daysSpent: 4 }
    ],
    toolsAndTransportCost: 4000,
    otherExpensesCost: 2500,
    notes: 'العمل يتم في عطلة نهاية الأسبوع بعد أوقات دوام المكتب.'
  },
  {
    id: 'p3',
    title: 'فيلا خاصة دالي إبراهيم',
    clientName: 'عائلة شرفي',
    clientPhone: '+213 778 99 88 77',
    location: 'الجزائر - دالي إبراهيم',
    areaSqm: 240,
    startDate: '2025-07-15',
    estimatedDays: 14,
    status: 'مكتمل',
    progress: 100,
    clientBudget: 220000,
    paidAmount: 220000,
    propertyType: 'فيلا خاصة',
    workTypes: ['دهان الجدران', 'دهان السقف', 'ديكورات جبسية وبريق'],
    materials: [
      { id: 'm8', name: 'طلاء فاخر نصف لمعان', quantity: 50, unit: 'لتر', unitPrice: 650, category: 'دهانات' },
      { id: 'm9', name: 'معجون أكرليك جاهز', quantity: 40, unit: 'كغ', unitPrice: 160, category: 'معجون وتحضير' },
      { id: 'm10', name: 'برايمر أساس مائي', quantity: 20, unit: 'لتر', unitPrice: 350, category: 'دهانات' },
      { id: 'm11', name: 'أدوات وفراشي خاصة بالديكور', quantity: 1, unit: 'مجموعة', unitPrice: 8500, category: 'أدوات وفراشي' }
    ],
    workers: [
      { workerId: 'w1', workerName: 'أحمد سعيد', dailyRate: 2500, daysSpent: 10 },
      { workerId: 'w2', workerName: 'محمد علي', dailyRate: 2500, daysSpent: 10 },
      { workerId: 'w3', workerName: 'يوسف قاسي', dailyRate: 2400, daysSpent: 8 },
      { workerId: 'w5', workerName: 'بلال عمر', dailyRate: 2000, daysSpent: 6 }
    ],
    toolsAndTransportCost: 12000,
    otherExpensesCost: 6500,
    notes: 'تم استلام كامل المبلغ ورضا تام من صاحب الفيلا.'
  },
  {
    id: 'p4',
    title: 'محل تجاري للألبسة',
    clientName: 'أحمد بوسعيد',
    clientPhone: '+213 664 44 33 22',
    location: 'الجزائر - بئر مراد رايس',
    areaSqm: 45,
    startDate: '2025-08-01',
    estimatedDays: 4,
    status: 'معلق',
    progress: 20,
    clientBudget: 45000,
    paidAmount: 15000,
    propertyType: 'محل تجاري',
    workTypes: ['دهان الجدران', 'واجهة خارجية'],
    materials: [
      { id: 'm12', name: 'دهان واجهات خارجي مضاد للعوامل الجوية', quantity: 15, unit: 'لتر', unitPrice: 800, category: 'دهانات' },
      { id: 'm13', name: 'شريط لاصق وحماية زجاج', quantity: 1, unit: 'مجموعة', unitPrice: 1800, category: 'أدوات وفراشي' }
    ],
    workers: [
      { workerId: 'w3', workerName: 'يوسف قاسي', dailyRate: 2400, daysSpent: 2 }
    ],
    toolsAndTransportCost: 2000,
    otherExpensesCost: 1000,
    notes: 'العمل متوقف مؤقتاً لانتظار تركيب الديكورات الخشبية والإنارة.'
  }
];

export const INITIAL_ADVANCES: AdvanceOrDeduction[] = [
  {
    id: 'a1',
    workerId: 'w2',
    workerName: 'محمد علي',
    type: 'سلفة',
    amount: 1000,
    date: '2025-08-12',
    reason: 'احتياجات شخصية عاجلة'
  },
  {
    id: 'a2',
    workerId: 'w3',
    workerName: 'يوسف قاسي',
    type: 'خصم',
    amount: 500,
    date: '2025-08-14',
    reason: 'تأخر نصف يوم وغياب دون إشعار'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'بن حمودة عبد القادر',
    phone: '+213 661 23 45 67',
    address: 'الجزائر - وسط المدينة',
    totalProjects: 1,
    status: 'نشط',
    notes: 'عميل دائم، دقيق في المواعيد ويدفع فوراً'
  },
  {
    id: 'c2',
    name: 'مؤسسة النور للأعمال',
    phone: '+213 552 11 22 33',
    address: 'الجزائر - سيدي بلعباس',
    totalProjects: 1,
    status: 'نشط',
    notes: 'مكتب هندسي استشاري'
  },
  {
    id: 'c3',
    name: 'فاطمة الزهراء',
    phone: '+213 555 98 76 54',
    address: 'البليدة - أولاد يعيش',
    totalProjects: 1,
    status: 'مكتمل',
    notes: 'شقة سكنية 4 غرف تم إنجازها بنجاح'
  },
  {
    id: 'c4',
    name: 'محمد كمال',
    phone: '+213 555 33 22 11',
    address: 'وهران - حي العقيد',
    totalProjects: 2,
    status: 'نشط',
    notes: 'مطور عقاري يرغب بشراكة مستمرة'
  },
  {
    id: 'c5',
    name: 'أحمد بوسعيد',
    phone: '+213 664 44 33 22',
    address: 'الجزائر - بئر مراد رايس',
    totalProjects: 1,
    status: 'معلق',
    notes: 'محل ألبسة قيد التجهيز'
  }
];

export const INITIAL_REQUESTS: ClientOrderRequest[] = [
  {
    id: 'req1',
    title: 'ورشة النور - شقة عائلية',
    clientName: 'عائلة ناصر',
    location: 'الجزائر العاصمة - القبة',
    areaSqm: 120,
    budgetOffer: 80000,
    timeAgo: 'منذ ساعتين',
    paintType: 'غرفة نوم + صالة - طلاء فينيل مائي أبيض ورمادي',
    materialsProvided: 'متوفرة من الزبون',
    preferredDate: 'خلال 3 أيام',
    notes: 'يريد صباغين ذوي خبرة ونظافة عالية في العمل والتشطيب.',
    status: 'قيد الانتظار'
  },
  {
    id: 'req2',
    title: 'سكن عائلي جديد بالكامل',
    clientName: 'رياض قندوز',
    location: 'بئر مراد رايس - الجزائر',
    areaSqm: 200,
    budgetOffer: 150000,
    timeAgo: 'منذ 5 ساعات',
    paintType: 'شقة كاملة 5 غرف + صالون + ممر',
    materialsProvided: 'على عاتق الصباغ',
    preferredDate: 'بداية الأسبوع القادم',
    notes: 'يحتاج تجهيز الحوائط بالمعجون وجهين ثم دهان ساتيني.',
    status: 'قيد الانتظار'
  },
  {
    id: 'req3',
    title: 'محل تجاري للأحذية',
    clientName: 'طارق مرواني',
    location: 'سيدي عبد الله - حي 3000 مسكن',
    areaSqm: 70,
    budgetOffer: 45000,
    timeAgo: 'منذ يوم',
    paintType: 'واجهة خارجية وجدران داخلية بلون كحلي وأبيض',
    materialsProvided: 'على عاتق الصباغ',
    preferredDate: 'مستعجل جداً',
    notes: 'الافتتاح بعد أسبوع، يرجى الرد السريع.',
    status: 'قيد الانتظار'
  }
];

export const SAMPLE_ROOMS: RoomMeasurement[] = [
  {
    id: 'r1',
    name: 'غرفة المعيشة (الصالون)',
    type: 'صالون',
    lengthM: 5.0,
    widthM: 4.0,
    heightM: 2.8,
    doorsDeductionM2: 2.0,
    windowsDeductionM2: 2.5,
    includeCeiling: true
  },
  {
    id: 'r2',
    name: 'غرفة النوم الرئيسية',
    type: 'غرفة',
    lengthM: 4.5,
    widthM: 3.5,
    heightM: 2.8,
    doorsDeductionM2: 2.0,
    windowsDeductionM2: 1.5,
    includeCeiling: true
  }
];
