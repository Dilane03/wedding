import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import bcrypt from "bcrypt"

// GET: Fetch all guests and their ceremony responses
export async function GET(request: NextRequest) {
  try {
    const guests = await sql`
      SELECT 
        g.id, g.name, g.email, g.phone, g.address, g.city, g.country,
        g.guest_type, g.partner_name, g.number_of_guests,
        g.dietary_restrictions, g.special_requests, g.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'ceremony_type', cr.ceremony_type,
              'response', cr.response,
              'response_date', cr.response_date
            )
          ) FILTER (WHERE cr.id IS NOT NULL), 
          '[]'
        ) as responses
      FROM guests g
      LEFT JOIN ceremony_responses cr ON g.id = cr.guest_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `
    return NextResponse.json({ guests })
  } catch (error) {
    console.error("Error fetching guests:", error)
    return NextResponse.json({ error: "Failed to fetch guests" }, { status: 500 })
  }
}

// POST: Create a new guest
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      address,
      city,
      country,
      guest_type,
      partner_name,
      number_of_guests,
      dietary_restrictions,
      special_requests,
      password,
    } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    const existingGuest = await sql`
      SELECT id FROM guests WHERE email = ${email}
    `
    if (existingGuest.length > 0) {
      return NextResponse.json({ error: "A guest with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newGuest = await sql`
      INSERT INTO guests (
        name, email, phone, address, city, country, guest_type,
        partner_name, number_of_guests, dietary_restrictions,
        special_requests, password
      ) VALUES (
        ${name}, ${email}, ${phone}, ${address}, ${city}, ${country},
        ${guest_type}, ${partner_name}, ${number_of_guests},
        ${dietary_restrictions}, ${special_requests}, ${hashedPassword}
      )
      RETURNING id, name, email, guest_type
    `

    await sql`
      INSERT INTO ceremony_responses (guest_id, ceremony_type, response)
      VALUES 
        (${newGuest[0].id}, 'dot', 'pending'),
        (${newGuest[0].id}, 'civil', 'pending')
    `

    return NextResponse.json(
      {
        message: "Guest created successfully",
        guest: newGuest[0],
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating guest:", error)
    return NextResponse.json({ error: "Failed to create guest" }, { status: 500 })
  }
}

// POST: Login endpoint for guests
export async function PUT(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await sql`
      SELECT * FROM guests WHERE email = ${email}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const guest = result[0]
    const isValid = await bcrypt.compare(password, guest.password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Remove password before sending
    delete guest.password

    return NextResponse.json({ message: "Login successful", guest })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
