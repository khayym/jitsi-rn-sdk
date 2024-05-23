import {NativeModules} from 'react-native';
// import DefaultPreference from 'react-native-default-preference';
import {MMKVLoader} from 'react-native-mmkv-storage';

const MMKV = new MMKVLoader().initialize();
export * from './functions.any';

const {AudioMode} = NativeModules;

/**
 * Handles changes to the `disableCallIntegration` setting.
 * On Android (where `AudioMode.setUseConnectionService` is defined) we must update
 * the native side too, since audio routing works differently.
 *
 * @param {boolean} disabled - Whether call integration is disabled or not.
 * @returns {void}
 */
export function handleCallIntegrationChange(disabled: boolean) {
  if (AudioMode.setUseConnectionService) {
    AudioMode.setUseConnectionService(!disabled);
  }
}

/**
 * Handles changes to the `disableCrashReporting` setting.
 * Stores the value into platform specific default preference file, so at app
 * start-up time it is retrieved on the native side and the crash reporting
 * is enabled/disabled.
 *
 * @param {boolean} disabled - Whether crash reporting is disabled or not.
 * @returns {void}
 */
export function handleCrashReportingChange(disabled: boolean) {
  // Store the value in MMKV storage
  MMKV.setString('isCrashReportingDisabled', disabled.toString());
}
