import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization' })
    }

    const token = authHeader.substring(7)
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { hotel_id, email, name, role, department } = req.body

    // Verify user owns hotel
    const { data: hotelData, error: hotelError } = await supabaseAdmin
      .from('hotels')
      .select('id')
      .eq('id', hotel_id)
      .eq('user_id', userData.user.id)
      .single()

    if (hotelError || !hotelData) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Check if staff already exists
    const { data: existingStaff } = await supabaseAdmin
      .from('staff')
      .select('id')
      .eq('hotel_id', hotel_id)
      .eq('email', email)
      .single()

    if (existingStaff) {
      return res.status(400).json({ error: 'Staff member already invited' })
    }

    // Create staff record
    const { data: staffData, error: staffError } = await supabaseAdmin
      .from('staff')
      .insert([
        {
          hotel_id,
          email,
          name,
          role: role || 'staff',
          department,
          status: 'pending_invite',
        },
      ])
      .select()
      .single()

    if (staffError) {
      return res.status(400).json({ error: staffError.message })
    }

    // TODO: Send invitation email via n8n webhook
    // const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${staffData.id}`
    // await fetch(process.env.N8N_WEBHOOK_EMAIL, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     to: email,
    //     subject: `You've been invited to ${hotelData.name}`,
    //     template: 'staff_invite',
    //     data: { name, hotelName: hotelData.name, inviteLink }
    //   })
    // })

    // Log activity
    await supabaseAdmin
      .from('activity_logs')
      .insert([
        {
          hotel_id,
          staff_id: userData.user.id,
          action: 'invited_staff',
          entity_type: 'staff',
          entity_id: staffData.id,
          details: { email, name, role },
        },
      ])

    res.status(201).json(staffData)
  } catch (error) {
    console.error('Staff invitation error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
