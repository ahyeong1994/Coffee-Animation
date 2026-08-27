import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PermissionsAndroid, Platform} from 'react-native';

const COFFEE_ALBUM_NAME = 'Noir Coffee';

const hasAndroidSavePermission = async () => {
  if (Platform.OS !== 'android' || Number(Platform.Version) >= 29) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

/** Saves one local image into the dedicated Noir Coffee system album. */
export const saveCoffeePhoto = async (photoUri: string) => {
  if (!(await hasAndroidSavePermission())) {
    throw new Error('Photo library permission was denied.');
  }

  return CameraRoll.save(photoUri, {
    type: 'photo',
    album: COFFEE_ALBUM_NAME,
  });
};
