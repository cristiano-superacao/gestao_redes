// ===== Netlify Function: Autenticação =====

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminPassword = process.env.ADMIN_PASSWORD || 'GestaoProvedores@2025#'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

  // Responder a preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  try {
    const { action, ...data } = JSON.parse(event.body || '{}')
    
    switch (action) {
      case 'login':
        return await handleLogin(data, headers)
      
      case 'admin_login':
        return await handleAdminLogin(data, headers)
      
      case 'request_access':
        return await handleAccessRequest(data, headers)
      
      case 'approve_user':
        return await handleApproveUser(data, headers)
      
      case 'reject_user':
        return await handleRejectUser(data, headers)
      
      case 'get_stats':
        return await handleGetStats(headers)
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Ação não reconhecida' })
        }
    }
  } catch (error) {
    console.error('Erro na função auth:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    }
  }
}

// Função de login com Google
async function handleLogin(data, headers) {
  const { email, name, photoUrl, googleId } = data
  
  try {
    // Verificar se usuário existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    let user = existingUser

    if (!user) {
      // Criar novo usuário
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email,
            name,
            photo_url: photoUrl,
            google_id: googleId,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (createError) throw createError
      
      user = newUser
      
      // Notificar admin sobre novo usuário
      await supabase
        .from('admin_notifications')
        .insert([
          {
            type: 'new_user',
            title: 'Novo usuário cadastrado',
            message: `${name} (${email}) se cadastrou e aguarda aprovação`,
            data: { userId: user.id },
            read: false
          }
        ])
    }

    // Verificar status do usuário
    if (user.status !== 'approved') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          error: 'Conta pendente de aprovação',
          status: user.status 
        })
      }
    }

    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    // Registrar atividade
    await supabase
      .from('user_activities')
      .insert([
        {
          user_id: user.id,
          action: 'login',
          ip: event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown',
          user_agent: event.headers['user-agent'] || 'unknown'
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status
        }
      })
    }
  } catch (error) {
    console.error('Erro no login:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao processar login' })
    }
  }
}

// Função de login administrativo
async function handleAdminLogin(data, headers) {
  const { password } = data
  
  if (password !== adminPassword) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Senha de administrador incorreta' })
    }
  }

  // Registrar acesso admin
  await supabase
    .from('admin_activities')
    .insert([
      {
        action: 'admin_login',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        timestamp: new Date().toISOString()
      }
    ])

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, admin: true })
  }
}

// Função de solicitação de acesso
async function handleAccessRequest(data, headers) {
  const { name, email, company, reason } = data
  
  try {
    const { data: request, error } = await supabase
      .from('access_requests')
      .insert([
        {
          name,
          email,
          company,
          reason,
          status: 'pending',
          ip: event.headers['x-forwarded-for'] || 'unknown'
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Notificar admin
    await supabase
      .from('admin_notifications')
      .insert([
        {
          type: 'access_request',
          title: 'Nova solicitação de acesso',
          message: `${name} (${email}) da empresa ${company} solicita acesso`,
          data: { requestId: request.id },
          read: false
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, requestId: request.id })
    }
  } catch (error) {
    console.error('Erro na solicitação de acesso:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao processar solicitação' })
    }
  }
}

// Função para aprovar usuário
async function handleApproveUser(data, headers) {
  const { userId } = data
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin'
      })
      .eq('id', userId)

    if (error) throw error

    // Registrar atividade
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: 'user_approved',
          data: { userId },
          timestamp: new Date().toISOString()
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    }
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao aprovar usuário' })
    }
  }
}

// Função para rejeitar usuário
async function handleRejectUser(data, headers) {
  const { userId, reason } = data
  
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason || ''
      })
      .eq('id', userId)

    if (error) throw error

    // Registrar atividade
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: 'user_rejected',
          data: { userId, reason },
          timestamp: new Date().toISOString()
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    }
  } catch (error) {
    console.error('Erro ao rejeitar usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao rejeitar usuário' })
    }
  }
}

// Função para obter estatísticas
async function handleGetStats(headers) {
  try {
    // Contar usuários por status
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('status')

    if (usersError) throw usersError

    const stats = {
      totalUsers: users.length,
      pendingUsers: users.filter(u => u.status === 'pending').length,
      approvedUsers: users.filter(u => u.status === 'approved').length,
      rejectedUsers: users.filter(u => u.status === 'rejected').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length
    }

    // Atividades de hoje
    const today = new Date().toISOString().split('T')[0]
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('id')
      .gte('created_at', today)

    if (!activitiesError) {
      stats.todayActivities = activities.length
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, stats })
    }
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao obter estatísticas' })
    }
  }
}