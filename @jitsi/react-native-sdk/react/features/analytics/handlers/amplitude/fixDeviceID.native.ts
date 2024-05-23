import {Amplitude} from '@amplitude/react-native';
// import DefaultPreference from 'react-native-default-preference';
import {getUniqueId} from 'react-native-device-info';
import {MMKVLoader} from 'react-native-mmkv-storage';

import logger from '../../logger';

const MMKV = new MMKVLoader().initialize();

/**
 * Custom logic for setting the correct device id.
 *
 * @param {AmplitudeClient} amplitude - The amplitude instance.
 * @returns {void}
 */
export async function fixDeviceID(amplitude: Amplitude) {
  const current = MMKV.getString('amplitudeDeviceId');

  if (current) {
    await amplitude.setDeviceId(current);
  } else {
    const uid = await getUniqueId();

    if (!uid) {
      logger.warn('Device ID is not set!');

      return;
    }

    await amplitude.setDeviceId(uid as string);
    MMKV.setString('amplitudeDeviceId', uid as string);
  }
}
