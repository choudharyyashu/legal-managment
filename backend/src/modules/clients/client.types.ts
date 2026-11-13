export type ClientType = 'Organization' | 'Individual' | 'Trust / Estate' | 'Government / Public';
export type ClientStatus = 'Active' | 'Prospective' | 'Inactive';

export interface ClientResponse {
  id: string;
  clientNumber: string;
  name: string;
  type: string;
  clientType: string;
  primaryContact: string | null;
  email: string;
  phone: string;
  address: string | null;
  assignedAttorneyId: string | null;
  assignedAttorneyName: string | null;
  status: string;
  notes: string | null;
  portalAccessEnabled: boolean;
  totalMatters: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientListQuery {
  search?: string;
  status?: ClientStatus;
  clientType?: ClientType;
  type?: ClientType;
  assignedAttorneyId?: string;
  sortBy?: 'name' | 'clientNumber' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

