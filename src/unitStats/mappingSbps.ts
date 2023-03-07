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
let spbsStats: SbpsType[];

// mapping a single entity of the json file. eg. panzergrenadier_ak.
// subtree -> eg. extensions node
const mapSbpsData = (subtree: any, filename: string, root: string) => {
  const spbsEntity: SbpsType = {
    filename: filename,
    root: root,
    // todo
  };

  return spbsEntity;
};

// calls the mapping for each entity and
// puts the result array into the exported SbpsData variable.
// This variable can be imported everywhere.
// this method is called after loading the JSON at build time.
const setSpbsStats = (sbpsJson: any) => {
  //@todo to be filled
  spbsStats = [];
};

export { mapSbpsData, setSpbsStats };
export type { SbpsType };
