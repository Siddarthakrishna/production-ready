import { Router } from 'express';
import { passport } from '../config/passport.js';
import { signAccessToken, signRefreshToken, cookieOptions } from '../services/token.service.js';

const router = Router();

// Feature flag: only enable Google OAuth endpoints if configured
const isGoogleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

if (isGoogleConfigured) {
  // Kick off Google OAuth
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
} else {
  // Graceful fallback to avoid runtime errors when not configured
  router.get('/google', (req, res) => {
    return res.status(503).send('Google OAuth not configured');
  });
}

// OAuth callback
if (isGoogleConfigured) {
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/index.html?error=google_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user; // set by passport verify
        // Generate JWT token with user data
        const token = signAccessToken(user);
        
        // Redirect to home.html with token in URL
        const redirectUrl = new URL('/home.html', process.env.FRONTEND_URL || 'http://localhost:3000');
        redirectUrl.searchParams.set('token', token);
        
        return res.redirect(redirectUrl.toString());
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        return res.redirect('/index.html?error=auth_error');
      }
    }
  );
} else {
  router.get('/google/callback', (req, res) => {
    return res.redirect('/?error=google_not_configured');
  });
}

export default router;
