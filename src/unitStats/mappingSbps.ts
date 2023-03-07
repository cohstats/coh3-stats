// type description of mapped data
// need to be extended by all required fields
type SbpsType = {
  filename: string; // filename  -> eg. panzergrenadier_ak
  root: string; // folder from which the extraction got started. Eg. afrika_corps, american, british,.
  //todo
};

// exported variable holding mapped data for each
// json file. Will be set via setSbpsStats.
// Can be accessed from everywhere
let sbpsStats: SbpsType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapSbpsData = (subtree: any, filename: string, root: string) => {
  const sbpsEntity: SbpsType = {
    filename: filename,
    root: root,
    // todo
  };

  return sbpsEntity;
};

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const getSbpsStats = (sbpsJson: any) => {
  //@todo to be filled
  return [];
};

//
const setSbpsStats = (sbpsStats: SbpsType[]) => {
  //@todo to be filled
  sbpsStats = sbpsStats;
};

export { sbpsStats, setSbpsStats, getSbpsStats };
export type { SbpsType };
