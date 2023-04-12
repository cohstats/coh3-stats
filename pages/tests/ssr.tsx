/**
 * This is example page of getting the data from Firestore on server.
 */

import { NextPage } from "next";
import React from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { DataTable } from "mantine-datatable";
import config from "../../config";
import { calculateLeaderboardStats } from "../../src/leaderboards/stats";

const SSR: NextPage = ({ data, tableData }: any) => {
  return (
    <>
      {/*ENV NAME |{config.getEdgioEnvName()}| IS DEV: |{`${config.isDevEnv()}`}|<br />*/}
      {/*TTEST: ${process.env.TEST_CONFIG}*/}
      {/*<br />*/}
      {/*THIS IS EXAMPLE OF SSR PAGE - lading {JSON.stringify(data)}*/}
      {/*<DataTable*/}
      {/*  columns={[{ accessor: "name" }, { accessor: "age" }]}*/}
      {/*  records={tableData}*/}
      {/*></DataTable>*/}
    </>
  );
};

export async function getServerSideProps() {
  // const docRef = doc(getFirestore(), "tests", "document");
  // const docSnap = await getDoc(docRef);
  //
  // if (docSnap.exists()) {
  //   console.log(docSnap.data());
  // }
  //
  // const tableData = [
  //   { name: " thomas", age: 4 },
  //   { name: " thomas", age: 4 },
  //   { name: " thomas", age: 4 },
  //   { name: " thomas", age: 4 },
  // ];

  console.log(await calculateLeaderboardStats());

  return { props: {} };
}

export default SSR;
