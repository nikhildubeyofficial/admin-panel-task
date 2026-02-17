import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod'

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}

export function verifyToken(token) {
    try {
        // Note: jsonwebtoken verify might rely on Node crypto, which may be polyfilled in Next.js Edge
        // If it fails, we might need 'jose' library. But for now attempting standard usage.
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}
