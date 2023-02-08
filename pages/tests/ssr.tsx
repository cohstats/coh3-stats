/**
 * This is example page of getting the data from Firestore on server.
 */

import { NextPage } from "next";
import React from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";

const SSR: NextPage = ({ data }: any) => {
  return <>THIS IS EXAMPLE OF SSR PAGE - lading {JSON.stringify(data)}</>;
};

export async function getServerSideProps() {
  const docRef = doc(getFirestore(), "tests", "document");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    console.log(docSnap.data());
  }

  return { props: { data: docSnap.data() } };
}

export default SSR;
