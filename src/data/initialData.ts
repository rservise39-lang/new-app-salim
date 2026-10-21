
import {
  Project,
  Worker,
  AdvanceOrDeduction,
  Client,
  ClientOrderRequest,
  RoomMeasurement,
} from '../types';

// يبدأ التطبيق بقوائم فارغة.
// تُضاف البيانات الحقيقية من خلال واجهات التطبيق.
export const INITIAL_WORKERS: Worker[] = [];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_ADVANCES: AdvanceOrDeduction[] = [];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_REQUESTS: ClientOrderRequest[] = [];

export const SAMPLE_ROOMS: RoomMeasurement[] = [];
