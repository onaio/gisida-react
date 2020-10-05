import { getURLSearchParams } from '../../utils';
import superset from '@onaio/superset-connector';

/**
 * Recursive method that trys to login user to superset
 * If authentication is successeful redirect to dashboard
 * Else If Number of retrys are less than 10 attempt again
 * Else Inform user and redirect to home
*/
export const supersetLogin = (config, history, n=10) => {
    superset.authZ(config, result => {
    if (result.status === 200) {
      console.log('User logged into superset', config.base);
      return history.push({
        pathname: '/dashboard',
        search: getURLSearchParams().toString(),
      });
    } else if (n > 0){
      console.log('superset retry', config.base);
      supersetLogin(config, history, n-1);
    } else {
      alert('Sorry we couldn\'t log you into superset');
      return history.push({
        pathname: '/',
        search: getURLSearchParams().toString(),
      });
    }
  });
}