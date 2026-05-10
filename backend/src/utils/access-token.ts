import {env} from '../config/env.js'
import jwt from 'jsonwebtoken'

export const generateTokens = (user: { id: string }) => {
    const accessToken = jwt.sign(
        { sub: user.id },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '1440m' }
    )
    return  accessToken ;
}
