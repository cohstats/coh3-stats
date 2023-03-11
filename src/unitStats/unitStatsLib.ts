import slash from "slash";

export const traverseTree = (
  entity: any,
  checkRelevant: any,
  mapper: any,
  path: string,
  parent: string,
) => {
  const relevantSet = new Set<any>();
  //let parent = parent;
  if (parent === "") parent = path;

  for (const i in entity) {
    //extend path
    const currentPath = path + "/" + i;

    // check if object is relevant (eg. is weapon_bag?)
    const isRelevant = checkRelevant.apply(this, [i, entity[i]]);

    if (!isRelevant && entity[i] !== null && typeof entity[i] == "object") {
      // remember current node as parrent (parent folder e.g. rifle)
      const newParent = i;

      //going one step down in the object tree!!
      const childSet = traverseTree(entity[i], checkRelevant, mapper, currentPath, newParent);

      childSet.forEach(relevantSet.add, relevantSet);

      // merge relevant object of child
      for (const s in childSet) relevantSet.add(s);

      // add relevant object to return list
    } else if (isRelevant) {
      if (mapper != "undefined")
        relevantSet.add(mapper.apply(this, [i, entity[i], path, parent]));
      else relevantSet.add(entity(i));
    }
  }

  return relevantSet;
};

export const getFactionIcon = (folderName: string): string => {
  let iconName = "icons/general/infantry_icn.png";
  switch (folderName) {
    case "afrika_korps":
      iconName = "icons/general/dak.webp";
      break;

    case "british":
      iconName = "icons/general/british.webp";
      break;

    case "american":
      iconName = "icons/general/american.webp";
      break;

    case "german":
      iconName = "icons/general/german.webp";
      break;

    default:
      break;
  }
  return slash(iconName);
};

export const isBaseFaction = (faction: string): boolean => {
  return ["afrika_korps", "american", "british", "german"].includes(faction);
};
