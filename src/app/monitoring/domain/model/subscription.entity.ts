export interface SubscriptionUsage {
  sensorsConnected: number;
  sensorsLimit: number;
  storageUsedGB: number;
  storageLimitGB: number;
  exports: number;
  exportsLimit: number;
}

export interface Subscription {
  id: number;
  plan: string;
  tier: string;
  price: number;
  currency: string;
  billingCycle: string;
  status: string;
  startDate: string;
  nextBillingDate: string;
  paymentMethod: string;
  features: string[];
  usage: SubscriptionUsage;
}
