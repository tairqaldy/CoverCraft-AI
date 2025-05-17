
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GenerateLetterDraftInput } from '@/ai/flows/generate-letter-draft';

export interface UserLetterData {
  userInputData: GenerateLetterDraftInput | null;
  currentLetterText: string;
  updatedAt: Timestamp;
}

const LETTER_DOC_ID = 'currentDraft'; // Using a fixed ID for simplicity, assuming one main draft per user

export const saveUserLetter = async (
  userId: string,
  userInputData: GenerateLetterDraftInput | null,
  currentLetterText: string
): Promise<void> => {
  if (!userId) throw new Error('User ID is required to save letter.');
  
  const letterDocRef = doc(db, `userLetters/${userId}/letters/${LETTER_DOC_ID}`);
  const dataToSave: UserLetterData = {
    userInputData,
    currentLetterText,
    updatedAt: serverTimestamp() as Timestamp,
  };
  await setDoc(letterDocRef, dataToSave, { merge: true });
};

export const getUserLetter = async (userId: string): Promise<UserLetterData | null> => {
  if (!userId) return null;

  const letterDocRef = doc(db, `userLetters/${userId}/letters/${LETTER_DOC_ID}`);
  const docSnap = await getDoc(letterDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserLetterData;
  } else {
    return null;
  }
};
