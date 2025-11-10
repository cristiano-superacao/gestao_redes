// ===== Netlify Function: Gerenciamento de Usuários =====

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  }

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
      case 'get_users':
        return await handleGetUsers(data, headers)
      
      case 'get_user_details':
        return await handleGetUserDetails(data, headers)
      
      case 'update_user':
        return await handleUpdateUser(data, headers)
      
      case 'delete_user':
        return await handleDeleteUser(data, headers)
      
      case 'suspend_user':
        return await handleSuspendUser(data, headers)
      
      case 'reactivate_user':
        return await handleReactivateUser(data, headers)
      
      case 'get_user_activities':
        return await handleGetUserActivities(data, headers)
      
      case 'get_access_requests':
        return await handleGetAccessRequests(data, headers)
      
      case 'process_access_request':
        return await handleProcessAccessRequest(data, headers)
      
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Ação não reconhecida' })
        }
    }
  } catch (error) {
    console.error('Erro na função users:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    }
  }
}

// Obter lista de usuários
async function handleGetUsers(data, headers) {
  const { page = 1, limit = 50, status = 'all', search = '' } = data
  
  try {
    let query = supabase
      .from('users')
      .select('id, name, email, status, created_at, last_login, photo_url', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filtrar por status
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    // Buscar por nome ou email
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Paginação
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: users, error, count } = await query

    if (error) throw error

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        users,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao obter usuários:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao obter usuários' })
    }
  }
}

// Obter detalhes do usuário
async function handleGetUserDetails(data, headers) {
  const { userId } = data
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    // Obter atividades recentes
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('action, created_at, ip, user_agent')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (activitiesError) {
      console.error('Erro ao obter atividades:', activitiesError)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user,
        activities: activities || []
      })
    }
  } catch (error) {
    console.error('Erro ao obter detalhes do usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao obter detalhes do usuário' })
    }
  }
}

// Atualizar usuário
async function handleUpdateUser(data, headers) {
  const { userId, updates } = data
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    // Registrar atividade admin
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: 'user_updated',
          data: { userId, updates },
          timestamp: new Date().toISOString()
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, user })
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao atualizar usuário' })
    }
  }
}

// Deletar usuário
async function handleDeleteUser(data, headers) {
  const { userId } = data
  
  try {
    // Primeiro obter dados do usuário para log
    const { data: userData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single()

    // Deletar atividades do usuário
    await supabase
      .from('user_activities')
      .delete()
      .eq('user_id', userId)

    // Deletar usuário
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error

    // Registrar atividade admin
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: 'user_deleted',
          data: { userId, userData },
          timestamp: new Date().toISOString()
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    }
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao deletar usuário' })
    }
  }
}

// Suspender usuário
async function handleSuspendUser(data, headers) {
  const { userId, reason } = data
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: reason || ''
      })
      .eq('id', userId)

    if (error) throw error

    // Registrar atividade admin
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: 'user_suspended',
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
    console.error('Erro ao suspender usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao suspender usuário' })
    }
  }
}

// Reativar usuário
async function handleReactivateUser(data, headers) {
  const { userId } = data
  
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'approved',
        suspended_at: null,
        suspension_reason: null,
        reactivated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error

    // Registrar atividade admin
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: 'user_reactivated',
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
    console.error('Erro ao reativar usuário:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao reativar usuário' })
    }
  }
}

// Obter atividades do usuário
async function handleGetUserActivities(data, headers) {
  const { userId, page = 1, limit = 20 } = data
  
  try {
    const offset = (page - 1) * limit

    const { data: activities, error, count } = await supabase
      .from('user_activities')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        activities,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao obter atividades:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao obter atividades' })
    }
  }
}

// Obter solicitações de acesso
async function handleGetAccessRequests(data, headers) {
  const { page = 1, limit = 20, status = 'all' } = data
  
  try {
    let query = supabase
      .from('access_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: requests, error, count } = await query

    if (error) throw error

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        requests,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      })
    }
  } catch (error) {
    console.error('Erro ao obter solicitações:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao obter solicitações' })
    }
  }
}

// Processar solicitação de acesso
async function handleProcessAccessRequest(data, headers) {
  const { requestId, action, comments } = data // action: 'approve' ou 'reject'
  
  try {
    // Atualizar solicitação
    const { data: request, error: updateError } = await supabase
      .from('access_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        processed_at: new Date().toISOString(),
        admin_comments: comments || '',
        processed_by: 'admin'
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) throw updateError

    // Se aprovado, criar conta de usuário
    if (action === 'approve') {
      const { error: createError } = await supabase
        .from('users')
        .insert([
          {
            name: request.name,
            email: request.email,
            company: request.company,
            status: 'approved',
            created_at: new Date().toISOString(),
            approved_at: new Date().toISOString(),
            approved_by: 'admin'
          }
        ])

      if (createError) throw createError
    }

    // Registrar atividade admin
    await supabase
      .from('admin_activities')
      .insert([
        {
          action: `access_request_${action}d`,
          data: { requestId, email: request.email },
          timestamp: new Date().toISOString()
        }
      ])

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, request })
    }
  } catch (error) {
    console.error('Erro ao processar solicitação:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro ao processar solicitação' })
    }
  }
}