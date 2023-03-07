// type description of mapped data
// need to be extended by all required fields
type EbpsType = {
  filename: string; // filename  -> eg. panzergrenadier_ak
  root: string; // folder from which the extraction got started. Eg. afrika_corps, american, british,.
  //todo
};

// exported variable holding mapped data for each
// json file. Will be set via setSbpsStats.
// Can be accessed from everywhere
let ebpsStats: EbpsType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapEbpsData = (subtree: any, filename: string, root: string) => {
  const ebpsEntity: EbpsType = {
    filename: filename,
    root: root,
    // todo
  };

  return ebpsEntity;
};

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const getEbpsStats = (ebpsJson: any) => {
  //@todo to be filled
  return [];
};

//
const setEbpsStats = (ebpsStats: EbpsType[]) => {
  //@todo to be filled
  ebpsStats = ebpsStats;
};

export { ebpsStats, getEbpsStats, setEbpsStats };
export type { EbpsType };
