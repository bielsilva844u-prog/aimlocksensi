import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import {
  FirebaseProvider,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';
import { useUser } from './auth/use-user';
import { FirebaseClientProvider } from './client-provider';

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let firestore: Firestore | undefined = undefined;

function initializeFirebase() {
  if (getApps().length === 0) {
    const _app = initializeApp(firebaseConfig);
    const _auth = getAuth(_app);
    const _firestore = getFirestore(_app);
    
    app = _app;
    auth = _auth;
    firestore = _firestore;

    return { app: _app, auth: _auth, firestore: _firestore };
  }
  
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);

  return { app, auth, firestore };
}

export {
  initializeFirebase,
  FirebaseProvider,
  FirebaseClientProvider,
  useCollection,
  useDoc,
  useUser,
  useFirebaseApp,
  useFirestore,
  useAuth,
};
