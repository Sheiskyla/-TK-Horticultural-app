import { GoogleLogin } from '@react-oauth/google';
import { googleClientId } from '../config.js';

export default function GoogleSignInButton(props) {
  if (!googleClientId) {
    return (
      <p className="text-center text-xs text-slate-500">
        Google sign-in is not configured for this deployment.
      </p>
    );
  }

  return <GoogleLogin {...props} />;
}
