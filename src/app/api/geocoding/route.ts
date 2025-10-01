import { NextRequest, NextResponse } from 'next/server'

const GEOCODING_BASE_URL = 'https://geocoding.geo.census.gov/geocoder'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }

    const url = `${GEOCODING_BASE_URL}/locations/onelineaddress`
    const params = new URLSearchParams({
      address: address,
      benchmark: 'Public_AR_Current',
      format: 'json'
    })

    const response = await fetch(`${url}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CasaReady/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}