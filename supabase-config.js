// ===== Configuração Supabase =====
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2'

// Configuração Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// Configurações de segurança
const ADMIN_PASSWORD = "NetBairro@Admin2024#"
const ADMIN_EMAIL = "admin@netbairro.com"

// Status de usuário
const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
}

// Configuração de rate limiting
const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5,
  REQUEST_COOLDOWN: 300000 // 5 minutos em ms
}

// Configuração Google OAuth para produção
const GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'

export { 
  supabase, 
  ADMIN_PASSWORD, 
  ADMIN_EMAIL, 
  USER_STATUS,
  RATE_LIMITS,
  GOOGLE_CLIENT_ID
}