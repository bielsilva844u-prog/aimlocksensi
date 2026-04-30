'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

interface UserProfile {
  uid: string;
  email: string | null;
  username: string | null;
  photoURL: string | null;
  activatedProducts?: string[];
}

interface FirestoreUserProfile {
    username: string | null;
    email: string | null;
    photoURL: string | null;
    activatedProducts?: { [product: string]: string }; // product -> expiration date ISO string
}

export const useUser = () => {
  const auth = useAuth();
  const firestore = useFirestore();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
        setUser(null);
        setLoading(false);
        return;
    };

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(firestore, 'users', authUser.uid);
        
        const unsubProfile = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const firestoreData = snapshot.data() as FirestoreUserProfile;
                const productExpirations = firestoreData.activatedProducts;
                
                const activeProducts: string[] = [];
                if (productExpirations) {
                    Object.entries(productExpirations).forEach(([product, expiresAt]) => {
                        if (new Date(expiresAt) > new Date()) {
                            activeProducts.push(product);
                        }
                    });
                }

                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    username: firestoreData.username,
                    photoURL: firestoreData.photoURL,
                    activatedProducts: activeProducts,
                });
            } else {
                 // The profile doesn't exist in Firestore yet.
                 // This can happen for a newly created user.
                 // We'll provide a basic user object from auth data.
                 // The registration page is responsible for creating the full profile.
                setUser({
                    uid: authUser.uid,
                    email: authUser.email,
                    username: authUser.email ? authUser.email.split('@')[0] : 'New User',
                    photoURL: authUser.photoURL,
                    activatedProducts: [],
                });
            }
            setLoading(false);
        });

        // Detach profile listener on cleanup
        return () => unsubProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return { user, loading };
};
