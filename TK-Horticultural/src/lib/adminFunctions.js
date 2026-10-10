import { functionsInstance, httpsCallable } from '../firebase';

export async function syncAllUsersCallable() {
  const syncFn = httpsCallable(functionsInstance, 'syncAllUsers');
  const result = await syncFn({});
  return result.data;
}

export async function setUserDisabledCallable(uid, disabled) {
  const disableFn = httpsCallable(functionsInstance, 'setUserDisabled');
  const result = await disableFn({ uid, disabled });
  return result.data;
}

export async function deleteUserAccountCallable(uid, deleteBookings = false) {
  const deleteFn = httpsCallable(functionsInstance, 'deleteUserAccount');
  const result = await deleteFn({ uid, deleteBookings });
  return result.data;
}

export async function sendPasswordResetCallable(email) {
  const resetFn = httpsCallable(functionsInstance, 'sendPasswordReset');
  const result = await resetFn({ email });
  return result.data;
}

export async function setAdminRoleCallable(uid, isAdmin) {
  const roleFn = httpsCallable(functionsInstance, 'setAdminRole');
  const result = await roleFn({ uid, isAdmin });
  return result.data;
}

