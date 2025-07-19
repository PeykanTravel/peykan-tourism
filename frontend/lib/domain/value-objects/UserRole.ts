export type RoleType = 'guest' | 'customer' | 'agent' | 'admin';

export interface RoleInfo {
  name: string;
  permissions: string[];
  level: number;
}

export class UserRole {
  private readonly _value: RoleType;
  private static readonly ROLES: Record<RoleType, RoleInfo> = {
    guest: {
      name: 'Guest',
      permissions: ['view_products', 'view_tours', 'view_events'],
      level: 0
    },
    customer: {
      name: 'Customer',
      permissions: ['view_products', 'view_tours', 'view_events', 'create_orders', 'view_orders', 'manage_profile'],
      level: 1
    },
    agent: {
      name: 'Agent',
      permissions: ['view_products', 'view_tours', 'view_events', 'create_orders', 'view_orders', 'manage_profile', 'manage_customers', 'view_reports'],
      level: 2
    },
    admin: {
      name: 'Administrator',
      permissions: ['*'],
      level: 3
    }
  };

  private constructor(value: RoleType) {
    this._value = value;
  }

  static create(value: string): UserRole {
    if (!value || typeof value !== 'string') {
      throw new Error('Role must be a non-empty string');
    }

    const role = value.toLowerCase() as RoleType;
    
    if (!Object.keys(UserRole.ROLES).includes(role)) {
      throw new Error(`Invalid role: ${value}. Valid roles are: ${Object.keys(UserRole.ROLES).join(', ')}`);
    }

    return new UserRole(role);
  }

  static GUEST = new UserRole('guest');
  static CUSTOMER = new UserRole('customer');
  static AGENT = new UserRole('agent');
  static ADMIN = new UserRole('admin');

  get value(): RoleType {
    return this._value;
  }

  get name(): string {
    return UserRole.ROLES[this._value].name;
  }

  get permissions(): string[] {
    return UserRole.ROLES[this._value].permissions;
  }

  get level(): number {
    return UserRole.ROLES[this._value].level;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes('*') || this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  canAccess(requiredRole: UserRole): boolean {
    return this.level >= requiredRole.level;
  }

  isAdmin(): boolean {
    return this._value === 'admin';
  }

  isAgent(): boolean {
    return this._value === 'agent' || this._value === 'admin';
  }

  isCustomer(): boolean {
    return this._value === 'customer' || this._value === 'agent' || this._value === 'admin';
  }

  isGuest(): boolean {
    return this._value === 'guest';
  }

  equals(other: UserRole): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
} 