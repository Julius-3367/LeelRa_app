// Supabase REST API client to replace Prisma
const supabaseUrl = "https://opnloqodiufrbwuswfam.supabase.co";
const supabaseKey = "sb_publishable_LyD1pKmVAOdWHfOIw9H8lA_8ws2mCP5";

// Mock Prisma client interface using Supabase REST API
export const prisma = {
  user: {
    findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
      let query = `${supabaseUrl}/rest/v1/users?`;
      if (where.email) query += `email=eq.${where.email}`;
      if (where.id) query += `id=eq.${where.id}`;
      
      const response = await fetch(query, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const users = await response.json();
      return users.length > 0 ? users[0] : null;
    },
    
    create: async ({ data }: { data: any }) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const users = await response.json();
      return users[0];
    },
    
    count: async () => {
      const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      return data.length > 0 ? data[0].count : 0;
    },
    
    findMany: async ({ where }: { where?: any } = {}) => {
      let query = `${supabaseUrl}/rest/v1/users?`;
      if (where?.is_active !== undefined) query += `is_active=eq.${where.is_active}&`;
      
      const response = await fetch(query.slice(0, -1), {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      return await response.json();
    },
    
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${where.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const users = await response.json();
      return users[0];
    },
  },
  
  $disconnect: async () => {
    // No-op for REST API
  },
};
