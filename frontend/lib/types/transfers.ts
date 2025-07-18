/**
 * Transfer-related TypeScript types and interfaces
 */

export type BookingStep = 'route' | 'vehicle' | 'datetime' | 'passengers' | 'options' | 'contact' | 'summary';

export interface TransferBookingStep {
  key: BookingStep;
  title: string;
  description: string;
  icon?: React.ComponentType<any>;
}

export interface TransferStepConfig {
  number: number;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
} 