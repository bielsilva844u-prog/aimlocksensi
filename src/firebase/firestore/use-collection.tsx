'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  Query,
  query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useCollection<T>(path: string, q?: Query) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!firestore) {
      setLoading(false);
      return;
    }
    const ref = q ? q : query(collection(firestore, path));
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const docs: T[] = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [path, q, firestore]);

  return { data, loading, error };
}
