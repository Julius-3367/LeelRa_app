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
    
    count: async ({ where }: { where?: any } = {}) => {
      let query = `${supabaseUrl}/rest/v1/users?select=count`;
      if (where?.is_active !== undefined) query += `&is_active=eq.${where.is_active}`;
      
      const response = await fetch(query, {
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

    delete: async ({ where }: { where: { id: string } }) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${where.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      return; // Prisma delete returns nothing
    },
  },

  activityRequest: {
    count: async ({ where }: { where?: any } = {}) => {
      let query = `${supabaseUrl}/rest/v1/activity_requests?select=count`;
      if (where?.status !== undefined) query += `&status=eq.${where.status}`;
      
      const response = await fetch(query, {
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
    
    findMany: async ({ where, orderBy, take, include }: { where?: any; orderBy?: any; take?: number; include?: any } = {}) => {
      let query = `${supabaseUrl}/rest/v1/activity_requests?`;
      if (where?.userId !== undefined) query += `user_id=eq.${where.userId}&`;
      if (where?.status !== undefined) query += `status=eq.${where.status}&`;
      if (orderBy?.createdAt) query += `order=created_at${orderBy.createdAt === 'desc' ? '.desc' : '.asc'}&`;
      if (take) query += `limit=${take}&`;
      
      const response = await fetch(query.slice(0, -1), {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      let data = await response.json();
      
      // Handle include relations (simplified for submittedBy)
      if (include?.submittedBy) {
        data = data.map((item: any) => ({
          ...item,
          submittedBy: {
            name: item.submitted_by_name || 'Unknown',
            email: item.submitted_by_email || 'unknown@example.com'
          }
        }));
      }
      
      return data;
    },
  },

  attendedEvent: {
    count: async () => {
      const response = await fetch(`${supabaseUrl}/rest/v1/attended_events?select=count`, {
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
  },

  activity: {
    count: async ({ where }: { where?: any } = {}) => {
      let query = `${supabaseUrl}/rest/v1/activities?select=count`;
      if (where?.status !== undefined) query += `&status=eq.${where.status}`;
      
      const response = await fetch(query, {
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
  },

  notification: {
    findMany: async ({ where }: { where?: any } = {}) => {
      let query = `${supabaseUrl}/rest/v1/notifications?`;
      if (where?.userId !== undefined) query += `user_id=eq.${where.userId}&`;
      if (where?.isRead !== undefined) query += `is_read=eq.${where.isRead}&`;
      
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
  },

  account: {
    findUnique: async ({ where }: { where: { userId?: string } }) => {
      let query = `${supabaseUrl}/rest/v1/accounts?`;
      if (where.userId) query += `user_id=eq.${where.userId}`;
      
      const response = await fetch(query, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const accounts = await response.json();
      return accounts.length > 0 ? accounts[0] : null;
    },
  },

  session: {
    findUnique: async ({ where }: { where: { sessionToken?: string } }) => {
      let query = `${supabaseUrl}/rest/v1/sessions?`;
      if (where.sessionToken) query += `session_token=eq.${where.sessionToken}`;
      
      const response = await fetch(query, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const sessions = await response.json();
      return sessions.length > 0 ? sessions[0] : null;
    },
  },
  
  $disconnect: async () => {
    // No-op for REST API
  },
};
