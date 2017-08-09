import { store } from '../persistence/store';
import {
  lastFmLoginConnect,
  lastFmLogin
} from '../rest/Lastfm';
import globals from '../globals';
const electron = window.require('electron');

export const LASTFM_CONNECT = 'LASTFM_CONNECT';
export const LASTFM_LOGIN = 'LASTFM_LOGIN';
export const LASTFM_READ_SETTINGS = 'LASTFM_READ_SETTINGS';

export function lastFmReadSettings() {
  return dispatch => {
    let settings = store.get('lastFm').value();
    if (settings) {
        dispatch({
          type: LASTFM_READ_SETTINGS,
          payload: {
            lastFmName: settings.name,
            lastFmSessionKey: settings.sessionKey
          }
        });
    } else {
      dispatch({
        type: LASTFM_READ_SETTINGS,
        payload: null
      });
    }
  }
}

export function lastFmConnectAction() {
  return dispatch => {
    lastFmLoginConnect()
    .then(response => response.json())
    .then(response => {
      let authToken = response.token;
      electron.shell.openExternal(
        'http://www.last.fm/api/auth/?api_key=' + globals.lastfmApiKey + '&token=' + authToken
      );

      dispatch({
        type: LASTFM_CONNECT,
        payload: authToken
      });
    });
  };
}

export function lastFmLoginAction(authToken) {
  return dispatch => {
    lastFmLogin(authToken)
    .then(response => response.json())
    .then(response => {

      let sessionKey = response.session.key;
      let sessionName = response.session.name;

      store.set('lastFm', {name: sessionName, sessionKey: sessionKey}).write();

      dispatch({
        type: LASTFM_LOGIN,
        payload: {
          sessionKey: sessionKey,
          name: sessionName
        }
      });
    });
  };
}
