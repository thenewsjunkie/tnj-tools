
export interface DatabaseFunctions {
  claim_screen_share_role: {
    Args: {
      p_session_id: string
      p_device_id: string
      p_share_code: string
    }
    Returns: {
      created_at: string | null
      expires_at: string
      host_connected: boolean | null
      host_device_id: string | null
      id: string
      is_active: boolean | null
      room_id: string | null
      share_code: string
      viewer_connected: boolean | null
      viewer_device_id: string | null
    }
  }
  create_screen_share_session: {
    Args: {
      p_share_code: string
      p_expires_at: string
    }
    Returns: {
      created_at: string | null
      expires_at: string
      host_connected: boolean | null
      host_device_id: string | null
      id: string
      is_active: boolean | null
      room_id: string | null
      share_code: string
      viewer_connected: boolean | null
      viewer_device_id: string | null
    }
  }
  mark_as_displayed: {
    Args: {
      conversation_id: string
    }
    Returns: undefined
  }
}
