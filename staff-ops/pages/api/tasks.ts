import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST for creating tasks
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization' })
    }

    const token = authHeader.substring(7)

    // Verify JWT and get user
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { hotel_id, title, description, assigned_to, priority, due_date } = req.body

    // Verify user owns this hotel
    const { data: hotelData, error: hotelError } = await supabaseAdmin
      .from('hotels')
      .select('id')
      .eq('id', hotel_id)
      .eq('user_id', userData.user.id)
      .single()

    if (hotelError || !hotelData) {
      return res.status(403).json({ error: 'Hotel not found or access denied' })
    }

    // Create task
    const { data: taskData, error: taskError } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          hotel_id,
          title,
          description,
          assigned_to,
          priority: priority || 'normal',
          due_date,
          status: 'pending',
          created_by: userData.user.id,
        },
      ])
      .select()
      .single()

    if (taskError) {
      return res.status(400).json({ error: taskError.message })
    }

    // Log activity
    await supabaseAdmin
      .from('activity_logs')
      .insert([
        {
          hotel_id,
          staff_id: userData.user.id,
          action: 'created_task',
          entity_type: 'task',
          entity_id: taskData.id,
          details: { title },
        },
      ])

    res.status(201).json(taskData)
  } catch (error) {
    console.error('Task creation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
