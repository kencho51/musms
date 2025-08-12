export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    return {
      success: true,
      message: 'POST endpoint works',
      received_data: body,
      method: event.node?.req?.method || 'unknown'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      step: 'reading_body'
    }
  }
}) 