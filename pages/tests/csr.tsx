/**
 * This is example page of getting the data from Firestore directly on the client.
 * This is something we don't really want to do. See README for more details.
 */

import { NextPage } from "next";
import React, { useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const CSR: NextPage = () => {
  useEffect(() => {
    try {
      (async () => {
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

  return <> THIS IS TEST PAGE OF CSR FUNCTIONS</>;
};

export default CSR;
