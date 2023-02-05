/**
 * This is proof that we can get the connection to FB is working
 */

import React, { useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const FirestoreTest: React.FC = () => {
  useEffect(() => {
    try {
      (async ()=>{
        const docRef = doc(getFirestore(), "tests", "document");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log(docSnap.data());
        }
      })();
    } catch (e) {

      console.error("Failed to get amount of analyzed matchess", e);
    }
  }, []);

  return <></>;
};

export default FirestoreTest;
